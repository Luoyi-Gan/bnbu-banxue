import {demand,type Account} from './auth';
import type {Database} from './database';

export function moderationPage(db:Database,actor:Account,params:URLSearchParams) {
  demand(actor.roles.includes('reviewer')||actor.roles.includes('superadmin'),'需要审核职责。',403);
  const status=params.get('status')??'all',kind=params.get('kind')??'all',query=(params.get('q')??'').trim().toLowerCase(),author=(params.get('author')??'').trim().toLowerCase();
  demand(['all','visible','pending','hidden','deleted'].includes(status),'状态筛选无效。');
  demand(['all','post','comment'].includes(kind),'类型筛选无效。');
  demand(query.length<=100 && author.length<=100,'搜索条件过长。');
  const page=Math.max(1,Math.min(100000,Number(params.get('page'))||1));
  const where="kind IN ('post','comment') AND (?='all' OR kind=?) AND (?='all' OR json_extract(data,'$.status')=?) AND (?='' OR lower(COALESCE(json_extract(data,'$.title'),'')||' '||COALESCE(json_extract(data,'$.body'),'')) LIKE '%'||?||'%') AND (?='' OR lower(COALESCE((SELECT name FROM accounts WHERE id=owner_id),'')) LIKE '%'||?||'%')";
  const args=[kind,kind,status,status,query,query,author,author];
  const total=Number((db.prepare(`SELECT count(*) AS count FROM entities WHERE ${where}`).get(...args) as {count:number}).count);
  const rows=db.prepare(`SELECT id,kind,owner_id AS ownerId,data,created_at AS createdAt,version FROM entities WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET ?`).all(...args,(page-1)*50) as {id:string;kind:'post'|'comment';ownerId:string;data:string;createdAt:string;version:number}[];
  const items=rows.map(row=>{
    const data=JSON.parse(row.data) as Record<string,unknown>;
    const parent=row.kind==='comment'?db.prepare("SELECT data FROM entities WHERE id=? AND kind='post'").get(String(data.postId)) as {data:string}|undefined:undefined;
    const parentData=parent?JSON.parse(parent.data) as Record<string,unknown>:null;
    const name=db.prepare('SELECT name FROM accounts WHERE id=?').get(row.ownerId) as {name:string}|undefined;
    const neighbors=row.kind==='comment' ? db.prepare("SELECT id,owner_id AS ownerId,json_extract(data,'$.body') AS body FROM entities WHERE kind='comment' AND json_extract(data,'$.postId')=? AND json_extract(data,'$.status')='visible' AND id<>? ORDER BY abs(julianday(created_at)-julianday(?)),created_at LIMIT 2").all(String(data.postId),row.id,row.createdAt) as {id:string;ownerId:string;body:string}[] : [];
    return {id:row.id,kind:row.kind,title:row.kind==='post'?String(data.title??''):`评论 · ${String(parentData?.title??'原帖子')}`,body:String(data.body??''),author:name?.name??'已注销用户',ownerId:row.ownerId,status:String(data.status??''),createdAt:row.createdAt,version:row.version,postTitle:parentData?.title,postExcerpt:parentData?String(parentData.body??'').slice(0,300):undefined,neighborComments:neighbors.map(item=>({id:item.id,body:item.body}))};
  });
  return {items,total,page,hasMore:page*50<total};
}
