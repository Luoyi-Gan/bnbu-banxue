"""Extract a walking graph from the viewer's existing OSM snapshots; no inferred links."""
import json, math, hashlib, sys
import xml.etree.ElementTree as ET
from pathlib import Path

source = Path(sys.argv[1] if len(sys.argv)>1 else '../BNBU 3D Model').resolve()
out = Path('public/campus-map/walking-graph.json')
campus = json.loads(Path('public/campus-map/data/processed/viewer-campus.json').read_text('utf-8'))
origin = campus['coordinate_system']['origin_lon_lat']
def ecef(lon, lat):
    l,p=map(math.radians,(lon,lat)); n=6378137/math.sqrt(1-6.69437999014e-3*math.sin(p)**2)
    return n*math.cos(p)*math.cos(l),n*math.cos(p)*math.sin(l),n*(1-6.69437999014e-3)*math.sin(p)
o=ecef(*origin);lo,la=map(math.radians,origin)
def project(lon,lat):
    x,y,z=[a-b for a,b in zip(ecef(lon,lat),o)]
    return [round(-math.sin(lo)*x+math.cos(lo)*y,3),round(-math.sin(la)*math.cos(lo)*x-math.sin(la)*math.sin(lo)*y+math.cos(la)*z,3)]
nodes={};ways={};sources=[];blocked=set()
for filename in ['campus.osm','campus-north.osm','campus-boundary.osm']:
    path=source/'data/sources'/filename
    sources.append({'file':filename,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    for el in ET.parse(path).getroot():
        tags={t.attrib['k']:t.attrib['v'] for t in el.findall('tag')}
        if el.tag=='node':
            nodes[el.attrib['id']]=project(float(el.attrib['lon']),float(el.attrib['lat']))
            if tags.get('foot') in ['no','private'] or tags.get('access') in ['no','private'] or tags.get('barrier') in ['wall','fence']:blocked.add(el.attrib['id'])
        elif el.tag=='way':ways[el.attrib['id']]=([n.attrib['ref'] for n in el.findall('nd')],tags)
rawpath=source/'data/sources/surroundings-osm-20261016.json'
raw=json.loads(rawpath.read_text('utf-8'));sources.append({'file':rawpath.name,'sha256':hashlib.sha256(rawpath.read_bytes()).hexdigest()})
for el in raw['elements']:
    if el['type']=='way' and el.get('tags',{}).get('highway'):
        refs=list(map(str,el.get('nodes',[])));geometry=el.get('geometry',[])
        if len(refs)!=len(geometry):continue
        for ref,p in zip(refs,geometry):
            if p:nodes[ref]=project(p['lon'],p['lat'])
        ways[str(el['id'])]=(refs,el['tags'])
allowed={'footway','path','pedestrian','steps','service','residential','living_street','unclassified','tertiary','tertiary_link','secondary','secondary_link'}
b=campus['bounds'];edges=[];used=set();seen=set()
for ident,(refs,tags) in sorted(ways.items()):
    if tags.get('highway') not in allowed or tags.get('area')=='yes':continue
    access=tags.get('foot',tags.get('access','yes'))
    if access in ['no','private','permit','customers','destination'] or tags.get('construction'):continue
    for a,c in zip(refs,refs[1:]):
        if a not in nodes or c not in nodes or a in blocked or c in blocked or a==c:continue
        p,q=nodes[a],nodes[c]
        if not all(b[0]-200<=x<=b[2]+200 and b[1]-200<=y<=b[3]+200 for x,y in [p,q]):continue
        key=tuple(sorted((a,c)))
        if key in seen:continue
        seen.add(key);distance=round(math.dist(p,q),3)
        if distance<=0:continue
        direction={'yes':'forward','1':'forward','-1':'backward'}.get(tags.get('oneway:foot'),'both')
        edges.append([a,c,distance,tags.get('name',''),tags['highway'],'way/'+ident,direction]);used.update([a,c])
result={'schema':1,'origin':origin,'sourceTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base','2026-10-16'),'sources':sources,'attribution':'© OpenStreetMap contributors · ODbL 1.0','nodes':{n:nodes[n] for n in sorted(used)},'edges':edges,'buildings':{b['id']:b['centroid'] for b in campus['buildings'] if b.get('construction_status')!='construction_unverified'},'limits':'Snapshot road connections only. Entrances, current closures and accessibility unverified. No synthetic connections.'}
result['buildingSourceSha256']=hashlib.sha256(Path('public/campus-map/data/processed/viewer-campus.json').read_bytes()).hexdigest()
out.write_bytes((json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n').encode('utf-8'))
print(json.dumps({'nodes':len(used),'edges':len(edges),'bytes':out.stat().st_size}))
