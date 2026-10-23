import {afterEach,describe,expect,it,vi} from 'vitest'
import {mountStaggeredEntrance} from './useStaggeredEntrance'

function fixture(ids=['a','b','c']){
 let notify:IntersectionObserverCallback=()=>{}
 const observer={observe:vi.fn(),unobserve:vi.fn(),disconnect:vi.fn()}
 vi.stubGlobal('IntersectionObserver',class{constructor(callback:IntersectionObserverCallback){notify=callback}observe=observer.observe;unobserve=observer.unobserve;disconnect=observer.disconnect})
 const nodes=ids.map(id=>({dataset:{entranceId:id} as Record<string,string>,animate:vi.fn(()=>({finished:new Promise<void>(()=>{}),cancel:vi.fn()}))}))
 const root={querySelectorAll:()=>nodes,animate:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()}
 const enter=(indices:number[])=>notify(indices.map(index=>({target:nodes[index],isIntersecting:true,boundingClientRect:{top:Math.floor(index/2)*200,left:index%2*200}})) as unknown as IntersectionObserverEntry[],observer as unknown as IntersectionObserver)
 return {nodes,root:root as unknown as HTMLElement,observer,enter}
}

afterEach(()=>vi.unstubAllGlobals())
describe('feed entrance lifecycle',()=>{
 it('orders visible cards spatially and never replays a seen card',()=>{
  const f=fixture();const seen=new Set<string>();const dispose=mountStaggeredEntrance(f.root,seen,false)
  f.enter([2,1,0])
  expect(f.nodes.map(node=>node.animate.mock.calls[0])).toEqual([0,32,64].map(delay=>[[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0px)'}],{duration:280,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'}]))
  f.enter([0,1,2]);expect(f.nodes.map(node=>node.animate.mock.calls.length)).toEqual([1,1,1])
  dispose();expect(f.observer.disconnect).toHaveBeenCalledOnce()
  expect(f.nodes.every(node=>node.dataset.entranceState==='shown')).toBe(true)
  expect(f.nodes.every(node=>node.animate.mock.results[0].value.cancel.mock.calls.length===1)).toBe(true)
 })
 it('preserves history across remounts while allowing new cards to enter',()=>{
  const f=fixture();const seen=new Set<string>();const dispose=mountStaggeredEntrance(f.root,seen,false)
  f.enter([0]);dispose();expect(f.nodes[1].dataset.entranceState).toBe('shown')
  const next=fixture(['a','new']);mountStaggeredEntrance(next.root,seen,false)
  expect(next.nodes[0].dataset.entranceState).toBe('seen')
  next.enter([0,1]);expect(next.nodes[0].animate).not.toHaveBeenCalled();expect(next.nodes[1].animate).toHaveBeenCalledOnce()
 })
 it('shows all cards immediately when reduced motion is requested',()=>{
  const f=fixture();const seen=new Set<string>();mountStaggeredEntrance(f.root,seen,true)
  expect(f.observer.observe).not.toHaveBeenCalled();expect(seen.size).toBe(3)
  expect(f.nodes.every(node=>node.dataset.entranceState==='shown'&&node.animate.mock.calls.length===0)).toBe(true)
 })
 it('keeps content visible without IntersectionObserver support',()=>{
  const f=fixture();vi.stubGlobal('IntersectionObserver',undefined);mountStaggeredEntrance(f.root,new Set(),false)
  expect(f.nodes.every(node=>node.dataset.entranceState==='shown')).toBe(true)
 })
})
