import { randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import { account, demand, digest, matchesPassword, normalizeEmail, ServiceError, timestamp, type AccountRow } from '../auth';
import type { PostgresDatabase } from './postgres';

export class PostgresAuth {
  constructor(private readonly db: PostgresDatabase) {}

  async login(identifierInput: unknown, password: unknown, kind?: 'PERSONAL' | 'ADMIN', validate?: (client:PoolClient,actor:ReturnType<typeof account>)=>Promise<void>) {
    demand(typeof identifierInput === 'string' && identifierInput.trim().length > 0 && identifierInput.trim().length <= (kind === 'ADMIN' ? 100 : 254), '请填写邮箱或管理账号。');
    const identifier = kind === 'PERSONAL' ? normalizeEmail(identifierInput) : identifierInput.trim().toLowerCase();
    demand(typeof password === 'string', '邮箱或密码错误。', 401);
    const result = await this.db.transaction(async client => {
      // Coordinate attempt limits across API instances, without locking unrelated accounts.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`login:${identifier}`]);
      const now = Date.now();
      const previous = (await client.query<{failures:number;blocked_until:string}>('SELECT * FROM login_attempts WHERE identifier=$1', [identifier])).rows[0];
      demand(!previous || Number(previous.blocked_until) < now || previous.failures < 10, '登录尝试过多，请十五分钟后重试。', 429);
      const rows = (await client.query<AccountRow>("SELECT * FROM accounts WHERE ((login_kind='PERSONAL' AND email=$1) OR (login_kind='ADMIN' AND login_name=$1)) AND ($2::text IS NULL OR login_kind=$2)", [identifier,kind ?? null])).rows;
      const matching = rows.filter(row=>matchesPassword(password,row.password_hash));
      if (!rows.length) matchesPassword(password,'00000000000000000000000000000000:'+ '00'.repeat(64));
      demand(matching.length <= 1, '账号标识重复，请联系管理员调整管理登录账号。', 409);
      if (!matching.length) {
        await client.query('INSERT INTO login_attempts(identifier,failures,blocked_until) VALUES($1,$2,$3) ON CONFLICT(identifier) DO UPDATE SET failures=excluded.failures,blocked_until=excluded.blocked_until', [identifier,previous && Number(previous.blocked_until)>now ? previous.failures+1 : 1,now+900_000]);
        // Commit failed-attempt accounting before returning a credential error.
        return null;
      }
      const row = matching[0];
      if (row.login_kind === 'ADMIN') {
        if (row.status !== 'active') throw new ServiceError(403,'ACCOUNT_DISABLED','管理账号已停用。');
        const identity = await client.query("SELECT 1 FROM entities WHERE kind='sportsIdentity' AND owner_id=$1 AND data::jsonb->>'role'='admin' AND data::jsonb->>'status'='verified'", [row.id]);
        demand(identity.rows.length,'管理账号身份不可用。',403);
      }
      await client.query('DELETE FROM login_attempts WHERE identifier=$1',[identifier]);
      if(validate)await validate(client,account(row));
      const token = randomBytes(32).toString('base64url');
      await client.query('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)', [digest(token),row.id,now+43_200_000,timestamp()]);
      return {token,account:account(row)};
    });
    if (!result) throw new ServiceError(401,'INVALID_CREDENTIALS','邮箱或密码错误。');
    return result;
  }

  async authenticate(token: string | undefined, client: Pick<PoolClient,'query'> = this.db.pool) {
    if (!token) throw new ServiceError(401,'UNAUTHENTICATED','请先登录。');
    const row = (await client.query<AccountRow>('SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>$2',[digest(token),Date.now()])).rows[0];
    if (!row || row.login_kind === 'HISTORY') throw new ServiceError(401,'UNAUTHENTICATED','登录已过期，请重新登录。');
    if (row.login_kind === 'ADMIN' && row.status !== 'active') throw new ServiceError(403,'ACCOUNT_DISABLED','管理账号已停用。');
    return account(row);
  }

  async logout(token: string | undefined) {
    if (token) await this.db.pool.query('DELETE FROM sessions WHERE token_hash=$1',[digest(token)]);
  }
}
