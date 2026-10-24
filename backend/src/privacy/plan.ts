export type StoredEntity = {id:string;kind:string;owner_id:string|null;data:string};
type Data = Record<string,unknown>;
const foreignKey=(key:string)=>/(Id|ID)$/.test(key)||['owner','actor','student','recipient','target','account','teacher','creator','author'].includes(key);
const object = (v:unknown):Data => v && typeof v==='object' && !Array.isArray(v) ? v as Data : {};
export function references(value:unknown, ids:Set<string>):boolean {
  if(typeof value==='string') {
    if(ids.has(value))return true;
    if(value.startsWith('{')||value.startsWith('['))try{return references(JSON.parse(value),ids);}catch{/* ordinary text */}
    return false;
  }
  if(Array.isArray(value))return value.some(v=>references(v,ids));
  return Object.entries(object(value)).some(([k,v])=>ids.has(k)||references(v,ids));
}
export function imageKeys(value:unknown, keys=new Set<string>()):Set<string> {
  if(typeof value==='string'&&(value.startsWith('{')||value.startsWith('[')))try{return imageKeys(JSON.parse(value),keys);}catch{return keys;}
  const data=object(value);
  if(typeof data.$bnbuStoredImage==='string'&&/^[a-f0-9]{64}$/.test(data.$bnbuStoredImage))keys.add(data.$bnbuStoredImage);
  for(const child of Array.isArray(value)?value:Object.values(data))imageKeys(child,keys);
  return keys;
}
// Collections such as room.members are shared; erase membership without deleting the room.
function removeReferences(value:unknown,ids:Set<string>):unknown {
  if(Array.isArray(value))return value.filter(v=>!(typeof v==='string'&&ids.has(v))).map(v=>removeReferences(v,ids));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(object(value)).filter(([k,v])=>!ids.has(k)&&!(typeof v==='string'&&ids.has(v))).map(([k,v])=>[k,removeReferences(v,ids)]));
  return value;
}
// Alumni is a legacy shared document. Its records need the same dependency closure as entities.
function pruneAlumni(data:Data,ids:Set<string>):Data {
  const value=object(data.value),next={...value};let changed=true;
  while(changed){changed=false;for(const [key,items]of Object.entries(next))if(Array.isArray(items))next[key]=items.filter(item=>{
    const row=object(item);
    if(Object.values(row).some(v=>typeof v==='string'&&ids.has(v))){if(typeof row.id==='string'&&!ids.has(row.id)){ids.add(row.id);changed=true;}return false;}return true;
  });}
  return {...data,value:next};
}
export function deletionPlan(rows:StoredEntity[],accountID:string) {
  const ids=new Set([accountID]),deleted=new Set(rows.filter(r=>r.owner_id===accountID).map(r=>r.id));
  for(const id of deleted)ids.add(id);
  let changed=true;
  while(changed){changed=false;for(const row of rows){
    if(deleted.has(row.id)||row.kind==='alumniState')continue;
    const data=object(JSON.parse(row.data));
    // Scalar foreign references: comments/posts, bookings/slots, DMs/recipients, applications/rooms.
    if(Object.entries(data).some(([key,v])=>foreignKey(key)&&typeof v==='string'&&ids.has(v))){deleted.add(row.id);ids.add(row.id);changed=true;}
  }}
  const updates=new Map<string,string>(),keys=new Set<string>();
  for(const row of rows){
    const data=JSON.parse(row.data);
    if(deleted.has(row.id)){imageKeys(data,keys);continue;}
    const clean=row.kind==='alumniState'?pruneAlumni(object(data),ids):removeReferences(data,ids);
    const encoded=JSON.stringify(clean);
    if(encoded!==JSON.stringify(data)){updates.set(row.id,encoded);imageKeys(data,keys);}
  }
  return {ids,deleted,updates,keys};
}
