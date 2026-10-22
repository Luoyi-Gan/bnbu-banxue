import {useEffect} from 'react'
import {workspaceChangedEvent} from '../live/api'
import {learningCommand} from './learningApi'
/** Poll only while the authenticated student shell is visible. */
export function LearningReminderPulse(){
  useEffect(()=>{
    let inFlight=false,stopped=false
    const check=async()=>{if(document.hidden||inFlight||stopped)return;inFlight=true;try{const result=await learningCommand<{added:number}>('reminders');if(result.added)window.dispatchEvent(new Event(workspaceChangedEvent))}catch{/* Next visible interval retries; no false delivery claim. */}finally{inFlight=false}}
    void check();const timer=setInterval(()=>void check(),60000)
    document.addEventListener('visibilitychange',check)
    return()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',check)}
  },[])
  return null
}
