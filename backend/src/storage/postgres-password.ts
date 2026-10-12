import type { PoolClient } from 'pg';
import { demand, digest, encodePassword, matchesPassword, type Account } from '../auth';
import type { Fields } from '../repository';
import { version } from "../version-check";
import { PostgresRepository } from './postgres-repository';

export async function postgresPassword(client: PoolClient, repo: PostgresRepository, actor: Account, token: string, input: Fields) {
  const identity=(await repo.all('sportsIdentity')).find(i=>i.ownerId===actor.id && i.data.status==='verified' && ['teacher','admin'].includes(String(i.data.role)));
  demand(identity && actor.status==='active','仅有效教师或管理员可修改本人密码。',403);
  demand(identity.data.role==='admin' || !(await repo.all('sportsSystem')).some(s=>s.data.mode!=='NORMAL'),'维护期间教师只能查看维护公告。',503);
  version(identity,input);
  demand(typeof input.currentPassword==='string' && typeof input.newPassword==='string' && input.newPassword.length>0,'请填写当前密码和非空新密码。');
  demand(input.newPassword===input.confirmPassword,'两次新密码不一致。');
  const row=(await client.query('SELECT password_hash FROM accounts WHERE id=$1 FOR UPDATE',[actor.id])).rows[0];
  demand(row && matchesPassword(input.currentPassword,row.password_hash),'当前密码不正确。',403);
  await client.query('UPDATE accounts SET password_hash=$1 WHERE id=$2',[encodePassword(input.newPassword),actor.id]);
  await client.query('DELETE FROM sessions WHERE account_id=$1 AND token_hash<>$2',[actor.id,digest(token)]);
  const saved=await repo.save(identity,{mustChangePassword:false,passwordChangedAt:Date.now()});
  await repo.notify([actor.id],identity.id,'sports.password.change','本人密码已更新，其他设备的登录状态已失效。');
  return {id:saved.id};
}
