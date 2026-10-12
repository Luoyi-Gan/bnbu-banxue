import { describe, expect, it } from "vitest";
import { buildSportsDashboard, shanghaiDate, type SportsDashboardData } from "../src/live/sportsDashboardModel";
import type { LiveEntity } from "../src/live/api";

const entity = (id: string, data: Record<string, unknown>, ownerId = "student-1", createdAt = "2026-10-11T16:01:00Z"): LiveEntity => ({ id, ownerId, data, createdAt, updatedAt: createdAt, version: 1, kind: "fixture" });
function fixture(role = "teacher"): SportsDashboardData {
  return {
    identity: entity("identity", { role }, role === "student" ? "student-1" : "teacher-1"),
    serverNow: Date.parse("2026-10-12T04:00:00Z"),
    courses: [entity("current", { semesterId: "semester", name: "课程" }), entity("past", { semesterId: "past" })],
    enrollments: [entity("member", { courseId: "current", status: "ACTIVE" })],
    records: [entity("record", { courseId: "current", status: "PENDING_AI" }), entity("old", { courseId: "past", status: "VALID" })],
    progress: [],
  };
}

describe("体育可视化统计边界", () => {
  it("当前学期隔离历史课程，待检查不计入确认进度", () => {
    const view = buildSportsDashboard(fixture(), "semester", "", 7);
    expect(view.selectedCourses.map(item => item.id)).toEqual(["current"]);
    expect(view.pendingCount).toBe(1);
    expect(view.confirmedMinutes).toBeNull();
    expect(view.groups.find(group => group.key === "valid")?.count).toBe(0);
  });
  it("管理员未获运动明细时显示未知而不是伪造零", () => {
    const view = buildSportsDashboard(fixture("admin"), "semester", "", 7);
    expect(view.canReadRecords).toBe(false);
    expect(view.memberCount).toBeNull();
    expect(view.pendingCount).toBeNull();
    expect(view.confirmedMinutes).toBeNull();
  });
  it("学生只统计本人有效入班课程与本人投影", () => {
    const data = fixture("student");
    data.enrollments!.push(entity("someone", { courseId: "current", status: "ACTIVE" }, "student-2"));
    data.records!.push(entity("private-record", { courseId: "current", status: "VALID" }, "student-2"));
    data.progress!.push(entity("private-progress", { courseId: "current", total: 900 }, "student-2"));
    const view = buildSportsDashboard(data, "semester", "", 7);
    expect(view.memberCount).toBe(1);
    expect(view.records.map(item => item.id)).toEqual(["record"]);
    expect(view.confirmedMinutes).toBeNull();
    data.enrollments![0].data.status = "REMOVED";
    expect(buildSportsDashboard(data, "semester", "", 7).selectedCourses).toHaveLength(0);
  });
  it("仅汇总最新确认投影，服务端确认的零保持为零", () => {
    const data = fixture();
    data.progress = [entity("old", { courseId: "current", sequence: 1, total: 60 }), entity("new", { courseId: "current", sequence: 2, total: 0 })];
    expect(buildSportsDashboard(data, "semester", "", 7).confirmedMinutes).toBe(0);
  });
  it("趋势以北京时间分日，保留零记录日期", () => {
    const data = fixture();
    data.records!.push(entity("before-midnight", { courseId: "current", status: "VALID" }, "student-1", "2026-10-11T15:59:00Z"));
    const view = buildSportsDashboard(data, "semester", "", 7);
    expect(shanghaiDate("2026-10-11T16:01:00Z")).toBe("2026-10-12");
    expect(view.trend).toHaveLength(7);
    expect(view.trend.at(-1)).toEqual({ day: "2026-10-12", total: 1, valid: 0 });
    expect(view.trend.at(-2)).toEqual({ day: "2026-10-11", total: 1, valid: 1 });
    expect(view.trend[0].total).toBe(0);
  });
  it("课程筛选同时约束成员、记录与统计，不跨课程混合", () => {
    const data = fixture();
    data.courses!.push(entity("other", { semesterId: "semester" }));
    data.records!.push(entity("unknown-status", { courseId: "other", status: "TECHNICAL" }));
    const view = buildSportsDashboard(data, "semester", "other", 30);
    expect(view.records).toHaveLength(1);
    expect(view.groups.find(group => group.key === "other")?.count).toBe(1);
    expect(view.memberCount).toBe(0);
    expect(view.trend).toHaveLength(30);
  });
});
