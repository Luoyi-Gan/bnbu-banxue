export type TimerState = {phase:'idle'|'active'|'paused'|'finished';elapsed:number;since:number|null}
export const initialTimer:TimerState={phase:'idle',elapsed:0,since:null}
export function elapsedMs(timer:TimerState,now:number){return timer.elapsed+(timer.phase==='active'&&timer.since!==null?Math.max(0,now-timer.since):0)}
export function changeTimer(timer:TimerState,action:'start'|'pause'|'resume'|'finish',now:number):TimerState {
  if(action==='start'&&timer.phase==='idle')return {phase:'active',elapsed:0,since:now}
  if(action==='resume'&&timer.phase==='paused')return {...timer,phase:'active',since:now}
  if(action==='pause'&&timer.phase==='active')return {phase:'paused',elapsed:elapsedMs(timer,now),since:null}
  if(action==='finish'&&(timer.phase==='active'||timer.phase==='paused'))return {phase:'finished',elapsed:elapsedMs(timer,now),since:null}
  return timer
}
export function timerLabel(ms:number){const n=Math.floor(ms/1000);return [Math.floor(n/3600),Math.floor(n/60)%60,n%60].map(v=>String(v).padStart(2,'0')).join(':')}
export function proofError(file:{type:string;size:number}){return !['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.type)?'支持 JPG、PNG、WebP 图片及 MP4、WebM 视频。':file.size>30*1024*1024?'单个凭证不能超过 30MB。':file.size===0?'不能使用空文件。':''}
