import { useEffect, useState } from "react";
import { api, sportsChangedEvent, type LiveEntity } from "./api";
import type { Field, OpenForm } from "./ConnectedApp";
import { SportsMaterials, type MaterialData } from "./SportsMaterials";
import { SportsReview, type ReviewData } from "./SportsReview";
import { SportsSystem, type SportsSystemData } from "./SportsSystem";
import { SportsCalendar, type CalendarData } from "./SportsCalendar";
import { SportsIncidents, type IncidentData } from "./SportsIncidents";
import { SportsSwimStart } from "./SportsSwimStart";
import { SportsRosterFiles } from "./SportsRosterFiles";
import { SportsReport } from "./SportsReport";
import { SportsApplications } from "./SportsApplications";
import { SportsSettlement } from "./SportsSettlement";
import { SportsRoster, type RosterCheck } from "./SportsRoster";
import { SportsOcr } from "./SportsOcr";
import { SportsWorkbook } from "./SportsWorkbook";
import { SportsEnduranceImport } from "./SportsEnduranceImport";
import { SportsEndurance } from "./SportsEndurance";
import { SportsHistoricalRemarks } from "./SportsHistoricalRemarks";
import { SportsGrades } from "./SportsGrades";
import { SportsConversion } from "./SportsConversion";
import { SportsHelp } from "./SportsHelp";
import { SportsFeedback } from "./SportsFeedback";
import { SportsAccountDirectory } from "./SportsAccountDirectory";
import { SportsAdministrators } from "./SportsAdministrators";
import { SportsAdminClosure } from "./SportsAdminClosure";
import { SportsAdminEmail } from "./SportsAdminEmail";
import { SportsTeacherAccounts } from "./SportsTeacherAccounts";
import { SportsCourseManagement } from "./SportsCourseManagement";

interface SportsData
  extends
    MaterialData,
    ReviewData,
    SportsSystemData,
    CalendarData,
    IncidentData {
  identity: LiveEntity;
  settlementPreparations?: LiveEntity[];
  settlementReports?: LiveEntity[];
  applications?: LiveEntity[];
  applicationHistory?: LiveEntity[];
  certifications?: LiveEntity[];
  exemptions?: LiveEntity[];
  certificationHistory?: LiveEntity[];
  firstLoginOnly?: boolean;
  teacherImports?: LiveEntity[];
  conversionTables?: LiveEntity[];
  rosterSources?: LiveEntity[];
  rosterDrafts?: LiveEntity[];
  rosterSnapshots?: LiveEntity[];
  rosterBases?: LiveEntity[];
  rosterChecks?: RosterCheck[];
  studentRosterChecks?: { courseId: string; status: string }[];
  rosterSummaries?: {
    courseId: string;
    denominator: number | null;
    completeCount: number;
    incompleteCount: number;
    conflictCount: number;
    outsideCount: number;
  }[];
  enduranceSources?: LiveEntity[];
  enduranceImports?: LiveEntity[];
  enduranceRecords?: LiveEntity[];
  enduranceHistory?: LiveEntity[];
  gradeDrafts?: LiveEntity[];
  gradePublications?: LiveEntity[];
  feedback?: LiveEntity[];
  feedbackReplies?: LiveEntity[];
  canManageFeedback?: boolean;
  administratorAccess?: { superAdmin: boolean; permissions: string[] };
  semesters: LiveEntity[];
  templates: LiveEntity[];
  courses: LiveEntity[];
  enrollments: LiveEntity[];
  invitations: LiveEntity[];
  enrollmentFlows?: LiveEntity[];
  makeups?: LiveEntity[];
  studentStatus?: string;
  sessions: LiveEntity[];
  serverNow: number;
  recoveryCourses?: LiveEntity[];
}
const field = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  value?: string | number,
): Field => ({ key, label, type, value });
const select = (key: string, label: string, items: LiveEntity[]): Field => ({
  key,
  label,
  type: "select",
  options: items.map((i) => ({ value: i.id, label: String(i.data.name) })),
});
const date = (v: unknown) =>
  new Date(String(v)).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });
const states: Record<string, string> = {
  UPCOMING: "即将开始",
  CURRENT: "当前学期",
  ARCHIVED: "已归档",
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  CLOSED: "已关闭",
  ACTIVE: "进行中",
  PAUSED: "已暂停",
  ENDED: "已结束",
  REVOKED: "已撤销",
};
export function LiveSports({
  open,
  run,
  busy,
}: {
  open: OpenForm;
  run: (action: string, input: Record<string, unknown>) => Promise<void>;
  busy: boolean;
}) {
  const [data, setData] = useState<SportsData | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true,
      inFlight = false;
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const result = await api<SportsData>("/api/sports/workspace");
        if (alive) {
          setData(result);
          setError("");
        }
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "体育服务暂不可用。");
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const onChange = () => {
      void refresh();
    };
    window.addEventListener(sportsChangedEvent, onChange);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 2500);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener(sportsChangedEvent, onChange);
    };
  }, []);
  if (!data)
    return (
      <p className="v2-panel live-card" role={error ? "alert" : undefined}>
        {error || "正在读取体育服务…"}
      </p>
    );
  const role = data.identity.data.role;
  const changePassword = (
    <button
      disabled={busy}
      onClick={() =>
        open(
          "修改本人密码",
          "sports.password.change",
          [
            { key: "currentPassword", label: "当前密码", type: "password" },
            { key: "newPassword", label: "新密码", type: "password" },
            {
              key: "confirmPassword",
              label: "再次填写新密码",
              type: "password",
            },
          ],
          { version: data.identity.version },
        )
      }
    >
      修改本人密码（其他登录将失效）
    </button>
  );
  if (data.firstLoginOnly)
    return (
      <section className="v2-panel live-card">
        <h2>首次登录须修改个人密码</h2>
        {data.system?.mode === "MAINTENANCE" && (
          <SportsSystem data={data} open={open} busy={busy} />
        )}
        {role === "admin" || data.system?.mode !== "MAINTENANCE" ? (
          changePassword
        ) : (
          <p>维护期间教师暂不能改密，请在恢复正常后继续。</p>
        )}
        {error && <p role="alert">{error}</p>}
      </section>
    );
  if (data.system?.mode === "MAINTENANCE")
    return (
      <>
        {error && <p role="alert">{error}</p>}
        <SportsSystem data={data} open={open} busy={busy} />
        {role === "admin" && changePassword}
        {data.canGovernAi && (
          <SportsReview
            data={{ ...data, courses: data.recoveryCourses ?? [] }}
            role={role}
            open={open}
            run={run}
            busy={busy}
          />
        )}
      </>
    );
  const action = (
    text: string,
    name: string,
    input: Record<string, unknown>,
  ) => (
    <button
      className="v2-button v2-button-secondary"
      disabled={busy}
      onClick={() => void run(name, input)}
    >
      {text}
    </button>
  );
  const version = (e: LiveEntity) => ({ id: e.id, version: e.version });
  const running = data.sessions.find(
    (s) => (s.data.clock as { state: string }).state !== "ENDED",
  );
  return (
    <>
      <SportsSystem data={data} open={open} busy={busy} />
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      <section className="v2-panel live-card">
        <h2>体育课程 · V8.1</h2>
        <p>
          {role === "student"
            ? "学生"
            : role === "teacher"
              ? "责任教师"
              : "体育管理员"}{" "}
          ·{" "}
          {data.identity.data.source === "local-acceptance"
            ? "独立本地验收身份"
            : "学校体育身份"}
        </p>
        <p>
          按课程规则完成运动并提交凭证。实际时长、可计分钟与最终计入分开，材料提交成功不代表审核通过。
        </p>
      </section>
      {role === "teacher" && <SportsHistoricalRemarks />}
      {data.administratorAccess?.superAdmin && <SportsAdministrators />}
      {role === "admin" && <SportsAdminEmail />}
      {role === "admin" &&
        data.identity.data.source === "SUPERADMIN_CONFIRMED_PERSON" && (
          <SportsAdminClosure />
        )}
      {data.administratorAccess?.permissions.includes("ACCOUNTS") && (
        <SportsAccountDirectory />
      )}
      <SportsReview data={data} role={role} open={open} run={run} busy={busy} />
      <SportsCalendar data={data} open={open} busy={busy} />
      {data.administratorAccess?.permissions.includes("GLOBAL_RULES") && (
        <SportsConversion
          tables={data.conversionTables ?? []}
          open={open}
          busy={busy}
        />
      )}
      {(role === "student" ||
        data.administratorAccess?.permissions.includes("HELP")) && (
        <SportsHelp />
      )}
      <SportsFeedback
        items={data.feedback ?? []}
        replies={data.feedbackReplies ?? []}
        manage={data.canManageFeedback === true}
        student={role === "student"}
        open={open}
        busy={busy}
      />
      {data.administratorAccess?.permissions.includes("ACCOUNTS") && (
        <SportsTeacherAccounts
          imports={data.teacherImports ?? []}
          open={open}
          busy={busy}
        />
      )}
      {(role === "teacher" || role === "admin") && changePassword}
      <SportsIncidents data={data} open={open} busy={busy} />
      {role === "admin" && (
        <>
          <div className="live-toolbar">
            <button
              className="v2-button v2-button-primary"
              disabled={
                !data.administratorAccess?.permissions.includes("SEMESTERS")
              }
              onClick={() =>
                open("创建体育学期", "sports.semester.create", [
                  field("name", "学期名称"),
                  field("academicYear", "学年（如2026-2027）"),
                  {
                    key: "type",
                    label: "学期类型",
                    type: "select",
                    options: [
                      { value: "FIRST", label: "第一学期" },
                      { value: "SECOND", label: "第二学期" },
                      { value: "SUMMER", label: "暑期" },
                    ],
                  },
                  field("startDate", "开始日期", "date"),
                  field("endDate", "结束日期", "date"),
                ])
              }
            >
              创建学期
            </button>
            <button
              className="v2-button v2-button-secondary"
              disabled={!data.administratorAccess?.superAdmin}
              onClick={() =>
                open("发布V8.1模板", "sports.template.publish", [
                  field("name", "模板名称"),
                ])
              }
            >
              发布规则模板
            </button>
          </div>
          <div className="live-cards">
            {data.semesters.map((s) => (
              <article className="v2-panel live-card" key={s.id}>
                <h3>{String(s.data.name)}</h3>
                <p>
                  {String(s.data.startDate)} — {String(s.data.endDate)} ·{" "}
                  {states[String(s.data.status)]}
                </p>
                {s.data.status === "UPCOMING" &&
                  data.administratorAccess?.permissions.includes("SEMESTERS") &&
                  action(
                    "切换为当前学期",
                    "sports.semester.activate",
                    version(s),
                  )}
              </article>
            ))}
          </div>
        </>
      )}
      {role === "teacher" && (
        <button
          className="v2-button v2-button-primary"
          onClick={() =>
            open("创建体育课程草稿", "sports.course.save", [
              field("name", "课程名称"),
              field("description", "课程说明", "textarea"),
              select(
                "semesterId",
                "当前学期",
                data.semesters.filter((s) => s.data.status === "CURRENT"),
              ),
              select("templateId", "规则模板", data.templates),
              field("threshold", "起算分钟（30/45/60）", "number", 30),
              field("weeklyLimit", "每周计入条数（2/3/4）", "number", 3),
              {
                ...field(
                  "relatedTarget",
                  "课程相关运动目标分钟",
                  "number",
                  600,
                ),
                min: 0,
              },
              {
                ...field("otherTarget", "其他运动目标分钟", "number", 600),
                min: 0,
              },
              field("startDate", "开始日期", "date"),
              field("deadlineDate", "常规截止日期", "date"),
              field("settlementDate", "结算日期（收尾七天之后）", "date"),
              field("startTime", "每日开始时间", "time", "06:00"),
              field("endTime", "每日结束时间", "time", "22:00"),
            ])
          }
        >
          创建课程
        </button>
      )}
      {role === "student" && (
        <button
          className="v2-button v2-button-primary"
          onClick={() =>
            open("登记邀请并核对教学班", "sports.enrollment.begin", [
              field("code", "邀请码"),
            ])
          }
        >
          输入邀请码入班
        </button>
      )}
      {role === "student" &&
        (data.enrollmentFlows ?? [])
          .filter((f) => f.data.status === "OPEN")
          .map((f) => (
            <article key={f.id} className="v2-panel live-card">
              <h3>{String(f.data.courseName)}</h3>
              <p>
                {String(f.data.semesterName)} · {String(f.data.teacherName)}
              </p>
              <p>
                本次流程最晚完成时间：
                {date(new Date(Number(f.data.deadline)).toISOString())}
                。邀请撤销、关闭入班或学期失效会立即终止资格。
              </p>
              {f.data.canComplete ? (
                action("确认加入教学班", "sports.enrollment.join", {
                  flowId: f.id,
                })
              ) : (
                <p>本次流程已不可继续，请取得新邀请。</p>
              )}
            </article>
          ))}
      <h2>体育课程</h2>
      <div className="live-cards">
        {data.courses.map((c) => (
          <article className="v2-panel live-card" key={c.id}>
            <h3>{String(c.data.name)}</h3>
            {role === "teacher" && (
              <SportsSettlement
                course={c}
                preparations={data.settlementPreparations ?? []}
                reports={data.settlementReports ?? []}
                open={open}
                busy={busy}
              />
            )}
            {(role === "student" || role === "teacher") && (
              <SportsApplications
                course={c}
                applications={data.applications ?? []}
                history={data.applicationHistory ?? []}
                creditHistory={data.certificationHistory ?? []}
                credits={data.certifications ?? []}
                exemptions={data.exemptions ?? []}
                teacher={role === "teacher"}
                canApply={data.enrollments.some(
                  (m) => m.data.courseId === c.id && m.data.status === "ACTIVE",
                )}
                open={open}
                busy={busy}
              />
            )}
            {role === "teacher" && <SportsReport key={c.version} course={c} />}
            {role === "teacher" && (
              <SportsOcr
                purpose="ROSTER"
                course={c}
                sources={data.rosterSources ?? []}
                open={open}
                busy={busy}
              />
            )}
            {role === "teacher" && (
              <SportsRosterFiles
                course={c}
                sources={data.rosterSources ?? []}
                open={open}
                busy={busy}
              />
            )}
            {role === "student" &&
              data.studentRosterChecks
                ?.filter((r) => r.courseId === c.id)
                .map((r) => (
                  <p key={r.courseId}>
                    本人学校名单核对：
                    {
                      (
                        {
                          COMPLETE: "注册入班匹配完成",
                          INCOMPLETE: "注册或入班条件尚未全部完成",
                          CONFLICT: "身份资料需教师核对",
                          OUTSIDE: "当前学校名单未匹配到本人",
                        } as Record<string, string>
                      )[r.status]
                    }
                  </p>
                ))}
            {role === "admin" &&
              data.rosterSummaries
                ?.filter((r) => r.courseId === c.id)
                .map((r) => (
                  <p key={r.courseId}>
                    名单治理摘要：分母{r.denominator ?? "核对中"}，匹配完成
                    {r.completeCount}，未完成{r.incompleteCount}，冲突
                    {r.conflictCount}，名单外{r.outsideCount}。
                  </p>
                ))}
            {role === "teacher" && (
              <SportsRoster
                course={c}
                drafts={data.rosterDrafts ?? []}
                snapshots={data.rosterSnapshots ?? []}
                bases={data.rosterBases ?? []}
                checks={data.rosterChecks ?? []}
                open={open}
                busy={busy}
              />
            )}
            {role === "teacher" && (
              <SportsOcr
                course={c}
                sources={data.enduranceSources ?? []}
                open={open}
                busy={busy}
              />
            )}
            {role === "teacher" && (
              <SportsWorkbook
                course={c}
                sources={data.enduranceSources ?? []}
                open={open}
                busy={busy}
              />
            )}
            {role === "teacher" && (
              <SportsEnduranceImport
                course={c}
                imports={data.enduranceImports ?? []}
                open={open}
                busy={busy}
              />
            )}
            {(role === "teacher" || role === "student") && (
              <SportsEndurance
                course={c}
                members={data.enrollments}
                records={data.enduranceRecords ?? []}
                history={data.enduranceHistory ?? []}
                exemptions={data.exemptions ?? []}
                teacher={role === "teacher"}
                open={open}
                busy={busy}
              />
            )}
            {role === "teacher" && (
              <SportsGrades
                course={c}
                members={data.enrollments}
                drafts={data.gradeDrafts ?? []}
                publications={data.gradePublications ?? []}
                open={open}
                busy={busy}
              />
            )}
            <p>{String(c.data.description)}</p>
            <p>
              {states[String(c.data.status)]} · 门槛{String(c.data.threshold)}
              分钟 · 每周{String(c.data.weeklyLimit)}条
            </p>
            <p>
              课程相关 {String(c.data.relatedTarget)} / 其他{" "}
              {String(c.data.otherTarget)} 分钟
            </p>
            <p>
              {String(c.data.startDate)} 至 {String(c.data.deadlineDate)}，每日{" "}
              {String(c.data.startTime)}–{String(c.data.endTime)}
            </p>
            <div className="live-actions">
              {role === "teacher" &&
                c.data.status === "DRAFT" &&
                action("核对并发布", "sports.course.publish", version(c))}
              {role === "teacher" && c.data.status === "PUBLISHED" && (
                <>
                  <button
                    className="v2-button v2-button-secondary"
                    onClick={() =>
                      open(
                        "生成入班邀请",
                        "sports.invitation.create",
                        [field("minutes", "有效分钟（5–120）", "number", 30)],
                        { courseId: c.id },
                      )
                    }
                  >
                    生成邀请
                  </button>
                  <button
                    className="v2-button v2-button-secondary"
                    onClick={() =>
                      open(
                        "关闭课程新业务入口",
                        "sports.course.close",
                        [field("reason", "关闭原因", "textarea")],
                        version(c),
                      )
                    }
                  >
                    关闭课程
                  </button>
                </>
              )}
              {role === "student" &&
                c.data.status === "PUBLISHED" &&
                data.enrollments.some(
                  (e) => e.data.courseId === c.id && e.data.status === "ACTIVE",
                ) &&
                !running && (
                  <>
                    {action("开始普通运动", "sports.session.start", {
                      courseId: c.id,
                    })}
                    <SportsSwimStart courseId={c.id} />
                  </>
                )}
            </div>
            {role === "teacher" && (
              <p>
                有效成员：
                {
                  data.enrollments.filter(
                    (e) =>
                      e.data.courseId === c.id && e.data.status === "ACTIVE",
                  ).length
                }
              </p>
            )}
            {role === "teacher" &&
              c.data.settlementStatus !== "SETTLED" &&
              data.semesters.some(
                (s) =>
                  s.id === c.data.semesterId && s.data.status === "CURRENT",
              ) && (
                <SportsCourseManagement
                  course={c}
                  enrollments={data.enrollments}
                  makeups={data.makeups ?? []}
                  open={open}
                  busy={busy}
                />
              )}
            {role === "student" && (
              <p>
                {data.enrollments.some(
                  (e) => e.data.courseId === c.id && e.data.status === "ACTIVE",
                )
                  ? "已进班"
                  : "已退班，保留原记录"}
              </p>
            )}
            {role === "student" &&
              (data.makeups ?? [])
                .filter(
                  (m) => m.data.courseId === c.id && m.data.status === "ACTIVE",
                )
                .map((m) => (
                  <p key={m.id}>
                    指定补练窗口：{date(m.data.startAt)} 至 {date(m.data.endAt)}
                    ，仍遵守课程每日时间及日周上限。
                  </p>
                ))}
          </article>
        ))}
      </div>
      {!data.courses.length && (
        <p className="live-empty">
          暂无课程。教师先创建并发布，学生凭有效邀请入班。
        </p>
      )}
      {role === "teacher" && (
        <>
          <h2>我的邀请</h2>
          <div className="live-cards">
            {data.invitations.map((i) => (
              <article key={i.id} className="v2-panel live-card">
                <h3>
                  {String(
                    data.courses.find((c) => c.id === i.data.courseId)?.data
                      .name ?? "课程邀请",
                  )}
                </h3>
                <p style={{ overflowWrap: "anywhere" }}>
                  邀请码：{String(i.data.code)}
                </p>
                <p>
                  到期：{date(new Date(Number(i.data.expiresAt)).toISOString())}
                </p>
                {i.data.status === "ACTIVE" &&
                  action("撤销邀请", "sports.invitation.revoke", version(i))}
              </article>
            ))}
          </div>
        </>
      )}
      {role === "student" && (
        <>
          <h2>我的运动</h2>
          <div className="live-cards">
            {data.sessions.map((s) => {
              const clock = s.data.clock as {
                state: string;
                startedAt: number;
                businessDate: string;
              };
              const seconds = Math.floor(
                Number(s.data.elapsedMilliseconds) / 1000,
              );
              return (
                <article key={s.id} className="v2-panel live-card">
                  <h3>
                    {states[clock.state]} · {clock.businessDate}
                  </h3>
                  <p>开始：{date(new Date(clock.startedAt).toISOString())}</p>
                  <p>
                    服务器有效计时：{Math.floor(seconds / 60)}分{seconds % 60}秒
                  </p>
                  <p>
                    可计分钟：{Number(s.data.eligibleMinutes)}
                    ；最终计入以审核后进度为准。
                  </p>
                  <div className="live-actions">
                    {clock.state === "ACTIVE" &&
                      action("暂停", "sports.session.pause", version(s))}
                    {clock.state === "PAUSED" &&
                      action("继续", "sports.session.resume", version(s))}
                    {clock.state !== "ENDED" &&
                      action("结束运动", "sports.session.end", version(s))}
                  </div>
                  {clock.state === "ENDED" && (
                    <SportsMaterials session={s} data={data} />
                  )}
                </article>
              );
            })}
          </div>
          <p>
            页面定期读取服务器计时，刷新不会重置。计时本身不证明运动完成；结束后仍需按规则提交凭证。
          </p>
        </>
      )}
    </>
  );
}
