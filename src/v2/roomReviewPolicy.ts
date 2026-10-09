import type { RoomReview, V2State } from './model'

export function finishRoom(state: V2State, roomId: string, actor: string): V2State {
  const room = state.rooms.find((item) => item.id === roomId)
  if (!room || room.owner !== actor || room.status !== 'open') throw new Error('只有队长可以结束进行中的队伍')
  return { ...state, rooms: state.rooms.map((item) => item.id === roomId ? { ...item, status: 'finished' } : item) }
}

export function addRoomReview(state: V2State, review: RoomReview): V2State {
  const room = state.rooms.find((item) => item.id === review.roomId)
  if (!room || room.status !== 'finished') throw new Error('只能评价已完成的队伍')
  if (review.from === review.to || !room.members.includes(review.from) || !room.members.includes(review.to)) throw new Error('只有已加入成员可以互评')
  if (!Number.isInteger(review.stars) || review.stars < 1 || review.stars > 5) throw new Error('请选择 1 至 5 星')
  if (state.roomReviews.some((item) => item.roomId === review.roomId && item.from === review.from && item.to === review.to)) throw new Error('每位搭子只能评价一次')
  return { ...state, roomReviews: [review, ...state.roomReviews] }
}

export function roomReviewAverage(reviews: RoomReview[], roomId: string): number | null {
  const matching = reviews.filter((item) => item.roomId === roomId)
  return matching.length >= 3 ? matching.reduce((sum, item) => sum + item.stars, 0) / matching.length : null
}
