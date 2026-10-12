import { openDatabase } from '../backend/src/database';
import { createApiServer } from '../backend/src/main';
import { createAccount, login, authenticate } from '../backend/src/auth';
import {it,expect} from 'vitest';
import {PostgresDatabase} from '../backend/src/storage/postgres';
import {createPostgresApiServer} from '../backend/src/postgres-api';
it('rejects the removed standalone sports service before opening any connection',async()=>{
  const db=new PostgresDatabase({connectionString:'postgresql://unused:unused@127.0.0.1:1/unused'});
  try { expect(()=>createPostgresApiServer(db,{surface:'sports'})).toThrow('伴学不提供独立体育服务'); }
  finally { await db.close(); }
});

it('rejects legacy sports URLs with the default server configuration before database access',async()=>{
 const db=new PostgresDatabase({connectionString:'postgresql://unused:unused@127.0.0.1:1/unused'});
 const server=createPostgresApiServer(db);
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+(server.address() as {port:number}).port;
 try {
  for(const route of ['/api/sports/administrators','/api/v1/teacher-progress']) {
   expect((await fetch(base+route)).status).toBe(404);
  }
  expect((await fetch(base+'/api/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sports.admins.create',input:{},requestId:'retired-command'})})).status).toBe(403);
 } finally {server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await db.close();}
});

it('legacy sports logout cannot revoke a Banxue SQLite session',async()=>{
 const db=openDatabase(':memory:');
 createAccount(db,{email:'isolation@example.test',name:'学生',password:'Isolation-123',roles:['student']});
 const session=login(db,'isolation@example.test','Isolation-123');
 const server=createApiServer(db);
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+(server.address() as {port:number}).port;
 try {
  const result=await fetch(base+'/api/v1/auth/logout',{method:'POST',headers:{'Content-Type':'application/json',Cookie:'bnbu_session='+session.token},body:'{}'});
  expect(result.status).toBe(404);
  expect(result.headers.get('set-cookie')).toBeNull();
  expect(authenticate(db,session.token).id).toBe(session.account.id);
 } finally {server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));db.close();}
});
