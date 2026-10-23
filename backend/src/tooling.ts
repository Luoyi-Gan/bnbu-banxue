import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { openDatabase, transaction } from "./database";
import { createAccount } from "./auth";
import { Repository } from './repository';

// Explicit CLI-only fixtures. Never called by application startup or registration.
export function prepareBrowserAcceptance(directory = resolve('data')) {
  const path = resolve(directory, "browser-acceptance.sqlite"),
    credentials = resolve(directory, "browser-acceptance-accounts.json");
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
  mkdirSync(directory, { recursive: true });
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

// Explicit test fixture setup only; application authentication never calls this.
export function prepareSportsAcceptance(directory = resolve('data')) {
  const path = resolve(directory, 'browser-acceptance.sqlite');
  if (!existsSync(path)) throw new Error('请先初始化独立验收数据库。');
  const manifest = JSON.parse(readFileSync(resolve(directory, 'browser-acceptance-accounts.json'), 'utf8')) as {database:string;accounts:{id:string;email:string}[]};
  if (resolve(manifest.database) !== path) throw new Error('验收账号文件与数据库不匹配。');
  const db = openDatabase(path);
  try {
    return transaction(db, () => {
      const repo = new Repository(db);
      let added = 0;
      for (const email of ['student-a@example.test', 'student-b@example.test']) {
        const fixture = manifest.accounts.find(item => item.email === email);
        const actor = db.prepare('SELECT id,email,organization,roles FROM accounts WHERE id=? AND email=?').get(fixture?.id ?? '', email);
        if (!actor || actor.organization !== '本地验收夹具（非学校核验）' || !JSON.parse(String(actor.roles)).includes('student')) throw new Error('仅允许初始化原始合成学生验收账号。');
        if (!repo.all('verifiedEmail').some(item => item.ownerId === actor.id && item.data.email === email)) {
          repo.create('verifiedEmail', String(actor.id), {email, source:'local-acceptance-fixture'});
          added++;
        }
      }
      return {added};
    });
  } finally {db.close();}
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
