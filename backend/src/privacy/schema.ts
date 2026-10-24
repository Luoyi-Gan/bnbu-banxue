// The same deletion state is used by the local SQLite and deployed PostgreSQL APIs.
export const deletionSchema = `
CREATE TABLE IF NOT EXISTS account_deletion_challenges (
 account_id TEXT PRIMARY KEY REFERENCES accounts(id), code_hash TEXT NOT NULL,
 expires_at BIGINT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, sent_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS account_deletion_receipts (
 session_hash TEXT NOT NULL, request_id TEXT NOT NULL, request_hash TEXT NOT NULL,
 completed_at TEXT NOT NULL, expires_at BIGINT NOT NULL, PRIMARY KEY(session_hash,request_id)
);
CREATE TABLE IF NOT EXISTS account_erasure_log (
 account_hash TEXT PRIMARY KEY, deleted_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS privacy_object_gc (
 object_key TEXT PRIMARY KEY, queued_at TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
);
`;
export const deletionMigration = {version: 14, sql: deletionSchema};
