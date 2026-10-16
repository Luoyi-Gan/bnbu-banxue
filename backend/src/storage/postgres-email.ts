import { randomInt, randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { demand, digest, hashPassword, normalizeEmail, ServiceError, timestamp, type Account } from '../auth';
import { deliverMessage } from '../mail-delivery';
import type { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';

export class PostgresEmail {
  constructor(private readonly db: PostgresDatabase) {}

  async sendVerification(rawEmail: unknown, localOutbox: boolean, origin='local') {
    const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
    demand(localOutbox || endpoint,'尚未配置验证码邮件服务。',503);
    const email = normalizeEmail(rawEmail);
    const message = await this.db.transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`email-source:${digest(origin)}`]);
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`email:${email}`]);
      const now = Date.now();
      const previous = (await client.query<{sent_at:string}>('SELECT sent_at FROM email_challenges WHERE email=$1',[email])).rows[0];
      demand(!previous || now-Number(previous.sent_at)>=60_000,'请稍后再发送验证码。',429);
      const subject=digest(email),source=digest(origin);
      const limits=(await client.query<{hour:string;day:string;source:string;global:string}>("SELECT count(*) FILTER (WHERE subject=$1 AND occurred_at>=$3) AS hour,count(*) FILTER (WHERE subject=$1) AS day,count(DISTINCT subject) FILTER (WHERE origin=$2 AND occurred_at>=$3) AS source,count(*) FILTER (WHERE occurred_at>=$3) AS global FROM security_rate_events WHERE category='email-send' AND occurred_at>=$4",[subject,source,now-3_600_000,now-86_400_000])).rows[0];
      demand(Number(limits.hour)<5 && Number(limits.day)<10 && Number(limits.source)<20 && Number(limits.global)<1000,'请求过于频繁，请稍后再试。',429);
      await client.query("INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES('email-send',$1,$2,$3)",[subject,source,now]);
      const code = String(randomInt(100000,1000000));
      const outbox = {id:randomUUID(),recipient:email,subject:'伴学注册验证码',body:`验证码：${code}，10 分钟内有效。`};
      await client.query('INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES($1,$2,$3,0,$4) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,sent_at=excluded.sent_at',[email,digest(`${email}:${code}`),now+600_000,now]);
      await client.query('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES($1,$2,$3,$4,$5)',[outbox.id,outbox.recipient,outbox.subject,outbox.body,timestamp()]);
      return outbox;
    });
    if (!endpoint) return {sent:true,delivery:'local-outbox',message:'验证码已写入本地开发收件箱，未发送至真实邮箱。'};
    await deliverMessage(message,endpoint);
    await this.db.pool.query('UPDATE mail_outbox SET delivered_at=$1 WHERE id=$2',[timestamp(),message.id]);
    return {sent:true,delivery:'email',message:'验证码已发送，请查看邮箱。'};
  }

  private async consume<T>(email: string, code: unknown, operation: (client: PoolClient)=>Promise<T>): Promise<T> {
    demand(typeof code==='string' && /^\d{6}$/.test(code),'请填写六位验证码。');
    const result = await this.db.transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`email:${email}`]);
      const challenge = (await client.query<{code_hash:string;expires_at:string;attempts:number}>('SELECT * FROM email_challenges WHERE email=$1 FOR UPDATE',[email])).rows[0];
      if (!challenge || Number(challenge.expires_at)<=Date.now() || challenge.attempts>=5) return {error:new ServiceError(400,'INVALID_REQUEST','验证码已失效，请重新获取。')};
      await client.query('UPDATE email_challenges SET attempts=attempts+1 WHERE email=$1',[email]);
      if (typeof code!=='string' || digest(`${email}:${code}`)!==challenge.code_hash) return {error:new ServiceError(400,'INVALID_REQUEST','验证码错误。')};
      const value = await operation(client);
      await client.query('DELETE FROM email_challenges WHERE email=$1',[email]);
      return {value};
    });
    if ('error' in result) throw result.error;
    return result.value;
  }

  async register(input: {email?:unknown;code?:unknown;password?:unknown}) {
    const email = normalizeEmail(input.email);
    const passwordHash = hashPassword(input.password);
    return this.consume(email,input.code,async client => {
      demand(!(await client.query("SELECT 1 FROM accounts WHERE email=$1 AND login_kind='PERSONAL'",[email])).rows.length,'该邮箱已注册。',409);
      const id = randomUUID();
      await client.query('INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES($1,$2,$3,$4,$5)',[id,email,passwordHash,email.split('@')[0].slice(0,20),timestamp()]);
      await new PostgresRepository(client).create('verifiedEmail',id,{email,source:'registration-code'});
      return {registered:true};
    });
  }

  async verifyOwnEmail(actor: Account, code: unknown) {
    demand(actor.status!=='banned','账号已封禁。',403);
    return this.consume(actor.email,code,async client => {
      const current = (await client.query<{email:string;status:string}>('SELECT email,status FROM accounts WHERE id=$1 FOR UPDATE',[actor.id])).rows[0];
      demand(current && current.email===actor.email && current.status!=='banned','账号状态已变化，请重新登录。',403);
      await new PostgresRepository(client).create('verifiedEmail',actor.id,{email:actor.email,source:'own-email-code'});
      return {verified:true};
    });
  }
}
