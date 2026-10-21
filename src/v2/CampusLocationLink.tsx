import {Link,useLocation} from 'react-router-dom'
import {MapPin} from 'lucide-react'
import {uiText} from './uiLanguage'
import {campusMapHref} from './campusMapLinks'
import './campusLocationLink.css'
export function CampusLocationLink({place,label='在地图中查看',onClick}:{place:string;label?:string;onClick?:()=>void}){
  const location=useLocation()
  return <Link className="campus-location-link" to={campusMapHref(place,location.pathname+location.search)} onClick={onClick}><MapPin size={15}/>{uiText(label)}</Link>
}
