import {flushSync} from 'react-dom'
import './sharedElementTransition.css'

export const sharedMotion={enter:300,exit:220,enterEase:'cubic-bezier(.2,.8,.2,1)',exitEase:'cubic-bezier(.4,0,.8,.2)'}
type Transition={finished:Promise<void>;skipTransition:()=>void}
let active:Transition|undefined
const origins=new Map<string,{scroll:number}>()
const find=(kind:'media'|'target',key:string)=>document.querySelector<HTMLElement>(`[data-shared-${kind}="${CSS.escape(key)}"]`)

/** Snapshot only the chosen media; unrelated cards never share the same transition name. */
export function sharedElementTransition(key:string,update:()=>void,{source,reverse=false}:{source?:HTMLElement|null;reverse?:boolean}={}) {
 const reduced=document.documentElement.dataset.uiMotion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches
 const start=typeof document.startViewTransition==='function'?document.startViewTransition.bind(document):undefined
 document.documentElement.dataset.sharedMotionEngine=reduced?'reduced':start?'view-transition':'fallback'
 if(!start||reduced){document.documentElement.dataset.sharedMotionResult='direct';update();return}
 if(active){active.skipTransition();void active.finished.catch(()=>{}).then(()=>sharedElementTransition(key,update,{source,reverse}));return}
 const from=source?.querySelector<HTMLElement>('[data-shared-media]')??source??find(reverse?'target':'media',key)
 if(!from||!from.getClientRects().length){document.documentElement.dataset.sharedMotionResult='no-source';update();return}
 if(!reverse){origins.set(key,{scroll:window.scrollY});if(origins.size>16)origins.delete(origins.keys().next().value!)}
 const previous=from.style.viewTransitionName
 document.documentElement.style.setProperty('--shared-radius-from',getComputedStyle(from).borderRadius)
 from.style.viewTransitionName='campus-media'
 document.documentElement.dataset.sharedTransition=reverse?'exit':'enter'
 let target:HTMLElement|null=null,targetName=''
 const transition=start(async()=>{
  flushSync(update)
  from.style.viewTransitionName=previous
  target=find(reverse?'media':'target',key)
  // Route content can require an authorised read; bound the snapshot wait and fall back naturally.
  if(!target)await new Promise<void>(resolve=>{
   const observer=new MutationObserver(()=>{target=find(reverse?'media':'target',key);if(target){clearTimeout(timeout);observer.disconnect();resolve()}})
   const timeout=setTimeout(()=>{observer.disconnect();resolve()},180)
   observer.observe(document.body,{childList:true,subtree:true})
  })
  if(reverse&&origins.has(key))window.scrollTo({top:origins.get(key)!.scroll,behavior:'instant'})
  if(target){targetName=target.style.viewTransitionName;target.style.viewTransitionName='campus-media';document.documentElement.style.setProperty('--shared-radius-to',getComputedStyle(target).borderRadius)}
 })
 active=transition
 let snapshotReady=false
 void transition.ready.then(()=>{snapshotReady=true}).catch(()=>{})
 void transition.finished.catch(()=>{}).finally(()=>{
  from.style.viewTransitionName=previous
  if(target)target.style.viewTransitionName=targetName
  if(active===transition){delete document.documentElement.dataset.sharedTransition;document.documentElement.style.removeProperty('--shared-radius-from');document.documentElement.style.removeProperty('--shared-radius-to');active=undefined}
  document.documentElement.dataset.sharedMotionResult=target?(snapshotReady?'complete':'skipped'):'missing-target'
  if(reverse){(document.querySelector<HTMLElement>(`[data-shared-trigger="${CSS.escape(key)}"]`)??target?.closest<HTMLElement>('a,button'))?.focus({preventScroll:true});origins.delete(key)}
 })
}
