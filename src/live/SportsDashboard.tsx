import { useId, useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronRight, CircleHelp, Clock3, Database, ExternalLink, Layers3, RefreshCw, Search, ShieldCheck, Timer, Users, WifiOff } from "lucide-react";
import { buildSportsDashboard, type SportsDashboardData } from "./sportsDashboardModel";

const platformUrl = import.meta.env.VITE_SPORTS_TEACHER_URL || "https://www.teacher.bnbusports.cn/#admin/accounts";
const format = (value: number | null | undefined) => value == null ? "—" : value.toLocaleString("zh-CN");
const courseStatus: Record<string, string> = { DRAFT: "草稿", PUBLISHED: "已发布", CLOSED: "已关闭" };

function CourtIllustration() {
  return <svg className="sports-court" viewBox="0 0 390 210" fill="none" aria-hidden="true">
    <g transform="translate(26 22) rotate(-9 170 85)">
      <rect x="15" y="10" width="330" height="168" rx="84" fill="white" fillOpacity=".06" stroke="white" strokeOpacity=".26" />
      {[0, 1, 2, 3].map(i => <rect key={i} x={26 + i * 12} y={21 + i * 12} width={308 - i * 24} height={146 - i * 24} rx={73 - i * 12} stroke="white" strokeOpacity=".24" />)}
      <path d="M176 10V57M176 131v47M224 17v34M239 138v32" stroke="white" strokeOpacity=".5" />
      <circle cx="86" cy="47" r="8" fill="#bcebc8" /><circle cx="86" cy="47" r="16" stroke="#bcebc8" strokeOpacity=".3" strokeWidth="5" />
      <path d="m244 97 13-14 11 7 16-22" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m274 68 11-1-1 11" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </g>
    <rect x="235" y="151" width="131" height="35" rx="17.5" fill="white" />
    <circle cx="254" cy="168" r="5" fill="#2159f5" />
    <text x="267" y="172" fill="#1748c9" fontSize="10" fontWeight="700" letterSpacing="1">KEEP MOVING</text>
  </svg>;
}

function TrendChart({ items, allowed }: { items: ReturnType<typeof buildSportsDashboard>["trend"]; allowed: boolean }) {
  const gradientId = useId();
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const max = Math.max(4, ...items.map(item => item.total));
  const step = 580 / Math.max(1, items.length - 1);
  const path = items.map((item, index) => `${index ? "L" : "M"}${40 + index * step},${172 - item.total / max * 130}`).join(" ");
  return <div className="sports-trend-plot">
    <svg viewBox="0 0 660 220" role="img" aria-label={allowed ? `按提交日期统计：最近 ${items.length} 天共 ${total} 条记录` : "当前身份未提供运动记录统计"}>
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3871ff" stopOpacity=".22" /><stop offset="100%" stopColor="#3871ff" stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="40" x2="628" y1={172 - i * 32.5} y2={172 - i * 32.5} stroke="#e9eef7" strokeDasharray="4 5" /><text x="22" y={176 - i * 32.5} textAnchor="end">{allowed && total ? Math.round(max * i / 4) : ""}</text></g>)}
      {allowed && total > 0 && <>
        <path d={`${path} L620,172 L40,172 Z`} fill={`url(#${gradientId})`} />
        <path d={path} stroke="#2159f5" strokeWidth="3" fill="none" strokeLinejoin="round" />
        {items.map((item, i) => <circle key={item.day} cx={40 + i * step} cy={172 - item.total / max * 130} r="4" fill="white" stroke="#2159f5" strokeWidth="2"><title>{item.day}：{item.total} 条提交，其中 {item.valid} 条当前有效</title></circle>)}
      </>}
      {items.filter((_, i) => items.length === 7 || i % 5 === 0 || i === items.length - 1).map(item => <text key={item.day} x={40 + items.indexOf(item) * step} y="204" textAnchor="middle">{item.day.slice(5).replace("-", "/")}</text>)}
    </svg>
    {(!allowed || !total) && <div className="sports-chart-empty"><Activity size={24} /><strong>{allowed ? "这段时间暂无提交记录" : "当前身份未提供记录统计"}</strong><span>{allowed ? "有新的运动记录后，趋势将在这里呈现" : "请在体育平台查看获授权的数据"}</span></div>}
  </div>;
}

export function SportsDashboard({ data, role, loading = false, onRefresh, sourceLabel, notice }: {
  data: SportsDashboardData | null;
  role: "student" | "teacher";
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  sourceLabel: string;
  notice?: string;
}) {
  const [semesterChoice, setSemesterChoice] = useState("");
  const [courseChoice, setCourseChoice] = useState("");
  const [days, setDays] = useState(7);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const semesters = data?.semesters ?? [];
  const semester = semesters.find(item => item.id === semesterChoice) ?? semesters.find(item => item.data.status === "CURRENT");
  const gated = data?.firstLoginOnly || data?.system?.mode === "MAINTENANCE";
  const summary = data && !gated ? buildSportsDashboard(data, semester?.id ?? "", "", days) : null;
  const courseId = summary?.courses.some(item => item.id === courseChoice) ? courseChoice : "";
  const view = data && !gated ? buildSportsDashboard(data, semester?.id ?? "", courseId, days) : null;
  const rows = view?.rows.filter(row => String(row.course.data.name).toLowerCase().includes(search.trim().toLowerCase())) ?? [];
  const totalRecords = view?.canReadRecords ? view.records.length : null;
  const validCount = view?.groups.find(group => group.key === "valid")?.count ?? 0;
  const validPercent = totalRecords ? Math.round(validCount / totalRecords * 100) : null;
  let offset = 0;
  const segments = view?.groups.map(group => {
    const start = offset; offset += totalRecords ? group.count / totalRecords * 100 : 0;
    return `${group.color} ${start}% ${offset}%`;
  }).join(", ");
  const scopeLabel = (view?.role ?? role) === "student" ? "我的有效课程" : "我的教学课程";
  const now = data ? new Date(data.serverNow).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "尚未读取";
  const dayDetail = view?.trend.find(item => item.day === selectedDay);

  function exportSummary() {
    if (!view) return;
    const cell = (value: unknown) => `"${String(value ?? "未提供").replace(/^\s*[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const csv = [
      ["数据来源", sourceLabel],
      ["读取时间（北京时间）", now],
      ["学期", semester?.data.name ?? "未提供"],
      ["课程", "状态", "有效成员人数", "确认进度累计分钟", "提交记录数"],
      ...rows.map(row => [row.course.data.name, courseStatus[String(row.course.data.status)] ?? "未提供", row.memberCount, row.minutes, row.records]),
    ].map(row => row.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "体育课程-只读摘要.csv"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="sports-dashboard" aria-busy={loading}>
    <section className="sports-hero">
      <div className="sports-hero-copy"><span className="sports-eyebrow"><Activity size={14} /> BNBU SPORTS</span><h2>让每一次运动，<br />都有迹可循。</h2><p>课程、运动与进度，一眼了解。</p><a href={platformUrl} target="_blank" rel="noopener noreferrer">进入体育平台 <ArrowUpRight size={16} /></a></div>
      <CourtIllustration />
    </section>

    <div className="sports-source-note"><Database size={17} /><div><strong>{sourceLabel}</strong><span>{data ? "只读展示当前账号获授权的课程和运动进度。" : "接通后展示获授权数据；未读取的数值显示为 —。"}</span></div><a href={platformUrl} target="_blank" rel="noopener noreferrer">体育平台 <ExternalLink size={13} /></a></div>

    <div className="sports-toolbar">
      <div className="sports-section-title"><span className="sports-title-icon"><BarIcon /></span><div><h3>运动数据总览</h3><p>{scopeLabel} · 按学期统计</p></div></div>
      <div className="sports-filters"><label><CalendarDays size={15} /><select aria-label="选择学期" value={semester?.id ?? ""} onChange={event => { setSemesterChoice(event.target.value); setCourseChoice(""); }} disabled={!semesters.length}><option value="" disabled>暂无学期</option>{semesters.map(item => <option key={item.id} value={item.id}>{String(item.data.name)}</option>)}</select></label><button type="button" onClick={() => void onRefresh?.()} disabled={loading || !onRefresh} aria-label="刷新体育数据"><RefreshCw size={15} className={loading ? "sports-spinning" : ""} />{loading ? "读取中" : "刷新"}</button></div>
    </div>
    {notice && <div className="sports-error" role="status"><WifiOff size={18} /><span>{notice}</span></div>}
    {gated && <div className="sports-error" role="status"><ShieldCheck size={18} /><span>{data?.firstLoginOnly ? "请先在体育平台完成首次密码修改，再查看统计。" : "体育服务维护中，统计暂不可用。"}</span></div>}
    <div className="sports-metrics">
      {[
        { label: "所选学期课程", value: view?.selectedCourses.length, unit: "门", note: scopeLabel, icon: BookOpen, tone: "blue" },
        { label: (view?.role ?? role) === "student" ? "有效课程成员（本人）" : "有效课程成员", value: view?.memberCount, unit: "人", note: view?.canReadRecords ? "当前有效成员 · 按账号去重" : "当前身份未提供此统计", icon: Users, tone: "violet" },
        { label: "已确认运动进度", value: view?.confirmedMinutes, unit: "分钟", note: view?.confirmedMinutes == null ? "尚无可用的确认进度" : "所选课程的服务端计入累计", icon: Timer, tone: "green" },
        { label: "待完成处理", value: view?.pendingCount, unit: "条", note: view?.canReadRecords ? "检查、补证及技术处理中" : "当前身份未提供此统计", icon: Clock3, tone: "amber" },
      ].map(metric => <article className={`sports-metric sports-tone-${metric.tone}`} key={metric.label}><div><span>{metric.label}</span><i><metric.icon size={18} /></i></div><strong>{loading && !data ? "—" : format(metric.value)}<small>{metric.unit}</small></strong><p>{metric.note}</p></article>)}
    </div>

    <div className="sports-analysis-grid">
      <section className="sports-panel sports-trend"><div className="sports-panel-heading"><div><h3>运动提交趋势</h3><p>按提交日期 · 北京时间</p></div><div className="sports-segmented" aria-label="趋势时间范围">{[7, 30].map(value => <button key={value} type="button" aria-pressed={days === value} onClick={() => { setDays(value); setSelectedDay(""); }}>近 {value} 天</button>)}</div></div>
        <div className="sports-trend-meta"><strong>{format(view?.canReadRecords ? view.trend.reduce((sum, item) => sum + item.total, 0) : null)}<small>条提交</small></strong><span><i />运动记录</span></div>
        <TrendChart items={view?.trend ?? []} allowed={!!view?.canReadRecords} />
        <div className="sports-chart-caption"><span>{dayDetail ? `${dayDetail.day}：${dayDetail.total} 条提交 · ${dayDetail.valid} 条当前有效` : "提交数量不等于最终有效或已计入数量"}</span><select aria-label="查看每日提交数" value={selectedDay} onChange={event => setSelectedDay(event.target.value)} disabled={!view?.canReadRecords}><option value="">每日明细</option>{view?.trend.map(item => <option key={item.day} value={item.day}>{item.day.slice(5)} · {item.total} 条</option>)}</select></div>
      </section>
      <section className="sports-panel sports-distribution"><div className="sports-panel-heading"><div><h3>记录状态分布</h3><p>所选学期 · 当前审核状态</p></div><Layers3 size={19} /></div><div className="sports-donut" style={{ background: totalRecords ? `conic-gradient(${segments})` : "#edf1f8" }} role="img" aria-label={totalRecords == null ? "记录统计未提供" : `共 ${totalRecords} 条记录，有效 ${validCount} 条`}><div><strong>{format(totalRecords)}</strong><span>{totalRecords == null ? "暂未提供" : "运动记录"}</span></div></div><div className="sports-legend">{(view?.groups ?? []).map(group => <div key={group.key}><span><i style={{ background: group.color }} />{group.label}</span><strong>{view?.canReadRecords ? group.count : "—"}</strong></div>)}</div><div className="sports-distribution-foot"><ShieldCheck size={14} /><span>有效记录占比</span><strong>{validPercent == null ? "—" : `${validPercent}%`}</strong></div></section>
    </div>

    <section className="sports-panel sports-course-panel"><div className="sports-panel-heading"><div><h3>{scopeLabel} <span className="sports-count">{format(view?.selectedCourses.length)}</span></h3><p>进度以服务端已确认记录为准</p></div><button className="sports-text-button" type="button" disabled={!view || !rows.length} onClick={exportSummary}><ArrowDownToLine size={15} />导出摘要</button></div><div className="sports-course-tools"><label className="sports-search"><Search size={16} /><input aria-label="搜索课程" placeholder="搜索课程名称…" value={search} onChange={event => setSearch(event.target.value)} /></label><select aria-label="筛选课程" value={courseId} onChange={event => setCourseChoice(event.target.value)}><option value="">全部课程</option>{summary?.courses.map(course => <option key={course.id} value={course.id}>{String(course.data.name)}</option>)}</select></div>
      <div className="sports-table-wrap"><table><thead><tr><th>课程名称</th><th>课程状态</th><th>有效成员</th><th>确认进度累计</th><th>运动记录</th></tr></thead><tbody>{rows.map(({ course, memberCount, minutes, records }) => <tr key={course.id}><td><div className="sports-course-name"><span><BookOpen size={17} /></span><div><strong>{String(course.data.name)}</strong><small>{String(semester?.data.name ?? "")}</small></div></div></td><td><span className={`sports-course-status ${course.data.status === "PUBLISHED" ? "is-published" : ""}`}>{course.data.status === "PUBLISHED" && <Check size={12} />}{courseStatus[String(course.data.status)] ?? "状态未提供"}</span></td><td>{format(memberCount)} <small>人</small></td><td><strong>{format(minutes)}</strong> <small>分钟</small></td><td>{format(records)} <small>条</small></td></tr>)}</tbody></table></div>
      {!rows.length && <div className="sports-table-empty"><BookOpen size={26} /><strong>{search ? "没有匹配的课程" : loading ? "正在读取课程…" : "暂无可展示的课程"}</strong><span>{search ? "试试其他课程名称" : "当前学期有获授权的课程后，将展示在这里"}</span>{search && <button type="button" onClick={() => setSearch("")}>清除搜索</button>}</div>}
    </section>

    <div className="sports-bottom-grid"><a className="sports-platform-card" href={platformUrl} target="_blank" rel="noopener noreferrer"><span className="sports-platform-icon"><Activity size={25} /></span><div><small>BNBU SPORTS</small><h3>前往体育平台</h3><p>课程管理、运动审核与完整记录</p></div><ArrowUpRight size={22} /></a><div className="sports-help-card"><CircleHelp size={22} /><div><h3>数据怎么看？</h3><p>“—”表示尚未提供，0 表示当前统计为零。已确认进度、有效记录与提交记录分别计算。</p></div></div></div>
    <footer className="sports-footer"><span><Database size={12} />体育平台只读展示 · 仅显示当前账号可读范围</span><span>最后读取 {now} <ChevronRight size={12} /></span></footer>
  </div>;
}

function BarIcon() { return <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 15V9m6 6V4m6 11v-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>; }
