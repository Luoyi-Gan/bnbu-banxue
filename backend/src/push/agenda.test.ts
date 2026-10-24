import {describe,it,expect} from 'vitest';
import {projectPushAgenda,selectLiveAgenda,validateSettings,defaultPushSettings,type AgendaOccurrence} from './agenda';
import type {Entity} from '../repository';
const now=Date.parse('2026-10-24T09:00:00+08:00');
const entity=(kind:string,id:string,data:Entity['data'],ownerId:string|null='a'):Entity=>({kind,id,data,ownerId,version:1,createdAt:'',updatedAt:''});
const activity=(id:string,start='2026-10-24T09:10:00+08:00',end='2026-10-24T10:00:00+08:00')=>entity('activity',id,{title:id,startAt:start,endAt:end,status:'published',visibility:'visible',location:'Library'},'other');
describe('push agenda',()=>{
 it('does not treat favorites or unconfirmed bookings as arrangements',()=>expect(projectPushAgenda('a',[activity('x'),entity('coffeeBooking','b',{status:'pending',slotId:'s'})],[{entity_id:'x',kind:'save'}],now)).toEqual([]));
 it('includes participant and owner activities, excludes hidden and finished',()=>{const rows=[activity('yes'),activity('hidden'),activity('old','2026-10-23T09:00:00+08:00','2026-10-23T10:00:00+08:00')];rows[1].data.visibility='hidden';expect(projectPushAgenda('a',rows,rows.map(x=>({entity_id:x.id,kind:'participate'})),now).map(x=>x.id)).toEqual(['yes']);});
 it('keeps overnight confirmed arrangements and stable identity across changes',()=>{const x=activity('x','2026-10-23T20:00:00+08:00','2026-10-24T10:00:00+08:00');x.ownerId='a';const before=projectPushAgenda('a',[x],[],now)[0];x.data.location='Other';const after=projectPushAgenda('a',[x],[],now)[0];expect(after.id).toBe(before.id);expect(after.version).not.toBe(before.version);});
 it('excludes unresolved/hidden courses and unknown weeks',()=>{const lesson={id:'l',name:'Math',weekday:6,startTime:'09:10',endTime:'10:00',weeks:'1-16'};const pref=entity('preferences','p',{academicCalendar:'custom',semesterStartDate:'2026-09-07'});const table=entity('timetable','t',{lessons:[lesson]});expect(projectPushAgenda('a',[pref,table],[],now).length).toBeGreaterThan(0);lesson.weeks='';expect(projectPushAgenda('a',[pref,table],[],now)).toEqual([]);lesson.weeks='1-16';pref.data.hiddenDailyCourses=['math'];expect(projectPushAgenda('a',[pref,table],[],now)).toEqual([]);});
 it('uses actual confirmed Coffee Chat slot and ignores proposed slot until accepted',()=>{const book=entity('coffeeBooking','b',{status:'confirmed',slotId:'s',proposedSlotId:'future'}),slot=entity('coffeeSlot','s',{startAt:'2026-10-24T09:30:00+08:00',endAt:'2026-10-24T10:00:00+08:00',location:'S'});expect(projectPushAgenda('a',[book,slot],[],now)[0].location).toBe('S');});
 it('uses the school holiday and makeup calendar without inventing lessons',()=>{
  const pref=entity('preferences','p',{academicCalendar:'bnbu-2026-s1'}),lesson={id:'monday',name:'Math',weekday:1,startTime:'09:10',endTime:'10:00',weeks:'1-14'};
  const table=entity('timetable','t',{lessons:[lesson]});
  const holiday=projectPushAgenda('a',[pref,table],[],Date.parse('2026-10-01T00:00:00+08:00'));
  expect(holiday).toEqual([]);
  const makeup=projectPushAgenda('a',[pref,table],[],Date.parse('2026-10-10T08:00:00+08:00'));
  expect(makeup[0].id).toBe('course:monday:2026-10-10');
  table.data.lessons=[{...lesson,needsReview:true}];expect(projectPushAgenda('a',[pref,table],[],Date.parse('2026-10-10T08:00:00+08:00'))).toEqual([]);
 });
 it('only projects confirmed alumni bookings for either participant and removes cancellations',()=>{
  const data={profiles:[{id:'p',owner:'mentor'}],slots:[{id:'s',alumniId:'p',startAt:'2026-10-24T09:10:00+08:00',endAt:'2026-10-24T10:00:00+08:00',location:'Library'}],bookings:[{id:'b',slotId:'s',student:'a',status:'confirmed'}]};
  const state=entity('alumniState','state',{value:data});
  expect(projectPushAgenda('a',[state],[],now)[0].id).toBe('b');
  expect(projectPushAgenda('mentor',[state],[],now)[0].id).toBe('b');
  expect(projectPushAgenda('stranger',[state],[],now)).toEqual([]);
  data.bookings[0].status='cancelled';expect(projectPushAgenda('a',[state],[],now)).toEqual([]);
 });
 const item=(id:string,start:number,end:number,kind:AgendaOccurrence['kind']='course'):AgendaOccurrence=>({id,kind,title:id,location:'',start,end,version:'1',target:{kind:'timetable',id}});
 it('prioritizes ongoing then earliest ending, and applies tie priorities',()=>{expect(selectLiveAgenda([item('future',100,200),item('ongoing',10,150)],50)?.id).toBe('ongoing');expect(selectLiveAgenda([item('late',10,200),item('soon',20,150)],50)?.id).toBe('soon');expect(selectLiveAgenda([item('activity',100,200,'activity'),item('course',100,200)],50)?.id).toBe('course');});
 it('does not recreate dismissed instances or start >15 minutes early',()=>{expect(selectLiveAgenda([item('dismissed',60,200),item('later',1000,2000)],50,['dismissed'])).toBeUndefined();});
 it('validates settings without altering existing web reminder preferences',()=>{expect(validateSettings({})).toEqual(defaultPushSettings);expect(()=>validateSettings({courseMinutes:1})).toThrow();expect(()=>validateSettings({notifications:'true'})).toThrow();expect(validateSettings({courseMinutes:0}).courseMinutes).toBe(0);});
});
