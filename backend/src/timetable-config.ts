export function timetableProvider(): 'tencent' | 'upstream' | null {
  const chosen = process.env.BNBU_TIMETABLE_PROVIDER || (process.env.BNBU_TIMETABLE_UPSTREAM ? 'upstream' : 'tencent');
  if (chosen === 'upstream') {
    try {
      const url = new URL(process.env.BNBU_TIMETABLE_UPSTREAM || '');
      return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) ? 'upstream' : null;
    } catch { return null; }
  }
  return chosen === 'tencent' && process.env.BNBU_TIMETABLE_OCR_SECRET_ID && process.env.BNBU_TIMETABLE_OCR_SECRET_KEY ? 'tencent' : null;
}
