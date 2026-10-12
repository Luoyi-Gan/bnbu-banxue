import { demand } from '../auth';
import { integerField, textField, type Fields } from '../repository';
import { sportsAccountGate } from '../sports/account-gate';
import { sportsAvailable } from '../sports/materials';
import { projectSportsNotification } from '../sports/portal-notifications';
import { PostgresAuth } from './postgres-auth';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export async function postgresSportsNotifications(db:PostgresDatabase,token:string,input:Fields) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const identities=await repo.all('sportsIdentity');
    sportsAccountGate({all:()=>identities},actor);
    demand(actor.status!=='banned' && identities.filter(i=>i.ownerId===actor.id && i.data.status==='verified' && ['student','teacher','admin'].includes(String(i.data.role))).length===1,'没有有效体育身份。',403);
    const systems=await repo.all('sportsSystem');
    sportsAvailable({all:()=>systems});
    demand(Object.keys(input).every(key=>['limit','cursor','unreadOnly'].includes(key)),'通知查询参数无效。');
    demand(input.unreadOnly===undefined || ['true','false'].includes(String(input.unreadOnly)),'未读筛选无效。');
    const limit=input.limit===undefined?20:integerField({limit:Number(input.limit)},'limit',1,100);
    const cursor=textField(input,'cursor',100,true);
    const boundary=cursor ? (await client.query<Fields>("SELECT created_at,id FROM notifications WHERE id=$1 AND recipient_id=$2 AND event LIKE 'sports.%'",[cursor,actor.id])).rows[0] : null;
    demand(!cursor || boundary,'通知分页基准已变化，请刷新。',409);
    const rows=(await client.query<Fields>(`SELECT n.*,e.kind AS target_kind,e.owner_id AS target_owner FROM notifications n LEFT JOIN entities e ON e.id=n.entity_id
      WHERE n.recipient_id=$1 AND n.event LIKE 'sports.%' AND ($2::boolean=false OR n.read_at IS NULL)
      AND ($3::text IS NULL OR n.created_at<$3 OR (n.created_at=$3 AND n.id<$4))
      ORDER BY n.created_at DESC,n.id DESC LIMIT $5`,[actor.id,input.unreadOnly==='true',boundary?.created_at ?? null,boundary?.id ?? null,limit+1])).rows;
    const items=rows.slice(0,limit),hasMore=rows.length>limit;
    return {data:items.map(row=>projectSportsNotification(row,row.target_kind ? {kind:row.target_kind,owner_id:row.target_owner} : undefined)),meta:{pagination:{hasMore,nextCursor:hasMore?items.at(-1)!.id:null,limit}}};
  });
}
