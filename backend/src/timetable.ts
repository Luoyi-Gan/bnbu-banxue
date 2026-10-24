import type { IncomingMessage } from 'node:http';
import sharp from 'sharp';
import { demand, digest, ServiceError } from './auth';
import type { LearningStore } from './learning-store';
import { parseTimetableResponse } from '../../shared/v2/timetableModel';
import { timetableProvider } from './timetable-config';
import { parseTimetableTables, type TimetableTable } from './timetable-parser';

export type TimetableRecognizer = (jpeg: Buffer) => Promise<TimetableTable[]>;
const maxImage = 10 * 1024 * 1024;
export async function reserveTimetableRecognition(store: LearningStore, accountID: string, origin: string) {
  // Serialize this short budget transaction across API replicas, before paid OCR.
  await store.transaction('timetable-ocr-budget', async sql => {
    const now = Date.now(), subject = digest(accountID), source = digest(origin);
    const rows = await sql.rows<{subject: string; origin: string; occurred_at: number | string}>(
      'SELECT subject,origin,occurred_at FROM security_rate_events WHERE category=? AND occurred_at>? AND (subject=? OR origin=?)',
      ['timetable-ocr', now - 86400000, subject, source]);
    demand(rows.filter(r => r.subject === subject && Number(r.occurred_at) > now - 60000).length < 6 &&
      rows.filter(r => r.subject === subject).length < 30 &&
      rows.filter(r => r.origin === source && Number(r.occurred_at) > now - 60000).length < 30,
    '课表识别次数较多，请稍后再试。', 429);
    await sql.rows('INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES(?,?,?,?)', ['timetable-ocr', subject, source, now]);
    await sql.rows('DELETE FROM security_rate_events WHERE category=? AND occurred_at<?', ['timetable-ocr', now - 86400000]);
  });
}

export async function recognizeTimetableWithTencent(jpeg: Buffer): Promise<TimetableTable[]> {
  try {
    const { ocr } = await import('tencentcloud-sdk-nodejs-ocr');
    const client = new ocr.v20181119.Client({
      credential: { secretId: process.env.BNBU_TIMETABLE_OCR_SECRET_ID!, secretKey: process.env.BNBU_TIMETABLE_OCR_SECRET_KEY! },
      region: process.env.BNBU_TIMETABLE_OCR_REGION || 'ap-guangzhou',
      profile: { httpProfile: { endpoint: 'ocr.tencentcloudapi.com', reqTimeout: 35 } },
    });
    const result = await client.RecognizeTableAccurateOCR({ ImageBase64: jpeg.toString('base64'), UseNewModel: false });
    return result.TableDetections || [];
  } catch {
    // Do not return or log provider diagnostics, which may contain request data.
    throw new ServiceError(502, 'TIMETABLE_OCR_UNAVAILABLE', '课表图片识别暂不可用，请稍后重试，原课表已保留。');
  }
}

async function readPhoto(request: IncomingMessage) {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length; demand(size <= maxImage + 64 * 1024, '课表照片不能超过 10 MB。', 413);
    chunks.push(chunk);
  }
  let form: FormData;
  try {
    form = await new Request('http://127.0.0.1/upload', { method: 'POST',
      headers: { 'Content-Type': request.headers['content-type'] || '' },
      body: new Blob([Uint8Array.from(Buffer.concat(chunks))]),
    }).formData();
  } catch { throw new ServiceError(400, 'INVALID_IMAGE_UPLOAD', '请上传有效的课表照片。'); }
  const file = form.get('image');
  demand(form.getAll('image').length === 1 && file instanceof File && file.size > 0, '请选择一张有效的课表照片。');
  demand(file.size <= maxImage, '课表照片不能超过 10 MB。', 413);
  const formats: Record<string, string> = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' };
  demand(formats[file.type], '请上传 JPG、PNG 或 WebP 格式的课表照片。');
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const source = sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'error', animated: false });
    const metadata = await source.metadata();
    demand(metadata.format === formats[file.type] && (!metadata.pages || metadata.pages === 1), '照片格式与内容不一致，或包含多帧图片。');
    // Normalize orientation, strip EXIF and convert WebP for Tencent. No files are persisted.
    const jpeg = await source.rotate().resize({ width: 2800, height: 2800, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
    demand(jpeg.toString('base64').length <= maxImage, '照片内容过大，请缩小后重新上传。', 413);
    return jpeg;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(400, 'INVALID_IMAGE', '照片无法读取或分辨率过大，请换一张清晰的课表图片。');
  }
}

export async function recognize(request: IncomingMessage, options: {
  reserve: () => Promise<void>; recognizer?: TimetableRecognizer; signal?: AbortSignal;
}) {
  const provider = timetableProvider();
  demand(provider, '尚未配置课表图片识别服务，照片没有发送给识别服务。', 503);
  const jpeg = await readPhoto(request);
  options.signal?.throwIfAborted();
  await options.reserve();
  options.signal?.throwIfAborted();
  if (provider === 'tencent') {
    const tables = await (options.recognizer || recognizeTimetableWithTencent)(jpeg);
    options.signal?.throwIfAborted();
    return { lessons: parseTimetableTables(tables), provider, requiresConfirmation: true };
  }
  const form = new FormData(); form.append('image', new Blob([Uint8Array.from(jpeg)], { type: 'image/jpeg' }), 'timetable.jpg');
  try {
    const result = await fetch(process.env.BNBU_TIMETABLE_UPSTREAM!, {
      method: 'POST', body: form, redirect: 'error',
      headers: process.env.BNBU_TIMETABLE_TOKEN ? { Authorization: `Bearer ${process.env.BNBU_TIMETABLE_TOKEN}` } : {},
      signal: AbortSignal.any([AbortSignal.timeout(45000), ...(options.signal ? [options.signal] : [])]),
    });
    demand(result.ok && result.headers.get('content-type')?.includes('application/json'), '识别服务返回无效。', 502);
    const reader = result.body?.getReader(); demand(reader, '识别服务返回为空。', 502);
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; demand(size <= 512 * 1024, '识别结果过大。', 502); chunks.push(value); }
    } finally { await reader.cancel(); }
    options.signal?.throwIfAborted();
    return { lessons: parseTimetableResponse(JSON.parse(Buffer.concat(chunks).toString('utf8'))).map(l => ({ ...l, needsReview: true })), provider, requiresConfirmation: true };
  } catch {
    options.signal?.throwIfAborted();
    throw new ServiceError(502, 'RECOGNITION_INVALID_RESPONSE', '识别服务未返回有效课表，请稍后重试，原课表已保留。');
  }
}
