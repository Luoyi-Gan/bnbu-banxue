import {randomBytes,randomInt} from 'node:crypto';
import {account,demand,digest,encodePassword,normalizeEmail,ServiceError,timestamp,type AccountRow,type Account} from './auth';
import {deliverMessage} from './mail-delivery';
import {learningEntity,type LearningSql,type LearningStore} from './learning-store';
import {ISpace} from './ispace';
import type {LearningCourse,LearningEvent,LearningMaterial,LearningOverview} from '../../shared/v2/learning';

type SchoolIdentity=Awaited<ReturnType<ISpace['login']>>;
export type SchoolSession=SchoolIdentity&{ownerId:string;expiresAt:number;courses?:LearningCourse[];events?:LearningEvent[];syncedAt?:string;materials?:Record<string,LearningMaterial[]>;warnings?:string[];sync?:LearningOverview['sync']};
export class LearningAuth {
  private readonly sessions=new Map<string,SchoolSession>();
  onSchoolLogin?: (actor:Account,token:string,username:string,password:string)=>Promise<void>;
  constructor(readonly store:LearningStore,readonly school=new ISpace()){}
  private cleanup(){const now=Date.now();for(const[key,value]of this.sessions)if(value.expiresAt<=now)this.sessions.delete(key);}
  current(token:string,ownerId:string){this.cleanup();const session=this.sessions.get(digest(token));return session?.ownerId===ownerId?session:undefined;}
  forget(token:string){this.sessions.delete(digest(token));}
  async limit(sql:LearningSql,subject:string,origin:string,category:string,max:number,window=60000){
    const now=Date.now(),key=digest(origin);
    const rows=await sql.rows<{subject:string}>('SELECT subject FROM security_rate_events WHERE category=? AND origin=? AND occurred_at>?',[category,key,now-window]);
    demand(rows.length<max,'请求过于频繁，请稍后再试。',429);
    await sql.rows('INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES(?,?,?,?)',[category,digest(subject),key,now]);
  }
  async requestCode(rawEmail:unknown,origin:string,localOutbox:boolean){
    const email=normalizeEmail(rawEmail),endpoint=process.env.BNBU_EMAIL_DELIVERY_URL;
    demand(localOutbox||endpoint,'尚未配置验证码邮件服务。',503);
    const message=await this.store.transaction('email-login',async sql=>{
      await this.limit(sql,email,origin,'email-send',20,3600000);
      const now=Date.now(),key=`login:${email}`;
      const previous=(await sql.rows<{sent_at:number}>('SELECT sent_at FROM email_challenges WHERE email=?',[key]))[0];
      demand(!previous||now-Number(previous.sent_at)>=60000,'请稍后再发送验证码。',429);
      const recent=await sql.rows('SELECT subject FROM security_rate_events WHERE category=? AND subject=? AND occurred_at>?',['email-send',digest(email),now-3600000]);
      demand(recent.length<=5,'请稍后再发送验证码。',429);
      const daily=await sql.rows('SELECT subject FROM security_rate_events WHERE category=? AND subject=? AND occurred_at>?',['email-send',digest(email),now-86400000]);
      const global=await sql.rows('SELECT subject FROM security_rate_events WHERE category=? AND occurred_at>?',['email-send',now-3600000]);
      demand(daily.length<=10&&global.length<=1000,'请求过于频繁，请稍后再试。',429);
      const code=String(randomInt(100000,1000000)),id=randomBytes(20).toString('hex');
      await sql.rows('INSERT INTO email_challenges(email,code_hash,expires_at,attempts,sent_at) VALUES(?,?,?,0,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,sent_at=excluded.sent_at',[key,digest(`${key}:${code}`),now+600000,now]);
      const value={id,recipient:email,subject:'会同里登录验证码',body:`登录验证码：${code}，10 分钟内有效。`};
      await sql.rows('INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)',[id,email,value.subject,value.body,timestamp()]);return value;
    });
    if(!endpoint)return {sent:true,message:'验证码已写入本地开发收件箱，未发送至真实邮箱。'};
    await deliverMessage(message,endpoint);
    await this.store.transaction('email-login',sql=>sql.rows('UPDATE mail_outbox SET delivered_at=? WHERE id=?',[timestamp(),message.id]));
    return {sent:true,message:'验证码已发送，请查看邮箱。'};
  }
  private async session(sql:LearningSql,row:AccountRow){
    demand(row.status!=='banned','账号已封禁。',403);
    const updated=await sql.ensure(row),token=randomBytes(32).toString('base64url');
    await sql.rows('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)',[digest(token),row.id,Date.now()+43200000,timestamp()]);
    return {token,account:account(updated)};
  }
  async emailLogin(rawEmail:unknown,code:unknown,origin:string){
    const email=normalizeEmail(rawEmail);demand(typeof code==='string'&&/^\d{6}$/.test(code),'请填写六位验证码。');
    this.cleanup();
    const result=await this.store.transaction('email-login',async sql=>{
      // Invalid attempts commit; do not throw before storing their increment.
      await this.limit(sql,email,origin,'login',60);
      const key=`login:${email}`;
      const challenge=(await sql.rows<{code_hash:string;expires_at:number;attempts:number}>('SELECT * FROM email_challenges WHERE email=?',[key]))[0];
      if(!challenge||Number(challenge.expires_at)<=Date.now()||challenge.attempts>=5)return {error:'验证码已失效，请重新获取。'};
      await sql.rows('UPDATE email_challenges SET attempts=attempts+1 WHERE email=?',[key]);
      if(challenge.code_hash!==digest(`${key}:${code}`))return {error:'验证码错误。'};
      let row=(await sql.rows<AccountRow>("SELECT * FROM accounts WHERE email=? AND login_kind='PERSONAL'",[email]))[0];
      if(!row){
        const id=randomBytes(20).toString('hex');
        await sql.rows('INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES(?,?,?,?,?)',[id,email,encodePassword(randomBytes(48).toString('base64url')),'同学',timestamp()]);
        row=(await sql.rows<AccountRow>('SELECT * FROM accounts WHERE id=?',[id]))[0];
      }
      demand(row.status!=='banned','账号已封禁。',403);
      const verified=await sql.rows<{data:string}>("SELECT data FROM entities WHERE kind='verifiedEmail' AND owner_id=?",[row.id]);
      if(!verified.some(item=>JSON.parse(item.data).email===email))await learningEntity(sql,'verifiedEmail',row.id,{email,source:'email-login-code'});
      const session=await this.session(sql,row);
      await sql.rows("UPDATE mail_outbox SET body='[验证码已消费]' WHERE recipient=? AND subject=?",[email,'会同里登录验证码']);
      await sql.rows('DELETE FROM email_challenges WHERE email=?',[key]);return session;
    });
    if('error'in result)throw new ServiceError(400,'INVALID_CODE',result.error!);
    return result;
  }
  async schoolLogin(username:unknown,password:unknown,origin:string){
    demand(typeof username==='string'&&username.trim().length>0&&username.length<=254&&typeof password==='string'&&password.length>0&&password.length<=256,'请填写学校账号和密码。');
    await this.store.transaction('school-login',sql=>this.limit(sql,username,origin,'school-login',12));
    this.cleanup();demand(this.sessions.size<1000,'连接繁忙，请稍后再试。',429);
    const identity=await this.school.login(username.trim(),password);
    const result=await this.store.transaction('email-login',async sql=>{
      const link=(await sql.rows<{owner_id:string}>('SELECT owner_id FROM entities WHERE id=? AND kind=?',[`ispace-link:${identity.userId}`,'schoolLink']))[0];
      const email=normalizeEmail(identity.email);
      demand(/^[^\s@]+@mail\.bnbu\.edu\.cn$/.test(email),'学校未返回有效的本人学校邮箱。',403);
      let row=link?(await sql.rows<AccountRow>("SELECT * FROM accounts WHERE id=? AND login_kind='PERSONAL'",[link.owner_id]))[0]:(await sql.rows<AccountRow>("SELECT * FROM accounts WHERE email=? AND login_kind='PERSONAL'",[email]))[0];
      if(!row&&!link){
        const id=randomBytes(20).toString('hex');
        await sql.rows('INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES(?,?,?,?,?)',[id,email,encodePassword(randomBytes(48).toString('base64url')),identity.name||'同学',timestamp()]);
        row=(await sql.rows<AccountRow>('SELECT * FROM accounts WHERE id=?',[id]))[0];
      }
      demand(row,'学校账号关联已失效。',403);
      demand(row.email===email,'学校邮箱与已有绑定不一致，请联系管理员核对。',409);
      demand(row.status!=='banned','账号已封禁。',403);
      const bindings=await sql.rows<{id:string}>("SELECT id FROM entities WHERE kind='schoolLink' AND owner_id=?",[row.id]);
      demand(!bindings.some(binding=>binding.id!==`ispace-link:${identity.userId}`),'该邮箱已关联其他学校账号，请联系管理员核对。',409);
      const identities=await sql.rows<{data:string}>("SELECT data FROM entities WHERE kind='companionIdentity' AND owner_id=?",[row.id]);
      demand(!identities.some(item=>{const d=JSON.parse(item.data);return d.role==='student'&&d.status==='revoked';}),'学生身份已撤销。',403);
      const latestRequest=(await sql.rows<{data:string}>("SELECT data FROM entities WHERE kind='studentIdentityRequest' AND owner_id=? ORDER BY created_at DESC,id DESC LIMIT 1",[row.id]))[0];
      demand(!latestRequest||JSON.parse(latestRequest.data).status!=='revoked','学生身份已撤销。',403);
      const verified=await sql.rows<{data:string}>("SELECT data FROM entities WHERE kind='verifiedEmail' AND owner_id=?",[row.id]);
      if(!verified.some(item=>JSON.parse(item.data).email===email))await learningEntity(sql,'verifiedEmail',row.id,{email,source:'ispace-school-login'});
      if(!link)await learningEntity(sql,'schoolLink',row.id,{subject:String(identity.userId),source:'ispace-school-login'},`ispace-link:${identity.userId}`);
      return this.session(sql,row);
    });
    this.sessions.set(digest(result.token),{...identity,ownerId:result.account.id,expiresAt:Date.now()+43200000});
    if(this.onSchoolLogin)await this.onSchoolLogin(result.account,result.token,username.trim(),password);
    return {authenticated:true,...result};
  }
}
