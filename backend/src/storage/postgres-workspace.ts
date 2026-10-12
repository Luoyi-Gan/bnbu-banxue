import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository, decodePostgresEntity } from './postgres-repository';
import { demand } from '../auth';
import type { Entity, Fields, Repository } from '../repository';
import { projectWorkspace } from '../snapshot-projection';
import { projectRelationshipHistory } from '../relationship-history';
import { projectSportsCompanion } from '../sports/companion';
import { passwordChangeRequired } from '../sports/account-gate';
import { recordedStudentNumber } from '../student-search';

export async function postgresWorkspace(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    // Build an immutable read model from one database snapshot; writes never use it.
    const rows=(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>('SELECT * FROM entities ORDER BY created_at DESC,id')).rows;
    const entities:Entity[]=await Promise.all(rows.map(decodePostgresEntity));
    const people=await new PostgresRepository(client).people();
    const repo:Pick<Repository,'all'|'get'|'people'>={
      all:kind=>entities.filter(entity=>entity.kind===kind),
      get:(id,kind)=>{const entity=entities.find(item=>item.id===id);demand(entity && (!kind || entity.kind===kind),'对象不存在。',404);return entity;},
      people:()=>people,
    };
    const audit=(await client.query<Fields>('SELECT id,actor_id,role,action,entity_id,reason,data,created_at FROM audit ORDER BY created_at,sequence')).rows;
    const allNotifications=(await client.query<Fields>('SELECT id,recipient_id,entity_id AS "entityId",event,body,created_at AS "createdAt",read_at AS "readAt" FROM notifications ORDER BY created_at DESC')).rows;
    const notifications=allNotifications.filter(row=>row.recipient_id===actor.id).map(row=>({id:row.id,entityId:row.entityId,event:row.event,body:row.body,createdAt:row.createdAt,readAt:row.readAt}));
    const relations=(await client.query<Fields>('SELECT entity_id AS "entityId",kind,created_at AS "createdAt" FROM relations WHERE account_id=$1',[actor.id])).rows;
    const personal=(await client.query("SELECT 1 FROM accounts WHERE id=$1 AND lower(trim(email))=$2 AND login_kind='PERSONAL'",[actor.id,actor.email.trim().toLowerCase()])).rows.length>0;
    const number=recordedStudentNumber(actor,repo.all('sportsIdentity'));
    return projectWorkspace({
      repo,firstLoginOnly:passwordChangeRequired(repo.all('sportsIdentity'),actor),studentNumber:number,
      sports:projectSportsCompanion(repo,actor,personal),notifications,relations,
      audit:[...audit].reverse().slice(0,200),
      coffeeHistory:id=>audit.filter(row=>row.entity_id===id && ['coffee.book','coffee.move','coffee.answer','coffee.cancel'].includes(String(row.action))).map(row=>{
        const data=JSON.parse(String(row.data)) as {accepted?:boolean};
        return {id:row.id,action:row.action,reason:row.reason,at:row.created_at,...(row.action==='coffee.answer' && typeof data.accepted==='boolean' ? {accepted:data.accepted} : {})};
      }),
      relationshipHistory:visible=>projectRelationshipHistory(actor.id,visible,
        audit.filter(row=>row.actor_id===actor.id && row.action==='relation.set').map(row=>({entityId:String(row.entity_id),data:String(row.data),at:String(row.created_at)})),
        audit.filter(row=>['room.create','room.decide','room.finish','room.moderate'].includes(String(row.action))).map(row=>({action:String(row.action),data:String(row.data),at:String(row.created_at)}))),
      notificationBatches:[...audit].reverse().filter(row=>row.action==='notification.send' && (row.actor_id===actor.id || actor.roles.includes('superadmin'))).map(row=>{
        const notices=allNotifications.filter(n=>n.entityId===row.entity_id),read=notices.filter(n=>n.readAt!==null).length;
        return {id:row.entity_id,createdAt:row.created_at,total:notices.length,read: notices.length ? read : 0,readRate:notices.length ? read/notices.length : null};
      }),
    },actor);
  });
}
