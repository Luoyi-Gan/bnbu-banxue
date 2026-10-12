import { processPostgresSportsReview } from './src/storage/postgres-review-worker';
import { seedPostgresConversions } from './src/storage/postgres-conversion-seed';
import { PostgresDatabase } from './src/storage/postgres';
import { postgresMigrations } from './src/storage/postgres-schema';
import { createPostgresApiServer } from './src/postgres-api';
import { configuredObjectStore } from './src/storage/cos-object-store';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for PostgreSQL');
configuredObjectStore();
const port = Number(process.env.BNBU_API_PORT ?? '4180');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid BNBU_API_PORT');
const db = new PostgresDatabase({connectionString:process.env.DATABASE_URL});
await db.migrate(postgresMigrations);
await seedPostgresConversions(db);
const server = createPostgresApiServer(db,{
  localOutbox:process.env.BNBU_LOCAL_OUTBOX==='1',
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
const reviewTimer=setInterval(()=>{if(reviewing)return;reviewing=true;void processPostgresSportsReview(db).catch(()=>console.error('Sports review pass failed; pending work retained')).finally(()=>{reviewing=false;});},10000);
reviewTimer.unref();
for(const signal of ['SIGINT','SIGTERM'] as const) process.once(signal,()=>{clearInterval(reviewTimer);server.close(()=>void db.close());});
