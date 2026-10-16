import {demand,type Account} from '../auth';
import type {PostgresDatabase} from './postgres';

export async function postgresModerationPage(db:PostgresDatabase,actor:Account,params:URLSearchParams) {
  demand(actor.roles.includes('reviewer')||actor.roles.includes('superadmin'),'需要审核职责。',403);
  const status=params.get('status')??'all',kind=params.get('kind')??'all',query=(params.get('q')??'').trim().toLowerCase(),author=(params.get('author')??'').trim().toLowerCase();
  demand(['all','visible','pending','hidden','deleted'].includes(status),'状态筛选无效。');
  demand(['all','post','comment'].includes(kind),'类型筛选无效。');
  demand(query.length<=100 && author.length<=100,'搜索条件过长。');
  const page=Math.max(1,Math.min(100000,Number(params.get('page'))||1));
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const where="e.kind IN ('post','comment') AND ($1='all' OR e.kind=$1) AND ($2='all' OR e.data::jsonb->>'status'=$2) AND ($3='' OR lower(COALESCE(e.data::jsonb->>'title','')||' '||COALESCE(e.data::jsonb->>'body','')) LIKE '%'||$3||'%') AND ($4='' OR lower(COALESCE(a.name,'')) LIKE '%'||$4||'%')";
    const values=[kind,status,query,author];
    const total=Number((await client.query<{count:string}>(`SELECT count(*) AS count FROM entities e LEFT JOIN accounts a ON a.id=e.owner_id WHERE ${where}`,values)).rows[0].count);
    const rows=(await client.query<{id:string;kind:'post'|'comment';ownerId:string;data:string;createdAt:string;version:number;author:string;parentData:string|null}>(`SELECT e.id,e.kind,e.owner_id AS "ownerId",e.data,e.created_at AS "createdAt",e.version,COALESCE(a.name,'已注销用户') AS author,p.data AS "parentData" FROM entities e LEFT JOIN accounts a ON a.id=e.owner_id LEFT JOIN entities p ON p.id=e.data::jsonb->>'postId' AND p.kind='post' WHERE ${where} ORDER BY e.created_at DESC,e.id DESC LIMIT 50 OFFSET $5`,[...values,(page-1)*50])).rows;
    const items=await Promise.all(rows.map(async row=>{
      const data=JSON.parse(row.data) as Record<string,unknown>,parentData=row.parentData?JSON.parse(row.parentData) as Record<string,unknown>:null;
      const neighbors=row.kind==='comment'?(await client.query<{id:string;body:string}>("SELECT id,data::jsonb->>'body' AS body FROM entities WHERE kind='comment' AND data::jsonb->>'postId'=$1 AND data::jsonb->>'status'='visible' AND id<>$2 ORDER BY abs(extract(epoch FROM (created_at::timestamptz-$3::timestamptz))),created_at LIMIT 2",[data.postId,row.id,row.createdAt])).rows:[];
      return {id:row.id,kind:row.kind,title:row.kind==='post'?String(data.title??''):`评论 · ${String(parentData?.title??'原帖子')}`,body:String(data.body??''),author:row.author,ownerId:row.ownerId,status:String(data.status??''),createdAt:row.createdAt,version:row.version,postTitle:parentData?.title,postExcerpt:parentData?String(parentData.body??'').slice(0,300):undefined,neighborComments:neighbors.map(item=>({id:item.id,body:item.body}))};
    }));
    return {items,total,page,hasMore:page*50<total};
  });
}
