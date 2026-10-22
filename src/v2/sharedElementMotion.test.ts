import {afterEach,describe,expect,it,vi} from 'vitest'

function fixture(hold=false){
 let scroll=213
 let mounted:'list'|'detail'='list'
 let observer:(()=>void)|undefined
 const style=()=>{let name='';const named=vi.fn();return{get viewTransitionName(){return name},set viewTransitionName(value:string){name=value;named(value)},named,setProperty:vi.fn(),removeProperty:vi.fn()}}
 const node=()=>({style:style(),getClientRects:()=>[{}],getBoundingClientRect:()=>({width:100,height:100,top:20,bottom:120}),querySelector:()=>null,querySelectorAll:()=>[],closest:():unknown=>null})
 const media=node(),otherMedia=node(),target=node(),surface={dataset:{} as Record<string,string>}
 let mediaItems=[media]
 let staleFeed=false
 target.closest=()=>surface
 const root={dataset:{} as Record<string,string>,style:style()}
 const transitions:Array<{ready:Promise<void>;finished:Promise<void>;release:()=>void;skipTransition:ReturnType<typeof vi.fn>}>=[]
 const startViewTransition=vi.fn((update:()=>Promise<void>)=>{
  const ready=Promise.resolve().then(update)
  let release=()=>{}
  const gate=hold?new Promise<void>(resolve=>{release=resolve}):Promise.resolve()
  const transition={ready,finished:ready.then(()=>gate),skipTransition:vi.fn(),release}
  transitions.push(transition);return transition
 })
 vi.stubGlobal('document',{
  documentElement:root,body:{},startViewTransition,
  querySelector:()=>null,
  querySelectorAll:(selector:string)=>selector.includes('shared-media')?(mounted==='list'?mediaItems:staleFeed?[otherMedia]:[]):(mounted==='detail'?[target]:[]),
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
 return{root,media,otherMedia,target,surface,startViewTransition,transitions,
  reorder:()=>{mediaItems=[otherMedia,media]},
  showOldProfileFeed:()=>{staleFeed=true},
  mount:(next:'list'|'detail')=>{mounted=next},
  routerCommit:(next:'list'|'detail')=>queueMicrotask(()=>{mounted=next;scroll=0;observer?.()}),
  settle:async()=>{await transitions.at(-1)!.finished;await Promise.resolve();await Promise.resolve()},
  scroll:()=>scroll,
 }
}

afterEach(()=>{vi.unstubAllGlobals();vi.resetModules()})

describe('shared element navigation',()=>{
 it('waits for the returning route instead of capturing a matching avatar in the old profile feed',async()=>{
  const f=fixture(),{sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('avatar:one',()=>f.mount('detail'),{source:f.media as unknown as HTMLElement})
  await f.settle();f.showOldProfileFeed()
  sharedElementTransition('avatar:one',()=>f.routerCommit('list'),{reverse:true})
  await f.settle()
  expect(f.otherMedia.style.named).not.toHaveBeenCalled()
  expect(f.media.style.named.mock.calls.filter(([name])=>name==='campus-media')).toHaveLength(2)
  expect(f.scroll()).toBe(213)
 })
 it('returns to the original card even when duplicate media reorder',async()=>{
  const f=fixture(),{sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('avatar:one',()=>f.mount('detail'),{source:f.media as unknown as HTMLElement})
  await f.settle();f.reorder()
  sharedElementTransition('avatar:one',()=>f.mount('list'),{reverse:true})
  await f.settle()
  // Only the original card is named during capture, even after it moves in DOM order.
  expect(f.media.style.named.mock.calls.filter(([name])=>name==='campus-media')).toHaveLength(2)
  expect(f.otherMedia.style.named).not.toHaveBeenCalled()
  expect(f.root.dataset.sharedMotionResult).toBe('complete')
  expect(f.otherMedia.style.viewTransitionName).toBe('')
 })
 it('finishes the current image movement and runs only the latest queued destination',async()=>{
  const f=fixture(true),{sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('post:one',()=>f.mount('detail'),{source:f.media as unknown as HTMLElement})
  await f.transitions[0].ready
  const stale=vi.fn(),latest=vi.fn(()=>f.mount('list'))
  sharedElementTransition('post:one',stale,{reverse:true})
  sharedElementTransition('post:two',latest,{reverse:true})
  expect(f.transitions[0].skipTransition).not.toHaveBeenCalled()
  expect(latest).not.toHaveBeenCalled()
  f.transitions[0].release();await f.settle()
  await f.transitions[1].ready
  expect(stale).not.toHaveBeenCalled()
  expect(latest).toHaveBeenCalledOnce()
  f.transitions[1].release();await f.settle()
  expect(f.root.dataset.sharedTransition).toBeUndefined()
 })
 it('cancels a queued close when the latest intent is the currently opening card',async()=>{
  const f=fixture(true),{sharedElementTransition}=await import('./sharedElementMotion')
  const open=vi.fn(()=>f.mount('detail')),close=vi.fn()
  sharedElementTransition('post:one',open,{source:f.media as unknown as HTMLElement})
  await f.transitions[0].ready
  sharedElementTransition('post:one',close,{reverse:true})
  sharedElementTransition('post:one',open)
  f.transitions[0].release();await f.settle()
  expect(open).toHaveBeenCalledOnce();expect(close).not.toHaveBeenCalled()
  expect(f.startViewTransition).toHaveBeenCalledOnce()
 })
 it('keeps the destination entrance suppressed after snapshot cleanup and return',async()=>{
  const f=fixture()
  const {sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('activity:one',()=>f.mount('detail'),{source:f.media as unknown as HTMLElement})
  await f.settle()
  expect(f.root.dataset.sharedTransition).toBeUndefined()
  expect(f.target.style.viewTransitionName).toBe('')
  expect(f.surface.dataset.sharedEntered).toBe('true')
  sharedElementTransition('activity:one',()=>f.mount('list'),{reverse:true})
  await f.settle()
  expect(f.surface.dataset.sharedEntered).toBe('true')
 })
 it('coalesces a repeated open while the same media is already expanding',async()=>{
  const f=fixture()
  const {sharedElementTransition}=await import('./sharedElementMotion')
  const update=vi.fn(()=>f.mount('detail'))
  sharedElementTransition('post:one',update,{source:f.media as unknown as HTMLElement})
  sharedElementTransition('post:one',update,{source:f.media as unknown as HTMLElement})
  await f.settle()
  expect(update).toHaveBeenCalledOnce()
  expect(f.startViewTransition).toHaveBeenCalledOnce()
  expect(f.root.dataset.sharedTransition).toBeUndefined()
 })
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
 it('keeps the card at its original viewport position when content above changes height',async()=>{
  const f=fixture(),{sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('post:one',()=>f.mount('detail'),{source:f.media as unknown as HTMLElement})
  await f.settle()
  f.media.getBoundingClientRect=()=>({width:100,height:100,top:60,bottom:160})
  sharedElementTransition('post:one',()=>f.mount('list'),{reverse:true})
  await f.settle()
  expect(f.scroll()).toBe(253)
  expect(f.root.dataset.sharedMotionResult).toBe('complete')
 })
 it('uses direct navigation and resets detail scroll for reduced motion',async()=>{
  const f=fixture();f.root.dataset.uiMotion='reduce'
  const {sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('shop:one',()=>f.mount('detail'),{resetScroll:true})
  expect(f.startViewTransition).not.toHaveBeenCalled()
  expect(f.scroll()).toBe(0)
  expect(f.root.dataset.sharedMotionEngine).toBe('reduced')
  expect(f.surface.dataset.sharedEntered).toBeUndefined()
 })
 it('navigates without snapshots when the entry media is unavailable',async()=>{
  const f=fixture();f.mount('detail')
  const update=vi.fn()
  const {sharedElementTransition}=await import('./sharedElementMotion')
  sharedElementTransition('missing',update,{resetScroll:true})
  expect(update).toHaveBeenCalledOnce()
  expect(f.startViewTransition).not.toHaveBeenCalled()
  expect(f.root.dataset.sharedMotionResult).toBe('no-source')
  expect(f.surface.dataset.sharedEntered).toBeUndefined()
  expect(f.scroll()).toBe(0)
 })
})
