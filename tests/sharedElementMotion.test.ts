import {afterEach,describe,expect,it,vi} from 'vitest'
import {sharedElementTransition} from '../src/v2/sharedElementMotion'

afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers()})
describe('共享图片转场的降级与加载边界',()=>{
 it('减少动态时立即完成界面切换，不启动图片移动',()=>{
  const start=vi.fn(),update=vi.fn(),root={dataset:{uiMotion:'reduce',sharedMotionEngine:''}}
  vi.stubGlobal('document',{documentElement:root,startViewTransition:start});vi.stubGlobal('matchMedia',()=>({matches:false}))
  sharedElementTransition('activity:test',update)
  expect(update).toHaveBeenCalledOnce();expect(start).not.toHaveBeenCalled();expect(root.dataset.sharedMotionEngine).toBe('reduced')
 })
 it('浏览器缺少转场接口时仍能正常打开内容',()=>{
  const update=vi.fn(),root={dataset:{sharedMotionEngine:''}}
  vi.stubGlobal('document',{documentElement:root});vi.stubGlobal('matchMedia',()=>({matches:false}))
  sharedElementTransition('activity:test',update)
  expect(update).toHaveBeenCalledOnce();expect(root.dataset.sharedMotionEngine).toBe('fallback')
 })
 it('目标尚未加载时限时结束等待并清除图片命名及观察器',async()=>{
  vi.useFakeTimers()
  const update=vi.fn(),disconnect=vi.fn(),from={style:{viewTransitionName:''},getClientRects:()=>[1],querySelector:()=>null},root={dataset:{sharedMotionEngine:'',sharedMotionResult:'',sharedTransition:undefined as string|undefined},style:{setProperty:vi.fn(),removeProperty:vi.fn()}}
  let completed:Promise<void>=Promise.resolve()
  vi.stubGlobal('document',{documentElement:root,querySelector:()=>null,startViewTransition:(callback:()=>Promise<void>)=>{completed=Promise.resolve().then(callback);return {ready:completed,finished:completed,skipTransition:vi.fn()}}})
  vi.stubGlobal('getComputedStyle',()=>({borderRadius:'24px'}));vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('window',{scrollY:0});vi.stubGlobal('CSS',{escape:(value:string)=>value})
  vi.stubGlobal('MutationObserver',class{observe(){}disconnect=disconnect})
  sharedElementTransition('activity:slow',update,{source:from as unknown as HTMLElement})
  await vi.advanceTimersByTimeAsync(200);await completed;await Promise.resolve()
  expect(update).toHaveBeenCalledOnce();expect(disconnect).toHaveBeenCalledOnce();expect(from.style.viewTransitionName).toBe('');expect(root.dataset.sharedTransition).toBeUndefined();expect(root.dataset.sharedMotionResult).toBe('missing-target')
 })
})
