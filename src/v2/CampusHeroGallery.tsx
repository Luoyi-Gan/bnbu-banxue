import {useEffect,useRef,useState} from 'react'
import {campusHeroPhotographs as photos} from './campusHeroPhotographs'

/** Decode the next real photo before fading it in; retain at most two display layers. */
export function CampusHeroGallery({autoplay}:{autoplay:boolean}){
 const [current,setCurrent]=useState(0),[previous,setPrevious]=useState<number|null>(null)
 const [visible,setVisible]=useState(()=>document.visibilityState==='visible')
 const failed=useRef(new Set<number>())
 useEffect(()=>{const change=()=>setVisible(document.visibilityState==='visible');document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change)},[])
 useEffect(()=>{
  if(previous===null)return
  const timer=window.setTimeout(()=>setPrevious(null),900)
  return()=>window.clearTimeout(timer)
 },[previous])
 useEffect(()=>{
  if(!autoplay||!visible||photos.length<2)return
  let stopped=false,prepared=false
  let candidate=-1
  for(let step=1;step<photos.length;step++){const index=(current+step)%photos.length;if(!failed.current.has(index)){candidate=index;break}}
  if(candidate===-1)return
  const next=new Image();next.decoding='async';next.fetchPriority='low'
  const ready=()=>{if(!stopped)prepared=true}
  const load=()=>{if(typeof next.decode==='function')void next.decode().then(ready,()=>{if(next.naturalWidth>0)ready();else error()});else ready()}
  const error=()=>{if(stopped)return;failed.current.add(candidate);for(let step=1;step<photos.length;step++){const index=(candidate+step)%photos.length;if(index!==current&&!failed.current.has(index)){candidate=index;next.src=photos[candidate].source;break}}}
  next.onload=load;next.onerror=error;next.src=photos[candidate].source
  // Even a fast cache hit must wait for the photo's normal display duration.
  const timer=window.setInterval(()=>{
   if(stopped||document.visibilityState!=='visible')return
   if(prepared){setPrevious(current);setCurrent(candidate)}
  },6500)
  return()=>{stopped=true;window.clearInterval(timer);next.onload=null;next.onerror=null}
 },[autoplay,visible,current])
 const image=(index:number,active:boolean)=><img key={index} src={photos[index].source} alt="" decoding="async" fetchPriority={index===0?'high':'auto'} className={active?`is-active${previous!==null?' is-entering':''}`:'is-previous'} style={{objectPosition:photos[index].position}}/>
 return <div className="home-hero-scene" aria-hidden="true" data-photo-count={photos.length}>{previous!==null&&image(previous,false)}{image(current,true)}</div>
}
