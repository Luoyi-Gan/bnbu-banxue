import {describe,it,expect} from 'vitest'
import {campusLifePrompt} from '../src/v2/campusLifeModel'
describe('campus life time prompts',()=>{
 it('uses Shanghai time and preserves stable campus entry positions',()=>{
  expect(campusLifePrompt(Date.parse('2026-10-22T02:59:00Z'))).toContain('课程安排')
  expect(campusLifePrompt(Date.parse('2026-10-22T03:00:00Z'))).toContain('吃饭')
  expect(campusLifePrompt(Date.parse('2026-10-22T06:00:00Z'))).toContain('校园活动')
  expect(campusLifePrompt(Date.parse('2026-10-22T10:00:00Z'))).toContain('明天')
  expect(campusLifePrompt(Date.parse('2026-10-22T16:00:00Z'))).toContain('课程安排')
 })
})
