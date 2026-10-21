import {AnimatePresence,motion} from 'motion/react'
import type {ReactNode} from 'react'
import {campusMotion} from './motionTokens'
import {useDevicePreferences} from './devicePreferences'
import {uiText} from './uiLanguage'
import './materialSkeleton.css'

export function SkeletonBars(){return <div className="material-skeleton-bars" aria-hidden="true"><i/><i/><i/></div>}

export function DiscoverySkeleton(){return <div className="material-skeleton-feed" aria-hidden="true">{[0,1,2,3].map(index=><div className="material-skeleton-card" key={index}><div className="discovery-cover material-skeleton-cover" style={{aspectRatio:index%2?'4 / 5':'3 / 4'}}/><SkeletonBars/></div>)}</div>}

/** The placeholder and the real list share a grid cell during the short replacement. */
export function LoadingSwap({loading,children}:{loading:boolean;children:ReactNode}){
 const {reducedMotion}=useDevicePreferences()
 return <div className="material-loading-swap" aria-busy={loading}>
  {loading&&<span className="material-loading-label" role="status">{uiText('正在加载内容…')}</span>}
  <AnimatePresence initial={false}>{loading&&<motion.div key="skeleton" className="material-loading-placeholder" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:reducedMotion?0:campusMotion.replace/1000}}><DiscoverySkeleton/></motion.div>}</AnimatePresence>
  {!loading&&<div className="material-loaded-content">{children}</div>}
 </div>
}
