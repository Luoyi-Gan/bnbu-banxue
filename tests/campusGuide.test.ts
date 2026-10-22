import {describe,it,expect} from 'vitest'
import {campusContacts} from '../shared/v2/campusContacts'
import {campusGuideCategories,searchCampusGuide} from '../shared/v2/campusGuideSearch'
import {campusContext,selectCampusSources} from '../backend/src/campus-ai'
describe('校园公开指南与查询',()=>{
 it('每条来源、入口和日期可核查，只允许学校公开域名',()=>{
  expect(new Set(campusContacts.map(item=>item.id)).size).toBe(campusContacts.length)
  for(const item of campusContacts){
   expect(campusGuideCategories).toContain(item.category)
   for(const link of [item.source,item.action]){const url=new URL(link);expect(url.protocol).toBe('https:');expect(url.hostname==='bnbu.edu.cn'||url.hostname.endsWith('.bnbu.edu.cn')).toBe(true)}
   expect(item.checkedAt).toBe('2026-10-22');expect(['page','index']).toContain(item.verification);expect(item.name&&item.description&&item.sourceLabel).toBeTruthy()
  }
 })
 it('覆盖12个苑舍，房型与换宿入口分别可检索',()=>{
  const halls=campusContacts.filter(item=>/^[\u4e00-\u9fff]{2}苑$/.test(item.name));expect(halls).toHaveLength(12)
  expect(searchCampusGuide('宿舍 调宿').some(item=>item.name==='宿舍调整')).toBe(true)
  expect(searchCampusGuide('2+2','住宿生活').some(item=>item.name==='二期苑舍')).toBe(true)
 })
 it('中文别名、英文缩写、全角字符和分类交集保持一致，查询不修改共享数据',()=>{
  const before=campusContacts.map(item=>item.id)
  expect(searchCampusGuide('ＶＰＮ').some(item=>item.name.includes('VPN'))).toBe(true)
  expect(searchCampusGuide('校医').some(item=>item.name==='医疗及健康教育处')).toBe(true)
  expect(searchCampusGuide('成绩单','住宿生活')).toHaveLength(0)
  expect(searchCampusGuide('无匹配测试词xyz')).toHaveLength(0)
  expect(campusContacts.map(item=>item.id)).toEqual(before)
 })
 it('校园AI从同一份公开指南检索宿舍，包含来源层级且不需要学校凭据',()=>{
  const sources=campusContext({id:'synthetic',email:'private@example.test',name:'测试',roles:['student'],status:'active',organization:'test'},{entities:[]})
  const selected=selectCampusSources(sources,'宏雅苑的宿舍信息在哪里')
  expect(selected.some(item=>item.title==='宏雅苑')).toBe(true)
  expect(JSON.stringify(selected)).not.toContain('private@example.test')
  expect(JSON.stringify(selected)).toContain('verification')
 })
})
