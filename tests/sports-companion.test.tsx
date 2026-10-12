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

it('确认无课保持空内容，源未接通仍保留现有看板布局且不展示虚构统计',()=>{
 const workspace={account:{roles:['student']},sports:null,sportsStatus:'not-enrolled'} as Workspace;
 const render=(value:Workspace)=>renderToStaticMarkup(<MemoryRouter><SportsPortal workspace={value}/></MemoryRouter>);
 expect(render(workspace)).toBe('');
 const unavailable=render({...workspace,sportsStatus:'unavailable'});
 for(const text of ['无法确认课程情况','sports-hero','运动数据总览','运动提交趋势','记录状态分布','sports-course-panel']) expect(unavailable).toContain(text);
 expect(unavailable).not.toContain('当前展示：伴学本地数据');
 expect(unavailable).not.toContain('<iframe');
 expect(unavailable).toContain('disabled="" aria-label="刷新体育数据"');
 expect(render({...workspace,sportsStatus:'unavailable',account:{...workspace.account,roles:['superadmin']}})).toContain('无法确认课程情况');
});

it('学生完整看板只使用可用源的授权投影，源失败时隐藏旧数据而保留图表',()=>{
 const entity=(id:string,data:Record<string,unknown>)=>({id,kind:'fixture',ownerId:'student',data,version:1,createdAt:'2026-10-12T00:00:00Z',updatedAt:'2026-10-12T00:00:00Z'});
 const workspace={account:{roles:['student']},sports:{source:'local',role:'student',progress:null},sportsStatus:'available',sportsDashboard:{
   identity:entity('identity',{role:'student'}),serverNow:Date.parse('2026-10-12T00:00:00Z'),
   semesters:[entity('semester',{status:'CURRENT',name:'测试学期'})],
   courses:[entity('course',{semesterId:'semester',name:'授权课程样例',status:'PUBLISHED'})],
   enrollments:[entity('enrollment',{courseId:'course',status:'ACTIVE'})],records:[],
   progress:[entity('progress',{courseId:'course',total:630,sequence:1})],
 }} as Workspace;
 const render=(value:Workspace)=>renderToStaticMarkup(<SportsPortal workspace={value}/>);
 const available=render(workspace);
 expect(available).toContain('运动提交趋势');
 expect(available).toContain('授权课程样例');
 expect(available).toContain('630');
 const failed=render({...workspace,sportsStatus:'unavailable'});
 expect(failed).toContain('运动提交趋势');
 expect(failed).not.toContain('授权课程样例');
 expect(failed).not.toContain('>630<');
});
