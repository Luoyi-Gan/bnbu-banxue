import { demand } from '../auth';
import { projectPersonHover } from '../person-hover';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import { postgresStudentSearch } from './postgres-student-search';
import {projectDisplayPeople} from '../display-people';

export async function postgresPersonHover(db:PostgresDatabase,token:string,personId:string,studentNumber?:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const viewer=await new PostgresAuth(db).authenticate(token,client);
    demand(viewer.roles.length>0 && viewer.status!=='banned','请先完成校园身份核验。',403);
    const repo=new PostgresRepository(client);
    const business=personId===viewer.id || (await client.query("SELECT 1 FROM entities WHERE (kind='post' AND owner_id=$1 AND data::jsonb->>'status'='visible') OR (kind='room' AND data::jsonb->>'visibility'='visible' AND (owner_id=$1 OR data::jsonb->'members' ? $1)) OR (kind='activity' AND owner_id=$1 AND data::jsonb->>'status'='published') LIMIT 1",[personId])).rows.length>0;
    const account=business?(await client.query<{id:string;name:string;organization:string;status:'active'|'muted'|'banned';roles:string}>("SELECT id,name,organization,status,roles FROM accounts WHERE id=$1 AND login_kind<>'HISTORY'",[personId])).rows[0]:undefined;
    const [preferences,profiles]=await Promise.all([repo.all('preferences'),repo.all('profile')]);
    const visible=account?projectDisplayPeople(viewer,[{...account,roles:JSON.parse(account.roles)}],new Set([personId]),preferences,profiles)[0]:undefined;
    const searched=!visible && studentNumber ? (await postgresStudentSearch(db,token,studentNumber)).students.find(person=>person.id===personId) : undefined;
    const person=visible ?? searched;
    demand(person,'用户当前不可查看。',404);
    const prefs=preferences.find(item=>item.ownerId===personId)?.data;
    const [rooms,activities,marks]=await Promise.all([
      repo.all('room'),repo.all('activity'),
      client.query<{id:string;createdAt:string}>("SELECT entity_id AS id,created_at AS \"createdAt\" FROM relations WHERE account_id=$1 AND kind='participate' ORDER BY created_at DESC",[personId]),
    ]);
    return projectPersonHover(viewer,personId,person,prefs,rooms,activities,marks.rows);
  });
}
