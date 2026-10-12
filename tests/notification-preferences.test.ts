import {describe,it,expect} from 'vitest';
import {notificationPreferences,showNoticeBadge} from '../src/v2/notificationPreferences';
import type {Workspace} from '../src/live/api';
describe('通知提醒与阅读状态分离',()=>{
  it('独立控制组队与消息红点，重新开启恢复未读提示',()=>{
    const data = {account:{id:'a'},entities:[{kind:'preferences',ownerId:'a',data:{teams:false,messages:true}}]} as unknown as Workspace;
    const team = {event:'room.apply',readAt:null} as Workspace['notifications'][number];
    const other = {...team,event:'activity.updated'};
    expect(showNoticeBadge(data,team)).toBe(false);
    expect(showNoticeBadge(data,other)).toBe(true);
    data.entities[0].data={teams:true,messages:false};
    expect(showNoticeBadge(data,team)).toBe(true);
    expect(showNoticeBadge(data,other)).toBe(false);
    expect(showNoticeBadge(data,{...team,readAt:'2026-10-12'})).toBe(false);
    expect(team.readAt).toBeNull();
    expect(notificationPreferences(null)).toEqual({teams:true,messages:true});
  });
});
