import {it,expect} from 'vitest';
import {PostgresDatabase} from '../backend/src/storage/postgres';
import {createPostgresApiServer} from '../backend/src/postgres-api';
it('rejects the removed standalone sports service before opening any connection',async()=>{
  const db=new PostgresDatabase({connectionString:'postgresql://unused:unused@127.0.0.1:1/unused'});
  try { expect(()=>createPostgresApiServer(db,{surface:'sports'})).toThrow('伴学不提供独立体育服务'); }
  finally { await db.close(); }
});
