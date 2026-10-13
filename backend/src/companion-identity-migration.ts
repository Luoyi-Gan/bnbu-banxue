import type { DatabaseSync } from "node:sqlite";

// Only migrate records belonging to an already authorized Banxue account.
// No role, credential, entity ID, version or verification field is changed.
export function migrateCompanionIdentity(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");
  try {
    if (!db.prepare("SELECT 1 FROM schema_migrations WHERE version=8").get()) {
      db.exec(`UPDATE entities SET kind='companionIdentity'
        WHERE kind='sportsIdentity' AND EXISTS (
          SELECT 1 FROM accounts a WHERE a.id=entities.owner_id AND (
            (json_extract(entities.data,'$.role')='admin' AND (a.login_kind='ADMIN' OR EXISTS(SELECT 1 FROM json_each(a.roles) WHERE value='superadmin')))
            OR (json_extract(entities.data,'$.role') IN ('student','teacher') AND EXISTS(SELECT 1 FROM json_each(a.roles) WHERE value=json_extract(entities.data,'$.role')))
          )
        );
        INSERT INTO schema_migrations VALUES(8,strftime('%Y-%m-%dT%H:%M:%fZ','now'));`);
    }
    db.exec("COMMIT");
  } catch(error) { db.exec("ROLLBACK"); throw error; }
}
