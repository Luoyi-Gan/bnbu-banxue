import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresDatabase } from '../backend/src/storage/postgres';
import { postgresMigrations } from '../backend/src/storage/postgres-schema';
import { PostgresRepository } from '../backend/src/storage/postgres-repository';
import { importSqlite } from '../backend/src/storage/import-sqlite';
import { openDatabase } from '../backend/src/database';
import { createAccount, hashPassword, digest } from '../backend/src/auth';
import { PostgresAuth } from '../backend/src/storage/postgres-auth';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe.skipIf(!process.env.BNBU_TEST_POSTGRES_URL)('PostgreSQL persistence on a real server', () => {
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  let admin: Pool;
  let db: PostgresDatabase;
  beforeAll(async () => {
    admin = new Pool({ connectionString: process.env.BNBU_TEST_POSTGRES_URL });
    await admin.query(`CREATE SCHEMA ${schema}`);
    db = new PostgresDatabase({ connectionString: process.env.BNBU_TEST_POSTGRES_URL, options: `-c search_path=${schema}` });
    await db.migrate(postgresMigrations);
  });
  afterAll(async () => {
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
});
