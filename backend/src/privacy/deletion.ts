import {createHmac,randomInt,randomUUID} from 'node:crypto';
import {demand,digest,matchesPassword,ServiceError,timestamp,type AccountRow} from '../auth';
import {effect} from '../storage/effects';
import {deletionPlan,imageKeys,references,type StoredEntity} from './plan';
export type Row=Record<string,unknown>;
export interface DeletionSQL { rows(sql:string,values?:unknown[]):Row[]|Promise<Row[]>; tables:Set<string>; }
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function* query(sql:DeletionSQL,text:string,values:unknown[]=[]){return yield* effect(sql.rows(text,values));}
function* actor(sql:DeletionSQL,token:string){
  const row=(yield* query(sql,'SELECT a.* FROM accounts a JOIN sessions s ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>?',[digest(token),Date.now()]))[0] as AccountRow|undefined;
  demand(row,'请重新登录后再注销账号。',401);
  demand(row.login_kind==='PERSONAL','此入口只用于本人个人账号注销。',403);
  return row;
}
function* throttle(sql:DeletionSQL,id:string,origin:string,category:string,limit:number){
  const now=Date.now(),subject=digest(id),source=digest(origin);
  yield* query(sql,'DELETE FROM security_rate_events WHERE occurred_at<?',[now-86_400_000]);
  const rows=yield* query(sql,'SELECT subject,origin FROM security_rate_events WHERE category=? AND occurred_at>?',[category,now-3_600_000]);
  demand(rows.filter(r=>r.subject===subject).length<limit&&rows.filter(r=>r.origin===source).length<30,'尝试过于频繁，请一小时后再试。',429);
  yield* query(sql,'INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES(?,?,?,?)',[category,subject,source,now]);
}
export function* requestDeletion(sql:DeletionSQL,token:string,origin:string){
  const user=yield* actor(sql,token),now=Date.now();
  const old=(yield* query(sql,'SELECT sent_at FROM account_deletion_challenges WHERE account_id=?',[user.id]))[0];
  demand(!old||now-Number(old.sent_at)>=60_000,'请一分钟后重新获取验证码。',429);
  yield* throttle(sql,user.id,origin,'account-deletion-code',5);
  const code=String(randomInt(100000,1000000));
  yield* query(sql,'DELETE FROM account_deletion_challenges WHERE account_id=?',[user.id]);
  yield* query(sql,'INSERT INTO account_deletion_challenges(account_id,code_hash,expires_at,sent_at) VALUES(?,?,?,?)',[user.id,digest('delete:'+user.id+':'+code),now+600_000,now]);
  const message={id:randomUUID(),recipient:user.email,subject:'会同里账号注销验证码',body:`注销验证码：${code}。仅用于永久删除本人会同里账号，10 分钟内有效。请勿将此验证码提供给任何人。`};
  yield* query(sql,'INSERT INTO mail_outbox(id,recipient,subject,body,created_at) VALUES(?,?,?,?,?)',[message.id,message.recipient,message.subject,message.body,timestamp()]);
  return message;
}
// Keys are fixed schema identifiers, never client input. Unknown table names are not interpolated.
const dependentTables:[string,string[]][]=[
 ['push_outbox',['id']],['push_live_bindings',['device_id','occurrence_id']],['push_devices',['id']],
 ['new_student_join_capabilities',['token_hash']],['member_join_capabilities',['token_hash']],
 ['student_email_challenges',['id']],['student_login_challenges',['id']],['admin_security_challenges',['id']],
 ['password_reset_challenges',['id']],['account_deletion_challenges',['account_id']],
 ['sports_template_publications',['template_id']],['post_views',['viewer_id','open_id']],
 ['relations',['account_id','entity_id','kind']],['notifications',['id']],['audit',['id']],
 ['command_receipts',['actor_id','request_id']],['sessions',['token_hash']],
 ['mail_outbox',['id']],['email_challenges',['email']],['login_attempts',['identifier']],
];
export function* confirmDeletion(sql:DeletionSQL,token:string,input:Row,origin:string){
  demand(Object.keys(input).every(k=>['requestId','confirmed','password','code'].includes(k)),'注销请求包含无效字段。');
  demand(typeof input.requestId==='string'&&uuid.test(input.requestId)&&input.confirmed===true,'请明确确认永久注销账号。');
  const password=typeof input.password==='string'?input.password:undefined,code=typeof input.code==='string'?input.code:undefined;
  demand((password!==undefined)!==(code!==undefined),'请选择密码或注销验证码验证本人身份。');
  demand(password!==undefined?password.length>=1&&password.length<=128:/^\d{6}$/.test(code!),'密码或验证码格式无效。');
  const sessionHash=digest(token),requestHash=createHmac('sha256',token).update(JSON.stringify([input.requestId,password??null,code??null])).digest('hex');
  yield* query(sql,'DELETE FROM account_deletion_receipts WHERE expires_at<?',[Date.now()]);
  const receipt=(yield* query(sql,'SELECT * FROM account_deletion_receipts WHERE session_hash=? AND request_id=?',[sessionHash,input.requestId]))[0];
  if(receipt){demand(receipt.request_hash===requestHash,'该注销请求的验证方式已改变，请使用原请求重试。',409);return {deleted:true,requestId:input.requestId,completedAt:receipt.completed_at};}
  const user=yield* actor(sql,token);
  yield* throttle(sql,user.id,origin,'account-deletion-confirm',5);
  let verified=false;
  if(password!==undefined)verified=matchesPassword(password,user.password_hash);
  else {
    const challenge=(yield* query(sql,'SELECT * FROM account_deletion_challenges WHERE account_id=?',[user.id]))[0];
    if(challenge&&Number(challenge.expires_at)>Date.now()&&Number(challenge.attempts)<5){
      yield* query(sql,'UPDATE account_deletion_challenges SET attempts=attempts+1 WHERE account_id=?',[user.id]);
      verified=challenge.code_hash===digest('delete:'+user.id+':'+code);
    }
  }
  // Return errors so failed-attempt counters COMMIT; the HTTP adapter throws after the transaction.
  if(!verified)return new ServiceError(400,'DELETION_REAUTH_FAILED','密码或注销验证码无效、已过期或尝试次数过多。');
  const rows=yield* query(sql,'SELECT id,kind,owner_id,data FROM entities');
  const plan=deletionPlan(rows as StoredEntity[],user.id),refs=new Set([...plan.ids,user.email,'login:'+user.email,digest(user.id),digest(user.email)]);
  // Collect auxiliary identifiers before dependent rows are removed (push devices, challenges, notices).
  const records=new Map<string,Row[]>();
  for(const [table]of dependentTables)if(sql.tables.has(table))records.set(table,yield* query(sql,`SELECT * FROM ${table}`));
  let expanded=true;
  while(expanded){expanded=false;for(const entries of records.values())for(const row of entries)if(references(row,refs))for(const key of ['id','token_hash'])if(typeof row[key]==='string'&&!refs.has(row[key])){refs.add(row[key]);expanded=true;}}
  for(const [table,keys]of dependentTables)for(const row of records.get(table)??[])if(references(row,refs)){
    imageKeys(row,plan.keys);
    yield* query(sql,`DELETE FROM ${table} WHERE ${keys.map(k=>`${k}=?`).join(' AND ')}`,keys.map(k=>row[k]));
  }
  for(const [id,data]of plan.updates)yield* query(sql,'UPDATE entities SET data=?,version=version+1,updated_at=? WHERE id=?',[data,timestamp(),id]);
  for(const id of plan.deleted)yield* query(sql,'DELETE FROM entities WHERE id=?',[id]);
  // RAG chunks are derived snapshots of public AND private content; rebuild rather than retain stale copies.
  if(sql.tables.has('campus_ai_chunks'))yield* query(sql,'DELETE FROM campus_ai_chunks');
  yield* query(sql,'DELETE FROM security_rate_events WHERE subject=? OR subject=?',[digest(user.id),digest(user.email)]);
  yield* query(sql,'DELETE FROM accounts WHERE id=?',[user.id]);
  const completedAt=timestamp();
  yield* query(sql,'INSERT INTO account_erasure_log(account_hash,deleted_at) VALUES(?,?)',[digest(user.id),completedAt]);
  yield* query(sql,'INSERT INTO account_deletion_receipts(session_hash,request_id,request_hash,completed_at,expires_at) VALUES(?,?,?,?,?)',[sessionHash,input.requestId,requestHash,completedAt,Date.now()+86_400_000]);
  for(const key of plan.keys)yield* query(sql,'INSERT INTO privacy_object_gc(object_key,queued_at) VALUES(?,?) ON CONFLICT(object_key) DO NOTHING',[key,completedAt]);
  return {deleted:true,requestId:input.requestId,completedAt,erasedAccountID:user.id};
}
