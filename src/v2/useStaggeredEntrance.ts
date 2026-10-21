import {useLayoutEffect,type RefObject} from 'react'

const histories=new Map<string,Set<string>>()
function history(scope:string){
 if(!histories.has(scope)){if(histories.size>=16)histories.delete(histories.keys().next().value!);histories.set(scope,new Set())}
 return histories.get(scope)!
}

/** One observer per feed, stopped for each card as soon as it has appeared. */
export function mountStaggeredEntrance(root:HTMLElement,seen:Set<string>,reducedMotion:boolean){
 const nodes=[...root.querySelectorAll<HTMLElement>('[data-entrance-id]')]
 const remember=(node:HTMLElement)=>{seen.add(node.dataset.entranceId!);if(seen.size>500)seen.delete(seen.values().next().value!)}
 if(reducedMotion||typeof IntersectionObserver==='undefined'||!root.animate){nodes.forEach(node=>{node.dataset.entranceState='shown';remember(node)});return()=>{}}
 const animations=new Map<HTMLElement,Animation>()
 const observer=new IntersectionObserver(entries=>{
  const fresh=entries.filter(entry=>entry.isIntersecting&&!seen.has((entry.target as HTMLElement).dataset.entranceId!)).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left)
  fresh.forEach((entry,index)=>{
   const node=entry.target as HTMLElement
   remember(node);observer.unobserve(node)
   node.dataset.entranceState='playing';node.dataset.entranceDelay=String(Math.min(index,5)*36);node.dataset.entranceRuns=String(Number(node.dataset.entranceRuns??0)+1)
   try{
    const animation=node.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0px)'}],{duration:240,delay:Math.min(index,5)*36,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'})
    animations.set(node,animation)
    void animation.finished.catch(()=>{}).finally(()=>{if(animations.get(node)===animation){node.dataset.entranceState='shown';animations.delete(node);animation.cancel()}})
   }catch{node.dataset.entranceState='shown'}
  })
 },{rootMargin:'-64px 0px -84px 0px',threshold:.01})
 nodes.forEach(node=>{if(seen.has(node.dataset.entranceId!)){node.dataset.entranceState='seen'}else{node.dataset.entranceState='pending';observer.observe(node)}})
 const focus=(event:FocusEvent)=>{
  const node=event.target instanceof Element?event.target.closest<HTMLElement>('[data-entrance-id]'):null
  if(!node||!root.contains(node))return
  remember(node);observer.unobserve(node);const animation=animations.get(node);animations.delete(node);animation?.cancel();node.dataset.entranceState='shown'
 }
 root.addEventListener('focusin',focus)
 return()=>{observer.disconnect();root.removeEventListener('focusin',focus);animations.forEach((animation,node)=>{node.dataset.entranceState='shown';animation.cancel()});animations.clear();nodes.forEach(node=>{if(node.dataset.entranceState==='pending')node.dataset.entranceState='shown'})}
}

export function useStaggeredEntrance(container:RefObject<HTMLDivElement|null>,scope:string|undefined,contentKey:string,columns:number,reducedMotion:boolean){
 useLayoutEffect(()=>{if(!scope||!container.current)return;return mountStaggeredEntrance(container.current,history(scope),reducedMotion)},[container,scope,contentKey,columns,reducedMotion])
}
