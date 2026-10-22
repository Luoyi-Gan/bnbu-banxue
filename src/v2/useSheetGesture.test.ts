import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
const runs=vi.hoisted(()=>[] as Array<{from:number;to:number;options:{velocity?:number;type?:string;onUpdate:(value:number)=>void;onComplete:()=>void};stop:ReturnType<typeof vi.fn>}>)
vi.mock('motion/react',()=>({animate:vi.fn((from,to,options)=>{const run={from,to,options,stop:vi.fn()};runs.push(run);return run})}))
import {mountSheetGesture,isTopSheet} from './useSheetGesture'

type Listener=(event:Record<string,unknown>)=>void
class Surface{
 listeners=new Map<string,Set<Listener>>()
 values=new Map<string,string>()
 style={setProperty:(key:string,value:string)=>this.values.set(key,value),removeProperty:(key:string)=>this.values.delete(key)}
 dataset:Record<string,string>={}
 parentElement:Surface|null=null
 header:Surface|null=null
 interactive=false
 inert=false
 captured=false
 querySelector(){return this.header}
 closest(selector:string){return selector==='[inert]'?this.inert?this:null:this.interactive?this:null}
 getClientRects(){return[{}]}
 getBoundingClientRect(){return{top:80}}
 clientHeight=600
 addEventListener(type:string,fn:Listener){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type)!.add(fn)}
 removeEventListener(type:string,fn:Listener){this.listeners.get(type)?.delete(fn)}
 setPointerCapture(){this.captured=true}
 hasPointerCapture(){return this.captured}
 releasePointerCapture(){this.captured=false;this.emit('lostpointercapture')}
 emit(type:string,overrides:Record<string,unknown>={}){const event={type,target:this,button:0,isPrimary:true,pointerId:1,clientX:100,clientY:100,timeStamp:0,preventDefault:vi.fn(),...overrides};this.listeners.get(type)?.forEach(fn=>fn(event));return event}
}
function fixture(reduced=false){
 const panel=new Surface(),layer=new Surface(),header=new Surface(),windowEvents=new Surface()
 panel.parentElement=layer;panel.header=header
 let layers=[layer],mobile=true
 vi.stubGlobal('Element',Surface)
 vi.stubGlobal('document',{querySelectorAll:()=>layers})
 vi.stubGlobal('window',Object.assign(windowEvents,{innerHeight:852}))
 vi.stubGlobal('matchMedia',()=>({get matches(){return mobile}}))
 const close=vi.fn(),cleanup=mountSheetGesture(panel as unknown as HTMLElement,reduced,close)
 return{panel,layer,header,windowEvents,close,cleanup,nest:()=>{layers=[layer,new Surface()]},desktop:()=>{mobile=false},
  pull:(distance=40)=>{header.emit('pointerdown');header.emit('pointermove',{clientY:100+distance,timeStamp:200})},
  release:()=>header.emit('pointerup',{timeStamp:400,clientY:140}),
 }
}
beforeEach(()=>{runs.length=0})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
describe('shared modal gesture controller',()=>{
 it('hands a fresh release velocity to the spring and discards stale pointer velocity',()=>{
  const f=fixture();f.pull(40);f.header.emit('pointerup',{clientY:140,timeStamp:220})
  expect(runs.at(-1)!.options.type).toBe('spring')
  expect(runs.at(-1)!.options.velocity).toBeGreaterThan(0)
  f.cleanup()
  const stale=fixture();stale.pull(40);stale.release()
  expect(runs.at(-1)!.options.velocity).toBe(0);stale.cleanup()
 })
 it('captures only the header and rolls a short drag back without closing',()=>{
  const f=fixture();f.pull();expect(f.layer.dataset.sheetState).toBe('dragging')
  expect(f.panel.listeners.size).toBe(0)
  f.release();expect(runs.at(-1)?.to).toBe(0)
  runs.at(-1)!.options.onComplete();expect(f.close).not.toHaveBeenCalled()
  expect(f.layer.values.size).toBe(0);f.cleanup()
 })
 it('finishes an intentional long pull once, even after releasing pointer capture',()=>{
  const f=fixture();f.pull(200);f.header.emit('pointerup',{clientY:300,timeStamp:400})
  expect(f.layer.dataset.sheetState).toBe('closing')
  expect(runs.at(-1)!.to).toBeGreaterThan(600)
  runs.at(-1)!.options.onComplete();expect(f.close).toHaveBeenCalledOnce();f.cleanup()
 })
 it('does not start on a form control, an underlying sheet or desktop',()=>{
  const f=fixture(),input=new Surface();input.interactive=true
  f.header.emit('pointerdown',{target:input});f.header.emit('pointermove',{clientY:300,timeStamp:100})
  expect(f.layer.dataset.sheetState).toBeUndefined()
  f.nest();expect(isTopSheet(f.panel as unknown as HTMLElement)).toBe(false);f.pull(200)
  expect(f.layer.dataset.sheetState).toBeUndefined();f.cleanup()
  const desktop=fixture();desktop.desktop();desktop.pull(200);expect(desktop.layer.dataset.sheetState).toBeUndefined();desktop.cleanup()
 })
 it('keeps the closing position until unmount and rebounds if the existing close guard refuses',()=>{
  vi.useFakeTimers()
  const f=fixture();f.pull(200);f.header.emit('pointerup',{clientY:300,timeStamp:400})
  const closing=runs.at(-1)!;closing.options.onUpdate(closing.to);closing.options.onComplete()
  expect(f.close).toHaveBeenCalledOnce()
  expect(f.layer.dataset.sheetState).toBe('closing')
  expect(parseFloat(f.layer.values.get('--sheet-drag-y')!)).toBeGreaterThan(600)
  vi.advanceTimersByTime(80)
  expect(runs.at(-1)!.to).toBe(0);expect(f.layer.dataset.sheetState).toBe('settling')
  runs.at(-1)!.options.onComplete();expect(f.layer.values.size).toBe(0);f.cleanup()
 })
 it('resumes an interrupted spring from its current position and clears a tap interruption',()=>{
  const f=fixture();f.pull();f.release();const previous=runs.at(-1)!
  previous.options.onUpdate(18)
  f.header.emit('pointerdown');f.header.emit('pointermove',{clientY:110,timeStamp:200})
  expect(previous.stop).toHaveBeenCalled();expect(parseFloat(f.layer.values.get('--sheet-drag-y')!)).toBeGreaterThan(18)
  f.release();runs.at(-1)!.options.onUpdate(10)
  f.header.emit('pointerdown');f.header.emit('pointerup')
  expect(runs.at(-1)!.to).toBe(0);f.cleanup()
 })
 it('returns on cancellation or blur, and resets on resize and unmount',()=>{
  const f=fixture();f.pull();f.header.emit('pointercancel');expect(runs.at(-1)!.to).toBe(0)
  f.pull();f.windowEvents.emit('blur');expect(runs.at(-1)!.to).toBe(0)
  f.pull();f.windowEvents.emit('resize');expect(f.layer.values.size).toBe(0)
  f.pull();f.cleanup();expect(f.layer.values.size).toBe(0)
  expect([...f.header.listeners.values()].every(listeners=>listeners.size===0)).toBe(true)
  runs.at(-1)?.options.onComplete();expect(f.close).not.toHaveBeenCalled()
 })
 it('keeps reduced-motion drags still and closes directly after a long pull',()=>{
  const f=fixture(true);f.pull(200)
  expect(f.layer.values.get('--sheet-drag-y')).toBe('0px')
  f.header.emit('pointerup',{clientY:300,timeStamp:400})
  expect(runs).toHaveLength(0);expect(f.close).toHaveBeenCalledOnce();f.cleanup()
 })
})
