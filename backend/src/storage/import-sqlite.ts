import { companionIdentityMigrationSql } from './postgres-schema';
import { DatabaseSync } from 'node:sqlite';
import type { PostgresDatabase } from './postgres';

const tables = [
  'accounts', 'sessions', 'email_challenges', 'mail_outbox',
  'admin_security_challenges', 'entities', 'relations', 'notifications',
  'audit', 'command_receipts',
] as const;

/** Offline cutover only: take a consistent read-only source snapshot, then import atomically. */
export async function importSqlite(sourcePath: string, target: PostgresDatabase) {
  const source = new DatabaseSync(sourcePath, { readOnly: true });
  let snapshot: { table: typeof tables[number]; columns: string[]; rows: Record<string, unknown>[] }[];
  try {
    source.exec('BEGIN');
    if (source.prepare('PRAGMA integrity_check').get()?.integrity_check !== 'ok') throw new Error('Source database integrity check failed');
    if (source.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Source database foreign key check failed');
    snapshot = tables.map(table => ({
      table,
      columns: source.prepare(`PRAGMA table_info(${table})`).all().map(row=>String(row.name)),
      rows: source.prepare(`SELECT * FROM ${table}`).all(),
    }));
    source.exec('COMMIT');
  } finally { source.close(); }

  return target.transaction(async client => {
    // Reject populated targets, and exclude concurrent writers throughout the import.
    await client.query(`LOCK TABLE ${tables.join(',')} IN ACCESS EXCLUSIVE MODE`);
    for (const {table} of snapshot) {
      if ((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new Error(`Target ${table} is not empty`);
    }
    const counts: Record<string, number> = {};
    for (const {table,columns,rows} of snapshot) {
      const targetColumns = (await client.query<{column_name:string}>('SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=$1', [table])).rows.map(row=>row.column_name);
      if (!columns.length || columns.some(column=>!targetColumns.includes(column) || !/^[a-z_][a-z0-9_]*$/.test(column))) throw new Error(`Source ${table} schema does not match target`);
      const sql = `INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map((_,i)=>`$${i+1}`).join(',')})`;
      for (const row of rows) {
        await client.query(sql,columns.map(column=>row[column] instanceof Uint8Array ? Buffer.from(row[column] as Uint8Array) : row[column]));
      }
      const count = Number((await client.query(`SELECT count(*) AS count FROM ${table}`)).rows[0].count);
      if (count !== rows.length) throw new Error(`Imported ${table} count mismatch`);
      counts[table] = count;
    }
    await client.query(companionIdentityMigrationSql);
    return counts;
  });
}
