import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { openDatabase } from "./database";
import { createAccount } from "./auth";

// Explicit CLI-only fixtures. Never called by application startup or registration.
export function prepareBrowserAcceptance() {
  const path = resolve("data/browser-acceptance.sqlite"),
    credentials = resolve("data/browser-acceptance-accounts.json");
  if (existsSync(path)) {
    console.log("独立验收数据库已存在，未修改；账号文件：" + credentials);
    return;
  }
  const db = openDatabase(path),
    password = randomBytes(18).toString("base64url");
  const profiles = [
    { email: "student-a@example.test", name: "验收学生甲", roles: ["student"] },
    { email: "student-b@example.test", name: "验收学生乙", roles: ["student"] },
    { email: "teacher@example.test", name: "验收教师", roles: ["teacher"] },
    { email: "admin@example.test", name: "验收管理员", roles: ["superadmin"] },
    { email: "reviewer@example.test", name: "验收审核员", roles: ["reviewer"] },
    { email: "operator@example.test", name: "验收运营", roles: ["operator"] },
  ];
  const accounts = profiles.map((profile) => ({
    ...profile,
    password,
    id: createAccount(db, {
      ...profile,
      password,
      organization: "本地验收夹具（非学校核验）",
    }),
  }));
  db.close();
  mkdirSync(resolve("data"), { recursive: true });
  writeFileSync(
    credentials,
    JSON.stringify(
      {
        purpose: "仅自动化与浏览器验收，不代表真实学校身份",
        database: path,
        accounts,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log("已创建独立浏览器验收数据库；账号文件：" + credentials);
}
export function readLocalOutbox(database: string, email: string) {
  if (!existsSync(database)) throw new Error("数据库不存在。");
  const db = openDatabase(database);
  const messages = db
    .prepare(
      "SELECT recipient,subject,body,created_at FROM mail_outbox WHERE recipient=? ORDER BY created_at DESC LIMIT 3",
    )
    .all(email);
  db.close();
  return messages;
}
