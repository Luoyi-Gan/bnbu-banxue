import { afterEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { SportsProgressCard } from "../src/v2/SportsProgressCard";
import { mapSportsProgress } from "../src/v2/sportsProgress";
import { api } from "../src/live/api";
import { SportsPortal } from "../src/live/SportsPortal";
import type { SportsCompanion } from "../src/live/sportsCompanion";

afterEach(() => vi.unstubAllGlobals());
const card = (sports?: SportsCompanion | null) => renderToStaticMarkup(<MemoryRouter><SportsProgressCard sports={sports}/></MemoryRouter>);
const progress = (hours: number) => mapSportsProgress({ courses: [{isCurrent: true, enrollmentStatus: "enrolled", name: "羽毛球", semester: "本学期"}], progress: {totalValidHours: hours}, hourRule: {total: 20} }, "local");

it("无账号摘要、无确认进度及教师身份不渲染学生卡片", () => {
  expect(card()).toBe("");
  expect(card(null)).toBe("");
  expect(card({source: "local", role: "student", progress: null})).toBe("");
  expect(card({source: "local", role: "teacher", progress: progress(10.5)})).toBe("");
});
it("服务端确认小时呈现圆环与剩余时长，确认零值不隐藏", () => {
  const html = card({source: "local", role: "student", progress: progress(10.5)});
  expect(html).toContain("52<small>%</small>");
  expect(html).toContain("10.5");
  expect(html).toContain("9.5");
  expect(html).toContain("本地体育库");
  expect(card({source: "local", role: "student", progress: progress(0)})).toContain("体育打卡进度");
});
it("普通教师只看到无体育记录状态，不依据校园角色显示统计", () => {
  const html = renderToStaticMarkup(<MemoryRouter><SportsPortal workspace={{account:{id: "teacher",name: "教师",roles:["teacher"]},sports:null}}/></MemoryRouter>);
  expect(html).toContain("暂无已接入的体育记录");
  expect(html).not.toContain("运动数据总览");
});
it("未连接服务返回 HTML 或无效身份时拒绝展示数据", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("<html>app</html>", {status: 200})).mockResolvedValueOnce(new Response("{}",{status: 200})));
  await expect(api("/api/workspace")).rejects.toThrow("尚未连接");
  await expect(api("/api/sports/workspace")).rejects.toThrow("有效身份");
});
it("数据请求使用当前会话且不缓存；未登录明确报错", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('{"message":"请先登录"}',{status:401}));
  vi.stubGlobal("fetch", fetcher);
  await expect(api("/api/workspace")).rejects.toThrow("请先登录");
  expect(fetcher).toHaveBeenCalledWith("/api/workspace", expect.objectContaining({credentials:"same-origin",cache:"no-store"}));
});
