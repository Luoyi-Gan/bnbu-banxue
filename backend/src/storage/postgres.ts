import { createHash } from 'node:crypto';
import { Pool, type PoolConfig, type PoolClient } from 'pg';

/** A transaction always owns one connection; callbacks must not use the pool. */
export class PostgresDatabase {
  readonly pool: Pool;
  constructor(config: PoolConfig) {
    this.pool = new Pool({ max: 10, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000, ...config });
    this.pool.on('error', () => console.error('PostgreSQL idle connection failed'));
  }

  async transaction<T>(operation: (client: PoolClient) => Promise<T>, privacyExclusive = false): Promise<T> {
    const client = await this.pool.connect();
    let broken = false;
    try {
      await client.query('BEGIN');
      // An erasure commits between other transactions, never halfway through their writes.
      await client.query(privacyExclusive ? 'SELECT pg_advisory_xact_lock(18422,43)' : 'SELECT pg_advisory_xact_lock_shared(18422,43)');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { broken = true; }
      throw error;
    } finally {
      client.release(broken);
    }
  }

  async migrate(migrations: readonly { version: number; sql: string }[]) {
    await this.transaction(async client => {
      // Serialize schema changes across concurrent API starts.
      await client.query('SELECT pg_advisory_xact_lock(18422, 1)');
      await client.query('CREATE TABLE IF NOT EXISTS backend_migrations (version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
      for (const migration of [...migrations].sort((a,b) => a.version-b.version)) {
        const checksum = createHash('sha256').update(migration.sql).digest('hex');
        const existing = await client.query<{ checksum: string }>('SELECT checksum FROM backend_migrations WHERE version=$1', [migration.version]);
        if (existing.rows.length) {
          if (existing.rows[0].checksum !== checksum) throw new Error(`Migration ${migration.version} checksum mismatch`);
          continue;
        }
        await client.query(migration.sql);
        await client.query('INSERT INTO backend_migrations(version,checksum) VALUES($1,$2)', [migration.version,checksum]);
      }
    });
  }

  close() { return this.pool.end(); }
}
