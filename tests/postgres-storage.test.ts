import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresDatabase } from '../backend/src/storage/postgres';
import { postgresMigrations } from '../backend/src/storage/postgres-schema';

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
    expect((await db.pool.query('SELECT * FROM backend_migrations')).rows).toHaveLength(1);
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
});
