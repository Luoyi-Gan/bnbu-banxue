import {describe,expect,it} from 'vitest'
import {resistedSheetOffset,shouldDismissSheet} from './sheetGesture'

describe('sheet drag decisions',()=>{
 it('clamps upward pulls and increases resistance over longer distances',()=>{
  expect(resistedSheetOffset(-30)).toBe(0)
  expect(resistedSheetOffset(0)).toBe(0)
  expect(resistedSheetOffset(100)).toBeLessThan(100)
  const first=resistedSheetOffset(100),second=resistedSheetOffset(200),third=resistedSheetOffset(300)
  expect(third).toBeGreaterThan(second)
  expect(third-second).toBeLessThan(second-first)
 })
 it('returns short pulls and accidental fast taps to their origin',()=>{
  expect(shouldDismissSheet(30,2,700)).toBe(false)
  expect(shouldDismissSheet(80,.2,700)).toBe(false)
  expect(shouldDismissSheet(80,-1,700)).toBe(false)
 })
 it('allows intentional quick flicks and long slow drags',()=>{
  expect(shouldDismissSheet(40,.7,700)).toBe(true)
  expect(shouldDismissSheet(160,0,700)).toBe(true)
  expect(shouldDismissSheet(100,0,300)).toBe(true)
 })
 it('keeps the distance threshold reachable on tall screens',()=>{
  expect(shouldDismissSheet(159,0,1200)).toBe(false)
  expect(shouldDismissSheet(160,0,1200)).toBe(true)
 })
})
