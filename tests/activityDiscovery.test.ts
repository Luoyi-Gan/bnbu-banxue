import { describe, expect, it } from 'vitest'
import { initialV2State, type LocalEvent } from '../shared/v2/model'
import { setActivityReaction } from '../src/v2/activityReactions'
import { savedActivityItems, seededActivities } from '../src/v2/activityCatalog'
import { discoveryColumns } from '../src/v2/discoveryLayout'

const local: LocalEvent = { id: 'local-discovery', title: '校园摄影', description: '校园摄影分享', startAt: '2026-10-12T12:00:00', location: 'T2', capacity: 10, status: 'published', registrations: 0 }

describe('活动发现的个人互动', () => {
  it('兼容没有互动字段的旧存档，并且重复设置只保留一份', () => {
    const id = seededActivities[0].id
    const liked = setActivityReaction(initialV2State, id, 'likedActivities', true)
    const saved = setActivityReaction(liked, id, 'savedActivities', true)
    expect(setActivityReaction(saved, id, 'likedActivities', true)).toBe(saved)
    expect(setActivityReaction(saved, id, 'savedActivities', true)).toBe(saved)
    expect(saved.likedActivities).toEqual([id])
    expect(saved.savedActivities).toEqual([id])
    expect(saved.participatingActivities).toEqual(initialV2State.participatingActivities)
    expect(setActivityReaction(saved, id, 'likedActivities', false).likedActivities).toEqual([])
    expect(setActivityReaction(saved, id, 'savedActivities', false).savedActivities).toEqual([])
  })
  it('拒绝对不存在、下架的活动新增互动，拒绝其他角色操作', () => {
    const state = { ...initialV2State, localEvents: [{ ...local, status: 'draft' as const }] }
    for (const kind of ['likedActivities', 'savedActivities'] as const) {
      expect(setActivityReaction(state, local.id, kind, true)).toBe(state)
      expect(setActivityReaction(state, 'missing', kind, true)).toBe(state)
      const teacher = { ...initialV2State, role: 'teacher' as const }
      expect(setActivityReaction(teacher, seededActivities[0].id, kind, true)).toBe(teacher)
    }
  })
  it('收藏同步个人列表，下架隐藏内容、保留记录，恢复后可见', () => {
    const state = setActivityReaction({ ...initialV2State, localEvents: [local] }, local.id, 'savedActivities', true)
    expect(savedActivityItems(state).map(item => item.id)).toEqual([local.id])
    const hidden = { ...state, localEvents: [{ ...local, status: 'draft' as const }] }
    expect(savedActivityItems(hidden)).toEqual([])
    expect(hidden.savedActivities).toEqual([local.id])
    expect(savedActivityItems({ ...hidden, localEvents: [local] })).toHaveLength(1)
    expect(setActivityReaction(hidden, local.id, 'savedActivities', false).savedActivities).toEqual([])
  })
  it('历史结束的公开活动可以点赞，不产生报名或参与记录', () => {
    const state = { ...initialV2State, localEvents: [{ ...local, startAt: '2020-01-01T10:00:00' }] }
    const next = setActivityReaction(state, local.id, 'likedActivities', true)
    expect(next.likedActivities).toEqual([local.id])
    expect(next.eventRegistrations).toBe(state.eventRegistrations)
    expect(next.participatingActivities).toBe(state.participatingActivities)
  })
})

describe('瀑布流追加布局', () => {
  it('多个批次追加不会挪动原有卡片所在列及顺序，也不会漏项或重复', () => {
    const items = Array.from({ length: 300 }, (_, index) => ({ id: `event-${index}` }))
    for (const count of [2, 3, 4]) {
      const first = discoveryColumns(items.slice(0, 6), count, 200)
      const second = discoveryColumns(items.slice(0, 12), count, 200)
      const full = discoveryColumns(items, count, 200)
      first.forEach((column, index) => expect(second[index].slice(0, column.length)).toEqual(column))
      second.forEach((column, index) => expect(full[index].slice(0, column.length)).toEqual(column))
      expect(new Set(full.flat().map(item => item.id)).size).toBe(300)
      expect(full.flat()).toHaveLength(300)
    }
  })
})
