import { helpRead } from '../sports/help';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';

export async function postgresSportsHelp(db: PostgresDatabase, token: string, lang: unknown) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor = await new PostgresAuth(db).authenticate(token, client);
    const repo = new PostgresRepository(client);
    const entities = [...await repo.all('sportsIdentity'), ...await repo.all('sportsSystem'), ...await repo.all('sportsHelp')];
    return helpRead({all: kind => entities.filter(item => item.kind === kind)}, actor, lang);
  });
}
