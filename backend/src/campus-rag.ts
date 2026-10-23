import {createHash} from 'node:crypto'
import type {LearningStore} from './learning-store'
import type {AIKnowledgeSource,AIKnowledgeCoverage,AIKnowledgeCategory} from '../../shared/v2/aiKnowledge'

export type KnowledgeChunk=AIKnowledgeSource&{chunkId:string;tokens:string[]}
const schemas=new WeakMap<LearningStore,Promise<void>>()
const aliases:Record<string,string>={宿舍:'宿舍 宿管 住宿 书院 dormitory accommodation',运动:'运动 体育 sports 学时 考核',课表:'课表 课程 timetable',社团:'社团 协会 organization',办事:'办事 联系 指南 证明',搭子:'搭子 组队 partner',咖啡:'咖啡 探店 Coffee',通知:'通知 notification',地图:'地图 楼栋 地点 建筑',食堂:'食堂 餐饮 dining food court canteen',老师:'老师 教师 coffee 交流'}
export function knowledgeTerms(text:string){
 const normalized=text.normalize('NFKC').toLowerCase(),parts=normalized.match(/[a-z0-9]+|[\u3400-\u9fff]+/g)??[]
 return parts.flatMap(p=>/^[a-z0-9]+$/.test(p)?[p]:p.length===1?[p]:Array.from({length:p.length-1},(_,i)=>p.slice(i,i+2)))
}
export function knowledgeChunks(sources:AIKnowledgeSource[]):KnowledgeChunk[]{
 return sources.flatMap(s=>{const chunks:KnowledgeChunk[]=[];for(let offset=0;offset<s.text.length||offset===0;offset+=760){const text=s.text.slice(offset,offset+900);chunks.push({...s,text,chunkId:s.id+':'+offset,tokens:knowledgeTerms(s.title+' '+(s.category??'')+' '+text)})}return chunks})
}
/** Inverted postings + BM25. Every authorized document is indexed; only the answer context has a budget. */
export function rankKnowledge(chunks:KnowledgeChunk[],question:string,budget=26000){
 let expanded=question;for(const [word,value]of Object.entries(aliases))if(question.includes(word))expanded+=' '+value
 const terms=[...new Set(knowledgeTerms(expanded))],postings=new Map<string,Map<number,number>>(),avg=chunks.reduce((s,c)=>s+c.tokens.length,0)/Math.max(1,chunks.length)
 chunks.forEach((c,i)=>{for(const t of c.tokens){let posting=postings.get(t);if(!posting){posting=new Map();postings.set(t,posting)}posting.set(i,(posting.get(i)??0)+1)}})
 const scores=new Map<number,number>()
 for(const term of terms){const posting=postings.get(term);if(!posting)continue;const idf=Math.log(1+(chunks.length-posting.size+.5)/(posting.size+.5));for(const [i,tf]of posting){const c=chunks[i],score=idf*tf*2.2/(tf+1.2*(.25+.75*c.tokens.length/Math.max(1,avg)))+(c.title.toLowerCase().includes(term)?3:0);scores.set(i,(scores.get(i)??0)+score)}}
 const ordered=[...scores].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).map(([i])=>chunks[i])
 if(/全部|所有|完整|总共|多少|全面/.test(question)){
  const categories:AIKnowledgeCategory[]=[];for(const [pattern,category]of [[/社团|协会/,'organization'],[/办事|指南|部门|联系/,'guide'],[/地图|楼栋|宿舍/,'map'],[/活动/,'activity'],[/探店|餐饮/,'shop'],[/社区|帖子/,'community'],[/课表|课程/,'course'],[/搭子|组队/,'partner'],[/通知/,'notification'],[/交流|老师|教师|校友/,'coffee'],[/体育|运动/,'sports']] as [RegExp,AIKnowledgeCategory][])if(pattern.test(question))categories.push(category)
  const catalogs=chunks.filter(c=>c.id.startsWith('catalog:')&&(!categories.length||categories.includes(c.category!))),catalogIds=new Set(catalogs.map(c=>c.chunkId));ordered.unshift(...catalogs);for(let i=ordered.length-1;i>=catalogs.length;i--)if(catalogIds.has(ordered[i].chunkId))ordered.splice(i,1)
 }
 if(!ordered.length)ordered.push(...chunks.filter(c=>c.category==='navigation'))
 const selected:KnowledgeChunk[]=[];let used=0
 for(const chunk of ordered){if(used+chunk.text.length>budget)continue;selected.push(chunk);used+=chunk.text.length;if(selected.length>=40)break}
 return selected
}
export class CampusKnowledgeIndex{
 constructor(private store:LearningStore){}
 async retrieve(actorId:string,sources:AIKnowledgeSource[],question:string,connections:AIKnowledgeCoverage['connections']={school:'not-connected',sports:'not-requested'},notes:string[]=[]){
  const chunks=knowledgeChunks(sources),indexedAt=new Date().toISOString()
  let schema=schemas.get(this.store);if(!schema){schema=this.store.transaction('campus-rag-schema',async sql=>{await sql.rows('CREATE TABLE IF NOT EXISTS campus_ai_chunks (actor_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, chunk_id TEXT NOT NULL, content_hash TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(actor_id,chunk_id))')});schemas.set(this.store,schema);void schema.catch(()=>schemas.delete(this.store))}await schema
  const stored=await this.store.transaction('campus-index:'+actorId,async sql=>{
   const current=await sql.rows<{chunk_id:string;content_hash:string}>('SELECT chunk_id,content_hash FROM campus_ai_chunks WHERE actor_id=?',[actorId]),prior=new Map(current.map(r=>[r.chunk_id,r.content_hash])),allowed=new Set(chunks.map(c=>c.chunkId))
   for(const c of chunks){const data=JSON.stringify(c),hash=createHash('sha256').update(data).digest('hex');if(prior.get(c.chunkId)!==hash)await sql.rows('INSERT INTO campus_ai_chunks(actor_id,chunk_id,content_hash,data) VALUES(?,?,?,?) ON CONFLICT(actor_id,chunk_id) DO UPDATE SET content_hash=excluded.content_hash,data=excluded.data',[actorId,c.chunkId,hash,data])}
   for(const c of current)if(!allowed.has(c.chunk_id))await sql.rows('DELETE FROM campus_ai_chunks WHERE actor_id=? AND chunk_id=?',[actorId,c.chunk_id])
   return (await sql.rows<{data:string}>('SELECT data FROM campus_ai_chunks WHERE actor_id=? ORDER BY chunk_id',[actorId])).map(r=>JSON.parse(r.data) as KnowledgeChunk).filter(c=>allowed.has(c.chunkId))
  })
  const selected=rankKnowledge(stored,question),categories:Partial<Record<AIKnowledgeCategory,number>>={}
  const documents=sources.filter(s=>!s.id.startsWith('catalog:'))
  for(const s of documents){const kind=s.category??'navigation';categories[kind]=(categories[kind]??0)+1}
  const coverage:AIKnowledgeCoverage={documents:documents.length,chunks:stored.length,selected:selected.length,indexedAt,categories,connections,partial:notes.length>0,notes}
  return {selected,coverage}
 }
}
