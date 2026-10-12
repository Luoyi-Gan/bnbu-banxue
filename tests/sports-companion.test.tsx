import { afterEach, beforeEach, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { openDatabase, type Database } from "../backend/src/database";
import { createAccount, login, type Account } from "../backend/src/auth";
import { Repository } from "../backend/src/repository";
import { snapshot } from "../backend/src/commands";
import { sportsCompanion } from "../backend/src/sports/companion";
import { SportsProgressCard } from "../src/v2/SportsProgressCard";

let db: Database, repo: Repository, actor: Account, otherId: string;
beforeEach(() => {
  db = openDatabase(":memory:"); repo = new Repository(db);
  createAccount(db, { email: "student@example.test", password: "Password-12345", name: "同学", roles: ["student"] });
  actor = login(db, "student@example.test", "Password-12345").account;
  otherId = createAccount(db, { email: "other@example.test", password: "Password-12345", name: "其他账号", roles: ["teacher"] });
});
afterEach(() => db.close());
function course() {
  repo.create("sportsIdentity", actor.id, { role: "student", status: "verified" });
  const term = repo.create("sportsSemester", null, { name: "2026–2027 第一学期", status: "CURRENT" });
  const course = repo.create("sportsCourse", otherId, { semesterId: term.id, name: "大学体育（羽毛球）", status: "PUBLISHED", relatedTarget: 600, otherTarget: 600 });
  repo.create("sportsEnrollment", actor.id, { semesterId: term.id, courseId: course.id, status: "ACTIVE" });
  return course;
}
const card = () => renderToStaticMarkup(<MemoryRouter><SportsProgressCard sports={sportsCompanion(repo, actor)}/></MemoryRouter>);

it("未匹配体育身份的学生不显示卡片，不回退预览数字", () => {
  expect(snapshot(db, actor).sports).toBeNull();
  expect(card()).toBe("");
});
it("同账号当前学期最新已确认分钟生成截图中的小时卡，不泄漏原始明细", () => {
  const c = course();
  repo.create("sportsProgress", actor.id, { courseId: c.id, sequence: 1, total: 600 });
  repo.create("sportsProgress", actor.id, { courseId: c.id, sequence: 2, total: 630, details: [{ private: "不可返回" }] });
  repo.create("sportsProgress", otherId, { courseId: c.id, sequence: 99, total: 1200 });
  const summary = snapshot(db, actor).sports;
  expect(summary?.progress).toMatchObject({ source: "local", completedHours: 10.5, targetHours: 20, remainingHours: 9.5, percent: 52.5 });
  expect(JSON.stringify(summary)).not.toContain("不可返回");
  expect(card()).toContain("52<small>%</small>");
  expect(card()).toContain("10.5");
  expect(card()).toContain("本地体育库");
  repo.save(c, { status: "CLOSED" });
  expect(sportsCompanion(repo, actor)?.progress?.completedHours).toBe(10.5);
});
it("待审记录不补齐未知进度，已确认零值仍显示", () => {
  const c = course();
  repo.create("sportsRecord", actor.id, { courseId: c.id, status: "PENDING_CHECK", activeMilliseconds: 3600000 });
  expect(card()).toBe("");
  repo.create("sportsProgress", actor.id, { courseId: c.id, sequence: 1, total: 0 });
  expect(sportsCompanion(repo, actor)?.progress?.completedHours).toBe(0);
  expect(card()).toContain("体育打卡进度");
  repo.create("sportsProgress", actor.id, { courseId: c.id, sequence: 2, total: null });
  expect(card()).toBe("");
});
it("已移出课程、旧学期和缺失目标不生成虚假进度", () => {
  const c = course();
  repo.create("sportsProgress", actor.id, { courseId: c.id, sequence: 1, total: 630 });
  repo.save(c, { relatedTarget: null });
  expect(sportsCompanion(repo, actor)?.progress).toMatchObject({ completedHours: 10.5, targetHours: null, percent: null });
  repo.save(repo.all("sportsEnrollment")[0], { status: "REMOVED" });
  expect(card()).toBe("");
  repo.save(repo.all("sportsEnrollment")[0], { status: "ACTIVE" });
  repo.save(repo.all("sportsSemester")[0], { status: "ARCHIVED" });
  expect(card()).toBe("");
});
it("普通教师不能因校园角色或同名资料获得体育入口，匹配本人体育身份才显示", () => {
  actor.roles = ["teacher"];
  repo.create("teacherProfile", actor.id, { sportsQualified: true });
  repo.create("sportsIdentity", otherId, { role: "teacher", status: "verified", email: actor.email });
  expect(sportsCompanion(repo, actor)).toBeNull();
  const identity = repo.create("sportsIdentity", actor.id, { role: "teacher", status: "verified" });
  expect(sportsCompanion(repo, actor)).toEqual({ role: "teacher", source: "local", progress: null });
  repo.save(identity, { status: "revoked" });
  expect(sportsCompanion(repo, actor)).toBeNull();
});
it("同邮箱独立管理账号不能被当作个人体育账号", () => {
  course();
  const id = createAccount(db, { email: "admin@example.test", password: "Password-12345", name: "管理", roles: ["teacher"] });
  db.prepare("UPDATE accounts SET login_kind='ADMIN',login_name='independent-admin',email=? WHERE id=?").run(actor.email, id);
  repo.create("sportsIdentity", id, { role: "teacher", status: "verified" });
  expect(sportsCompanion(repo, { ...actor, id, roles: ["teacher"] })).toBeNull();
  expect(sportsCompanion(repo, { ...actor, email: "different@example.test" })).toBeNull();
});
it("封禁、维护及首次改密期间不返回正常体育摘要", () => {
  course();
  expect(sportsCompanion(repo, { ...actor, status: "banned" })).toBeNull();
  const system = repo.create("sportsSystem", null, { mode: "MAINTENANCE" });
  expect(sportsCompanion(repo, actor)).toBeNull();
  repo.save(system, { mode: "NORMAL" });
  actor.roles = ["teacher"];
  repo.save(repo.all("sportsIdentity")[0], { role: "teacher", mustChangePassword: true });
  expect(snapshot(db, actor)).toMatchObject({ firstLoginOnly: true });
  expect(snapshot(db, actor).sports).toBeUndefined();
});
