import {motion,useSpring,useTransform} from 'motion/react'
import {useLayoutEffect,useRef} from 'react'
import {useDevicePreferences} from './devicePreferences'
import {campusMotion} from './motionTokens'
import {feedTabFromSwipe} from './feedTabsGesture'
import {uiText} from './uiLanguage'

/** One persistent spring keeps selection continuous during rapid taps and horizontal swipes. */
export function CommunityFeedTabs({view,onChange}:{view:string;onChange:(value:string)=>void}){
 const {reducedMotion}=useDevicePreferences()
 const active=view==='following'?0:view===''?1:-1
 const position=useSpring(active===0?0:1,campusMotion.selectionSpring)
 const x=useTransform(position,value=>`calc(6px + var(--community-tab-step,68px) * ${value})`)
 const suppressClick=useRef(0),root=useRef<HTMLElement>(null)
 useLayoutEffect(()=>{if(active<0)return;if(reducedMotion)position.jump(active);else position.set(active)},[active,reducedMotion,position])
 return <motion.nav ref={root} className="community-feed-tabs" aria-label={uiText('笔记信息流')}
  onPointerDownCapture={()=>{suppressClick.current=0}}
  onPanEnd={(_,info)=>{const next=feedTabFromSwipe(info.offset.x,info.offset.y,info.velocity.x);if(next===null)return;suppressClick.current=Date.now()+250;if(next!==view)onChange(next)}}
  onClickCapture={event=>{if(event.detail!==0&&Date.now()<suppressClick.current){suppressClick.current=0;event.preventDefault();event.stopPropagation()}}}
  onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=event.key==='ArrowLeft'||event.key==='Home'?0:1;onChange(index===0?'following':'');root.current?.querySelectorAll<HTMLButtonElement>('button')[index]?.focus()}}>
  <button type="button" aria-pressed={active===0} onClick={()=>onChange('following')}>{uiText('关注')}</button>
  <button type="button" aria-pressed={active===1} onClick={()=>onChange('')}>{uiText('推荐')}</button>
  <motion.span className="community-feed-indicator" aria-hidden="true" style={{x,opacity:active<0?0:1}}/>
 </motion.nav>
}
