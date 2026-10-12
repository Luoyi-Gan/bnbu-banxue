import { Repository } from "../backend/src/repository";
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresDatabase } from '../backend/src/storage/postgres';
import { postgresMigrations } from '../backend/src/storage/postgres-schema';
import { PostgresRepository } from '../backend/src/storage/postgres-repository';
import { importSqlite } from '../backend/src/storage/import-sqlite';
import { openDatabase } from '../backend/src/database';
import { createAccount, hashPassword, digest } from '../backend/src/auth';
import { PostgresAuth } from '../backend/src/storage/postgres-auth';
import { PostgresEmail } from '../backend/src/storage/postgres-email';
import { createPostgresApiServer } from '../backend/src/postgres-api';
import type { AddressInfo } from 'node:net';
import { executePostgres } from '../backend/src/storage/postgres-commands';
import { occupiedPolicy } from '../backend/src/coffee';
import { runAsync } from '../backend/src/storage/effects';
import { postgresWorkspace } from '../backend/src/storage/postgres-workspace';
import { postgresStudentSearch } from '../backend/src/storage/postgres-student-search';
import { postgresAdministratorDirectory } from '../backend/src/storage/postgres-administrators';
import { postgresAdminEmailStatus, postgresAdminEmailRequest, postgresAdminEmailConfirm } from '../backend/src/storage/postgres-admin-email';
import { postgresAdministratorSelf } from '../backend/src/storage/postgres-admin-deletion';
import { postgresCommunityView } from '../backend/src/storage/postgres-community-view';
import { postgresAccountDirectory } from '../backend/src/storage/postgres-account-directory';











import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe.skipIf(!process.env.BNBU_TEST_POSTGRES_URL)('PostgreSQL persistence on a real server', () => {
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  let admin: Pool;
  let db: PostgresDatabase;
  beforeAll(async () => {
    vi.stubEnv('BNBU_EMAIL_DELIVERY_URL', '');
    admin = new Pool({ connectionString: process.env.BNBU_TEST_POSTGRES_URL });
    await admin.query(`CREATE SCHEMA ${schema}`);
    db = new PostgresDatabase({ connectionString: process.env.BNBU_TEST_POSTGRES_URL, options: `-c search_path=${schema}` });
    await db.migrate(postgresMigrations);
  });
  afterAll(async () => {
    vi.unstubAllEnvs();
    await db?.close();
    if (admin) {
      try { await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); }
      finally { await admin.end(); }
    }
  });
  it('changes an initial administrator password atomically and revokes other sessions', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,login_kind,login_name) VALUES('password-admin','password@example.test',$1,'管理员','now','ADMIN','password-manager')",[hashPassword('Initial-test-123')]);
    const identity=await db.transaction(client=>new PostgresRepository(client).create('companionIdentity','password-admin',{role:'admin',status:'verified',mustChangePassword:true}));
    const auth=new PostgresAuth(db);
    const first=await auth.login('password-manager','Initial-test-123');
    const other=await auth.login('password-manager','Initial-test-123');
    await expect(executePostgres(db,first.token,'preferences.preview',{enabled:false},randomUUID())).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
    const input={version:identity.version,currentPassword:'wrong',newPassword:'Changed-test-123',confirmPassword:'Changed-test-123'};
    await expect(executePostgres(db,first.token,'accounts.password.change',input,randomUUID())).rejects.toMatchObject({status:403});
    expect((await auth.authenticate(other.token)).id).toBe('password-admin');
    input.currentPassword='Initial-test-123';
    const key=randomUUID();
    expect(await executePostgres(db,first.token,'accounts.password.change',input,key)).toEqual({id:identity.id});
    expect(await executePostgres(db,first.token,'accounts.password.change',input,key)).toEqual({id:identity.id});
    await expect(auth.authenticate(other.token)).rejects.toMatchObject({status:401});
    expect((await auth.authenticate(first.token)).id).toBe('password-admin');
    await expect(auth.login('password-manager','Initial-test-123')).rejects.toMatchObject({status:401});
    expect((await auth.login('password-manager','Changed-test-123')).account.id).toBe('password-admin');
    const saved=await db.transaction(client=>new PostgresRepository(client).get(identity.id));
    expect(saved.data.mustChangePassword).toBe(false);
    expect(saved.version).toBe(identity.version+1);
  });
  it('restricts administrator directory to verified superadmins and excludes credentials', async () => {
    const auth=new PostgresAuth(db);
    const login=await auth.login('password-manager','Changed-test-123');
    await expect(postgresAdministratorDirectory(db,login.token)).rejects.toMatchObject({status:403});
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const directory=await postgresAdministratorDirectory(db,login.token);
    expect(directory.items.find(i=>i.id==='password-admin')?.loginName).toBe('password-manager');
    expect(JSON.stringify(directory)).not.toContain('password_hash');
    expect(JSON.stringify(directory)).not.toContain('Changed-test-123');
    expect(directory.permissions).toEqual(["ACCOUNTS"]);
    const system=await db.transaction(client=>new PostgresRepository(client).create('sportsSystem','password-admin',{mode:'MAINTENANCE'}));
    expect((await postgresAdministratorDirectory(db,login.token)).items).toEqual(directory.items);
    await db.transaction(client=>new PostgresRepository(client).save(system,{mode:'NORMAL'}));
    await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'");
  });
  it('disables only the independent admin account and never revives old sessions', async () => {
    const auth=new PostgresAuth(db);
    const root=(await auth.login('password-manager','Changed-test-123')).token;
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    try {
      await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,login_kind,login_name) VALUES('state-admin','state@example.test',$1,'分管理员','now','ADMIN','state-manager')",[hashPassword('State-test-123')]);
      await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('state-person','state@example.test',$1,'个人','now')",[hashPassword('State-test-123')]);
      const identity=await db.transaction(client=>new PostgresRepository(client).create('companionIdentity','state-admin',{role:'admin',status:'verified',permissions:['ACCOUNTS']}));
      const management=(await auth.login('state-manager','State-test-123')).token;
      const personal=(await auth.login('state@example.test','State-test-123')).token;
      const input={id:identity.id,version:identity.version,status:'DISABLED',confirmed:true,handoverConfirmed:false};
      await expect(executePostgres(db,management,'accounts.admins.state',input,randomUUID())).rejects.toMatchObject({status:403});
      await expect(executePostgres(db,root,'accounts.admins.state',input,randomUUID())).rejects.toThrow('职责移交');
      expect((await auth.authenticate(management)).id).toBe('state-admin');
      input.handoverConfirmed=true;
      const key=randomUUID();
      await executePostgres(db,root,'accounts.admins.state',input,key);
      await executePostgres(db,root,'accounts.admins.state',input,key);
      await expect(auth.authenticate(management)).rejects.toMatchObject({status:401});
      await expect(auth.login('state-manager','State-test-123')).rejects.toMatchObject({code:'ACCOUNT_DISABLED'});
      expect((await auth.authenticate(personal)).id).toBe('state-person');
      await expect(executePostgres(db,root,'accounts.admins.state',{...input,status:'ACTIVE'},randomUUID())).rejects.toMatchObject({status:409});
      await executePostgres(db,root,'accounts.admins.state',{...input,version:identity.version+1,status:'ACTIVE'},randomUUID());
      await expect(auth.authenticate(management)).rejects.toMatchObject({status:401});
      expect((await auth.login('state-manager','State-test-123')).account.id).toBe('state-admin');
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('creates an isolated management login only for a verified person with fixed permissions', async () => {
    const auth=new PostgresAuth(db);
    const root=(await auth.login('password-manager','Changed-test-123')).token;
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const input={personId:'state-person',loginName:' NEW-MANAGER ',name:'新管理员',email:'new-manager@bnbu.edu.cn',department:'测试',permissions:['ACCOUNTS'],initialPassword:'New-manager-123',confirmPassword:'New-manager-123',confirmed:true};
    try {
      await expect(executePostgres(db,root,'accounts.admins.create',input,randomUUID())).rejects.toThrow('身份核验');
      await db.transaction(client=>new PostgresRepository(client).create('companionIdentity','state-person',{role:'student',status:'verified'}));
      await expect(executePostgres(db,root,'accounts.admins.create',{...input,permissions:['SUPERADMIN']},randomUUID())).rejects.toThrow('固定业务权限');
      await expect(executePostgres(db,root,'accounts.admins.create',{...input,email:'bad@example.test'},randomUUID())).rejects.toThrow('学校域名');
      const key=randomUUID();
      const result=await executePostgres(db,root,'accounts.admins.create',input,key);
      expect(await executePostgres(db,root,'accounts.admins.create',input,key)).toEqual(result);
      const identity=await db.transaction(client=>new PostgresRepository(client).get(result.id));
      expect(identity.ownerId).not.toBe('state-person');
      expect(identity.data.mustChangePassword).toBe(true);
      expect(identity.data.schoolEmailVerified).not.toBe(true);
      const login=await auth.login('new-manager','New-manager-123');
      expect(login.account.roles).toEqual(['admin']);
      await expect(executePostgres(db,login.token,'preferences.preview',{enabled:false},randomUUID())).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
      await expect(executePostgres(db,root,'accounts.admins.create',{...input,loginName:'another-manager'},randomUUID())).rejects.toMatchObject({status:409});
      expect((await auth.login('state@example.test','State-test-123')).account.id).toBe('state-person');
      const history=(await db.pool.query("SELECT data FROM entities WHERE kind='sportsAdminHistory' AND data::jsonb->>'administratorId'=$1",[identity.ownerId])).rows;
      expect(history).toHaveLength(1);
      expect(JSON.stringify(history)).not.toContain('New-manager-123');
      await db.pool.query("INSERT INTO mail_outbox VALUES('admin-edit-mail',$1,'test','code','now',NULL)",[input.email]);
      await db.pool.query("INSERT INTO admin_security_challenges(id,account_id,purpose,email,code_hash,expires_at,sent_at,identity_version,mail_id) VALUES('admin-edit-challenge',$1,'EMAIL_VERIFY',$2,'hash',9999999999999,1,1,'admin-edit-mail')",[identity.ownerId,input.email]);
      await db.pool.query("INSERT INTO email_challenges VALUES($1,'personal-proof',9999999999999,0,1)",[input.email]);
      const edit={id:identity.id,version:identity.version,name:'修改后',email:'changed-manager@bnbu.edu.cn',department:'新部门',permissions:['ACCOUNTS'],confirmed:true};
      await expect(executePostgres(db,root,'accounts.admins.edit',{...edit,loginName:'forbidden'},randomUUID())).rejects.toThrow('不允许的字段');
      await expect(executePostgres(db,root,'accounts.admins.edit',{...edit,version:0},randomUUID())).rejects.toMatchObject({status:409});
      expect((await db.pool.query("SELECT id FROM admin_security_challenges WHERE id='admin-edit-challenge'")).rows).toHaveLength(1);
      await executePostgres(db,root,'accounts.admins.edit',edit,randomUUID());
      const changed=await db.transaction(client=>new PostgresRepository(client).get(identity.id));
      expect(changed.data.permissions).toEqual(['ACCOUNTS']);
      expect(changed.data.schoolEmailVerified).toBe(false);
      expect((await db.pool.query("SELECT id FROM admin_security_challenges WHERE id='admin-edit-challenge'")).rows).toHaveLength(0);
      expect((await db.pool.query("SELECT id FROM mail_outbox WHERE id='admin-edit-mail'")).rows).toHaveLength(0);
      expect((await db.pool.query('SELECT email FROM email_challenges WHERE email=$1',[input.email])).rows).toHaveLength(1);
      expect((await auth.login('new-manager','New-manager-123')).account.email).toBe(edit.email);
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('verifies only the current management email and consumes its private challenge', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('new-manager','New-manager-123')).token;
    await expect(postgresAdminEmailRequest(db,token,true)).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
    const account=await auth.authenticate(token);
    const identity=await db.transaction(async client=>(await new PostgresRepository(client).all('companionIdentity')).find(i=>i.ownerId===account.id)!);
    await executePostgres(db,token,'accounts.password.change',{version:identity.version,currentPassword:'New-manager-123',newPassword:'Changed-manager-123',confirmPassword:'Changed-manager-123'},randomUUID());
    expect((await postgresAdminEmailStatus(db,token)).verified).toBe(false);
    const challenge=await postgresAdminEmailRequest(db,token,true);
    await expect(postgresAdminEmailRequest(db,token,true)).rejects.toMatchObject({status:429});
    const row=(await db.pool.query('SELECT * FROM admin_security_challenges WHERE id=$1',[challenge.challengeId])).rows[0];
    const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE id=$1',[row.mail_id])).rows[0].body)![0];
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:challenge.challengeId,code:'wrong'})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
    expect(Number((await db.pool.query('SELECT attempts FROM admin_security_challenges WHERE id=$1',[challenge.challengeId])).rows[0].attempts)).toBe(1);
    expect(await postgresAdminEmailConfirm(db,token,{challengeId:challenge.challengeId,code})).toEqual({verified:true});
    expect((await postgresAdminEmailStatus(db,token)).verified).toBe(true);
    expect((await db.pool.query('SELECT code_hash FROM admin_security_challenges WHERE id=$1',[challenge.challengeId])).rows[0].code_hash).toBeNull();
    expect((await db.pool.query('SELECT id FROM mail_outbox WHERE id=$1',[row.mail_id])).rows).toHaveLength(0);
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:challenge.challengeId,code})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
  });
  it('rejects stale admin challenges and rolls verification back when audit insertion fails', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('new-manager','Changed-manager-123')).token;
    const actor=await auth.authenticate(token);
    const issue=async()=>{
      await db.pool.query('UPDATE admin_security_challenges SET sent_at=0 WHERE account_id=$1',[actor.id]);
      const challenge=await postgresAdminEmailRequest(db,token,true);
      const row=(await db.pool.query('SELECT c.*,m.body FROM admin_security_challenges c JOIN mail_outbox m ON m.id=c.mail_id WHERE c.id=$1',[challenge.challengeId])).rows[0];
      return {id:challenge.challengeId,code:/\d{6}/.exec(row.body)![0],mailId:row.mail_id};
    };
    const stale=await issue();
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client),identity=(await repo.all('companionIdentity')).find(i=>i.ownerId===actor.id)!;
      await repo.save(identity,{schoolEmailVerified:false});
    });
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:stale.id,code:stale.code})).rejects.toMatchObject({code:'VERSION_CONFLICT'});
    expect((await postgresAdminEmailStatus(db,token)).verified).toBe(false);
    const challenge=await issue();
    await db.pool.query("CREATE FUNCTION reject_email_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='accounts.email.verify' THEN RAISE EXCEPTION 'injected audit failure'; END IF; RETURN NEW; END; $$");
    await db.pool.query('CREATE TRIGGER reject_email_audit BEFORE INSERT ON audit FOR EACH ROW EXECUTE FUNCTION reject_email_audit()');
    try {
      await expect(postgresAdminEmailConfirm(db,token,{challengeId:challenge.id,code:challenge.code})).rejects.toThrow('injected audit failure');
      expect((await postgresAdminEmailStatus(db,token)).verified).toBe(false);
      const row=(await db.pool.query('SELECT * FROM admin_security_challenges WHERE id=$1',[challenge.id])).rows[0];
      expect(row.consumed_at).toBeNull();
      expect(row.code_hash).toBeTruthy();
      expect(row.attempts).toBe(0);
      expect((await db.pool.query('SELECT id FROM mail_outbox WHERE id=$1',[challenge.mailId])).rows).toHaveLength(1);
    } finally {
      await db.pool.query('DROP TRIGGER reject_email_audit ON audit');
      await db.pool.query('DROP FUNCTION reject_email_audit()');
    }
    expect(await postgresAdminEmailConfirm(db,token,{challengeId:challenge.id,code:challenge.code})).toEqual({verified:true});
    const exhausted=await issue();
    for(let i=0;i<5;i++) await expect(postgresAdminEmailConfirm(db,token,{challengeId:exhausted.id,code:'wrong'})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:exhausted.id,code:exhausted.code})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
  });
  it('closes an independent admin login while retaining history and the personal account', async () => {
    const auth=new PostgresAuth(db),login=await auth.login('new-manager','Changed-manager-123');
    const snapshot=await postgresAdministratorSelf(db,login.token);
    await expect(executePostgres(db,login.token,'accounts.close',{...snapshot,confirmed:true,handoverConfirmed:false},randomUUID())).rejects.toThrow('职责移交');
    await expect(executePostgres(db,login.token,'accounts.close',{...snapshot,email:'stale@bnbu.edu.cn',confirmed:true,handoverConfirmed:true},randomUUID())).rejects.toMatchObject({status:409});
    const id=login.account.id;
    await executePostgres(db,login.token,'accounts.close',{...snapshot,confirmed:true,handoverConfirmed:true},randomUUID());
    await expect(auth.authenticate(login.token)).rejects.toMatchObject({status:401});
    await expect(auth.login('new-manager','Changed-manager-123')).rejects.toMatchObject({status:401});
    const row=(await db.pool.query('SELECT * FROM accounts WHERE id=$1',[id])).rows[0];
    expect(row.login_kind).toBe('HISTORY');
    expect([row.name,row.email,row.login_name,row.password_hash,row.organization]).toEqual([null,null,null,null,null]);
    expect((await db.pool.query('SELECT id FROM admin_security_challenges WHERE account_id=$1',[id])).rows).toHaveLength(0);
    const history=(await db.pool.query("SELECT data FROM entities WHERE kind='sportsAdminHistory' AND data::jsonb->>'administratorId'=$1",[id])).rows;
    expect(history.length).toBeGreaterThan(1);
    expect(JSON.stringify(history)).not.toContain('changed-manager@bnbu.edu.cn');
    expect((await auth.login('state@example.test','State-test-123')).account.id).toBe('state-person');
    expect((await db.pool.query("SELECT email FROM email_challenges WHERE email='new-manager@bnbu.edu.cn'")).rows).toHaveLength(1);
  });
  it('rolls administrator deletion back on audit failure and supports authorized retries', async () => {
    const auth=new PostgresAuth(db),root=(await auth.login('password-manager','Changed-test-123')).token;
    const target=await auth.login('state-manager','State-test-123');
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const identity=await db.transaction(async client=>(await new PostgresRepository(client).all('companionIdentity')).find(i=>i.ownerId===target.account.id)!);
    const input={accountId:target.account.id,version:identity.version,confirmed:true,handoverConfirmed:true};
    await db.pool.query("CREATE FUNCTION reject_delete_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='accounts.admins.delete' THEN RAISE EXCEPTION 'injected deletion audit failure'; END IF; RETURN NEW; END; $$");
    await db.pool.query('CREATE TRIGGER reject_delete_audit BEFORE INSERT ON audit FOR EACH ROW EXECUTE FUNCTION reject_delete_audit()');
    try {
      await expect(executePostgres(db,root,'accounts.admins.delete',input,randomUUID())).rejects.toThrow('injected deletion audit failure');
      expect((await auth.authenticate(target.token)).id).toBe(target.account.id);
      expect((await db.pool.query('SELECT login_kind FROM accounts WHERE id=$1',[target.account.id])).rows[0].login_kind).toBe('ADMIN');
    } finally {
      await db.pool.query('DROP TRIGGER reject_delete_audit ON audit');
      await db.pool.query('DROP FUNCTION reject_delete_audit()');
    }
    try {
      const key=randomUUID();
      const result=await executePostgres(db,root,'accounts.admins.delete',input,key);
      expect(await executePostgres(db,root,'accounts.admins.delete',input,key)).toEqual(result);
      await expect(auth.authenticate(target.token)).rejects.toMatchObject({status:401});
      expect((await auth.login('state@example.test','State-test-123')).account.id).toBe('state-person');
      await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'");
      await expect(executePostgres(db,root,'accounts.admins.delete',input,key)).rejects.toMatchObject({status:403});
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('stores image bytes outside PostgreSQL and rolls the entity back on object write failure', async () => {
    const root=mkdtempSync(join(tmpdir(),'bnbu-pg-objects-'));
    const previous=process.env.BNBU_OBJECT_DIRECTORY;
    process.env.BNBU_OBJECT_DIRECTORY=root;
    try {
      const image='data:image/png;base64,'+Buffer.from([137,80,78,71,1,2,3]).toString('base64');
      const post=await db.transaction(client=>new PostgresRepository(client).create('post','state-person',{title:'私有待审图片',body:'test',board:'test',images:[image],status:'pending'}));
      const raw=(await db.pool.query('SELECT data FROM entities WHERE id=$1',[post.id])).rows[0].data;
      expect(raw).not.toContain('data:image');
      expect(raw).toContain('$bnbuStoredImage');
      expect((await db.transaction(client=>new PostgresRepository(client).get(post.id))).data.images).toEqual([image]);
      const auth=new PostgresAuth(db),own=(await auth.login('state@example.test','State-test-123')).token;
      const other=(await auth.login('password-manager','Changed-test-123')).token;
      expect(JSON.stringify(await postgresCommunityView(db,other))).not.toContain(image);
      expect(JSON.stringify(await postgresCommunityView(db,own))).toContain(image);
      await expect(db.transaction(client=>new PostgresRepository(client).create('post','state-person',{images:[{$bnbuStoredImage:'f'.repeat(64),contentType:'image/png'}]}))).rejects.toThrow('内部存储标识');
      const before=Number((await db.pool.query('SELECT count(*) FROM entities')).rows[0].count);
      process.env.BNBU_OBJECT_DIRECTORY=join(root,JSON.parse(raw).images[0].$bnbuStoredImage);
      await expect(db.transaction(client=>new PostgresRepository(client).create('post','state-person',{images:[image]}))).rejects.toThrow();
      expect(Number((await db.pool.query('SELECT count(*) FROM entities')).rows[0].count)).toBe(before);
      await db.pool.query('DELETE FROM entities WHERE id=$1',[post.id]);
    } finally {
      if(previous===undefined) delete process.env.BNBU_OBJECT_DIRECTORY; else process.env.BNBU_OBJECT_DIRECTORY=previous;
      rmSync(root,{recursive:true,force:true});
    }
  });
  it('projects the student account directory without leaking login credentials', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('password-manager','Changed-test-123')).token;
    await expect(postgresAccountDirectory(db,token,'student',{})).rejects.toMatchObject({status:403});
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    try {
      const data=await postgresAccountDirectory(db,token,'student',{id:'state-person'});
      expect(data.items).toHaveLength(1);
      expect(data.items[0].status).toBe('ACTIVE');
      expect(data.items[0].verifiedEmail).toBeNull();
      expect(JSON.stringify(data)).not.toContain('password_hash');
      expect(JSON.stringify(data)).not.toContain('state@example.test');
      await expect(postgresAccountDirectory(db,token,'student',{status:'PENDING'})).rejects.toThrow('筛选状态');
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('keeps a multi-activity split atomic when a later activity is invalid', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('password-manager','Changed-test-123')).token;
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const command=(action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    try {
      const mail=await command('mail.import',{messageId:'pg-split-atomic',subject:'两场活动',sender:'school@example.test',body:'活动名称：上午讲座\n活动名称：下午比赛'});
      const fields={title:'上午讲座',description:'介绍',startAt:'2027-01-01T10:00:00+08:00',endAt:'2027-01-01T11:00:00+08:00',location:'图书馆',host:'学院',conditions:''};
      const input={id:mail.id,expectedVersion:1,confirmed:true,reason:'核对两场',activities:[fields,{...fields,title:'下午比赛',location:''}]};
      const before=Number((await db.pool.query("SELECT count(*) FROM entities WHERE kind IN ('activity','mail')")).rows[0].count);
      await expect(command('mail.split',input)).rejects.toThrow();
      expect(Number((await db.pool.query("SELECT count(*) FROM entities WHERE kind IN ('activity','mail')")).rows[0].count)).toBe(before);
      input.activities[1].location='体育馆';
      await command('mail.split',input);
      const parent=await db.transaction(client=>new PostgresRepository(client).get(mail.id));
      expect(parent.data.childMailIds).toHaveLength(2);
      expect(Number((await db.pool.query("SELECT count(*) FROM entities WHERE kind='activity' AND data::jsonb->>'mailId'=ANY($1)",[parent.data.childMailIds])).rows[0].count)).toBe(2);
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('persists timetable corrections only for the owner and deduplicates retries', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('table-owner','table@example.test',$1,'课表学生','now','[\"student\"]')",[hashPassword('Table-test-123')]);
    const auth=new PostgresAuth(db),token=(await auth.login('table@example.test','Table-test-123')).token;
    const other=(await auth.login('state@example.test','State-test-123')).token;
    const input={fileName:'table.png',lessons:[{name:'数据库',weekday:1}]};
    const key=randomUUID();
    const result=await executePostgres(db,token,'timetable.save',input,key);
    expect(await executePostgres(db,token,'timetable.save',input,key)).toEqual(result);
    const original=await db.transaction(client=>new PostgresRepository(client).get(result.id));
    expect(original.version).toBe(1);
    expect((await postgresWorkspace(db,other)).entities.some(e=>e.id===result.id)).toBe(false);
    const lesson=(original.data.lessons as {id:string;name:string}[])[0];
    await executePostgres(db,token,'timetable.correct',{lessonId:lesson.id,name:'数据库实践',weekday:2},randomUUID());
    const corrected=await db.transaction(client=>new PostgresRepository(client).get(result.id));
    expect((corrected.data.lessons as {name:string}[])[0].name).toBe('数据库实践');
    expect(corrected.version).toBe(2);
    await expect(executePostgres(db,token,'timetable.save',{fileName:'bad.png',lessons:[{name:'错误',weekday:9}]},randomUUID())).rejects.toThrow();
    expect((await db.transaction(client=>new PostgresRepository(client).get(result.id))).version).toBe(2);
  });
  it('serializes concurrent migrations and rejects changed migration contents', async () => {
    await Promise.all([db.migrate(postgresMigrations), db.migrate(postgresMigrations)]);
    expect((await db.pool.query('SELECT * FROM backend_migrations')).rows).toHaveLength(postgresMigrations.length);
    await expect(db.migrate([{version:1,sql:'SELECT 1'}])).rejects.toThrow('checksum mismatch');
  });
  it('rolls back all changes on the same connection and releases it afterwards', async () => {
    await expect(db.transaction(async client => {
      await client.query("INSERT INTO mail_outbox VALUES('rollback','test','subject','body','now',NULL)");
      throw new Error('business failure');
    })).rejects.toThrow('business failure');
    expect((await db.pool.query("SELECT * FROM mail_outbox WHERE id='rollback'")).rows).toHaveLength(0);
    await db.transaction(async client => { await client.query("INSERT INTO mail_outbox VALUES('commit','test','subject','body','now',NULL)"); });
    expect((await db.pool.query("SELECT * FROM mail_outbox WHERE id='commit'")).rows).toHaveLength(1);
  });
  it('preserves separate namespaces, foreign keys and millisecond expiry values', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('student','same@example.test','hash','student','now')");
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,login_kind,login_name) VALUES('admin','same@example.test','hash','admin','now','ADMIN','manager')");
    await expect(db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('duplicate','same@example.test','hash','student','now')")).rejects.toMatchObject({code:'23505'});
    await expect(db.pool.query("INSERT INTO sessions VALUES('bad','missing',1791800000000,'now')")).rejects.toMatchObject({code:'23503'});
    await db.pool.query("INSERT INTO sessions VALUES('ok','student',1791800000000,'now')");
    expect((await db.pool.query("SELECT expires_at FROM sessions WHERE token_hash='ok'")).rows[0].expires_at).toBe('1791800000000');
  });
  it('prevents historical identities regaining login even with otherwise valid fields', async () => {
    await db.pool.query("INSERT INTO accounts(id,organization,status,roles,created_at,login_kind) VALUES('history',NULL,'banned','[]','now','HISTORY')");
    await expect(db.pool.query("UPDATE accounts SET login_kind='PERSONAL',email='revive@example.test',password_hash='hash',name='revive' WHERE id='history'")).rejects.toMatchObject({code:'23514'});
  });
  it('persists business entities, deduplicates relations and keeps notifications in the transaction', async () => {
    const entity = await db.transaction(async client => {
      const repo = new PostgresRepository(client);
      const created = await repo.create('post', null, {title:'真实 PostgreSQL 数据'});
      return repo.save(created, {status:'visible'});
    });
    await db.transaction(async client => {
      const repo = new PostgresRepository(client);
      expect((await repo.get(entity.id,'post')).data.status).toBe('visible');
      await repo.relation('student',entity.id,'saved',true);
      await repo.relation('student',entity.id,'saved',true);
      expect(await repo.related('student',entity.id,'saved')).toBe(true);
      await repo.notify(['student','student'],entity.id,'post.visible','已公开');
    });
    expect((await db.pool.query('SELECT * FROM notifications WHERE entity_id=$1',[entity.id])).rows).toHaveLength(1);
    await expect(db.transaction(async client => {
      const repo = new PostgresRepository(client);
      await repo.save(entity,{status:'hidden'});
      await repo.notify(['missing'],entity.id,'post.hidden','不应保存');
    })).rejects.toMatchObject({code:'23503'});
    await db.transaction(async client => {
      const repo = new PostgresRepository(client);
      expect((await repo.get(entity.id)).data.status).toBe('visible');
      await repo.relation('student',entity.id,'saved',false);
      expect(await repo.related('student',entity.id,'saved')).toBe(false);
      expect((await repo.people()).some(p=>p.id==='history')).toBe(false);
      expect((await repo.person('history')).name).toBe('已注销用户');
    });
  });
  it('rejects stale concurrent edits instead of overwriting committed business data', async () => {
    const original = await db.transaction(client=>new PostgresRepository(client).create('post',null,{title:'original'}));
    const results = await Promise.allSettled(['first','second'].map(title => db.transaction(client => new PostgresRepository(client).save(original,{title}))));
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const failure = results.find(r=>r.status==='rejected');
    expect(failure?.status==='rejected' && failure.reason.status).toBe(409);
    const saved = await db.transaction(client=>new PostgresRepository(client).get(original.id));
    expect(saved.version).toBe(2);
  });
  it('imports a read-only SQLite snapshot atomically and refuses to overwrite a populated target', async () => {
    const importSchema = `${schema}_import`;
    await admin.query(`CREATE SCHEMA ${importSchema}`);
    const target = new PostgresDatabase({connectionString:process.env.BNBU_TEST_POSTGRES_URL,options:`-c search_path=${importSchema}`});
    const directory = mkdtempSync(join(tmpdir(),'bnbu-import-'));
    const filename = join(directory,'source.sqlite');
    try {
      await target.migrate(postgresMigrations);
      const source = openDatabase(filename);
      let accountId: string;
      try {
        accountId = createAccount(source,{email:'import@example.test',name:'导入账号',password:'Test-import-123',roles:['student']});
        new Repository(source).create('post', accountId, { title: '导入验证', body: '伴学社区数据', status: 'pending' });
        new Repository(source).create('sportsIdentity', accountId, {role:'student',status:'verified',studentNumber:'20260002'});
        // Force a failure after accounts have been inserted; the whole import must roll back.
        source.exec('ALTER TABLE entities ADD COLUMN unexpected_column TEXT');
      } finally { source.close(); }
      await expect(importSqlite(filename,target)).rejects.toThrow('schema does not match');
      expect((await target.pool.query('SELECT * FROM accounts')).rows).toHaveLength(0);
      const fix = openDatabase(filename);
      try { fix.exec('ALTER TABLE entities DROP COLUMN unexpected_column'); } finally { fix.close(); }
      const counts = await importSqlite(filename,target);
      expect(counts.accounts).toBe(1);
      expect(counts.entities).toBe(2);
      expect((await target.pool.query("SELECT data FROM entities WHERE kind='companionIdentity'")).rows[0].data).toContain('20260002');
      expect((await target.pool.query("SELECT data FROM entities WHERE kind='post'")).rows[0].data).toContain('导入验证');
      expect(counts).not.toHaveProperty('sports_media_blobs');
      expect((await target.pool.query('SELECT id FROM accounts')).rows[0].id).toBe(accountId!);
      await expect(importSqlite(filename,target)).rejects.toThrow('not empty');
      expect((await target.pool.query('SELECT * FROM accounts')).rows).toHaveLength(1);
    } finally {
      await target.close();
      await admin.query(`DROP SCHEMA ${importSchema} CASCADE`);
      rmSync(directory,{recursive:true,force:true});
    }
  });
  it('authenticates both account namespaces, hashes sessions and rejects disabled administrators', async () => {
    const auth = new PostgresAuth(db);
    const password = 'Postgres-test-123';
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('login-student','login@example.test',$1,'学生','now','[\"student\"]')",[hashPassword(password)]);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles,login_kind,login_name) VALUES('login-admin','login@example.test',$1,'管理员','now','[\"reviewer\"]','ADMIN','login-manager')",[hashPassword(password)]);
    await db.transaction(client=>new PostgresRepository(client).create('companionIdentity','login-admin',{role:'admin',status:'verified'}));
    const student = await auth.login(' LOGIN@example.test ',password);
    expect(student.account.id).toBe('login-student');
    expect(student.account).not.toHaveProperty('password_hash');
    expect((await auth.authenticate(student.token)).roles).toEqual(['student']);
    const session = (await db.pool.query('SELECT token_hash FROM sessions WHERE account_id=$1',['login-student'])).rows[0];
    expect(session.token_hash).toBe(digest(student.token));
    await auth.logout(student.token);
    await expect(auth.authenticate(student.token)).rejects.toMatchObject({status:401});
    const manager = await auth.login('login-manager',password);
    expect(manager.account.id).toBe('login-admin');
    await db.pool.query("UPDATE accounts SET status='banned' WHERE id='login-admin'");
    await expect(auth.authenticate(manager.token)).rejects.toMatchObject({status:403});
    await expect(auth.login('login-manager',password)).rejects.toMatchObject({status:403});
    const expired = await auth.login('login@example.test',password);
    await db.pool.query('UPDATE sessions SET expires_at=0 WHERE token_hash=$1',[digest(expired.token)]);
    await expect(auth.authenticate(expired.token)).rejects.toMatchObject({status:401});
  });
  it('persists failed attempts across auth instances and never creates a session on failure', async () => {
    const auth = new PostgresAuth(db);
    for (let i=0;i<10;i++) await expect(auth.login('missing@example.test','wrong-password')).rejects.toMatchObject({status:401});
    await expect(new PostgresAuth(db).login('missing@example.test','wrong-password')).rejects.toMatchObject({status:429});
    expect((await db.pool.query('SELECT failures FROM login_attempts WHERE identifier=$1',['missing@example.test'])).rows[0].failures).toBe(10);
  });
  it('serializes email sending and registration, consumes a code once and never grants school roles', async () => {
    const mail = new PostgresEmail(db);
    const email = 'registration@bnbu.edu.cn';
    const sends = await Promise.allSettled([mail.sendVerification(email,true),mail.sendVerification(email,true)]);
    expect(sends.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const messages = (await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows;
    expect(messages).toHaveLength(1);
    const code = /\d{6}/.exec(messages[0].body)![0];
    const attempts = await Promise.allSettled([mail.register({email,code,password:'Register-test-123'}),mail.register({email,code,password:'Register-test-123'})]);
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const accounts = (await db.pool.query('SELECT id,roles FROM accounts WHERE email=$1',[email])).rows;
    expect(accounts).toHaveLength(1);
    expect(accounts[0].roles).toBe('[]');
    expect((await db.pool.query("SELECT * FROM entities WHERE kind='verifiedEmail' AND owner_id=$1",[accounts[0].id])).rows).toHaveLength(1);
    await expect(mail.register({email,code,password:'Register-test-123'})).rejects.toThrow('验证码已失效');
  });
  it('commits wrong-code attempts, enforces the limit and verifies only the current account email', async () => {
    const mail = new PostgresEmail(db);
    const email = 'wrong-code@example.test';
    await mail.sendVerification(email,true);
    const code = /\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
    for(let i=0;i<5;i++) await expect(mail.register({email,code:'invalid',password:'Register-test-123'})).rejects.toThrow('验证码错误');
    await expect(mail.register({email,code,password:'Register-test-123'})).rejects.toThrow('验证码已失效');
    expect((await db.pool.query('SELECT attempts FROM email_challenges WHERE email=$1',[email])).rows[0].attempts).toBe(5);
    const actor = await db.transaction(client=>new PostgresRepository(client).person('login-student'));
    await mail.sendVerification(actor.email,true);
    const ownCode = /\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1 ORDER BY created_at DESC',[actor.email])).rows[0].body)![0];
    await expect(mail.verifyOwnEmail({...actor,status:'banned'},ownCode)).rejects.toMatchObject({status:403});
    expect(await mail.verifyOwnEmail(actor,ownCode)).toEqual({verified:true});
    await expect(mail.verifyOwnEmail(actor,ownCode)).rejects.toThrow('验证码已失效');
  });
  it('serves real HTTP registration, cookies, session restoration and logout using PostgreSQL', async () => {
    const server = createPostgresApiServer(db,{localOutbox:true});
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const post = (path:string,data:unknown,cookie?:string,origin?:string)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},body:JSON.stringify(data)});
    try {
      expect((await (await fetch(base+'/api/health')).json()).storage).toBe('postgresql');
      expect((await fetch(base+'/api/auth/me')).status).toBe(401);
      const email='http-postgres@example.test',password='Http-postgres-123';
      expect((await post('/api/auth/verification-codes',{email},undefined,'https://untrusted.example')).status).toBe(403);
      expect((await post('/api/auth/verification-codes',{email})).status).toBe(200);
      const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
      expect((await post('/api/auth/register',{email,password,code})).status).toBe(201);
      const login=await post('/api/auth/sign-in',{identifier:email,password});
      expect(login.status).toBe(200);
      expect(login.headers.get('set-cookie')).toContain('HttpOnly; SameSite=Strict');
      const cookie=login.headers.get('set-cookie')!.split(';')[0];
      const me=await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}});
      expect((await me.json()).account.email).toBe(email);
      expect((await post('/api/auth/logout',{},cookie)).status).toBe(200);
      expect((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status).toBe(401);
    } finally {
      await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
    }
  });
  it('executes shared community policy over HTTP with atomic audit, notification and retry receipts', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('pg-reviewer','review-pg@example.test',$1,'审核员','now','[\"reviewer\"]')",[hashPassword('Review-postgres-123')]);
    const auth = new PostgresAuth(db);
    const student = await auth.login('login@example.test','Postgres-test-123');
    const reviewer = await auth.login('review-pg@example.test','Review-postgres-123');
    const viewer = await auth.login('http-postgres@example.test','Http-postgres-123');
    const server=createPostgresApiServer(db);
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const command=(token:string,action:string,input:unknown,requestId=randomUUID())=>fetch(base+'/api/commands',{method:'POST',headers:{'Content-Type':'application/json',Cookie:`bnbu_session=${token}`},body:JSON.stringify({action,input,requestId})});
    const community=(token:string)=>fetch(base+'/api/community',{headers:{Cookie:`bnbu_session=${token}`}}).then(r=>r.json());
    try {
      const requestId=randomUUID();
      const attempts=await Promise.all([command(student.token,'post.create',{title:'PG 帖子',body:'正文',board:'校园'},requestId),command(student.token,'post.create',{title:'PG 帖子',body:'正文',board:'校园'},requestId)]);
      expect(attempts.map(r=>r.status)).toEqual([200,200]);
      const responses=await Promise.all(attempts.map(r=>r.json()));
      expect(responses[0]).toEqual(responses[1]);
      const id=responses[0].data.id;
      expect((await community(student.token)).posts.some((p:{id:string})=>p.id===id)).toBe(true);
      expect((await community(viewer.token)).posts.some((p:{id:string})=>p.id===id)).toBe(false);
      expect((await db.pool.query('SELECT * FROM audit WHERE entity_id=$1',[id])).rows).toHaveLength(1);
      expect((await command(student.token,'content.review',{id,status:'visible'})).status).toBe(403);
      expect((await command(reviewer.token,'content.review',{id,status:'visible'})).status).toBe(200);
      const studentWorkspace=await postgresWorkspace(db,student.token);
      expect(studentWorkspace.notifications.some(n=>n.entityId===id)).toBe(true);
      expect((await postgresWorkspace(db,viewer.token)).notifications.some(n=>n.entityId===id)).toBe(false);
      expect((await community(viewer.token)).posts.some((p:{id:string})=>p.id===id)).toBe(true);
      expect((await command(student.token,'relation.set',{id,kind:'like',enabled:true})).status).toBe(200);
      expect((await command(student.token,'relation.set',{id,kind:'save',enabled:true})).status).toBe(200);
      const ownView=await community(student.token);
      expect(ownView.likedPosts).toContain(id);
      expect(ownView.savedPosts).toContain(id);
      expect(ownView.posts.find((p:{id:string})=>p.id===id).likes).toBe(1);
      const otherView=await community(viewer.token);
      expect(otherView.likedPosts).not.toContain(id);
      expect(otherView.savedPosts).not.toContain(id);
      expect((await db.pool.query('SELECT * FROM notifications WHERE entity_id=$1',[id])).rows).toHaveLength(1);
      expect((await command(reviewer.token,'content.review',{id,status:'hidden'})).status).toBe(400);
      expect((await db.transaction(client=>new PostgresRepository(client).get(id))).data.status).toBe('visible');
      expect((await db.pool.query('SELECT * FROM audit WHERE entity_id=$1',[id])).rows).toHaveLength(4);
      expect((await command(student.token,'post.create',{title:'不同操作',body:'正文',board:'校园'},requestId)).status).toBe(409);
    } finally { await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve())); }
  });
  it('preserves coffee capacity under concurrent booking, reserves both times until acceptance and releases cancellation', async () => {
    const auth = new PostgresAuth(db);
    const tokens: Record<string,string> = {};
    for(const [id,role] of [['coffee-teacher','teacher'],['coffee-a','student'],['coffee-b','student']]) {
      await db.pool.query('INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES($1,$2,$3,$1,$4,$5)',[id,`${id}@example.test`,hashPassword('Coffee-test-123'),new Date().toISOString(),JSON.stringify([role])]);
      tokens[id]=(await auth.login(`${id}@example.test`,'Coffee-test-123')).token;
    }
    const command=(who:string,action:string,input:Record<string,unknown>)=>executePostgres(db,tokens[who],action,input,randomUUID());
    const start=Date.now()+86400_000;
    const first=await command('coffee-teacher','coffee.slot.create',{startAt:new Date(start).toISOString(),endAt:new Date(start+3600_000).toISOString(),capacity:1,location:'图书馆'});
    const second=await command('coffee-teacher','coffee.slot.create',{startAt:new Date(start+7200_000).toISOString(),endAt:new Date(start+10800_000).toISOString(),capacity:1,location:'图书馆'});
    const races=await Promise.allSettled(['coffee-a','coffee-b'].map(who=>command(who,'coffee.book',{slotId:first.id,topic:'学习交流'})));
    expect(races.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const winnerIndex=races.findIndex(r=>r.status==='fulfilled');
    const winner=['coffee-a','coffee-b'][winnerIndex],loser=['coffee-a','coffee-b'][1-winnerIndex];
    const result=races[winnerIndex];
    if(result.status!=='fulfilled') throw new Error('Expected confirmed booking');
    const bookingId=result.value.id;
    await command('coffee-teacher','coffee.move',{id:bookingId,slotId:second.id,reason:'老师改期'});
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      expect((await repo.get(bookingId)).data.slotId).toBe(first.id);
      expect(await runAsync(occupiedPolicy(repo,first.id))).toBe(1);
      expect(await runAsync(occupiedPolicy(repo,second.id))).toBe(1);
    });
    await expect(command(loser,'coffee.book',{slotId:second.id,topic:'不能占用预留'})).rejects.toMatchObject({status:409});
    await command(winner,'coffee.answer',{id:bookingId,accept:true});
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      expect((await repo.get(bookingId)).data.slotId).toBe(second.id);
      expect(await runAsync(occupiedPolicy(repo,first.id))).toBe(0);
    });
    await command(winner,'coffee.cancel',{id:bookingId,reason:'取消测试'});
    expect(await command(loser,'coffee.book',{slotId:second.id,topic:'名额已释放'})).toHaveProperty('id');
    const teacherView=await postgresWorkspace(db,tokens['coffee-teacher']);
    const studentView=await postgresWorkspace(db,tokens[winner]);
    const unrelatedView=await postgresWorkspace(db,(await auth.login('review-pg@example.test','Review-postgres-123')).token);
    expect(teacherView.entities.find(e=>e.id===bookingId)?.data.status).toBe('cancelled');
    expect(studentView.entities.find(e=>e.id===bookingId)?.data.history).toHaveLength(4);
    expect(unrelatedView.entities.some(e=>e.id===bookingId)).toBe(false);
    expect(unrelatedView.notifications.some(n=>n.entityId===bookingId)).toBe(false);
  });
  it('deduplicates broadcasts and atomically enforces notification ownership for batch reads', async () => {
    const auth=new PostgresAuth(db);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('notify-operator','notify@example.test',$1,'运营','now','[\"operator\"]')",[hashPassword('Notify-test-123')]);
    const operator=(await auth.login('notify@example.test','Notify-test-123')).token;
    const a=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const b=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const request=randomUUID(),input={recipients:['coffee-a','coffee-b','coffee-a'],body:'群发通知'};
    const first=await executePostgres(db,operator,'notification.send',input,request);
    expect(first.recipients).toBe(2);
    expect(await executePostgres(db,operator,'notification.send',input,request)).toEqual(first);
    const notices=(await db.pool.query('SELECT id,recipient_id FROM notifications WHERE entity_id=$1',[first.id])).rows;
    expect(notices).toHaveLength(2);
    const own=notices.find(n=>n.recipient_id==='coffee-a').id,other=notices.find(n=>n.recipient_id==='coffee-b').id;
    await expect(executePostgres(db,a,'notification.readmany',{ids:[own,other]},randomUUID())).rejects.toMatchObject({status:404});
    expect((await db.pool.query('SELECT read_at FROM notifications WHERE id=$1',[own])).rows[0].read_at).toBeNull();
    await executePostgres(db,a,'notification.readmany',{ids:[own,own]},randomUUID());
    const batch=(await postgresWorkspace(db,operator)).notificationBatches.find(row=>row.id===first.id);
    expect(batch).toMatchObject({total:2,read:1,readRate:0.5});
    expect((await postgresWorkspace(db,b)).notifications.find(row=>row.id===other)?.readAt).toBeNull();
    expect((await postgresWorkspace(db,a)).notifications.some(row=>row.id===other)).toBe(false);
    await expect(executePostgres(db,a,'notification.send',input,randomUUID())).rejects.toMatchObject({status:403});
  });
  it('shares certification review and persists independent preference fields without deleting notifications', async () => {
    const auth=new PostgresAuth(db);
    const student=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const reviewer=(await auth.login('review-pg@example.test','Review-postgres-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    const certification=await command(student,'certification.apply',{kind:'club',organization:'测试社团',note:'测试材料'});
    await expect(command(student,'certification.review',{id:certification.id,approve:true})).rejects.toMatchObject({status:403});
    await command(reviewer,'certification.review',{id:certification.id,approve:true});
    await command(student,'preferences.searchable',{enabled:false});
    await command(student,'preferences.preview',{enabled:false});
    await command(student,'preferences.reminders',{key:'messages',enabled:false});
    const view=await postgresWorkspace(db,student);
    expect(view.entities.find(e=>e.id===certification.id)?.data.status).toBe('approved');
    expect(view.entities.find(e=>e.kind==='preferences')?.data).toMatchObject({searchable:false,profilePreview:false,messages:false});
    expect(view.notifications.some(n=>n.entityId===certification.id)).toBe(true);
    await expect(command(reviewer,'certification.review',{id:certification.id,approve:false})).rejects.toMatchObject({status:400});
    await command(reviewer,'certification.review',{id:certification.id,approve:false,reason:'撤销测试'});
    expect((await postgresWorkspace(db,student)).entities.find(e=>e.id===certification.id)?.data.status).toBe('rejected');
  });
  it('keeps published knowledge answers as private snapshots when administrators edit the source', async () => {
    const auth=new PostgresAuth(db);
    const operator=(await auth.login('notify@example.test','Notify-test-123')).token;
    const student=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const other=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    const fields={title:'图书馆',body:'九点开放',keywords:'图书馆',source:'学校说明',status:'published'};
    const entry=await command(operator,'knowledge.save',fields);
    await command(operator,'knowledge.save',{title:'内部草稿',body:'不可公开',keywords:'图书馆',source:'内部',status:'draft'});
    const answer=await command(student,'knowledge.ask',{question:'图书馆何时开放？'});
    const before=(await postgresWorkspace(db,student)).entities.find(e=>e.id===answer.id)!;
    expect(before.data.body).toContain('九点开放');
    expect(before.data.body).not.toContain('不可公开');
    await command(operator,'knowledge.save',{...fields,id:entry.id,body:'十点开放'});
    expect((await postgresWorkspace(db,student)).entities.find(e=>e.id===answer.id)?.data.body).toBe(before.data.body);
    expect((await postgresWorkspace(db,other)).entities.some(e=>e.id===answer.id)).toBe(false);
    await expect(command(student,'knowledge.save',fields)).rejects.toMatchObject({status:403});
    const next=await command(student,'knowledge.ask',{question:'图书馆开放时间'});
    expect((await postgresWorkspace(db,student)).entities.find(e=>e.id===next.id)?.data.body).toContain('十点开放');
  });
  it('protects the last active superadmin and blocks writes through a previously valid banned session', async () => {
    const auth=new PostgresAuth(db);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('govern-super','govern-super@example.test',$1,'超管','now','[\"superadmin\"]')",[hashPassword('Govern-test-123')]);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('govern-student','govern-student@example.test',$1,'测试学生','now','[\"student\"]')",[hashPassword('Govern-test-123')]);
    const superToken=(await auth.login('govern-super@example.test','Govern-test-123')).token;
    const student=(await auth.login('govern-student@example.test','Govern-test-123')).token;
    await expect(executePostgres(db,superToken,'account.update',{id:'govern-super',status:'banned',roles:[],reason:'停用测试'},randomUUID())).rejects.toThrow('唯一有效超级管理员');
    await expect(executePostgres(db,student,'account.update',{id:'govern-super',status:'banned',roles:[],reason:'越权测试'},randomUUID())).rejects.toMatchObject({status:403});
    await executePostgres(db,superToken,'account.update',{id:'govern-student',status:'banned',roles:['student'],reason:'封禁测试'},randomUUID());
    await expect(executePostgres(db,student,'post.create',{title:'不应发布',body:'测试',board:'校园'},randomUUID())).rejects.toMatchObject({status:403});
    expect((await db.pool.query("SELECT status FROM accounts WHERE id='govern-super'")).rows[0].status).toBe('active');
  });
  it('publishes mail with a default cover and notifies only current saved or participating students on correction', async () => {
    const auth=new PostgresAuth(db);
    const operator=(await auth.login('notify@example.test','Notify-test-123')).token;
    const a=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const b=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    const source={messageId:'pg-school-mail',subject:'校园讲座',sender:'school@example.test',body:'活动名称：公开讲座\n活动介绍：介绍\n活动开始时间：2027-01-01 10:00\n活动结束时间：2027-01-01 11:00\n活动地点：图书馆\n主办方：学院'};
    const mail=await command(operator,'mail.import',source);
    const original=(await postgresWorkspace(db,a)).entities.find(e=>e.kind==='activity' && e.data.mailId===mail.id)!;
    expect(original.data.image).toBe('/activity-default-cover.svg');
    await command(a,'relation.set',{id:original.id,kind:'save',enabled:true});
    await command(a,'relation.set',{id:original.id,kind:'participate',enabled:true});
    await command(b,'relation.set',{id:original.id,kind:'like',enabled:true});
    await command(operator,'mail.correct',{id:mail.id,title:'公开讲座',description:'介绍',startAt:'2027-01-01T10:00:00+08:00',endAt:'2027-01-01T11:00:00+08:00',location:'T2',host:'学院',conditions:'',reason:'学校更正地点'});
    const notices=(await db.pool.query("SELECT recipient_id FROM notifications WHERE entity_id=$1 AND event='activity.changed'",[original.id])).rows;
    expect(notices).toEqual([{recipient_id:'coffee-a'}]);
    expect(JSON.stringify(await postgresWorkspace(db,a))).not.toContain('school@example.test');
    await command(operator,'mail.import',source);
    const activities=(await postgresWorkspace(db,a)).entities.filter(e=>e.kind==='activity' && e.data.mailId===mail.id);
    expect(activities).toHaveLength(1);
    expect(activities[0].data.location).toBe('T2');
  });
  it('runs alumni verification and booking while keeping student numbers private and cancelling revoked bookings', async () => {
    const auth=new PostgresAuth(db);
    const alumni=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const student=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const reviewer=(await auth.login('review-pg@example.test','Review-postgres-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    await command(alumni,'alumni.apply',{studentNumber:'TEST-2024-PRIVATE',major:'计算机',graduationYear:2024,city:'珠海',direction:'就业',experience:'工作',topics:'实习',bio:'',evidence:'内部核对说明'});
    const profile=(await postgresWorkspace(db,reviewer)).alumni.profiles.find(p=>p.owner==='coffee-a')!;
    expect(profile.studentNumber).toBe('TEST-2024-PRIVATE');
    await command(reviewer,'alumni.review',{id:profile.id,approve:true});
    const publicView=await postgresWorkspace(db,student);
    expect(publicView.alumni.profiles.find(p=>p.id===profile.id)?.studentNumber).toBeUndefined();
    expect(JSON.stringify(publicView)).not.toContain('内部核对说明');
    const start=Date.now()+3*86400_000;
    await command(alumni,'alumni.slot.create',{startAt:new Date(start).toISOString(),endAt:new Date(start+3600_000).toISOString(),location:'图书馆'});
    const slot=(await postgresWorkspace(db,alumni)).alumni.slots.find(s=>s.alumniId===profile.id)!;
    await command(student,'alumni.request',{slotId:slot.id,question:'实习交流'});
    const booking=(await postgresWorkspace(db,student)).alumni.bookings.find(b=>b.slotId===slot.id)!;
    await command(alumni,'alumni.decide',{id:booking.id,accept:true});
    expect((await postgresWorkspace(db,student)).alumni.bookings.find(b=>b.id===booking.id)?.status).toBe('confirmed');
    await command(reviewer,'alumni.review',{id:profile.id,approve:false,reason:'撤销认证测试'});
    expect((await postgresWorkspace(db,student)).alumni.bookings.find(b=>b.id===booking.id)?.status).toBe('cancelled');
    await expect(command(alumni,'alumni.slot.create',{startAt:new Date(start+7200_000).toISOString(),endAt:new Date(start+10800_000).toISOString(),location:'图书馆'})).rejects.toThrow();
  });
  it('uses independent enrolled numbers for search and respects search and profile privacy switches', async () => {
    const auth=new PostgresAuth(db),mail=new PostgresEmail(db);
    const email='y123456789@bnbu.edu.cn';
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,organization,created_at,roles) VALUES('search-person',$1,$2,'搜索学生','学院','now','[\"student\"]')",[email,hashPassword('Search-test-123')]);
    const target=await auth.login(email,'Search-test-123');
    const requester=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[]});
    await mail.sendVerification(email,true);
    const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
    await mail.verifyOwnEmail(target.account,code);
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[]});
    await db.transaction(client=>new PostgresRepository(client).create('companionIdentity','search-person',{role:'student',status:'verified',studentNumber:'20260001'}));
    expect(await postgresStudentSearch(db,requester,'y123456789')).toEqual({students:[]});
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[{id:'search-person',name:'搜索学生',organization:'学院'}]});
    await executePostgres(db,target.token,'preferences.preview',{enabled:false},randomUUID());
    expect((await postgresStudentSearch(db,requester,'20260001')).students[0].organization).toBe('');
    await executePostgres(db,target.token,'preferences.searchable',{enabled:false},randomUUID());
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[]});
    expect(await postgresStudentSearch(db,requester,'2026')).toEqual({students:[]});
    await executePostgres(db,target.token,'alumni.apply',{studentNumber:'ignored-client-value',major:'计算机',graduationYear:2024,city:'珠海',direction:'就业',experience:'工作',topics:'实习',bio:'',evidence:'核对说明'},randomUUID());
    const alumniState=await db.transaction(client=>new PostgresRepository(client).all('alumniState'));
    const application=(alumniState[0].data.value as {profiles:Array<{owner:string;studentNumber:string;studentNumberSource:string}>}).profiles.find(p=>p.owner==='search-person');
    expect(application).toMatchObject({studentNumber:'20260001',studentNumberSource:'enrollment'});
  });
});
