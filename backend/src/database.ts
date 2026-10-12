import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  migrateAccountNamespaces,
  migrateHistoricalSubjects,
} from "./account-migration";

export function openDatabase(filename: string) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(
    "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;",
  );
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      name TEXT NOT NULL, organization TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','muted','banned')),
      roles TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id),
      expires_at INTEGER NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS email_challenges (
      email TEXT PRIMARY KEY, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mail_outbox (
      id TEXT PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL,
      body TEXT NOT NULL, created_at TEXT NOT NULL, delivered_at TEXT
    );
    CREATE TABLE IF NOT EXISTS admin_security_challenges (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id),
      purpose TEXT NOT NULL CHECK(purpose IN ('EMAIL_VERIFY','PASSWORD_RESET')),
      email TEXT NOT NULL, code_hash TEXT, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, sent_at INTEGER NOT NULL,
      identity_version INTEGER NOT NULL, mail_id TEXT NOT NULL,
      consumed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS admin_challenge_account ON admin_security_challenges(account_id,purpose,sent_at);
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL,
      owner_id TEXT REFERENCES accounts(id), data TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS entities_kind_owner ON entities(kind, owner_id);
    CREATE TABLE IF NOT EXISTS relations (
      account_id TEXT NOT NULL REFERENCES accounts(id),
      entity_id TEXT NOT NULL REFERENCES entities(id), kind TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL,
      PRIMARY KEY (account_id, entity_id, kind)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, recipient_id TEXT NOT NULL REFERENCES accounts(id),
      entity_id TEXT, event TEXT NOT NULL, body TEXT NOT NULL,
      created_at TEXT NOT NULL, read_at TEXT
    );
    CREATE INDEX IF NOT EXISTS notifications_recipient ON notifications(recipient_id, created_at);
    CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES accounts(id),
      role TEXT NOT NULL, action TEXT NOT NULL, entity_id TEXT,
      reason TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS command_receipts (
      actor_id TEXT NOT NULL REFERENCES accounts(id), request_id TEXT NOT NULL,
      request_hash TEXT NOT NULL, result TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY (actor_id, request_id)
    );
    CREATE TABLE IF NOT EXISTS sports_media_blobs (
      sha256 TEXT PRIMARY KEY, bytes BLOB NOT NULL, created_at TEXT NOT NULL
    );
    INSERT OR IGNORE INTO schema_migrations VALUES (2, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
    INSERT OR IGNORE INTO schema_migrations VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
  `);
  migrateAccountNamespaces(db);
  migrateHistoricalSubjects(db);
  db.exec(
    "INSERT OR IGNORE INTO schema_migrations VALUES(6,strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
  );
  transaction(db, () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS sports_template_publications (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id TEXT NOT NULL UNIQUE REFERENCES entities(id)
      );
      INSERT INTO sports_template_publications(template_id)
      SELECT id FROM entities
      WHERE kind='sportsTemplate' AND json_extract(data,'$.status')='published'
        AND id NOT IN (SELECT template_id FROM sports_template_publications)
      ORDER BY created_at,id;
      INSERT OR IGNORE INTO schema_migrations VALUES(7,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
    `);
  });
  return db;
}

export type Database = ReturnType<typeof openDatabase>;
export function transaction<T>(db: Database, operation: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
