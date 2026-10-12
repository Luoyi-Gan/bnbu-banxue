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
        source.prepare('INSERT INTO sports_media_blobs VALUES(?,?,?)').run('blob-test',Buffer.from([0,1,255]),'now');
        // Force a failure after accounts have been inserted; the whole import must roll back.
        source.exec('ALTER TABLE entities ADD COLUMN unexpected_column TEXT');
      } finally { source.close(); }
      await expect(importSqlite(filename,target)).rejects.toThrow('schema does not match');
      expect((await target.pool.query('SELECT * FROM accounts')).rows).toHaveLength(0);
      const fix = openDatabase(filename);
      try { fix.exec('ALTER TABLE entities DROP COLUMN unexpected_column'); } finally { fix.close(); }
      const counts = await importSqlite(filename,target);
      expect(counts.accounts).toBe(1);
      expect(counts.entities).toBeGreaterThan(0);
      expect((await target.pool.query('SELECT id FROM accounts')).rows[0].id).toBe(accountId!);
      expect((await target.pool.query("SELECT bytes FROM sports_media_blobs WHERE sha256='blob-test'")).rows[0].bytes).toEqual(Buffer.from([0,1,255]));
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
    await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','login-admin',{role:'admin',status:'verified'}));
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
});
