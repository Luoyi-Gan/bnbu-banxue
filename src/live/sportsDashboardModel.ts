import type { LiveEntity } from "./api";

export interface SportsDashboardData {
  identity: LiveEntity;
  serverNow: number;
  firstLoginOnly?: boolean;
  system?: { mode: string };
  semesters?: LiveEntity[];
  courses?: LiveEntity[];
  enrollments?: LiveEntity[];
  records?: LiveEntity[];
  progress?: LiveEntity[];
}

export const recordGroups = [
  { key: "valid", label: "有效记录", color: "#2159f5" },
  { key: "pending", label: "等待检查", color: "#8ba7fc" },
  { key: "supplement", label: "待补充材料", color: "#f4ad57" },
  { key: "invalid", label: "无效记录", color: "#e58090" },
  { key: "other", label: "传输 / 技术处理", color: "#c5cede" },
] as const;

export function recordGroup(status: unknown) {
  if (status === "VALID") return "valid";
  if (status === "INVALID") return "invalid";
  if (status === "PENDING_AI" || status === "TEACHER_PENDING") return "pending";
  if (status === "SUPPLEMENT_REQUIRED") return "supplement";
  return "other";
}

export function shanghaiDate(time: number | string) {
  const date = new Date(time);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
    : "";
}

function confirmedTotal(items: LiveEntity[]) {
  if (!items.length || items.some(item => typeof item.data.total !== "number" || !Number.isFinite(item.data.total) || item.data.total < 0)) return null;
  return items.reduce((sum, item) => sum + (item.data.total as number), 0);
}

export function buildSportsDashboard(data: SportsDashboardData, semesterId: string, courseId: string, days: number) {
  const role = String(data.identity.data.role);
  const student = role === "student";
  const canReadRecords = student || role === "teacher";
  const memberships = (data.enrollments ?? []).filter(item => item.data.status === "ACTIVE" && (!student || item.ownerId === data.identity.ownerId));
  const courses = (data.courses ?? []).filter(course => course.data.semesterId === semesterId &&
    (!student || memberships.some(item => item.data.courseId === course.id)));
  const selectedCourses = courses.filter(course => !courseId || course.id === courseId);
  const ids = new Set(selectedCourses.map(course => course.id));
  const scoped = (items: LiveEntity[] = []) => items.filter(item => ids.has(String(item.data.courseId)) && (!student || item.ownerId === data.identity.ownerId));
  const records = canReadRecords ? scoped(data.records) : [];
  const members = canReadRecords ? scoped(memberships) : [];
  // Keep only the newest server projection for each person/course, never add history.
  const latest = new Map<string, LiveEntity>();
  for (const item of canReadRecords ? scoped(data.progress) : []) {
    const key = `${item.ownerId}:${item.data.courseId}`;
    const previous = latest.get(key);
    if (!previous || Number(item.data.sequence ?? 0) > Number(previous.data.sequence ?? 0)) latest.set(key, item);
  }
  const progress = [...latest.values()];
  const anchor = shanghaiDate(data.serverNow);
  const midnight = Date.parse(`${anchor}T00:00:00+08:00`);
  const trend = Array.from({ length: days }, (_, index) => {
    const day = shanghaiDate(midnight - (days - index - 1) * 86_400_000);
    const items = records.filter(record => shanghaiDate(record.createdAt) === day);
    return { day, total: items.length, valid: items.filter(item => item.data.status === "VALID").length };
  });
  const groups = recordGroups.map(group => ({ ...group, count: records.filter(record => recordGroup(record.data.status) === group.key).length }));
  return {
    role, canReadRecords, courses, selectedCourses, records, trend, groups,
    memberCount: canReadRecords ? new Set(members.map(item => item.ownerId).filter(Boolean)).size : null,
    confirmedMinutes: canReadRecords ? confirmedTotal(progress) : null,
    pendingCount: canReadRecords ? records.filter(record => !["VALID", "INVALID"].includes(String(record.data.status))).length : null,
    rows: selectedCourses.map(course => ({
      course,
      memberCount: canReadRecords ? new Set(members.filter(item => item.data.courseId === course.id).map(item => item.ownerId).filter(Boolean)).size : null,
      minutes: canReadRecords ? confirmedTotal(progress.filter(item => item.data.courseId === course.id)) : null,
      records: canReadRecords ? records.filter(item => item.data.courseId === course.id).length : null,
    })),
  };
}
