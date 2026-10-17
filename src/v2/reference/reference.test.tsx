import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { mkdirSync, writeFileSync } from 'node:fs'
import type { LiveEntity, Workspace } from '../../live/api'
import * as workspaceHook from '../useWorkspaceBackend'
import * as communityHook from '../useCommunityBackend'
import { ReferenceHome, ReferenceCampus, ReferenceMe, ReferenceDiscover, ReferenceSports } from './pages'
import { campusDate, ownLessons, sportsSummary, weekDates } from './model'
import type { Post } from '../../../shared/v2/model'

const stamp='2026-10-17T09:00:00+08:00'
const entity=(id:string,kind:string,data:Record<string,unknown>,ownerId:string|null='student'):LiveEntity=>({id,kind,data,ownerId,createdAt:stamp,updatedAt:stamp,version:1})
const fixture:Workspace={account:{id:'student',name:'王同学',email:'layout@example.test',organization:'计算机科学与技术 · 2024级',studentNumber:'2024001234',roles:['student'],status:'active'},entities:[
  entity('event-a','activity',{title:'秋日摄影分享会',description:'用镜头记录校园的季节',location:'校园公共空间',startAt:'2026-10-25T14:00:00+08:00',endAt:'2026-10-25T17:00:00+08:00',status:'published',image:'/src/assets/campus/home-background.jpg',host:'摄影社'}),
  entity('event-b','activity',{title:'计算机前沿技术分享会',description:'分享项目经历，交流新的想法',location:'教学楼',startAt:'2026-10-26T19:00:00+08:00',endAt:'2026-10-26T21:00:00+08:00',status:'published',image:'/src/assets/campus/campus-services.jpg',host:'计算机协会'}),
  ...['计算机协会','摄影社','羽毛球社','志愿者协会'].map((name,i)=>entity(`org-${i}`,'organization',{name,category:['学术','艺术','运动','公益'][i],status:'approved',visibility:'visible'})),
  entity('room-1','room',{title:'寻找高数学习搭子',place:'图书馆',time:'周末下午',status:'open',visibility:'visible',isMember:true}),
  entity('room-2','room',{title:'羽毛球搭子',place:'体育馆',time:'周三下午',status:'open',visibility:'visible',isMember:false},'another'),
  entity('timetable','timetable',{lessons:[{id:'math',name:'高等数学',weekday:6,startTime:'08:00',endTime:'08:50',location:'教A101',teacher:'张老师',period:'',weeks:'1–16周',note:'',needsReview:false},{id:'structure',name:'数据结构',weekday:6,startTime:'11:00',endTime:'11:50',location:'教B302',teacher:'李老师',period:'',weeks:'1–16周',note:'',needsReview:false},{id:'english',name:'大学英语',weekday:6,startTime:'14:00',endTime:'15:50',location:'教C201',teacher:'',period:'',weeks:'1–16周',note:'',needsReview:false}]}),
],relations:[{entityId:'event-a',kind:'participate',createdAt:stamp},{entityId:'org-1',kind:'follow',createdAt:stamp},{entityId:'event-b',kind:'save',createdAt:stamp}],notifications:[],people:[],audit:[],alumni:{profiles:[],follows:[],slots:[],bookings:[],notices:[],history:[]},sportsStatus:'available',sports:{source:'local',role:'student',progress:{source:'local',semester:'2026秋季学期',course:'体育课程',status:'in-progress',completedHours:16,targetHours:24,remainingHours:8,percent:66.6}},sportsDashboard:{serverNow:Date.parse(stamp),identity:entity('identity','identity',{role:'student'}),records:[entity('run-1','record',{sportName:'户外跑步',status:'VALID'}),entity('run-2','record',{sportName:'体育场馆',status:'TEACHER_PENDING'})]}}
const posts:Post[]=[{id:'post-a',title:'秋日校园',body:'记录校园里平常而美好的瞬间。',images:['/src/assets/campus/home-background.jpg'],board:'校园',author:'摄影社',date:stamp,likes:0,status:'visible',comments:[]},{id:'post-b',title:'傍晚的校园',body:'分享你喜欢的校园风景。',images:['/src/assets/campus/evening-campus.jpg'],board:'生活',author:'同学',date:stamp,likes:0,status:'visible',comments:[]},{id:'post-c',title:'校园生活回顾',body:'认识同学，也认识更大的世界。',images:['/src/assets/campus/campus-services.jpg'],board:'校园',author:'计算机协会',date:stamp,likes:0,status:'visible',comments:[]}]
beforeEach(()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-17T10:00:00+08:00'))
  vi.spyOn(workspaceHook,'useWorkspaceBackend').mockReturnValue({data:fixture,error:'',busy:false,mutate:vi.fn().mockResolvedValue(true),refresh:vi.fn().mockResolvedValue(undefined)})
  vi.spyOn(communityHook,'useCommunityBackend').mockReturnValue({account:{id:'student',name:'王同学'},posts,likedPosts:[],savedPosts:[],error:'',busy:false,detailPost:null,detailCommentsHasMore:false,detailCommentPage:1,mutate:vi.fn(),recordOpen:vi.fn(),loadMore:vi.fn(),loadPost:vi.fn()})
})
afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers()})

it('上海日期和周日历在跨日及跨月边界保持一致',()=>{
  expect(campusDate('2026-10-31T17:00:00Z')).toBe('2026-11-01')
  const days=weekDates(new Date('2026-10-31T17:00:00Z'))
  expect(days[0].key).toBe('2026-10-26');expect(days[6].key).toBe('2026-11-01')
})
it('课表摘要只读取本人记录并保留星期与周次',()=>{
  expect(ownLessons(fixture,6).map(item=>item.name)).toEqual(['高等数学','数据结构','大学英语'])
  expect(ownLessons({...fixture,account:{...fixture.account,id:'other'}},6)).toEqual([])
  expect(ownLessons(fixture,5)).toEqual([])
})
it('体育源不可用时隐藏旧投影，记录始终限制为授权身份',()=>{
  expect(sportsSummary({...fixture,sportsStatus:'unavailable'}).percent).toBeNull()
  expect(sportsSummary({...fixture,sportsStatus:'unavailable'}).records).toEqual([])
  const data={...fixture,sportsDashboard:{...fixture.sportsDashboard!,records:[...fixture.sportsDashboard!.records!,entity('other-record','record',{sportName:'他人记录'},'other')]}}
  expect(sportsSummary(data).records).toHaveLength(2)
})
it('个人主页不把关注称为加入，不把参与标记称为正式报名',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><ReferenceMe/></MemoryRouter>)
  expect(html).toContain('关注组织');expect(html).toContain('标记参与');expect(html).not.toContain('报名成功')
  expect(html).toContain('我的日历');expect(html).toContain('更多功能')
})
it('有内容的五页结构可渲染，运动页不提供虚构GPS或开始提交',()=>{
  const pages={home:<ReferenceHome/>,discover:<ReferenceDiscover/>,campus:<ReferenceCampus/>,me:<ReferenceMe/>,sports:<ReferenceSports/>}
  for(const [name,page] of Object.entries(pages)) {
    const html=renderToStaticMarkup(<MemoryRouter>{page}</MemoryRouter>)
    expect(html).toContain('ref-page')
    if(name==='sports'){expect(html).toContain('67%');expect(html).not.toContain('GPS');expect(html).not.toContain('开始打卡')}
    if(process.env.REFERENCE_RENDER==='1') {
      const dir='artifacts/reference-rebuild-20261017';mkdirSync(dir,{recursive:true})
      writeFileSync(`${dir}/sample-${name}.html`,`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>布局样例 · ${name}</title><link rel="stylesheet" href="/src/styles/base.css"><link rel="stylesheet" href="/src/v2/v2.css"><link rel="stylesheet" href="/src/v2/aRedesign.css"><link rel="stylesheet" href="/src/v2/aControls.css"><link rel="stylesheet" href="/src/v2/studentTheme.css"><link rel="stylesheet" href="/src/v2/editorial.css"><link rel="stylesheet" href="/src/v2/referenceStudent.css"><link rel="stylesheet" href="/src/v2/campusReference.css"><link rel="stylesheet" href="/src/v2/reference/reference.css"><style>body{margin:0;background:#faf9f6}a{text-decoration:none}button,input,select{font:inherit}.v2-app{display:block!important}.v2-icon-button{background:transparent;border:0;padding:0;color:#252b23}.v2-icon-button svg{width:21px;height:21px}.sample-note{font:10px sans-serif;color:#8a836e;padding:5px 20px;background:#f1eade}.ref-page{padding-bottom:75px}.sample-nav{display:flex;justify-content:space-around;position:fixed;bottom:0;background:#faf9f6f2;left:0;right:0;padding:14px 0;font:12px sans-serif;color:#656e5a;border-top:1px solid #eee}</style><div class="sample-note">布局样例 · 测试数据，非真实校园记录</div><div class="v2-app v2-app-student">${html}</div><nav class="sample-nav"><span>⌂ 首页</span><span>◉ 发现</span><span>♧ 校园</span><span>♧ 打卡</span><span>♙ 我的</span></nav></html>`)
    }
  }
})
