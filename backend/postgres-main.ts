import { PostgresDatabase } from './src/storage/postgres';
import { postgresMigrations } from './src/storage/postgres-schema';
import { createPostgresApiServer } from './src/postgres-api';
import { configuredObjectStore } from './src/storage/cos-object-store';
import { startActivityMailbox } from './src/activity-mailbox';
import { executePostgresMailboxImport } from './src/storage/postgres-commands';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for PostgreSQL');
configuredObjectStore();
const port = Number(process.env.BNBU_API_PORT ?? '4180');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid BNBU_API_PORT');
const surface='companion' as const;
if(process.env.BNBU_APP_SURFACE && process.env.BNBU_APP_SURFACE!=='companion') throw new Error('Only the Banxue companion service is supported');
const schema=process.env.BNBU_POSTGRES_SCHEMA ?? 'public';
if(!/^[a-z][a-z0-9_]{0,62}$/.test(schema))throw new Error('Invalid PostgreSQL schema');
const db = new PostgresDatabase({connectionString:process.env.DATABASE_URL,options:`-c search_path=${schema}`});
await db.pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
await db.migrate(postgresMigrations);

const server = createPostgresApiServer(db,{
  localOutbox:process.env.BNBU_LOCAL_OUTBOX==='1',
  surface,
  secureCookies:process.env.BNBU_SECURE_COOKIES==='1',
  origins:process.env.BNBU_ALLOWED_ORIGINS?.split(',').map(value=>value.trim()).filter(Boolean),
});
try {
  await new Promise<void>((resolve,reject)=>{
    server.once('error',reject);
    server.listen(port,process.env.BNBU_API_HOST ?? '127.0.0.1',resolve);
  });
} catch(error) { await db.close(); throw error; }
console.log(`BNBU PostgreSQL API listening on port ${port}; business route migration in progress`);
const mailbox=startActivityMailbox((actorId,input,requestId)=>executePostgresMailboxImport(db,actorId,input,requestId));
for(const signal of ['SIGINT','SIGTERM'] as const) process.once(signal,()=>{mailbox?.stop();server.close(()=>void db.close());});
