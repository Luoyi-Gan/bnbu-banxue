import { SportsPortal } from '../src/live/SportsPortal';
import type { Workspace } from '../src/live/api';
import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { openDatabase } from '../backend/src/database';
import { createAccount, login } from '../backend/src/auth';
import { Repository } from '../backend/src/repository';
import { snapshot } from '../backend/src/commands';
import { SportsProgressCard } from '../src/v2/SportsProgressCard';

it('未配置真实体育源时不会展示伴学库残留的测试身份和运动数据', () => {
  const db=openDatabase(':memory:');
  try {
    const id=createAccount(db,{email:'student@example.test',password:'Password-12345',name:'同学',roles:['student']});
    const actor=login(db,'student@example.test','Password-12345').account,repo=new Repository(db);
    repo.create('sportsIdentity',id,{role:'student',status:'verified'});
    const semester=repo.create('sportsSemester',null,{status:'CURRENT'});
    const course=repo.create('sportsCourse',id,{semesterId:semester.id,status:'PUBLISHED',relatedTarget:600,otherTarget:600});
    repo.create('sportsEnrollment',id,{courseId:course.id,semesterId:semester.id,status:'ACTIVE'});
    repo.create('sportsProgress',id,{courseId:course.id,total:630,sequence:1});
    expect(snapshot(db,actor).sports).toBeNull();
  } finally { db.close(); }
});
it('未接入的体育摘要不生成零进度卡片',()=>{
  expect(renderToStaticMarkup(<MemoryRouter><SportsProgressCard sports={null}/></MemoryRouter>)).toBe('');
});

it('确认无课保持空内容，读取失败不伪装无课，不按年级或管理员角色开放体育面板',()=>{
 const workspace={account:{roles:['student']},sports:null,sportsStatus:'not-enrolled'} as Workspace;
 const render=(value:Workspace)=>renderToStaticMarkup(<MemoryRouter><SportsPortal workspace={value}/></MemoryRouter>);
 expect(render(workspace)).toBe('');
 expect(render({...workspace,sportsStatus:'unavailable'})).toContain('无法确认课程情况');
 expect(render({...workspace,sportsStatus:'unavailable',account:{...workspace.account,roles:['superadmin']}})).toContain('无法确认课程情况');
});
