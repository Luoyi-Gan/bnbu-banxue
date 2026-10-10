import { parseTimetableResponse, type TimetableLesson } from './timetableModel'

export type RecognitionStage = 'preparing' | 'recognizing' | 'organizing'
// Configure a same-origin authenticated backend route; never put provider keys in VITE_*.
const configuredPath = String(import.meta.env.VITE_TIMETABLE_RECOGNITION_PATH ?? '')
export const timetableRecognitionPath = /^\/api\/[\w/-]+$/.test(configuredPath) ? configuredPath : ''
export function validateTimetablePhoto(file: Pick<File, 'type' | 'size'>) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('请上传 JPG、PNG 或 WebP 格式的课表照片。')
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('图片不能为空，大小不能超过 10 MB。')
}
export async function recognizeTimetable(file: File, signal: AbortSignal, onStage: (stage: RecognitionStage) => void, path = timetableRecognitionPath): Promise<TimetableLesson[]> {
  validateTimetablePhoto(file)
  if (!path) throw new Error('课表识别服务尚未接入，当前照片未上传。可先查看示例课表。')
  if (!/^\/api\/[\w/-]+$/.test(path)) throw new Error('识别接口配置无效。')
  onStage('preparing')
  const body = new FormData(); body.append('image', file)
  onStage('recognizing')
  const response = await fetch(path, { method: 'POST', body, credentials: 'same-origin', signal })
  if (!response.ok) throw new Error(response.status === 413 ? '图片过大，请缩小后重新上传。' : response.status === 401 || response.status === 403 ? '登录状态已失效，请重新登录后识别。' : '课表识别服务暂时不可用，请稍后重试。')
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('课表识别接口尚未正确接入。')
  onStage('organizing')
  return parseTimetableResponse(await response.json())
}

export const sampleTimetable: TimetableLesson[] = parseTimetableResponse({ lessons: [
  { name: '数据结构（示例）', weekday: 1, startTime: '09:00', endTime: '10:50', location: 'T2-202', teacher: '陈老师', weeks: '1–16 周', needsReview: false },
  { name: '大学英语（示例）', weekday: 1, startTime: '14:00', endTime: '15:50', location: 'T4-105', teacher: '王老师', weeks: '1–16 周', needsReview: false },
  { name: '微积分（示例）', weekday: 2, startTime: '10:00', endTime: '11:50', location: 'T3-301', weeks: '1–16 周', needsReview: false },
  { name: '学术写作（示例）', weekday: 3, startTime: '14:00', endTime: '15:50', location: 'T4-201', weeks: '单周', needsReview: false },
  { name: '课程项目（示例）', weekday: 4, startTime: '09:00', endTime: '10:50', location: '资源中心', weeks: '1–16 周', needsReview: false },
  { name: '体育（示例）', weekday: 5, startTime: '16:00', endTime: '17:50', location: '体育馆', weeks: '1–16 周', needsReview: false },
  { name: '摄影实践（示例）', weekday: 6, startTime: '10:00', endTime: '11:50', location: '校园集合点', weeks: '第 6 周', needsReview: false },
] })

export async function demonstrateRecognition(signal: AbortSignal, onStage: (stage: RecognitionStage) => void) {
  for (const stage of ['preparing', 'recognizing', 'organizing'] as const) {
    signal.throwIfAborted(); onStage(stage)
    await new Promise<void>((resolve, reject) => {
      const cancel = () => { clearTimeout(timer); reject(new DOMException('已取消', 'AbortError')) }
      const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve() }, 550)
      signal.addEventListener('abort', cancel, { once: true })
    })
  }
  return sampleTimetable
}
