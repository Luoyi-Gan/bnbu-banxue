import { describe, expect, it } from 'vitest'
import { addRoomReview, finishRoom, roomReviewAverage } from '../src/v2/roomReviewPolicy'
import { initialV2State, studentName, type RoomReview } from '../src/v2/model'

const state = () => structuredClone(initialV2State)
const review = (changes: Partial<RoomReview> = {}): RoomReview => ({ id: 'review-1', roomId: 'room-ai', from: studentName, to: '许宁', stars: 5, tags: ['合作愉快'], comment: '', date: '10月9日', ...changes })

describe('finished team reviews', () => {
  it('only lets the owner finish and preserves applications and members', () => {
    const value = state()
    expect(() => finishRoom(value, 'room-ai', '许宁')).toThrow('队长')
    const next = finishRoom(value, 'room-ai', studentName)
    expect(next.rooms.find((room) => room.id === 'room-ai')).toMatchObject({ status: 'finished', requests: ['李明'], members: [studentName, '许宁'] })
    expect(value.rooms.find((room) => room.id === 'room-ai')?.status).toBe('open')
    expect(() => finishRoom(next, 'room-ai', studentName)).toThrow()
  })
  it('only accepts one valid review per member pair after completion', () => {
    const value = state()
    expect(() => addRoomReview(value, review())).toThrow('已完成')
    const finished = finishRoom(value, 'room-ai', studentName)
    expect(() => addRoomReview(finished, review({ to: '李明' }))).toThrow('已加入')
    expect(() => addRoomReview(finished, review({ stars: 0 }))).toThrow('1 至 5')
    const next = addRoomReview(finished, review())
    expect(next.roomReviews).toHaveLength(1)
    expect(() => addRoomReview(next, review({ id: 'review-2' }))).toThrow('只能评价一次')
  })
  it('hides the average until three reviews exist', () => {
    const one = [review()]
    expect(roomReviewAverage(one, 'room-ai')).toBeNull()
    expect(roomReviewAverage([...one, review({ id: '2', from: '许宁', to: studentName, stars: 4 }), review({ id: '3', from: '林同学', to: studentName, stars: 3 })], 'room-ai')).toBe(4)
  })
})
