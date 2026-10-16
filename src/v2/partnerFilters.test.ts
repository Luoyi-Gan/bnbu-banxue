import { describe, expect, it } from 'vitest'
import { emptyPartnerFilters, filterPartnerRooms, type PartnerRoom } from './partnerFilters'

const room = (id: string, type: PartnerRoom['type'], details: PartnerRoom['details']): PartnerRoom => ({ id, type, title: id, body: '', time: '周五', place: '学校南门', capacity: 4, memberCount: 1, members: ['author'], owner: 'author', status: 'open', requests: [], details })

describe('找搭子结构化筛选', () => {
  const rooms = [room('car', 'carpool', { startsAt: '2026-10-16T17:30:00', departurePlace: '学校南门', destinationPlace: '珠海站', destinationAddress: '珠海市香洲区' }), room('sport', 'sport', { startsAt: '2026-10-17T09:00:00', sportType: '羽毛球', locationScope: 'campus', extraCost: false, genderPreference: 'any' }), room('legacy', 'study', {})]
  it('组合时间、地点和类别，缺少结构化字段的旧队伍不匹配', () => {
    expect(filterPartnerRooms(rooms, { ...emptyPartnerFilters, type: 'carpool', location: '珠海', timeFrom: '2026-10-16T17:00' }).map(item => item.id)).toEqual(['car'])
    expect(filterPartnerRooms(rooms, { ...emptyPartnerFilters, location: '香洲区' }).map(item => item.id)).toEqual(['car'])
    expect(filterPartnerRooms(rooms, { ...emptyPartnerFilters, timeFrom: '2026-10-16T17:00' }).map(item => item.id)).toEqual(['car', 'sport'])
  })
  it('运动筛选按已声明条件组合，性别偏好不是入队资格', () => {
    expect(filterPartnerRooms(rooms, { ...emptyPartnerFilters, type: 'sport', sportType: '羽毛球', locationScope: 'campus', extraCost: 'no', genderPreference: 'any' }).map(item => item.id)).toEqual(['sport'])
  })
  it('课程绩点区间相交才匹配', () => {
    const courses = [room('course', 'study', {gpaMin: 3, gpaMax: 3.5}), room('unknown', 'study', {})]
    expect(filterPartnerRooms(courses, { ...emptyPartnerFilters, gpaMin: '3.4', gpaMax: '3.8' }).map(item => item.id)).toEqual(['course'])
  })
})
