import {it,expect} from 'vitest';
import {liveSearch} from '../src/v2/liveSearch';
import type {Workspace} from '../src/live/api';
it('搜索只列出后端可见内容与本人待审帖子，不回退演示数据',()=>{
  const data = {account:{id:'self'},people:[],entities:[
    {id:'event',kind:'activity',data:{status:'published',title:'真实活动'}},
    {id:'draft',kind:'activity',data:{status:'draft'}},
    {id:'mine',kind:'post',ownerId:'self',data:{status:'pending'}},
    {id:'other',kind:'post',ownerId:'other',data:{status:'pending'}},
    {id:'hidden',kind:'post',data:{status:'hidden'}},
    {id:'room',kind:'room',data:{status:'open',visibility:'visible'}},
    {id:'closed',kind:'room',data:{status:'finished',visibility:'visible'}},
    {id:'private',kind:'room',data:{status:'open',visibility:'hidden'}},
  ]} as unknown as Workspace;
  expect(liveSearch(data).map(r=>r.id)).toEqual(['event','mine','room']);
  expect(liveSearch(null)).toEqual([]);
});
