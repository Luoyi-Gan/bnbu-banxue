import {motion,useSpring,useTransform,useVelocity,type MotionStyle,type MotionValue} from 'motion/react'
import {useLayoutEffect} from 'react'
import {Link} from 'react-router-dom'
import type {LucideIcon} from 'lucide-react'
import {uiText} from './uiLanguage'

type Destination={path:string;label:string;icon:LucideIcon;end?:boolean}
const MotionLink=motion.create(Link)

function FluidNavLink({item,index,activeIndex,position,reducedMotion}:{item:Destination;index:number;activeIndex:number;position:MotionValue<number>;reducedMotion:boolean}){
 const selection=useTransform(position,value=>activeIndex<0?0:reducedMotion?Number(index===activeIndex):Math.max(0,1-2*Math.abs(value-index)))
 const Icon=item.icon
 return <MotionLink to={item.path} className={activeIndex===index?'is-active':''} aria-current={activeIndex===index?'page':undefined} style={{'--student-nav-selection':selection} as MotionStyle}><Icon size={20}/><span>{uiText(item.label)}</span></MotionLink>
}

/** Translation and material deformation share the same interruptible position. */
export function FluidStudentNav({items,activeIndex,reducedMotion}:{items:Destination[];activeIndex:number;reducedMotion:boolean}){
 const position=useSpring(Math.max(0,activeIndex),{stiffness:420,damping:34,mass:.8})
 const velocity=useVelocity(position)
 const x=useTransform(position,value=>`${value*100}%`)
 const scaleX=useTransform(velocity,value=>reducedMotion?1:1+Math.min(.14,Math.abs(value)*.012))
 const scaleY=useTransform(velocity,value=>reducedMotion?1:1-Math.min(.045,Math.abs(value)*.004))
 const radius=useTransform(velocity,value=>19+(reducedMotion?0:Math.min(5,Math.abs(value)*.4)))
 useLayoutEffect(()=>{if(activeIndex<0)return;if(reducedMotion)position.jump(activeIndex);else position.set(activeIndex)},[activeIndex,reducedMotion,position])
 return <nav className={`v2-mobile-nav student-fluid-nav${reducedMotion?' is-reduced-motion':''}`} aria-label={uiText('手机主导航')} data-active-index={activeIndex}>
  {items.map((item,index)=><FluidNavLink key={item.path} item={item} index={index} activeIndex={activeIndex} position={position} reducedMotion={reducedMotion}/>)}
  {activeIndex>=0&&<motion.span className="student-nav-indicator" aria-hidden="true" style={{x}}><motion.span className="student-nav-fluid" style={{scaleX,scaleY,borderRadius:radius}}/></motion.span>}
 </nav>
}
