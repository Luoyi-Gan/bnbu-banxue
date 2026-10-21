import {ChevronDown,MapPin,Route} from 'lucide-react'
import type {CampusBuilding} from './campusLocations'
import {uiText} from './uiLanguage'
import './campusBuildingDetails.css'

export type BuildingDetails={phase?:string;levels?:number;height_m?:number;height_status?:string;area_m2?:number;source_timestamp?:string;name_en?:string}

export function CampusBuildingDetails({building,info,onDirections}:{building:CampusBuilding;info?:BuildingDetails;onDirections:()=>void}){
  const phase=info?.phase==='1'?'一期':info?.phase==='2'?'二期':'校内建筑'
  return <section className="campus-place-profile" aria-label={uiText('建筑信息')}>
    <header className="campus-place-heading">
      <div className="campus-place-title"><span>{uiText(phase)}</span><h2>{building.name}</h2>{info?.name_en&&<p>{info.name_en}</p>}</div>
      <button type="button" className="campus-place-directions" onClick={onDirections}><Route size={17}/>{uiText('去这里')}</button>
    </header>
    <dl className="campus-place-facts">
      <div><dt>{uiText('楼层')}<small>{uiText('地图记录')}</small></dt><dd>{info?.levels!=null?<>{info.levels}<span>{uiText('层')}</span></>:<span className="campus-place-unknown">{uiText('未记录')}</span>}</dd></div>
      <div><dt>{uiText('建筑高度')}<small>{uiText('估算')}</small></dt><dd>{info?.height_m!=null?<>{Math.round(info.height_m)}<span>m</span></>:<span className="campus-place-unknown">{uiText('未记录')}</span>}</dd></div>
      <div><dt>{uiText('占地面积')}</dt><dd>{info?.area_m2!=null?<>{Math.round(info.area_m2).toLocaleString()}<span>m²</span></>:<span className="campus-place-unknown">{uiText('未记录')}</span>}</dd></div>
    </dl>
    <p className="campus-place-access"><MapPin size={14}/><span>{uiText('具体入口与开放情况，请留意现场标识。')}</span></p>
    <details className="campus-place-source"><summary><span>{uiText('更多资料')}</span><ChevronDown size={15}/></summary><div><p>{uiText('地图记录时间')}<span>{info?.source_timestamp?.slice(0,10)||uiText('未记录')}</span></p></div></details>
  </section>
}
