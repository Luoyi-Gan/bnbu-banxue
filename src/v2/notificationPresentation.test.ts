import { describe, expect, it } from 'vitest'
import type { Workspace, LiveEntity } from '../live/api'
import { noticeCategory, noticeDestination, type Notice } from './notificationPresentation'
import { liveStudentSchedule } from './liveStudentSchedule'

const entity = (id: string, kind: string, data: Record<string,unknown>): LiveEntity => ({id,kind,data,ownerId:'student',version:1,createdAt:'2026-10-17T08:00:00Z',updatedAt:'2026-10-17T08:00:00Z'})
const workspace = (entities: LiveEntity[]): Workspace => ({account:{id:'student'},entities,relations:[],people:[{id:'teacher',name:'老师'}],alumni:{bookings:[],slots:[],profiles:[]}} as unknown as Workspace)
const notice = (event: string, entityId: string | null): Notice => ({id:'notice',event,entityId,body:'通知正文',readAt:null,createdAt:'2026-10-17T08:00:00Z'})

describe('student notice and schedule destinations', () => {
  it('distinguishes activity, community, conversations and system messages', () => {
    expect(['activity.update','post.create','coffee.propose','room.decide','alumni.booking.cancel','account.disable'].map(noticeCategory)).toEqual(['活动','社区','交流','交流','交流','系统'])
  })
  it('does not invent destinations for hidden, missing or unrelated objects', () => {
    const data = workspace([entity('hidden','activity',{status:'draft'}),entity('room','room',{isMember:false})])
    expect(noticeDestination(notice('activity.update','hidden'),data)).toBeNull()
    expect(noticeDestination(notice('room.decide','room'),data)).toBeNull()
    expect(noticeDestination(notice('system.update',null),data)).toBeNull()
    expect(noticeDestination(notice('activity.update','missing'),data)).toBeNull()
    expect(noticeDestination(notice('post.deleted','post'),data)).toBeNull()
  })
  it('links a booking to the exact teacher and slot, and a comment to its parent post', () => {
    const data = workspace([entity('booking','coffeeBooking',{teacherId:'t/1',slotId:'s?1'}),entity('comment','comment',{postId:'p/1'})])
    expect(noticeDestination(notice('coffee.book','booking'),data)?.path).toBe('/v2/coffee?teacher=t%2F1&slot=s%3F1')
    expect(noticeDestination(notice('comment.create','comment'),data)?.path).toBe('/v2/community?item=p%2F1')
  })
  it('opens like and comment notices at their associated post', () => {
    const data = workspace([])
    for (const event of ['community.like','community.comment','community.reply','community.commentlike']) {
      expect(noticeDestination(notice(event,'post/1'),data)?.path).toBe('/v2/community?item=post%2F1')
    }
  })
  it('keeps calendar membership and confirmed booking rules while linking to specific objects', () => {
    const data = workspace([
      entity('room','room',{isMember:true,status:'open',visibility:'visible',title:'队伍',time:'周六',place:'校园'}),
      entity('slot','coffeeSlot',{startAt:'2026-10-18T08:00:00Z',endAt:'2026-10-18T09:00:00Z',location:'交流室'}),
      entity('booking','coffeeBooking',{status:'confirmed',teacherId:'teacher',slotId:'slot'}),
      entity('cancelled','coffeeBooking',{status:'cancelled',teacherId:'teacher',slotId:'slot'}),
      {...entity('unmarked','activity',{status:'published',title:'未标记活动',startAt:'2026-10-18T08:00:00Z'}),ownerId:'organizer'},
      entity('mine','activity',{status:'published',title:'本人主办活动',startAt:'2026-10-18T08:00:00Z'}),
    ])
    const items = liveStudentSchedule(data,Date.parse('2026-10-17T08:00:00Z'))
    expect(items.map(item => item.id)).toEqual(['booking','mine','room'])
    expect(items.map(item => item.path)).toEqual(['/v2/coffee?teacher=teacher&slot=slot','/v2/activities/mine','/v2/partners/teams?item=room'])
    expect(data.entities.find(item => item.id === 'booking')?.data.status).toBe('confirmed')
  })
})
