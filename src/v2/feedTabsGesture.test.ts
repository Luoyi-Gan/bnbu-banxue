import {describe,expect,it} from 'vitest'
import {feedTabFromSwipe} from './feedTabsGesture'

describe('community navigation gesture intent',()=>{
 it('leaves vertical and diagonal scrolling to the browser',()=>{
  expect(feedTabFromSwipe(45,90,900)).toBeNull()
  expect(feedTabFromSwipe(40,35,900)).toBeNull()
 })
 it('ignores taps, jitter and a short slow drag',()=>{
  expect(feedTabFromSwipe(10,0,1000)).toBeNull()
  expect(feedTabFromSwipe(25,0,100)).toBeNull()
 })
 it('switches in the direction of a deliberate drag or short fast flick',()=>{
  expect(feedTabFromSwipe(50,3,20)).toBe('following')
  expect(feedTabFromSwipe(-50,3,-20)).toBe('')
  expect(feedTabFromSwipe(-25,2,-600)).toBe('')
 })
})
