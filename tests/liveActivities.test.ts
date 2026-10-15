import { describe, expect, it } from 'vitest'
import type { Workspace } from '../src/live/api'
import campusPhoto from '../src/assets/campus/home-background.jpg'
import { liveActivities } from '../src/v2/liveActivities'

const workspace = (...images: unknown[]): Workspace => ({
  entities: images.map((image, index) => ({
    id: `activity-${index}`, kind: 'activity', ownerId: null, version: 1,
    createdAt: '2026-10-12T00:00:00Z', updatedAt: '2026-10-12T00:00:00Z',
    data: {title: '活动', startAt: '2026-10-20T10:00:00Z', location: '校园', status: 'published', source: 'mail', image},
  })),
} as Workspace)

describe('活动真实封面与默认封面', () => {
  it('已有海报原样保留，不替换成通用图片', () => {
    const images = ['https://school.example/poster.jpg', '/uploads/poster.webp', 'data:image/png;base64,aW1hZ2U=']
    const items = liveActivities(workspace(...images))
    expect(items.map(item => item.image)).toEqual(images)
    expect(items.every(item => item.isDefaultCover === false)).toBe(true)
  })

  it('缺少海报及旧绿色占位图统一使用校园照片，并标明默认封面而不改写原记录', () => {
    const data = workspace(undefined, '', '  ', '/activity-default-cover.svg')
    const original = JSON.stringify(data)
    const items = liveActivities(data)
    expect(items).toHaveLength(4)
    expect(items.every(item => item.image === campusPhoto && item.isDefaultCover)).toBe(true)
    expect(JSON.stringify(data)).toBe(original)
    expect(items[3].local?.image).toBe('/activity-default-cover.svg')
  })

  it('没有后台活动时不混入旧演示活动', () => {
    expect(liveActivities(null)).toEqual([])
    expect(liveActivities(workspace())).toEqual([])
  })

  it('核对发布的截图活动显示独立来源', () => {
    const data = workspace(undefined)
    data.entities[0].data.source = 'screenshot'
    const activity = liveActivities(data)[0]
    expect(activity.subtitle).toBe('来自活动海报或通知')
    expect(activity.category).toBe('学校活动')
    expect(activity.local?.mailSourceId).toBe('activity-0')
  })
})
