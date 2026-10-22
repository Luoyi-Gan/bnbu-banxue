import {afterEach,describe,expect,it,vi} from 'vitest'

function fixture(){
 let scroll=213
 let mounted:'list'|'detail'='list'
 let observer:(()=>void)|undefined
 const style=()=>({viewTransitionName:'',setProperty:vi.fn(),removeProperty:vi.fn()})
 const node=()=>({style:style(),getClientRects:()=>[{}],getBoundingClientRect:()=>({width:100,height:100,top:20,bottom:120}),querySelector:()=>null,querySelectorAll:()=>[],closest:()=>null})
 const media=node(),target=node()
 const root={dataset:{} as Record<string,string>,style:style()}
 const transitions:Array<{finished:Promise<void>}>=[]
 const startViewTransition=vi.fn((update:()=>Promise<void>)=>{
  const ready=Promise.resolve().then(update)
  const transition={ready,finished:ready.then(()=>{}),skipTransition:vi.fn()}
  transitions.push(transition);return transition
 })
 vi.stubGlobal('document',{
  documentElement:root,body:{},startViewTransition,
  querySelector:()=>null,
  querySelectorAll:(selector:string)=>selector.includes('shared-media')?(mounted==='list'?[media]:[]):(mounted==='detail'?[target]:[]),
 })
 vi.stubGlobal('window',{get scrollY(){return scroll},scrollTo:({top}:{top:number})=>{scroll=top}})
 vi.stubGlobal('innerHeight',800)
 vi.stubGlobal('getComputedStyle',()=>({borderRadius:'20px'}))
 vi.stubGlobal('matchMedia',()=>({matches:false}))
 vi.stubGlobal('CSS',{escape:(value:string)=>value})
 vi.stubGlobal('MutationObserver',class {
  constructor(callback:()=>void){observer=callback}
  observe(){}
  disconnect(){observer=undefined}
 })
 return{root,media,target,startViewTransition,
  mount:(next:'list'|'detail')=>{mounted=next},
  routerCommit:(next:'list'|'detail')=>queueMicrotask(()=>{mounted=next;scroll=0;observer?.()}),
  settle:async()=>{await transitions.at(-1)!.finished;await Promise.resolve();await Promise.resolve()},
  scroll:()=>scroll,
 }
}

afterEach(()=>{vi.unstubAllGlobals();vi.resetModules()})

describe('shared element navigation',()=>{
 it('restores origin scroll after an asynchronous router commit resets it',async()=>{
  const f=fixture()
  const {sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('shop:one',()=>f.routerCommit('detail'),{source:f.media as unknown as HTMLElement,resetScroll:true})
  await f.settle()
  expect(f.scroll()).toBe(0)
  sharedElementTransition('shop:one',()=>f.routerCommit('list'),{source:f.target as unknown as HTMLElement,reverse:true})
  await f.settle()
  expect(f.scroll()).toBe(213)
  expect(f.root.dataset.sharedMotionResult).toBe('complete')
  expect(f.root.dataset.sharedTransition).toBeUndefined()
  expect(f.media.style.viewTransitionName).toBe('')
  expect(f.target.style.viewTransitionName).toBe('')
 })
 it('uses direct navigation and resets detail scroll for reduced motion',async()=>{
  const f=fixture();f.root.dataset.uiMotion='reduce'
  const {sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('shop:one',()=>f.mount('detail'),{resetScroll:true})
  expect(f.startViewTransition).not.toHaveBeenCalled()
  expect(f.scroll()).toBe(0)
  expect(f.root.dataset.sharedMotionEngine).toBe('reduced')
 })
 it('navigates without snapshots when the entry media is unavailable',async()=>{
  const f=fixture();f.mount('detail')
  const update=vi.fn()
  const {sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('missing',update,{resetScroll:true})
  expect(update).toHaveBeenCalledOnce()
  expect(f.startViewTransition).not.toHaveBeenCalled()
  expect(f.root.dataset.sharedMotionResult).toBe('no-source')
  expect(f.scroll()).toBe(0)
 })
})
