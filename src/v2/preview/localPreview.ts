import type { LiveEntity, Workspace } from '../../live/api'

export function isLocalPreview(data: Workspace, development: boolean, hostname: string) {
  return development && ['127.0.0.1', 'localhost', '[::1]'].includes(hostname)
    && /^(student-[ab]|teacher|admin|reviewer|operator)@example\.test$/.test(data.account.email)
    && data.entities.some(e => e.ownerId === data.account.id && e.kind === 'profile' && e.data.previewFixture === true)
}

/** Display-only fixture. Sports writes still belong to the sports platform. */
export function withPreviewSports(data: Workspace, development: boolean, hostname: string, now = Date.now()): Workspace {
  if (!isLocalPreview(data, development, hostname) || !data.account.roles.includes('student')) return data
  const entity = (id: string, kind: string, fields: Record<string, unknown>, days = 0): LiveEntity => ({
    id, kind, ownerId: data.account.id, data: fields, version: 1,
    createdAt: new Date(now - days * 86400000).toISOString(), updatedAt: new Date(now).toISOString(),
  })
  return {...data, sportsStatus:'available', sports:{source:'local', role:'student', progress:{
    source:'local', semester:'模拟学期', course:'体育课程（模拟）', status:'in-progress',
    completedHours:16, targetHours:24, remainingHours:8, percent:16 / 24 * 100,
  }}, sportsDashboard:{serverNow:now, identity:entity('preview-sports-identity','identity',{role:'student'}),
    records:Array.from({length:8},(_,i)=>entity(`preview-sport-${i}`,'record',{
      sportName:i%2?'体育场馆（模拟）':'户外跑步（模拟）',status:i===0?'TEACHER_PENDING':'VALID',
      durationSeconds:3600, creditedSeconds:i===0?0:3600,
    },i+1)),
  }}
}
