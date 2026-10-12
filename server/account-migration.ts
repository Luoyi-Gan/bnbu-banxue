import type { DatabaseSync } from "node:sqlite";

/** Historical subjects retain only the foreign-key identity, never login credentials. */
export function migrateHistoricalSubjects(db: DatabaseSync) {
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE version=5").get())
    return;
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE;");
  try {
    db.exec(`CREATE TABLE accounts_v5 (
      id TEXT PRIMARY KEY, email TEXT, password_hash TEXT, name TEXT,
      organization TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','muted','banned')),
      roles TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL,
      login_kind TEXT NOT NULL DEFAULT 'PERSONAL' CHECK(login_kind IN ('PERSONAL','ADMIN','HISTORY')),
      login_name TEXT UNIQUE, UNIQUE(email,login_kind),
      CHECK((login_kind='PERSONAL' AND login_name IS NULL AND email IS NOT NULL AND password_hash IS NOT NULL AND name IS NOT NULL)
        OR (login_kind='ADMIN' AND login_name IS NOT NULL AND length(login_name)>0 AND email IS NOT NULL AND password_hash IS NOT NULL AND name IS NOT NULL)
        OR (login_kind='HISTORY' AND login_name IS NULL AND email IS NULL AND password_hash IS NULL AND name IS NULL AND organization IS NULL AND status='banned' AND roles='[]'))
    );
    INSERT INTO accounts_v5 SELECT id,email,password_hash,name,organization,status,roles,created_at,login_kind,login_name FROM accounts;
    DROP TABLE accounts; ALTER TABLE accounts_v5 RENAME TO accounts;
    CREATE TRIGGER accounts_history_no_login BEFORE UPDATE ON accounts WHEN OLD.login_kind='HISTORY' AND NEW.login_kind<>'HISTORY' BEGIN SELECT RAISE(ABORT,'Historical subjects cannot regain login'); END;
    INSERT INTO schema_migrations VALUES(5,strftime('%Y-%m-%dT%H:%M:%fZ','now'));`);
    if (db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error("历史主体迁移外键检查失败");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys=ON");
  }
}

/** Split login namespaces without changing existing account IDs or their foreign keys. */
export function migrateAccountNamespaces(db: DatabaseSync) {
  if (
    db
      .prepare("PRAGMA table_info(accounts)")
      .all()
      .some((c) => c.name === "login_kind")
  )
    return;
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE;");
  try {
    db.exec(`
      CREATE TABLE accounts_v4 (
        id TEXT PRIMARY KEY, email TEXT NOT NULL, password_hash TEXT NOT NULL,
        name TEXT NOT NULL, organization TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','muted','banned')),
        roles TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL,
        login_kind TEXT NOT NULL DEFAULT 'PERSONAL' CHECK(login_kind IN ('PERSONAL','ADMIN')),
        login_name TEXT UNIQUE,
        UNIQUE(email, login_kind),
        CHECK((login_kind='PERSONAL' AND login_name IS NULL) OR (login_kind='ADMIN' AND length(login_name)>0))
      );
      INSERT INTO accounts_v4(id,email,password_hash,name,organization,status,roles,created_at)
        SELECT id,email,password_hash,name,organization,status,roles,created_at FROM accounts;
      DROP TABLE accounts;
      ALTER TABLE accounts_v4 RENAME TO accounts;
      INSERT INTO schema_migrations VALUES(4,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
    `);
    if (db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error("账号迁移外键检查失败");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys=ON");
  }
}
