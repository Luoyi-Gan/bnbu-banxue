import { processPostgresSportsReview } from './src/storage/postgres-review-worker';
import { processPostgresDeadlineReminders } from './src/storage/postgres-deadline-reminders';
import { seedPostgresConversions } from './src/storage/postgres-conversion-seed';
import { PostgresDatabase } from './src/storage/postgres';
import { postgresMigrations } from './src/storage/postgres-schema';
import { createPostgresApiServer } from './src/postgres-api';
import { configuredObjectStore } from './src/storage/cos-object-store';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for PostgreSQL');
configuredObjectStore();
const port = Number(process.env.BNBU_API_PORT ?? '4180');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid BNBU_API_PORT');
const surface=process.env.BNBU_APP_SURFACE==='sports'?'sports':'companion';
const schema=process.env.BNBU_POSTGRES_SCHEMA ?? (surface==='sports'?'sports':'public');
if(!/^[a-z][a-z0-9_]{0,62}$/.test(schema))throw new Error('Invalid PostgreSQL schema');
if(surface==='sports' && schema==='public')throw new Error('Sports requires a separate PostgreSQL schema');
const db = new PostgresDatabase({connectionString:process.env.DATABASE_URL,options:`-c search_path=${schema}`});
await db.pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
await db.migrate(postgresMigrations);
await seedPostgresConversions(db);
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
let reviewing=false;
const reviewTimer=setInterval(()=>{if(surface!=='sports' || reviewing)return;reviewing=true;void processPostgresSportsReview(db).catch(()=>console.error('Sports review pass failed; pending work retained')).finally(()=>{reviewing=false;});},10000);
reviewTimer.unref();
let reminding=false;
const reminderTimer=setInterval(()=>{if(surface!=='sports' || reminding)return;reminding=true;void processPostgresDeadlineReminders(db).catch(()=>console.error('Sports deadline reminders failed; pending work retained')).finally(()=>{reminding=false;});},60000);
reminderTimer.unref();
for(const signal of ['SIGINT','SIGTERM'] as const) process.once(signal,()=>{clearInterval(reviewTimer);clearInterval(reminderTimer);server.close(()=>void db.close());});
