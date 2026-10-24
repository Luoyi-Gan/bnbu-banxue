import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository, decodePostgresEntity } from './postgres-repository';
import { demand } from '../auth';
import type { Entity, Fields, Repository } from '../repository';
import { projectWorkspace } from '../snapshot-projection';
import { projectRelationshipHistory } from '../relationship-history';
import { passwordChangeRequired } from '../accounts/account-gate';
import { recordedStudentNumber } from '../student-search';
import { projectDisplayPeople } from '../display-people';

export async function postgresWorkspace(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    if (actor.roles.length === 0) {
      const ownKinds=['profile','preferences','verifiedEmail','companionIdentity','studentIdentityRequest'];
      const ownRows=(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>('SELECT * FROM entities WHERE owner_id=$1 AND kind=ANY($2::text[]) ORDER BY created_at DESC,id',[actor.id,ownKinds])).rows;
      const ownEntities=await Promise.all(ownRows.map(decodePostgresEntity));
      const notifications=(await client.query<Fields>('SELECT id,entity_id AS "entityId",event,body,target,created_at AS "createdAt",read_at AS "readAt" FROM notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 50',[actor.id])).rows;
      const people=projectDisplayPeople(actor,[{id:actor.id,name:actor.name,organization:actor.organization,status:actor.status,roles:actor.roles}],new Set([actor.id]),ownEntities.filter(e=>e.kind==='preferences'),ownEntities.filter(e=>e.kind==='profile'));
      return {firstLoginOnly:false,account:{...actor,studentNumber:null},sports:null,sportsStatus:'unavailable',entities:ownEntities,people,notifications,relations:[],audit:[],notificationBatches:[],relationshipHistory:[],alumni:{profiles:[],follows:[],slots:[],bookings:[],notices:[],history:[]},capabilities:{schoolIdentity:process.env.BNBU_IDENTITY_VERIFICATION_URL?'configured':'external-service-required'}};
    }
    // Build an immutable read model from one database snapshot; writes never use it.
    const rows=(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>(`SELECT id,kind,owner_id,data,version,created_at,updated_at FROM (SELECT e.*,row_number() OVER (PARTITION BY e.kind ORDER BY e.created_at DESC,e.id) AS rn FROM entities e WHERE
      e.kind NOT IN ('post','comment','room') OR
      (e.kind='post' AND (e.owner_id=$1 OR (e.data::jsonb->>'status'='visible' AND e.id IN (SELECT entity_id FROM relations WHERE account_id=$1 AND kind='save')))) OR
      (e.kind='room' AND (e.owner_id=$1 OR e.data::jsonb->'members' ? $1 OR e.id IN (SELECT entity_id FROM relations WHERE account_id=$1 AND kind='save') OR e.id IN (SELECT data::jsonb->>'roomId' FROM entities WHERE kind='roomApplication' AND owner_id=$1))) OR
      (e.kind='comment' AND (e.owner_id=$1 OR e.data::jsonb->>'postId' IN (SELECT id FROM entities WHERE kind='post' AND (owner_id=$1 OR id IN (SELECT entity_id FROM relations WHERE account_id=$1 AND kind='save')))))
      ) scoped WHERE scoped.kind NOT IN ('post','comment','room') OR scoped.rn<=50 ORDER BY created_at DESC,id`,[actor.id])).rows;
    const entities:Entity[]=await Promise.all(rows.map(decodePostgresEntity));
    const people=await new PostgresRepository(client).people();
    const repo:Pick<Repository,'all'|'get'|'people'>={
      all:kind=>entities.filter(entity=>entity.kind===kind),
      get:(id,kind)=>{const entity=entities.find(item=>item.id===id);demand(entity && (!kind || entity.kind===kind),'对象不存在。',404);return entity;},
      people:()=>people,
    };
    const audit=(await client.query<Fields>("SELECT id,actor_id,role,action,entity_id,reason,data,created_at FROM audit WHERE actor_id=$1 OR action IN ('room.create','room.decide','room.finish','room.moderate') OR ($2 AND action='notification.send') ORDER BY created_at DESC,sequence DESC LIMIT 2000",[actor.id,actor.roles.includes('superadmin')])).rows;
    // Each party needs the complete booking timeline, including changes by the
    // other party. Match the shared projection's operator/teacher/owner scope,
    // keeping this separate from the actor-scoped general audit feed.
    const operate=actor.roles.includes('operator') || actor.roles.includes('superadmin');
    const coffeeIDs=entities.filter(entity=>entity.kind==='coffeeBooking' && (entity.ownerId===actor.id || (entity.data.teacherId===actor.id && actor.roles.includes('teacher')) || operate)).map(entity=>entity.id);
    const coffeeAudit=coffeeIDs.length?(await client.query<Fields>("SELECT id,action,entity_id,reason,data,created_at FROM audit WHERE entity_id=ANY($1::text[]) AND action IN ('coffee.book','coffee.move','coffee.answer','coffee.cancel') ORDER BY created_at,sequence",[coffeeIDs])).rows:[];
    const allNotifications=(await client.query<Fields>('SELECT id,recipient_id,entity_id AS "entityId",event,body,target,created_at AS "createdAt",read_at AS "readAt" FROM notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 100',[actor.id])).rows;
    const notifications=allNotifications.map(row=>({id:row.id,entityId:row.entityId,event:row.event,body:row.body,target:row.target,createdAt:row.createdAt,readAt:row.readAt}));
    const batchIds=audit.filter(row=>row.action==='notification.send').map(row=>String(row.entity_id));
    const batchRows=batchIds.length?(await client.query<{id:string;total:string;read:string}>('SELECT entity_id AS id,count(*) AS total,count(read_at) AS read FROM notifications WHERE entity_id=ANY($1::text[]) GROUP BY entity_id',[batchIds])).rows:[];
    const batchStats=new Map(batchRows.map(row=>[row.id,{total:Number(row.total),read:Number(row.read)}]));
    const relations=(await client.query<Fields>('SELECT entity_id AS "entityId",kind,created_at AS "createdAt" FROM relations WHERE account_id=$1',[actor.id])).rows;
    const number=recordedStudentNumber(actor,repo.all('companionIdentity'));
    const projected = projectWorkspace({
      repo,firstLoginOnly:passwordChangeRequired(repo.all('companionIdentity'),actor),studentNumber:number,
      sports:null,notifications,relations,
      audit:audit.slice(0,200),
      coffeeHistory:id=>coffeeAudit.filter(row=>row.entity_id===id && ['coffee.book','coffee.move','coffee.answer','coffee.cancel'].includes(String(row.action))).map(row=>{
        const data=JSON.parse(String(row.data)) as {accepted?:boolean};
        return {id:row.id,action:row.action,reason:row.reason,at:row.created_at,...(row.action==='coffee.answer' && typeof data.accepted==='boolean' ? {accepted:data.accepted} : {})};
      }),
      relationshipHistory:visible=>projectRelationshipHistory(actor.id,visible,
        audit.filter(row=>row.actor_id===actor.id && row.action==='relation.set').map(row=>({entityId:String(row.entity_id),data:String(row.data),at:String(row.created_at)})),
        audit.filter(row=>['room.create','room.decide','room.finish','room.moderate'].includes(String(row.action))).map(row=>({action:String(row.action),data:String(row.data),at:String(row.created_at)}))),
      notificationBatches:audit.filter(row=>row.action==='notification.send' && (row.actor_id===actor.id || actor.roles.includes('superadmin'))).map(row=>{
        const stat=batchStats.get(String(row.entity_id))??{total:0,read:0};
        return {id:row.entity_id,createdAt:row.created_at,total:stat.total,read:stat.read,readRate:stat.total?stat.read/stat.total:null};
      }),
    },actor);
    const counts=(await client.query("SELECT count(*) AS total,count(*) FILTER(WHERE read_at IS NULL) AS unread,count(*) FILTER(WHERE read_at IS NULL AND CASE WHEN event LIKE 'room.%' THEN COALESCE((SELECT (data::jsonb->>'teams')::boolean FROM entities WHERE kind='preferences' AND owner_id=$1 LIMIT 1),true) ELSE COALESCE((SELECT (data::jsonb->>'messages')::boolean FROM entities WHERE kind='preferences' AND owner_id=$1 LIMIT 1),true) END) AS badge FROM notifications WHERE recipient_id=$1",[actor.id])).rows[0];
    return {...projected,notificationCount:Number(counts.total),totalUnreadCount:Number(counts.unread),effectiveNoticeCount:Number(counts.badge)};
  });
}
