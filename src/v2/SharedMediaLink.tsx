import {Link,useNavigate,type LinkProps} from 'react-router-dom'
import type {MouseEvent} from 'react'
import {sharedElementTransition} from './sharedElementMotion'
export function SharedMediaLink({transitionKey,reverse=false,resetScroll=false,beforeNavigate,onClick,to,...props}:LinkProps&{transitionKey:string;reverse?:boolean;resetScroll?:boolean;beforeNavigate?:()=>void}) {
 const navigate=useNavigate()
 const click=(event:MouseEvent<HTMLAnchorElement>)=>{
  onClick?.(event)
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||props.target==='_blank')return
  event.preventDefault()
  const source=reverse?document.querySelector<HTMLElement>(`[data-shared-target="${CSS.escape(transitionKey)}"]`):event.currentTarget.closest<HTMLElement>('article,section,.community-hub')?.querySelector<HTMLElement>(`[data-shared-media="${CSS.escape(transitionKey)}"]`)??document.querySelector<HTMLElement>(`[data-shared-media="${CSS.escape(transitionKey)}"]`)
  sharedElementTransition(transitionKey,()=>{beforeNavigate?.();navigate(to,{state:props.state,replace:props.replace})},{source,reverse,resetScroll})
 }
 return <Link {...props} data-shared-trigger={reverse?undefined:transitionKey} to={to} onClick={click}/>
}
