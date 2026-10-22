import {describe,expect,it} from 'vitest'
import {resistedSheetOffset,shouldDismissSheet,sheetDetent,resistedSheetHeight,sheetReleaseVelocity} from './sheetGesture'

describe('sheet drag decisions',()=>{
 it('converts release speed into resisted surface space with a bounded signed velocity',()=>{
  expect(sheetReleaseVelocity(0,1)).toBe(1000)
  expect(sheetReleaseVelocity(600,1)).toBe(250)
  expect(sheetReleaseVelocity(0,-1)).toBe(-1000)
  expect(sheetReleaseVelocity(0,100)).toBe(2400)
 })
 it('snaps slow drags by position and fast flicks in their direction',()=>{
  const stops=[220,400,650]
  expect(sheetDetent(390,0,stops)).toBe(400)
  expect(sheetDetent(390,1,stops)).toBe(220)
  expect(sheetDetent(390,-1,stops)).toBe(650)
  expect(sheetDetent(100,-20,stops)).toBe(400)
 })
 it('resists pulling beyond the smallest and largest detents',()=>{
  expect(resistedSheetHeight(400,220,650)).toBe(400)
  expect(resistedSheetHeight(120,220,650)).toBe(204)
  expect(resistedSheetHeight(750,220,650)).toBe(666)
 })
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
