import {describe,it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {planCampusRoute,type WalkingGraph} from '../src/v2/campusRouting'
import {campusMapHref,mapBuildingTarget,safeMapReturn} from '../src/v2/campusMapLinks'
const fixture=():WalkingGraph=>({nodes:{a:[0,0],b:[30,0],c:[30,40],d:[200,200]},edges:[['a','c',100,'绕行路','footway','way/1'],['a','b',30,'湖边路','footway','way/2'],['b','c',40,'台阶','steps','way/3']],buildings:{start:[0,5],end:[30,45],island:[200,200],far:[500,500]},sourceTimestamp:'2026-10-16',attribution:'OSM'})
describe('campus walking routes',()=>{
  it('finds the shortest recorded road path, excludes endpoint gaps from road distance and reports stairs',()=>{
    const result=planCampusRoute(fixture(),'start','end').route!
    expect(result.points).toEqual([[0,0],[30,0],[30,40]])
    expect(result.metres).toBe(70);expect(result.startGap).toBe(5);expect(result.endGap).toBe(5)
    expect(result.steps[1]).toEqual({name:'台阶',metres:40,stairs:true})
  })
  it('does not invent edges for disconnected, remote, missing or identical endpoints',()=>{
    for(const pair of [['start','island'],['start','far'],['start','missing'],['start','start']])expect(planCampusRoute(fixture(),...pair as [string,string]).error).toBeTruthy()
  })
  it('honours explicitly mapped pedestrian one-way restrictions',()=>{
    const g=fixture();g.edges=[['a','b',30,'路','footway','way/2','forward']];g.buildings.end=[30,0]
    expect(planCampusRoute(g,'start','end').route).toBeTruthy()
    expect(planCampusRoute(g,'end','start').error).toBeTruthy()
  })
  it('routes real imported buildings entirely over adjacent source nodes',()=>{
    const g:WalkingGraph=JSON.parse(readFileSync(new URL('../public/campus-map/walking-graph.json',import.meta.url),'utf8'))
    const r=planCampusRoute(g,'way/1215983507','way/664082915').route!
    expect(r.points.length).toBeGreaterThan(2);expect(r.metres).toBeGreaterThan(100)
    for(let i=1;i<r.points.length;i++)expect(g.edges.some(e=>[e[0],e[1]].every(id=>[r.points[i-1],r.points[i]].includes(g.nodes[id])))).toBe(true)
    expect(g.edges.every(e=>!['motorway','construction','proposed','cycleway'].includes(e[4]))).toBe(true)
    expect(g.nodes).not.toHaveProperty('undefined')
    const raw=JSON.parse(readFileSync(new URL('../public/campus-map/walking-graph.json',import.meta.url),'utf8'))
    expect(raw.sources.every((s:{sha256:string})=>s.sha256.length===64)).toBe(true)
    expect(raw.buildingSourceSha256).toBe(createHash('sha256').update(readFileSync(new URL('../public/campus-map/data/processed/viewer-campus.json',import.meta.url))).digest('hex'))
  })
})
describe('map links',()=>{
  it('encodes source location and return route, accepting only a known building ID',()=>{
    const params=new URLSearchParams(campusMapHref('T4-105','/v2/me?tab=timetable').split('?')[1])
    expect(mapBuildingTarget(params)).toBe('way/664093256');expect(params.get('place')).toBe('T4-105');expect(params.get('returnTo')).toBe('/v2/me?tab=timetable')
    expect(mapBuildingTarget(new URLSearchParams('building=way/evil&place=教学楼+A101'))).toBeNull()
  })
  it('keeps ambiguous locations unresolved and rejects external return destinations',()=>{
    expect(mapBuildingTarget(new URLSearchParams('place=学习资源中心'))).toBeNull()
    for(const value of ['https://evil.test','//evil.test','/v2\\evil','javascript:alert(1)'])expect(safeMapReturn(value)).toBe('/v2/campus')
  })
})
