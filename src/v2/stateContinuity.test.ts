import {describe,expect,it,vi} from 'vitest'
import {playConfirmedState} from './stateContinuity'

function icon(){
 const animations:Array<{finished:Promise<void>;cancel:ReturnType<typeof vi.fn>;finish:()=>void}>=[]
 const node={dataset:{} as Record<string,string>,animate:vi.fn(()=>{
  let finish=()=>{}
  const animation={finished:new Promise<void>(resolve=>{finish=resolve}),cancel:vi.fn(),finish:()=>finish()}
  animations.push(animation);return animation
 })}
 return {node:node as unknown as HTMLElement,animate:node.animate,animations}
}
describe('confirmed icon state continuity',()=>{
 it('cleans completed motion while preserving the selected state markup',async()=>{
  const f=icon();playConfirmedState(f.node,true,false)
  expect(f.node.dataset.stateMotion).toBe('activating')
  f.animations[0].finish();await Promise.resolve();await Promise.resolve()
  expect(f.node.dataset.stateMotion).toBeUndefined()
  expect(f.animations[0].cancel).toHaveBeenCalled()
 })
 it('cancels rapid reversals without letting old completion clear new motion',async()=>{
  const f=icon();const stop=playConfirmedState(f.node,true,false)
  stop();playConfirmedState(f.node,false,false)
  f.animations[0].finish();await Promise.resolve();await Promise.resolve()
  expect(f.node.dataset.stateMotion).toBe('deactivating')
  expect(f.animations[0].cancel).toHaveBeenCalled()
  expect(f.animations[1].cancel).not.toHaveBeenCalled()
 })
 it('skips motion for reduced-motion users and unsupported browsers',()=>{
  const f=icon();playConfirmedState(f.node,true,true)
  expect(f.animate).not.toHaveBeenCalled()
  expect(()=>playConfirmedState({dataset:{}} as HTMLElement,true,false)).not.toThrow()
 })
})
