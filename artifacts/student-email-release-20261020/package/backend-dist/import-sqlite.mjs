import { resolve } from "node:path";
import { c as companionIdentityMigrationSql, P as PostgresDatabase, p as postgresMigrations } from "./postgres-schema-C1S6kA9K.js";
import { DatabaseSync } from "node:sqlite";
const tables = [
  "accounts",
  "sessions",
  "email_challenges",
  "mail_outbox",
  "admin_security_challenges",
  "entities",
  "relations",
  "notifications",
  "audit",
  "command_receipts"
];
async function importSqlite(sourcePath, target) {
  const source = new DatabaseSync(sourcePath, { readOnly: true });
  let snapshot;
  try {
    source.exec("BEGIN");
    if (source.prepare("PRAGMA integrity_check").get()?.integrity_check !== "ok") throw new Error("Source database integrity check failed");
    if (source.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Source database foreign key check failed");
    snapshot = tables.map((table) => ({
      table,
      columns: source.prepare(`PRAGMA table_info(${table})`).all().map((row) => String(row.name)),
      rows: source.prepare(`SELECT * FROM ${table}`).all()
    }));
    source.exec("COMMIT");
  } finally {
    source.close();
  }
  return target.transaction(async (client) => {
    await client.query(`LOCK TABLE ${tables.join(",")} IN ACCESS EXCLUSIVE MODE`);
    for (const { table } of snapshot) {
      if ((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new Error(`Target ${table} is not empty`);
    }
    const counts = {};
    for (const { table, columns, rows } of snapshot) {
      const targetColumns = (await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=$1", [table])).rows.map((row) => row.column_name);
      if (!columns.length || columns.some((column) => !targetColumns.includes(column) || !/^[a-z_][a-z0-9_]*$/.test(column))) throw new Error(`Source ${table} schema does not match target`);
      const sql = `INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map((_, i) => `$${i + 1}`).join(",")})`;
      for (const row of rows) {
        await client.query(sql, columns.map((column) => row[column] instanceof Uint8Array ? Buffer.from(row[column]) : row[column]));
      }
      const count = Number((await client.query(`SELECT count(*) AS count FROM ${table}`)).rows[0].count);
      if (count !== rows.length) throw new Error(`Imported ${table} count mismatch`);
      counts[table] = count;
    }
    await client.query(companionIdentityMigrationSql);
    return counts;
  });
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (process.argv.length !== 3) throw new Error("Usage: node backend/dist/import-sqlite.mjs <source.sqlite>");
const db = new PostgresDatabase({ connectionString: process.env.DATABASE_URL });
try {
  await db.migrate(postgresMigrations);
  const counts = await importSqlite(resolve(process.argv[2]), db);
  console.log(JSON.stringify({ imported: true, counts }));
} finally {
  await db.close();
}
