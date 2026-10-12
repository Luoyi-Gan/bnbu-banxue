import {expect, it} from 'vitest'
import {liveRelationships} from '../src/v2/liveRelationships'
import type {Workspace} from '../src/live/api'
it('仅关联本人对象，关闭队伍不展开成员，不将收藏视为参与', () => {
  const data = {account:{id:'me'}, people:[{id:'other',name:'同学'}], relations:[{entityId:'saved',kind:'save'},{entityId:'marked',kind:'participate'}], alumni:{profiles:[],slots:[],bookings:[]}, entities:[
    {id:'saved',kind:'activity',ownerId:'other',data:{status:'published',title:'收藏'}},
    {id:'marked',kind:'activity',ownerId:'other',data:{status:'published',title:'参与'}},
    {id:'open',kind:'room',ownerId:'other',data:{title:'开放',isMember:true,status:'open',visibility:'visible',members:['me','other']}},
    {id:'closed',kind:'room',ownerId:'me',data:{title:'结束',isMember:true,status:'finished',visibility:'visible',members:['me','other']}},
    {id:'stranger',kind:'room',ownerId:'other',data:{title:'无关',isMember:false,status:'open',visibility:'visible',members:[]}},
  ]} as unknown as Workspace
  const result=liveRelationships(data)
  expect(result.map(e=>e.sourceId)).toEqual(['marked','open','closed'])
  expect(result.find(e=>e.sourceId==='open')?.members).toEqual([{id:'person:other',name:'同学',canView:true,relation:'同队成员 · 不代表好友或共同到场'}])
  expect(result.find(e=>e.sourceId==='closed')).toMatchObject({active:false,members:[],establishedAt:null})
  expect(liveRelationships(null)).toEqual([])
})
