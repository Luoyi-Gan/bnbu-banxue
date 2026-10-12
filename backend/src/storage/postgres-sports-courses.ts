import { demand } from '../auth';
import type { Entity, Repository } from '../repository';
import { projectSportsCourses } from '../sports/courses';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';

/** Course portion of the sports workspace, read from one consistent snapshot. */
export async function postgresSportsCourses(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor = await new PostgresAuth(db).authenticate(token, client);
    const source = new PostgresRepository(client);
    const kinds = ['sportsIdentity', 'sportsSemester', 'sportsCourse', 'sportsEnrollment', 'sportsEnrollmentFlow', 'sportsMakeup', 'sportsTemplate', 'sportsInvitation'];
    const entities: Entity[] = [];
    for (const kind of kinds) entities.push(...await source.all(kind));
    const repo: Pick<Repository, 'all' | 'get'> = {
      all: kind => entities.filter(item => item.kind === kind),
      get: (id, kind) => {
        const item = entities.find(item => item.id === id && (!kind || item.kind === kind));
        demand(item, '对象不存在。', 404);
        return item;
      },
    };
    const names = new Map((await client.query<{id:string;name:string}>('SELECT id,name FROM accounts')).rows.map(row => [row.id,row.name]));
    return projectSportsCourses(repo, actor, id => names.get(id) ?? '历史学生');
  });
}
