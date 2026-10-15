import { demand } from '../auth';
import { projectPersonHover } from '../person-hover';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import { postgresStudentSearch } from './postgres-student-search';
import { postgresWorkspace } from './postgres-workspace';

export async function postgresPersonHover(db:PostgresDatabase,token:string,personId:string,studentNumber?:string) {
  const workspace=await postgresWorkspace(db,token);
  const visible=workspace.people.find(person=>person.id===personId);
  const searched=!visible && studentNumber ? (await postgresStudentSearch(db,token,studentNumber)).students.find(person=>person.id===personId) : undefined;
  const person=visible ?? searched;
  demand(person,'用户当前不可查看。',404);
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const viewer=await new PostgresAuth(db).authenticate(token,client);
    const repo=new PostgresRepository(client);
    const prefs=(await repo.all('preferences')).find(item=>item.ownerId===personId)?.data;
    const [rooms,activities,marks]=await Promise.all([
      repo.all('room'),repo.all('activity'),
      client.query<{id:string;createdAt:string}>("SELECT entity_id AS id,created_at AS \"createdAt\" FROM relations WHERE account_id=$1 AND kind='participate' ORDER BY created_at DESC",[personId]),
    ]);
    return projectPersonHover(viewer,personId,person,prefs,rooms,activities,marks.rows);
  });
}
