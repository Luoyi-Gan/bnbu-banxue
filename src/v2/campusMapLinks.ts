import {fallbackCampusBuildings,resolveCampusLocation} from './campusLocations'
export function campusMapHref(place:string,returnTo:string){
  const params=new URLSearchParams({place:place.slice(0,200),returnTo:safeMapReturn(returnTo)})
  const id=resolveCampusLocation(place)
  if(id)params.set('building',id)
  return '/v2/campus/explore?'+params
}
export function safeMapReturn(value:string|null){return value&&/^\/v2(?:\/|\?|$)/.test(value)&&!/[\\\r\n]/.test(value)?value:'/v2/campus'}
export function mapBuildingTarget(params:URLSearchParams){const id=params.get('building');return fallbackCampusBuildings.some(b=>b.id===id)?id:resolveCampusLocation(params.get('place')??'')}
