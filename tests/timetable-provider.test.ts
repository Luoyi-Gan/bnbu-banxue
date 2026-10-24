import { afterEach, expect, it, vi } from 'vitest';
import { recognizeTimetableWithTencent } from '../backend/src/timetable';
import { timetableProvider } from '../backend/src/timetable-config';
const spy = vi.hoisted(() => ({ request: vi.fn(), config: vi.fn() }));
vi.mock('tencentcloud-sdk-nodejs-ocr', () => ({ ocr: { v20181119: { Client: class {
  constructor(config: unknown) { spy.config(config); }
  RecognizeTableAccurateOCR = spy.request;
} } } }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
it('uses the table V3 geometry API with server-only credentials and no URL or account data', async () => {
  vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_ID', 'test-id'); vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_KEY', 'test-secret');
  vi.stubEnv('BNBU_TIMETABLE_OCR_REGION', 'ap-guangzhou');
  spy.request.mockResolvedValue({ TableDetections: [{ Cells: [] }] });
  expect(await recognizeTimetableWithTencent(Buffer.from('normalized-image'))).toEqual([{ Cells: [] }]);
  expect(spy.request).toHaveBeenCalledExactlyOnceWith({ ImageBase64: Buffer.from('normalized-image').toString('base64'), UseNewModel: false });
  expect(spy.config.mock.calls[0][0]).toMatchObject({ credential: { secretId: 'test-id', secretKey: 'test-secret' }, region: 'ap-guangzhou' });
});
it('sanitizes provider failures without returning credentials or provider response bodies', async () => {
  spy.request.mockRejectedValue(new Error('test-secret private-photo'));
  await expect(recognizeTimetableWithTencent(Buffer.from('photo'))).rejects.toMatchObject({ status: 502, code: 'TIMETABLE_OCR_UNAVAILABLE' });
});
it('advertises only a fully configured provider and rejects insecure upstream URLs', () => {
  vi.stubEnv('BNBU_TIMETABLE_PROVIDER', ''); vi.stubEnv('BNBU_TIMETABLE_UPSTREAM', '');
  vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_ID', ''); vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_KEY', '');
  expect(timetableProvider()).toBeNull();
  vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_ID', 'id'); expect(timetableProvider()).toBeNull();
  vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_KEY', 'key'); expect(timetableProvider()).toBe('tencent');
  vi.stubEnv('BNBU_TIMETABLE_PROVIDER', 'upstream');
  for (const url of ['http://external.example/api', 'file:///tmp/photo', 'invalid']) { vi.stubEnv('BNBU_TIMETABLE_UPSTREAM', url); expect(timetableProvider()).toBeNull(); }
  vi.stubEnv('BNBU_TIMETABLE_UPSTREAM', 'https://ocr.example/api'); expect(timetableProvider()).toBe('upstream');
  vi.stubEnv('BNBU_TIMETABLE_UPSTREAM', 'http://127.0.0.1:1234/api'); expect(timetableProvider()).toBe('upstream');
  vi.stubEnv('BNBU_TIMETABLE_PROVIDER', 'typo'); expect(timetableProvider()).toBeNull();
});
