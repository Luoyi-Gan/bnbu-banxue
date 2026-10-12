import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { demand, timestamp, type Account } from '../auth';
import type { Entity, Fields } from '../repository';

type EntityRow = { id: string; kind: string; owner_id: string | null; data: string; version: number; created_at: string; updated_at: string };
const decode = (row: EntityRow): Entity => ({ id: row.id, kind: row.kind, ownerId: row.owner_id, data: JSON.parse(row.data), version: row.version, createdAt: row.created_at, updatedAt: row.updated_at });

/** Construct inside PostgresDatabase.transaction; every operation shares its client. */
export class PostgresRepository {
  constructor(readonly client: PoolClient) {}
  async updateAccount(id: string, status: Account['status'], roles: string[]) {
    await this.client.query('UPDATE accounts SET status=$1,roles=$2 WHERE id=$3',[status,JSON.stringify([...new Set(roles)]),id]);
  }
  async ownsNotification(id: string, recipientId: string) {
    return (await this.client.query('SELECT 1 FROM notifications WHERE id=$1 AND recipient_id=$2',[id,recipientId])).rows.length>0;
  }
  async readNotification(id: string, recipientId: string, at: string) {
    await this.client.query('UPDATE notifications SET read_at=COALESCE(read_at,$1) WHERE id=$2 AND recipient_id=$3',[at,id,recipientId]);
  }

  async all(kind: string): Promise<Entity[]> {
    const result = await this.client.query<EntityRow>('SELECT * FROM entities WHERE kind=$1 ORDER BY created_at DESC,id', [kind]);
    return result.rows.map(decode);
  }

  async get(id: unknown, kind?: string): Promise<Entity> {
    demand(typeof id === 'string', '对象标识无效。');
    const {rows} = await this.client.query<EntityRow>('SELECT * FROM entities WHERE id=$1', [id]);
    const row = rows[0];
    demand(row && (!kind || row.kind === kind), '对象不存在。', 404);
    return decode(row);
  }

  async create(kind: string, ownerId: string | null, data: Fields): Promise<Entity> {
    const now = timestamp();
    const {rows} = await this.client.query<EntityRow>('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5) RETURNING *', [randomUUID(),kind,ownerId,JSON.stringify(data),now]);
    return decode(rows[0]);
  }

  async save(entity: Entity, patch: Fields): Promise<Entity> {
    const {rows} = await this.client.query<EntityRow>('UPDATE entities SET data=$1,version=version+1,updated_at=$2 WHERE id=$3 AND version=$4 RETURNING *', [JSON.stringify({...entity.data,...patch}),timestamp(),entity.id,entity.version]);
    demand(rows[0], '内容已更新，请刷新后重试。', 409);
    return decode(rows[0]);
  }

  async people(): Promise<Omit<Account,'email'>[]> {
    const {rows} = await this.client.query<{id:string;name:string;organization:string;status:Account['status'];roles:string}>("SELECT id,name,organization,status,roles FROM accounts WHERE login_kind<>'HISTORY'");
    return rows.map(row => ({...row,roles:JSON.parse(row.roles)}));
  }

  async person(id: string): Promise<Account> {
    const {rows} = await this.client.query<Omit<Account,'roles'> & {roles:string}>("SELECT id,COALESCE(email,'') AS email,COALESCE(name,'已注销用户') AS name,COALESCE(organization,'') AS organization,status,roles FROM accounts WHERE id=$1", [id]);
    demand(rows[0], '账号不存在。', 404);
    return {...rows[0],roles:JSON.parse(rows[0].roles)};
  }

  async notify(recipients: string[], entityId: string | null, event: string, body: string) {
    for (const recipient of new Set(recipients)) {
      await this.client.query('INSERT INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES($1,$2,$3,$4,$5,$6)', [randomUUID(),recipient,entityId,event,body,timestamp()]);
    }
  }

  async related(accountId: string, entityId: string, kind: string): Promise<boolean> {
    const {rows} = await this.client.query('SELECT 1 FROM relations WHERE account_id=$1 AND entity_id=$2 AND kind=$3', [accountId,entityId,kind]);
    return rows.length > 0;
  }

  async relation(accountId: string, entityId: string, kind: string, enabled: boolean) {
    if (enabled) {
      await this.client.query('INSERT INTO relations(account_id,entity_id,kind,created_at) VALUES($1,$2,$3,$4) ON CONFLICT(account_id,entity_id,kind) DO NOTHING', [accountId,entityId,kind,timestamp()]);
    } else {
      await this.client.query('DELETE FROM relations WHERE account_id=$1 AND entity_id=$2 AND kind=$3', [accountId,entityId,kind]);
    }
  }
}
