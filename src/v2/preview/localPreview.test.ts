import { expect, it } from 'vitest'
import type { Workspace } from '../../live/api'
import { withPreviewSports } from './localPreview'

const fixture:Workspace={account:{id:'a',email:'student-a@example.test',roles:['student'],name:'王同学',organization:'模拟学院',status:'active'},entities:[{id:'profile',ownerId:'a',kind:'profile',data:{previewFixture:true},createdAt:'2026-10-17',updatedAt:'2026-10-17',version:1}],alumni:{profiles:[],slots:[],bookings:[],follows:[],notices:[],history:[]},notifications:[],people:[],relations:[],audit:[]}
it('模拟体育仅在已标记的本地验收账号开发环境生效',()=>{
  expect(withPreviewSports(fixture,false,'localhost')).toBe(fixture)
  expect(withPreviewSports(fixture,true,'campus.example.com')).toBe(fixture)
  expect(withPreviewSports({...fixture,entities:[]},true,'localhost').sports).toBeUndefined()
  expect(withPreviewSports({...fixture,account:{...fixture.account,email:'real@example.edu'}},true,'localhost').sports).toBeUndefined()
})
it('模拟记录属于当前账号且日期随当前预览时间滚动',()=>{
  const data=withPreviewSports(fixture,true,'127.0.0.1',Date.parse('2026-10-17T08:00:00Z'))
  expect(data.sports?.progress?.completedHours).toBe(16)
  expect(data.sportsDashboard?.records).toHaveLength(8)
  expect(data.sportsDashboard?.records?.every(r=>r.ownerId==='a')).toBe(true)
  expect(data.sportsDashboard?.records?.[0].createdAt).toBe('2026-10-16T08:00:00.000Z')
})
