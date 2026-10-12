import { resolve } from 'node:path';
import { PostgresDatabase } from './src/storage/postgres';
import { postgresMigrations } from './src/storage/postgres-schema';
import { importSqlite } from './src/storage/import-sqlite';

// Explicit offline command; API startup never copies or overwrites business data.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
if (process.argv.length !== 3) throw new Error('Usage: node backend/dist/import-sqlite.mjs <source.sqlite>');
const db=new PostgresDatabase({connectionString:process.env.DATABASE_URL});
try {
  await db.migrate(postgresMigrations);
  const counts=await importSqlite(resolve(process.argv[2]),db);
  console.log(JSON.stringify({imported:true,counts}));
} finally { await db.close(); }
