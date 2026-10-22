import {useEffect,useRef,useState} from 'react'
import {Activity,Camera,ChevronRight,Clock3,Footprints,History,LoaderCircle,Pause,Play,QrCode,RefreshCw,Square,X} from 'lucide-react'
import {api} from '../../live/api'
import {Modal} from '../ui'
import {Header} from '../reference/components'
import {parseSportsInvite} from '../../../shared/v2/sportsInvite'
import {uiText,useUiLanguage} from '../uiLanguage'
import {qrDetector} from './qrDetector'
import './movementEntry.css'
import {RealSportsDashboard} from './RealSportsDashboard'

type Detection={state:'existing'|'new';checkedAt:string;sportsOrigin:string;localAcceptance?:boolean}
type Session={id:string;sport:string;status:'active'|'paused'|'finished';elapsedMs:number;runningSince:number|null;startedAt:string;finishedAt:string|null;version:number}
type Personal={sessions:Session[];serverNow:number}
const command=<T,>(operation:string,input:Record<string,unknown>={})=>api<T>('/api/movement/command',{operation,input})
const clock=(milliseconds:number)=>{const seconds=Math.floor(Math.max(0,milliseconds)/1000);return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
export function MovementEntry(){useUiLanguage();
 const [detection,setDetection]=useState<Detection|null>(null),[view,setView]=useState<'entry'|'join'|'solo'|'sports'>('entry'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true)
 const [invite,setInvite]=useState(''),[scanning,setScanning]=useState(false),[cameraError,setCameraError]=useState('')
 const video=useRef<HTMLVideoElement>(null),generation=useRef(0),mounted=useRef(true)
 const [personal,setPersonal]=useState<Personal|null>(null),[sport,setSport]=useState('健走'),[tick,setTick]=useState(0),[recordsOpen,setRecordsOpen]=useState(false)
 const personalGeneration=useRef(0)
 const receivedAt=useRef(performance.now()),scanGeneration=useRef(0)
 const loadPersonal=async()=>{const version=++personalGeneration.current;const value=await command<Personal>('personal.list');if(!mounted.current||version!==personalGeneration.current)return;receivedAt.current=performance.now();setPersonal(value)}
 const check=async()=>{const request=++generation.current;setLoading(true);setError('');try{const value=await api<Detection>('/api/movement');if(!mounted.current||request!==generation.current)return;setDetection(value);setView('entry');if(value.state==='existing')setView('sports')}catch(failure){if(mounted.current&&request===generation.current)setError(failure instanceof Error?failure.message:'暂时无法连接体育平台，请重试。')}finally{if(mounted.current&&request===generation.current)setLoading(false)}}
 useEffect(()=>{mounted.current=true;void check();return()=>{mounted.current=false;generation.current++;scanGeneration.current++}} ,[]) // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(view!=='solo')return;const timer=setInterval(()=>setTick(value=>value+1),1000);return()=>clearInterval(timer)},[view])
 useEffect(()=>{if(view!=='solo'||busy)return;const refresh=()=>{if(document.visibilityState==='visible')void loadPersonal().catch(()=>setError('暂时无法同步个人运动，已显示的记录保留，请重试。'))};const timer=setInterval(refresh,15000);window.addEventListener('focus',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh)}} ,[view,busy])
 useEffect(()=>{if(!scanning)return;const hide=()=>{if(document.hidden)setScanning(false)};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[scanning])
 useEffect(()=>{
  if(!scanning)return;
  const version=++scanGeneration.current;let cancelled=false;let stream:MediaStream|undefined,timer:ReturnType<typeof setTimeout>|undefined;
  const stop=()=>{stream?.getTracks().forEach(track=>track.stop());if(timer)clearTimeout(timer)};
  const current=()=>!cancelled&&mounted.current&&version===scanGeneration.current;
  void(async()=>{try{
   const detector=await qrDetector();if(!current())return;
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});if(!current()){stop();return}
   if(!video.current){stop();return}video.current.srcObject=stream;await video.current.play();
   const scan=async()=>{if(!current())return;try{const found=await detector.detect(video.current!);if(!current())return;if(found[0]?.rawValue){const token=parseSportsInvite(found[0].rawValue,detection!.sportsOrigin);setInvite(token);setScanning(false);setCameraError('');stop();return}}catch(failure){if(current())setCameraError(failure instanceof Error?failure.message:'暂时无法识别二维码。')}if(current())timer=setTimeout(()=>void scan(),300)};void scan();
  }catch(failure){if(current())setCameraError(failure instanceof DOMException&&failure.name==='NotAllowedError'?'相机权限被拒绝。请允许相机权限，或返回输入邀请码。':failure instanceof DOMException&&failure.name==='NotFoundError'?'没有找到可用相机，请返回输入邀请码。':failure instanceof Error?failure.message:'无法打开相机，请返回输入邀请码。');stop()}})();
  return()=>{cancelled=true;stop()};
 },[scanning,detection])
 const chooseSolo=async()=>{setBusy(true);setError('');try{await loadPersonal();setView('solo')}catch(failure){setError(failure instanceof Error?failure.message:'暂时无法读取个人运动。')}finally{setBusy(false)}}
 const join=async()=>{if(!detection)return;setBusy(true);setError('');try{await openExternal('join',parseSportsInvite(invite,detection.sportsOrigin))}catch(failure){setError(failure instanceof Error?failure.message:'入班入口暂不可用。')}finally{setBusy(false)}}
 const active=personal?.sessions.find(item=>item.status!=='finished'),records=personal?.sessions.filter(item=>item.status==='finished')??[]
 // Render against the server timestamp and monotonic local elapsed time. Writes use server time only.
 const elapsed=active?active.elapsedMs+(active.status==='active'&&active.runningSince?Math.max(0,(personal!.serverNow-active.runningSince)+(performance.now()-receivedAt.current)):0):0
 void tick
 const mutate=async(operation:string)=>{if(busy)return;const version=++personalGeneration.current;setBusy(true);setError('');try{const value=await command<Personal>(operation,operation==='personal.start'?{sport}:{id:active?.id,version:active?.version});if(!mounted.current||version!==personalGeneration.current)return;receivedAt.current=performance.now();setPersonal(value)}catch(failure){if(mounted.current){setError(failure instanceof Error?failure.message:'保存失败，请重试。');try{await loadPersonal()}catch{/* Preserve last state until retry. */}}}finally{if(mounted.current)setBusy(false)}}
 const openExternal=(destination:'sports'|'join'='sports',inviteCode?:string)=>{const popup=window.open('about:blank','_blank');if(!popup){setError('浏览器阻止了新窗口，请允许弹出窗口后重试。');return}popup.opener=null;setBusy(true);setError('');return command<{url:string}>('launch',{destination,...(inviteCode?{invite:inviteCode}:{})}).then(result=>{popup.location.replace(result.url)}).catch(failure=>{popup.close();setError(failure instanceof Error?failure.message:'打开失败，请重试。')}).finally(()=>setBusy(false))}
 return <section className={`ref-page ref-subpage motion-entry ${view==='sports'?'has-sports-frame':''}`}>
  <Header title={view==='solo'?'个人运动':view==='join'?'扫码入班':'运动'} backDisabled={busy} backLabel={view==='solo'||view==='join'?'返回运动选择':'返回首页'} onBack={view==='solo'||view==='join'?()=>{if(!busy){setView('entry');setError('')}}:undefined} actions={<button type="button" className="motion-icon-button" aria-label="重新检测体育账号" disabled={loading||busy} onClick={()=>void check()}><RefreshCw size={19} className={loading?'is-spinning':''}/></button>}/>
  {detection?.localAcceptance&&<aside className="motion-local-notice">{uiText('本地联动验收 · 体育账号目录为模拟数据，个人运动写入独立测试库。')}</aside>}
  {error&&<div className="motion-error" role="alert"><p>{uiText(error)}</p><button type="button" disabled={loading||busy} onClick={()=>void(view==='join'?join():view==='solo'?chooseSolo():check())}>{uiText('重试')}</button></div>}
  {!loading&&detection?.state==='existing'&&(view==='solo'||view==='join')&&<button className="motion-join-later" onClick={()=>{setView('sports');setError('')}}>{uiText('返回运动概览')}</button>}
  {loading?<div className="motion-connection" role="status"><LoaderCircle size={27} className="is-spinning"/><strong>{uiText('正在连接 BNBU Sports')}</strong><p>{uiText('读取你的体育账号与运动记录')}</p></div>:<>
   {view==='entry'&&detection?.state==='new'&&<><div className="motion-welcome"><span><Footprints size={34}/></span><h2>{uiText('选一种方式，开始运动')}</h2><p>{uiText('加入体育班级，或留一点时间给自己。')}</p></div><div className="motion-options"><button type="button" disabled={busy} onClick={()=>{setView('join');setError('')}}><span className="motion-option-icon"><QrCode size={27}/></span><span><strong>{uiText('扫码入班')}</strong><small>{uiText('扫描老师的二维码，加入体育课程')}</small></span><ChevronRight size={21}/></button><button type="button" disabled={busy} onClick={()=>void chooseSolo()}><span className="motion-option-icon is-solo"><Footprints size={27}/></span><span><strong>{uiText('自己运动，不入班')}</strong><small>{uiText('记录个人运动，自由安排每一次出发')}</small></span><ChevronRight size={21}/></button></div><p className="motion-entry-note">{uiText('之后也可以随时扫码加入班级。')}</p></>}
   {view==='entry'&&detection?.state==='existing'&&<button className="motion-primary" disabled={busy} onClick={()=>void check()}>{uiText('打开 BNBU Sports')}</button>}
   {view==='join'&&<div className="motion-join-panel"><div className="motion-qr-illustration"><QrCode size={72}/></div><h2>{uiText('和你的体育班级连接')}</h2><p>{uiText('扫描老师提供的入班二维码，或粘贴邀请链接。')}</p><button className="motion-primary" type="button" disabled={busy} onClick={()=>{setCameraError('');setScanning(true)}}><Camera size={19}/>{uiText('打开相机扫码')}</button><span className="motion-or">{uiText('或输入邀请码')}</span><label>{uiText('邀请码 / 邀请链接')}<input autoComplete="off" value={invite} onChange={event=>setInvite(event.target.value)} maxLength={2048} placeholder={uiText('粘贴老师提供的邀请码或链接')}/></label><button className="motion-secondary" type="button" disabled={busy||!invite.trim()} onClick={()=>void join()}>{uiText(busy?'正在打开…':'查看班级并加入')}<ChevronRight size={17}/></button><small>{uiText('在体育平台确认班级信息后完成入班。')}</small></div>}
   {view==='sports'&&<RealSportsDashboard busy={busy} onJoin={()=>{setView('join');setError('')}} onPersonal={()=>void chooseSolo()} onPlatform={()=>openExternal()}/>}
   {view==='solo'&&<><div className="motion-solo-caption"><span><Activity size={16}/>{uiText('自己运动，不入班')}</span><button type="button" disabled={busy} onClick={()=>setRecordsOpen(true)}><History size={16}/>{uiText('运动记录')}</button></div><div className="motion-solo-panel"><span className="motion-solo-symbol"><Footprints size={45}/></span>{active?<strong className="motion-sport-name">{active.sport}</strong>:<label className="motion-sport-picker">{uiText('今天想做什么运动')}<input value={sport} maxLength={40} onChange={event=>setSport(event.target.value)}/></label>}<div className="motion-timer" aria-live="off">{clock(elapsed)}</div><p>{uiText(active?.status==='paused'?'已暂停':active?'正在运动':'给今天留一点运动时间')}</p><div className="motion-solo-actions">{!active?<button className="motion-primary" disabled={busy||!sport.trim()} onClick={()=>void mutate('personal.start')}><Play size={18}/>{uiText(busy?'正在开始…':'开始运动')}</button>:<><button className="motion-secondary" disabled={busy} onClick={()=>void mutate(active.status==='active'?'personal.pause':'personal.resume')}>{active.status==='active'?<Pause size={18}/>:<Play size={18}/>} {uiText(active.status==='active'?'暂停':'继续')}</button><button className="motion-primary" disabled={busy} onClick={()=>void mutate('personal.finish')}><Square size={16}/>{uiText('结束并保存')}</button></>}</div><small>{uiText('个人运动独立保存，不计入课程学时。')}</small></div><button className="motion-join-later" disabled={busy} onClick={()=>setView('join')}><QrCode size={18}/>{uiText('想加入体育课程？扫码入班')}<ChevronRight size={16}/></button></>}
  </>}
  {scanning&&<Modal title="扫描入班二维码" onClose={()=>setScanning(false)}><div className="motion-scanner"><video ref={video} muted playsInline/><span/></div>{cameraError&&<p role="alert">{cameraError}</p>}<p className="motion-entry-note">{uiText('请将老师提供的二维码放入画面中；识别后再确认班级。')}</p><button type="button" className="motion-secondary" onClick={()=>setScanning(false)}><X size={16}/>{uiText('返回输入邀请码')}</button></Modal>}
  {recordsOpen&&<Modal title="个人运动记录" onClose={()=>setRecordsOpen(false)}><div className="motion-personal-records">{records.map(item=><article key={item.id}><span><Footprints size={19}/></span><div><strong>{item.sport}</strong><small>{new Date(item.startedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})}</small></div><time>{clock(item.elapsedMs)}</time></article>)}{!records.length&&<div className="motion-connection"><Clock3 size={28}/><strong>{uiText('还没有个人运动记录')}</strong><p>{uiText('完成一次运动后，记录会保存在这里。')}</p></div>}<p className="motion-entry-note">{uiText('个人运动与课程打卡分开记录，不产生课程学时。')}</p></div></Modal>}
 </section>
}
