import {campusMotion} from './motionTokens'
import {flushSync} from 'react-dom'
import './sharedElementTransition.css'

export const sharedMotion={enter:campusMotion.sharedEnter,exit:campusMotion.sharedExit,enterEase:campusMotion.ease,exitEase:campusMotion.ease}
type Transition={finished:Promise<void>;skipTransition:()=>void}
let active:Transition|undefined
const origins=new Map<string,{scroll:number;index:number}>()
const candidates=(kind:'media'|'target',key:string)=>Array.from(document.querySelectorAll<HTMLElement>(`[data-shared-${kind}="${CSS.escape(key)}"]`))
const find=(kind:'media'|'target',key:string)=>{const items=candidates(kind,key);return items.find(element=>{const rect=element.getBoundingClientRect();return rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<innerHeight})??items[0]??null}

/** Snapshot only the chosen media; unrelated cards never share the same transition name. */
export function sharedElementTransition(key:string,update:()=>void,{source,reverse=false,resetScroll=false}:{source?:HTMLElement|null;reverse?:boolean;resetScroll?:boolean}={}) {
 const reduced=document.documentElement.dataset.uiMotion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches
 const start=typeof document.startViewTransition==='function'?document.startViewTransition.bind(document):undefined
 document.documentElement.dataset.sharedMotionEngine=reduced?'reduced':start?'view-transition':'fallback'
 if(!start||reduced){document.documentElement.dataset.sharedMotionResult='direct';update();if(resetScroll&&!reverse)window.scrollTo({top:0,behavior:'instant'});return}
 if(active){active.skipTransition();void active.finished.catch(()=>{}).then(()=>sharedElementTransition(key,update,{source,reverse,resetScroll}));return}
 const from=source?.querySelector<HTMLElement>('[data-shared-media]')??source??find(reverse?'target':'media',key)
 if(!from||!from.getClientRects().length){document.documentElement.dataset.sharedMotionResult='no-source';update();if(resetScroll&&!reverse)window.scrollTo({top:0,behavior:'instant'});return}
 if(!reverse){origins.set(key,{scroll:window.scrollY,index:candidates('media',key).indexOf(from)});if(origins.size>16)origins.delete(origins.keys().next().value!)}
 document.documentElement.dataset.sharedOriginScroll=String(origins.get(key)?.scroll??0)
 const previous=from.style.viewTransitionName
 document.documentElement.style.setProperty('--shared-radius-from',getComputedStyle(from).borderRadius)
 from.style.viewTransitionName='campus-media'
 document.documentElement.dataset.sharedKind=key.startsWith('shop:')?'shop':'media'
 document.documentElement.style.setProperty('--shared-duration',`${reverse?sharedMotion.exit:sharedMotion.enter}ms`)
 document.documentElement.dataset.sharedTransition=reverse?'exit':'enter'
 let target:HTMLElement|null=null,targetName=''
 const transition=start(async()=>{
  flushSync(update)
  if(resetScroll&&!reverse)window.scrollTo({top:0,behavior:'instant'})
  from.style.viewTransitionName=previous
  if(reverse&&origins.has(key))window.scrollTo({top:origins.get(key)!.scroll,behavior:'instant'})
  target=find(reverse?'media':'target',key)
  // Route content can require an authorised read; bound the snapshot wait and fall back naturally.
  if(!target)await new Promise<void>(resolve=>{
   const observer=new MutationObserver(()=>{target=find(reverse?'media':'target',key);if(target){clearTimeout(timeout);observer.disconnect();resolve()}})
   const timeout=setTimeout(()=>{observer.disconnect();resolve()},700)
   observer.observe(document.body,{childList:true,subtree:true})
  })
  // Router commits can reset scroll after the first flush; restore after the destination mounts.
  if(reverse&&origins.has(key))window.scrollTo({top:origins.get(key)!.scroll,behavior:'instant'})
  if(reverse){const index=origins.get(key)?.index;if(index!=null&&index>=0)target=candidates('media',key)[index]??target}
  const bounds=target?.getBoundingClientRect()
  const image=(target?.tagName==='IMG'?target:Array.from(target?.querySelectorAll<HTMLImageElement>('img')??[]).find(item=>{
   const rect=item.getBoundingClientRect()
   return bounds&&rect.right>bounds.left&&rect.left<bounds.right&&rect.bottom>bounds.top&&rect.top<bounds.bottom
  })) as HTMLImageElement|undefined
  if(image&&!image.complete&&typeof image.decode==='function'){
   let timer:ReturnType<typeof setTimeout>|undefined
   await Promise.race([image.decode().catch(()=>{}),new Promise<void>(resolve=>{timer=setTimeout(resolve,160)})]).finally(()=>clearTimeout(timer))
  }
  if(target){targetName=target.style.viewTransitionName;target.style.viewTransitionName='campus-media';document.documentElement.style.setProperty('--shared-radius-to',getComputedStyle(target).borderRadius)}
 })
 active=transition
 let snapshotReady=false
 void transition.ready.then(()=>{snapshotReady=true}).catch(()=>{})
 void transition.finished.catch(()=>{}).finally(()=>{
  from.style.viewTransitionName=previous
  if(target)target.style.viewTransitionName=targetName
  if(active===transition){delete document.documentElement.dataset.sharedTransition;delete document.documentElement.dataset.sharedKind;document.documentElement.style.removeProperty('--shared-duration');document.documentElement.style.removeProperty('--shared-radius-from');document.documentElement.style.removeProperty('--shared-radius-to');active=undefined}
  document.documentElement.dataset.sharedMotionResult=target?(snapshotReady?'complete':'skipped'):'missing-target'
  if(reverse){(target?.closest<HTMLElement>('a,button')??document.querySelector<HTMLElement>(`[data-shared-trigger="${CSS.escape(key)}"]`))?.focus({preventScroll:true});origins.delete(key)}
 })
}
