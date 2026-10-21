import {describe,expect,it} from 'vitest'
import {homeAmbient} from './homeAmbient'
describe('homepage ambient hour boundaries',()=>{
 it('uses campus daytime and evening boundaries',()=>{
  expect([0,5,6,10,11,16,17,19,20,23].map(homeAmbient)).toEqual(['night','night','morning','morning','day','day','evening','evening','night','night'])
 })
 it('falls back calmly for unknown hours',()=>{
  expect([NaN,-1,24].map(homeAmbient)).toEqual(['day','day','day'])
 })
})
