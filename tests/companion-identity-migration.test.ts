import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../backend/src/database';
import { createAccount } from '../backend/src/auth';
import { Repository } from '../backend/src/repository';
import { migrateCompanionIdentity } from '../backend/src/companion-identity-migration';
import { PostgresDatabase } from '../backend/src/storage/postgres';
import { postgresMigrations } from '../backend/src/storage/postgres-schema';

it('migrates only existing Banxue roles without changing identity facts or credentials, once',()=>{
 const db=openDatabase(':memory:');
 try {
  const repo=new Repository(db);
  const owner=createAccount(db,{email:'migration@example.test',name:'学生',password:'Migration-test-123',roles:['student']});
  const owned=repo.create('sportsIdentity',owner,{role:'student',status:'verified',studentNumber:'20260001',source:'local-acceptance'});
  const foreign=repo.create('sportsIdentity',owner,{role:'teacher',status:'verified'});
  const before=db.prepare('SELECT * FROM accounts WHERE id=?').get(owner);
  db.exec('DELETE FROM schema_migrations WHERE version=8');
  migrateCompanionIdentity(db);
  expect(repo.get(owned.id)).toEqual({...owned,kind:'companionIdentity'});
  expect(repo.get(foreign.id)).toEqual(foreign);
  expect(db.prepare('SELECT * FROM accounts WHERE id=?').get(owner)).toEqual(before);
  const later=repo.create('sportsIdentity',owner,{role:'student',status:'verified'});
  migrateCompanionIdentity(db);
  expect(repo.get(later.id).kind).toBe('sportsIdentity');
 } finally {db.close();}
});

it.skipIf(!process.env.BNBU_TEST_POSTGRES_URL)('upgrades a real PostgreSQL legacy schema without granting roles or changing IDs',async()=>{
 const admin=new PostgresDatabase({connectionString:process.env.BNBU_TEST_POSTGRES_URL});
 const schema='identity_'+randomUUID().replaceAll('-','');
 await admin.pool.query('CREATE SCHEMA '+schema);
 const db=new PostgresDatabase({connectionString:process.env.BNBU_TEST_POSTGRES_URL,options:'-c search_path='+schema});
 try {
  await db.migrate(postgresMigrations.filter(migration=>migration.version<9));
  await db.pool.query(`INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES('person','migration@example.test','unchanged','学生','["student"]','now')`);
  await db.pool.query(`INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES
   ('allowed','sportsIdentity','person','{"role":"student","status":"verified","studentNumber":"20260001"}','now','now'),
   ('foreign','sportsIdentity','person','{"role":"teacher","status":"verified"}','now','now')`);
  const before=(await db.pool.query('SELECT * FROM accounts')).rows;
  const identity=(await db.pool.query("SELECT * FROM entities WHERE id='allowed'")).rows[0];
  await db.migrate(postgresMigrations);
  await db.migrate(postgresMigrations);
  expect((await db.pool.query("SELECT * FROM entities WHERE id='allowed'")).rows[0]).toEqual({...identity,kind:'companionIdentity'});
  expect((await db.pool.query("SELECT kind FROM entities WHERE id='foreign'")).rows[0].kind).toBe('sportsIdentity');
  expect((await db.pool.query('SELECT * FROM accounts')).rows).toEqual(before);
 } finally {await db.close();await admin.pool.query('DROP SCHEMA '+schema+' CASCADE');await admin.close();}
});
