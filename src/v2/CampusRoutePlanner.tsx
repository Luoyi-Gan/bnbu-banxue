import {useEffect,useState} from 'react'
import {ArrowDownUp,Route,X} from 'lucide-react'
import {planCampusRoute,type WalkingGraph,type WalkingRoute} from './campusRouting'
import type {CampusBuilding} from './campusLocations'
import {uiText} from './uiLanguage'
export function CampusRoutePlanner({buildings,destination,onRoute,onClose}:{buildings:CampusBuilding[];destination:string;onRoute:(route:WalkingRoute|null)=>void;onClose:()=>void}){
  const [graph,setGraph]=useState<WalkingGraph|null>(null),[loadError,setLoadError]=useState(''),[attempt,setAttempt]=useState(0)
  const [from,setFrom]=useState(''),[to,setTo]=useState(destination),[error,setError]=useState(''),[result,setResult]=useState<WalkingRoute|null>(null)
  useEffect(()=>{const controller=new AbortController();setLoadError('');fetch('/campus-map/walking-graph.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(setGraph).catch(()=>{if(!controller.signal.aborted)setLoadError('路线资料加载失败，请重试。')});return()=>controller.abort()},[attempt])
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){onRoute(null);onClose()}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[onClose,onRoute])
  const reset=()=>{setResult(null);setError('');onRoute(null)}
  const choices=buildings.filter(b=>!b.name.startsWith('未命名')&&(!graph||graph.buildings[b.id]))
  return <section className="map-p1-route" aria-label={uiText('路线规划')}><header><strong><Route size={18}/>{uiText('步行路线')}</strong><button aria-label={uiText('关闭路线规划')} onClick={()=>{onRoute(null);onClose()}}><X size={19}/></button></header>
    <form onSubmit={event=>{event.preventDefault();if(!graph)return;const planned=planCampusRoute(graph,from,to);setError(planned.error??'');setResult(planned.route??null);onRoute(planned.route??null)}}>
      <label>{uiText('起点楼栋')}<select autoFocus aria-label={uiText('路线起点')} required value={from} onChange={e=>{setFrom(e.target.value);reset()}}><option value="">{uiText('选择起点')}</option>{choices.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <button className="map-p1-swap" type="button" aria-label={uiText('交换起终点')} onClick={()=>{setFrom(to);setTo(from);reset()}}><ArrowDownUp size={16}/></button>
      <label>{uiText('终点楼栋')}<select aria-label={uiText('路线终点')} required value={to} onChange={e=>{setTo(e.target.value);reset()}}><option value="">{uiText('选择终点')}</option>{choices.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <button className="map-p1-plan" disabled={!graph||!from||!to}>{uiText(graph?'规划路线':'正在加载道路…')}</button>
    </form>
    {loadError&&<p role="alert">{uiText(loadError)}<button onClick={()=>setAttempt(n=>n+1)}>{uiText('重试')}</button></p>}{error&&<p role="alert">{uiText(error)}</p>}
    {result&&<div className="map-p1-route-result" role="status"><strong>{uiText('已记录道路约')} {Math.round(result.metres)} m</strong>{result.steps.some(step=>step.stairs)&&<span className="map-p1-stairs">{uiText('含台阶')}</span>}<p>{uiText('起终点为楼栋附近的道路节点；距离楼栋中心约')} {Math.round(result.startGap)} m / {Math.round(result.endGap)} m。{uiText('最后一段及具体入口请现场确认。')}</p><details><summary>{uiText('查看路段明细')} · {result.steps.length}</summary><ol>{result.steps.map((step,i)=><li key={i}>{uiText(step.name)} · {Math.round(step.metres)} m{step.stairs?' · '+uiText('含台阶'):''}</li>)}</ol></details></div>}
    <p className="map-p1-route-note">{uiText('基于离线道路记录，开放状态和无障碍条件待核实；不提供实时导航。')}</p><small>{graph?.sourceTimestamp.slice(0,10)} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a></small>
  </section>
}
