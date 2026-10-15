import type { IncomingMessage } from 'node:http'
import { demand, ServiceError } from './auth'

export type ScreenshotRecognition = { text: string; requestId: string }
export type ScreenshotRecognizer = (bytes: Buffer, mime: 'image/png' | 'image/jpeg') => Promise<ScreenshotRecognition>

export const activityOcrConfigured = () => Boolean(process.env.BNBU_ACTIVITY_OCR_SECRET_ID && process.env.BNBU_ACTIVITY_OCR_SECRET_KEY)

export async function recognizeWithTencent(bytes: Buffer): Promise<ScreenshotRecognition> {
  demand(activityOcrConfigured(), '尚未配置活动截图 OCR 服务。', 503)
  try {
    const { ocr } = await import('tencentcloud-sdk-nodejs-ocr')
    const client = new ocr.v20181119.Client({
      credential: { secretId: process.env.BNBU_ACTIVITY_OCR_SECRET_ID!, secretKey: process.env.BNBU_ACTIVITY_OCR_SECRET_KEY! },
      region: process.env.BNBU_ACTIVITY_OCR_REGION || 'ap-guangzhou',
      profile: { httpProfile: { endpoint: 'ocr.tencentcloudapi.com', reqTimeout: 20 } },
    })
    const result = await client.GeneralAccurateOCR({ ImageBase64: bytes.toString('base64') })
    return {
      text: (result.TextDetections ?? []).map(item => item.DetectedText?.trim()).filter(Boolean).join('\n').slice(0, 20_000),
      requestId: result.RequestId ?? '',
    }
  } catch {
    throw new ServiceError(502, 'ACTIVITY_OCR_UNAVAILABLE', '活动截图识别暂不可用，未保存或发布活动。')
  }
}

export async function recognizeActivityScreenshot(request: IncomingMessage, recognizer: ScreenshotRecognizer = recognizeWithTencent) {
  let size = 0
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    size += chunk.length
    demand(size <= 6 * 1024 * 1024, '活动截图不能超过 5 MB。', 413)
    chunks.push(chunk)
  }
  const envelope = new Request('http://127.0.0.1/upload', {
    method: 'POST',
    headers: { 'Content-Type': request.headers['content-type'] ?? '' },
    body: new Blob([Uint8Array.from(Buffer.concat(chunks))]),
  })
  let file: FormDataEntryValue | null
  try { file = (await envelope.formData()).get('image') }
  catch { throw new ServiceError(400, 'INVALID_IMAGE_UPLOAD', '请上传 PNG 或 JPG 活动截图。') }
  demand(file instanceof File && file.size > 0 && file.size <= 5 * 1024 * 1024 && (file.type === 'image/png' || file.type === 'image/jpeg'), '请上传不超过 5 MB 的 PNG 或 JPG 活动截图。')
  const bytes = Buffer.from(await file.arrayBuffer())
  demand(file.type === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) : bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')), '活动截图格式无效。')
  const result = await recognizer(bytes, file.type)
  demand(result.text.trim(), '截图未识别出文字，请换一张清晰图片。', 422)
  return { ...result, image: `data:${file.type};base64,${bytes.toString('base64')}` }
}
