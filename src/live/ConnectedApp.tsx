import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Coffee,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  api,
  ApiError,
  command,
  loadWorkspace,
  sportsChangedEvent,
  type LiveEntity,
  type Workspace,
} from "./api";
import { prepareCommunityImage } from "../v2/communityImages";
import { ManagementTools } from "./ManagementTools";
import { LiveTimetable } from "./LiveTimetable";
import { LiveSports } from "./LiveSports";
import { Modal, PageHeading } from "../v2/ui";
import brandIcon from "../assets/brand/brand-app-icon-a.svg";
import "../v2/v2.css";
import "../v2/aRedesign.css";
import "./live.css";

export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "date"
    | "time"
    | "textarea"
    | "number"
    | "datetime-local"
    | "select"
    | "image"
    | "images"
    | "checkbox";
  min?: number;
  options?: { value: string; label: string }[];
  value?: string | number | boolean;
  optional?: boolean;
  max?: number;
};
export type OpenForm = (
  title: string,
  action: string,
  fields: Field[],
  fixed?: Record<string, unknown>,
) => void;
type ActionForm = {
  title: string;
  action: string;
  fixed?: Record<string, unknown>;
  fields: Field[];
};
const f = (
  key: string,
  label: string,
  type?: Field["type"],
  optional = false,
): Field => ({ key, label, type, optional });
const choices = (key: string, label: string, options: string[]): Field => ({
  key,
  label,
  type: "select",
  options: options.map((value) => ({ value, label: value })),
});
const reason = f("reason", "处理原因", "textarea");
const read = (item: LiveEntity, key: string) =>
  typeof item.data[key] === "string" || typeof item.data[key] === "number"
    ? String(item.data[key])
    : "";
const names: Record<string, string> = {
  pending: "待处理",
  approved: "已通过",
  rejected: "已拒绝",
  visible: "已公开",
  hidden: "已隐藏",
  published: "已发布",
  draft: "未公开",
  open: "招募中",
  finished: "已结束",
  confirmed: "已预约",
  cancelled: "已取消",
  resolved: "已处理",
  upheld: "举报成立",
  active: "正常",
  muted: "禁言",
  banned: "封禁",
  student: "学生",
  teacher: "教师",
  superadmin: "超级管理员",
  operator: "运营",
  reviewer: "审核员",
  unavailable: "时段不可用",
  withdrawn: "已撤回",
  expired: "已过期",
};
const label = (value: unknown) => names[String(value)] ?? String(value ?? "");
const when = (value: unknown) =>
  value
    ? new Date(String(value)).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      })
    : "未提供";

function EditForm({
  form,
  busy,
  error,
  onSubmit,
}: {
  form: ActionForm;
  busy: boolean;
  error: string;
  onSubmit: (input: Record<string, unknown>) => Promise<void>;
}) {
  const [preparing, setPreparing] = useState(false);
  const [preparationError, setPreparationError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    if (busy || preparing) return;
    setPreparing(true);
    setPreparationError("");
    try {
      const data = new FormData(element),
        input: Record<string, unknown> = { ...form.fixed };
      for (const field of form.fields) {
        const value = data.get(field.key);
        if (field.type === "images") {
          const files = data
            .getAll(field.key)
            .filter(
              (value): value is File => value instanceof File && value.size > 0,
            );
          if (files.length > 9) {
            element
              .querySelector<HTMLInputElement>(`[name="${field.key}"]`)
              ?.setCustomValidity("最多九张图片");
            element.reportValidity();
            return;
          }
          input[field.key] = await Promise.all(
            files.map(prepareCommunityImage),
          );
        } else if (field.type === "image") {
          if (value instanceof File && value.size) {
            if (value.size > 5 * 1024 * 1024) {
              element
                .querySelector<HTMLInputElement>(`[name="${field.key}"]`)
                ?.setCustomValidity("图片不能超过 5MB");
              element.reportValidity();
              return;
            }
            input[field.key] = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(value);
            });
            if (field.key === "cover") input.coverName = value.name;
          } else input[field.key] = field.value ?? "";
        } else if (field.type === "number") input[field.key] = Number(value);
        else if (field.type === "checkbox") input[field.key] = value === "on";
        else if (field.type === "datetime-local")
          input[field.key] = value ? new Date(String(value)).toISOString() : "";
        else input[field.key] = String(value ?? "");
      }
      if (
        form.action === "account.update" &&
        form.fields.some((field) => field.key.startsWith("role_"))
      )
        input.roles = form.fields
          .filter(
            (field) =>
              field.key.startsWith("role_") && input[field.key] === true,
          )
          .map((field) => field.key.slice(5));
      if (form.action === "notification.send") {
        input.recipients = form.fields
          .filter(
            (field) =>
              field.key.startsWith("recipient_") && input[field.key] === true,
          )
          .map((field) => field.key.slice("recipient_".length));
        delete input.recipient;
      }
      await onSubmit(input);
    } catch (error) {
      setPreparationError(
        error instanceof Error
          ? error.message
          : "图片读取失败，请重新选择有效图片。",
      );
    } finally {
      setPreparing(false);
    }
  };
  return (
    <form className="live-form" onSubmit={submit}>
      <fieldset disabled={busy || preparing}>
        {form.fields.map((field) => (
          <label key={field.key}>
            <span>
              {field.label}
              {field.optional ? "（选填）" : ""}
            </span>
            {field.type === "textarea" ? (
              <textarea
                name={field.key}
                defaultValue={String(field.value ?? "")}
                required={!field.optional}
                maxLength={field.max ?? 10000}
                rows={4}
              />
            ) : field.type === "select" ? (
              <select
                name={field.key}
                defaultValue={String(field.value ?? "")}
                required={!field.optional}
              >
                <option value="">请选择</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                name={field.key}
                type="checkbox"
                defaultChecked={field.value === true}
              />
            ) : (
              <input
                name={field.key}
                type={
                  field.type === "image" || field.type === "images"
                    ? "file"
                    : (field.type ?? "text")
                }
                multiple={field.type === "images"}
                accept={
                  field.type === "image" || field.type === "images"
                    ? "image/png,image/jpeg,image/webp"
                    : undefined
                }
                defaultValue={
                  field.type === "image" || field.type === "images"
                    ? undefined
                    : String(field.value ?? "")
                }
                required={!field.optional}
                min={field.type === "number" ? (field.min ?? 1) : undefined}
                maxLength={field.max ?? 2000}
                onChange={(event) => event.currentTarget.setCustomValidity("")}
              />
            )}
          </label>
        ))}
      </fieldset>
      {(error || preparationError) && (
        <p className="live-error" role="alert">
          {error || preparationError}
        </p>
      )}
      <button
        className="v2-button v2-button-primary"
        disabled={busy || preparing}
        type="submit"
      >
        {busy ? "正在保存…" : preparing ? "正在准备…" : "确认提交"}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

export function ConnectedApp() {
  const location = useLocation(),
    navigate = useNavigate(),
    module = location.pathname.split("/")[2] || "home";
  const [data, setData] = useState<Workspace | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState<ActionForm | null>(null),
    [formError, setFormError] = useState("");
  const inFlight = useRef(false);
  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setData(await loadWorkspace());
      setError("");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401)
        navigate("/v2/login", { replace: true });
      else setError(cause instanceof Error ? cause.message : "加载失败。");
    } finally {
      inFlight.current = false;
    }
  }, [navigate]);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 5000);
    const focus = () => {
      void refresh();
    };
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  const run = async (action: string, input: Record<string, unknown>) => {
    if (busy) return;
    setBusy(true);
    setFormError("");
    setMessage("");
    try {
      await command(action, input);
      if (action.startsWith("sports.")) window.dispatchEvent(new Event(sportsChangedEvent));
      setForm(null);
      setMessage("已保存到本地服务。");
      await refresh();
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "保存失败。";
      if (form) setFormError(detail);
      else setError(detail);
    } finally {
      setBusy(false);
    }
  };
  const open = (
    title: string,
    action: string,
    fields: Field[],
    fixed: Record<string, unknown> = {},
  ) => {
    setFormError("");
    setForm({ title, action, fields, fixed });
  };
  if (!data)
    return (
      <main className="live-loading">
        <h1>连接伴学</h1>
        <p role={error ? "alert" : "status"}>
          {error || "正在获取账号与校园数据…"}
        </p>
        <button onClick={() => void refresh()}>重试</button>
        <Link to="/v2/login">登录</Link>
      </main>
    );
  const me = data.account,
    roles = me.roles,
    student = roles.includes("student"),
    teacher = roles.includes("teacher"),
    review = roles.some((r) => ["reviewer", "superadmin"].includes(r)),
    operate = roles.some((r) => ["operator", "superadmin"].includes(r)),
    superadmin = roles.includes("superadmin");
  const all = (kind: string) => data.entities.filter((e) => e.kind === kind);
  const myProfile = all("profile").find((p) => p.ownerId === me.id);
  const person = (id: unknown) =>
    data.people.find((p) => p.id === id)?.name ??
    (id === me.id ? me.name : "相关成员");
  const own = (entity: LiveEntity) => entity.ownerId === me.id;
  const relation = (entity: LiveEntity, kind: string) =>
    data.relations.some((r) => r.entityId === entity.id && r.kind === kind);
  const button = (
    title: string,
    action: string,
    input: Record<string, unknown>,
  ) => (
    <button
      className="v2-button v2-button-secondary"
      disabled={busy}
      onClick={() => void run(action, input)}
    >
      {title}
    </button>
  );
  const relationButton = (entity: LiveEntity, kind: string, title: string) =>
    button(`${relation(entity, kind) ? "取消" : ""}${title}`, "relation.set", {
      id: entity.id,
      kind,
      enabled: !relation(entity, kind),
    });
  const cards = (
    items: LiveEntity[],
    render: (entity: LiveEntity) => ReactNode,
  ) =>
    items.length ? (
      <div className="live-cards">
        {items.map((entity) => (
          <article className="v2-panel live-card" key={entity.id}>
            {render(entity)}
          </article>
        ))}
      </div>
    ) : (
      <div className="v2-panel live-empty">
        暂无记录。提交后的状态会在相关账号中同步。
      </div>
    );
  const title = (entity: LiveEntity, fallback = "") => (
    <>
      <div className="live-card-top">
        <span>{person(entity.ownerId)}</span>
        <span className="live-status">
          {label(entity.data.status ?? entity.data.visibility)}
        </span>
      </div>
      <h3>{read(entity, "title") || read(entity, "name") || fallback}</h3>
    </>
  );
  const reviewButtons = (entity: LiveEntity, action: string) => (
    <div className="live-actions">
      {button("通过", action, { id: entity.id, approve: true })}
      <button
        className="v2-button v2-button-secondary"
        onClick={() =>
          open("驳回或撤销", action, [reason], {
            id: entity.id,
            approve: false,
          })
        }
      >
        驳回 / 撤销
      </button>
    </div>
  );
  const nav: [string, string, LucideIcon][] = [
    ["home", "概览", LayoutDashboard],
    ...(student || teacher || operate
      ? [["sports", "体育课程", CalendarDays] as [string, string, LucideIcon]]
      : []),
    ...(student
      ? [
          ["activities", "校园活动", Compass],
          ["community", "社区", MessageCircle],
          ["teams", "找搭子", UsersRound],
          ["alumni", "校友同行", UsersRound],
          ["campus", "校园服务", BookOpen],
        ]
      : []),
    ...(student || teacher || operate
      ? [["coffee", "Coffee Chat", Coffee]]
      : []),
    ...(review || operate ? [["admin", "审核与运营", ShieldCheck]] : []),
    ["notifications", "消息通知", Bell],
    ["profile", "个人资料", CalendarDays],
  ] as [string, string, LucideIcon][];
  const moduleTitle = nav.find((n) => n[0] === module)?.[1] ?? "伴学";
  const coffeeSlots = all("coffeeSlot"),
    coffeeBookings = all("coffeeBooking");
  const slotLabel = (id: unknown) => {
    const slot = coffeeSlots.find((s) => s.id === id);
    return slot
      ? `${person(slot.ownerId)} · ${when(slot.data.startAt)}`
      : "原时段";
  };
  const myCoffee = coffeeBookings.filter(
    (b) =>
      (own(b) || b.data.teacherId === me.id) && b.data.status === "confirmed",
  );
  const upcoming = [
    ...all("activity")
      .filter(
        (a) => a.data.status === "published" && relation(a, "participate"),
      )
      .map((a) => ({
        id: a.id,
        title: read(a, "title"),
        start: read(a, "startAt"),
        end: read(a, "endAt") || read(a, "startAt"),
        detail: read(a, "location"),
        path: "activities",
      })),
    ...myCoffee.flatMap((b) => {
      const s = coffeeSlots.find((s) => s.id === b.data.slotId);
      return s
        ? [
            {
              id: b.id,
              title: "Coffee Chat",
              start: read(s, "startAt"),
              end: read(s, "endAt"),
              detail: slotLabel(s.id),
              path: "coffee",
            },
          ]
        : [];
    }),
    ...all("room")
      .filter(
        (r) =>
          r.data.isMember &&
          r.data.status === "open" &&
          r.data.visibility === "visible",
      )
      .map((r) => ({
        id: r.id,
        title: read(r, "title"),
        start: read(r, "time"),
        end: read(r, "time"),
        detail: read(r, "place"),
        path: "teams",
      })),
    ...data.alumni.bookings
      .filter((b) => b.status === "confirmed")
      .flatMap((b) => {
        const s = data.alumni.slots.find((s) => s.id === b.slotId);
        const p = data.alumni.profiles.find((p) => p.id === s?.alumniId);
        return s && (b.student === me.id || p?.owner === me.id)
          ? [
              {
                id: b.id,
                title: "校友同行",
                start: s.startAt,
                end: s.endAt,
                detail: `${p?.name ?? "校友"} · ${s.location}`,
                path: "alumni",
              },
            ]
          : [];
      }),
  ]
    .filter((item) => Date.parse(item.end) > Date.now())
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const periodFields = [
    f("startAt", "开始时间", "datetime-local"),
    f("endAt", "结束时间", "datetime-local"),
    f("location", "地点或交流方式"),
  ];
  const alumniProfileFields = [
    f("city", "城市"),
    choices("direction", "交流方向", ["升学", "就业"]),
    f("experience", "经历"),
    f("topics", "交流话题"),
    f("bio", "介绍", "textarea", true),
  ];

  return (
    <div className="v2-app live-app">
      <aside className="v2-sidebar live-sidebar">
        <Link to="/workspace" className="v2-brand">
          <img src={brandIcon} alt="" />
          <span>
            <strong>伴学</strong>
            <small>BNBU CAMPUS</small>
          </span>
        </Link>
        <div className="v2-nav-label">校园与我</div>
        <nav className="v2-side-nav">
          {nav.map(([key, text, Icon]) => (
            <Link
              className={`v2-side-link${module === key ? " is-active" : ""}`}
              key={key}
              to={`/workspace/${key}`}
            >
              <Icon size={19} />
              {text}
            </Link>
          ))}
        </nav>
        <div className="live-connection">
          <span />
          本地服务已连接
          <br />
          <small>账号隔离 · 数据持久保存</small>
        </div>
      </aside>
      <div className="v2-workspace">
        <header className="v2-topbar">
          <div>
            <span className="v2-breadcrumb">BNBU / {moduleTitle}</span>
            <strong>{me.name}</strong>
          </div>
          <div className="live-actions">
            <button
              className="v2-icon-button"
              aria-label="刷新数据"
              onClick={() => void refresh()}
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="v2-button v2-button-secondary"
              onClick={async () => {
                await api("/api/auth/logout", {});
                navigate("/v2/login");
              }}
            >
              <LogOut size={16} />
              退出
            </button>
          </div>
        </header>
        <main className="v2-main live-main">
          <PageHeading
            eyebrow="BNBU CAMPUS"
            title={moduleTitle}
            description={`${me.roles.map(label).join(" · ") || "尚未授予校园身份"}${me.status !== "active" ? ` · ${label(me.status)}` : ""}`}
          />
          {error && (
            <p className="live-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="live-success" role="status">
              {message}
            </p>
          )}
          {module === "sports" && (
            <LiveSports open={open} run={run} busy={busy} />
          )}
          {module === "home" && (
            <>
              <section className="live-hero">
                <span>你好，{me.name}</span>
                <h2>
                  把校园里的下一步，
                  <br />
                  安排在这里。
                </h2>
                <p>活动、伙伴与交流，连接同一份真实操作记录。</p>
                <Link
                  className="v2-button v2-button-primary"
                  to="/workspace/notifications"
                >
                  查看通知 ·{" "}
                  {data.notifications.filter((n) => !n.readAt).length}
                  <ArrowRight size={16} />
                </Link>
              </section>
              <div className="live-summary">
                {[
                  ["我的交流", myCoffee.length],
                  [
                    "待审内容",
                    all("post").filter(
                      (p) => own(p) && p.data.status === "pending",
                    ).length,
                  ],
                  [
                    "我的队伍",
                    all("room").filter((r) => r.data.isMember).length,
                  ],
                ].map(([name, count]) => (
                  <div className="v2-panel" key={name}>
                    <strong>{count}</strong>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
              {!roles.length && (
                <p className="v2-panel live-card">
                  邮箱账号已建立。学校身份和业务职责须经授权后才能开展校园操作。
                </p>
              )}
              <h2>近期安排</h2>
              <div className="live-cards">
                {upcoming.map((item) => (
                  <Link
                    className="v2-panel live-card"
                    key={item.id}
                    to={`/workspace/${item.path}`}
                  >
                    <h3>{item.title}</h3>
                    <p>{when(item.start)}</p>
                    <p>{item.detail}</p>
                  </Link>
                ))}
              </div>
              {!upcoming.length && (
                <p className="live-empty">暂无即将开始的安排。</p>
              )}
            </>
          )}
          {module === "activities" && (
            <>
              <div className="live-toolbar">
                <button
                  className="v2-button v2-button-primary"
                  onClick={() =>
                    open("发起校园活动", "activity.create", [
                      f("title", "标题"),
                      f("description", "活动介绍", "textarea"),
                      f("startAt", "开始时间", "datetime-local"),
                      f("location", "地点"),
                      f("capacity", "安排人数上限", "number"),
                    ])
                  }
                >
                  发起活动
                </button>
                <span>已认证社团成员可发起；参与标记不代表报名或出席。</span>
              </div>
              {cards(all("activity"), (entity) => (
                <>
                  {title(entity)}
                  <p>{read(entity, "description")}</p>
                  <p>
                    {when(entity.data.startAt)} · {read(entity, "location")}
                  </p>
                  <div className="live-actions">
                    {relationButton(entity, "participate", "参与标记")}
                    {relationButton(entity, "like", "点赞")}
                    {relationButton(entity, "save", "收藏")}
                    {own(entity) &&
                      button(
                        entity.data.status === "published"
                          ? "结束展示"
                          : "恢复展示",
                        "activity.visibility",
                        {
                          id: entity.id,
                          publish: entity.data.status !== "published",
                        },
                      )}
                  </div>
                </>
              ))}
            </>
          )}
          {module === "community" && (
            <>
              <div className="live-toolbar">
                <button
                  className="v2-button v2-button-primary"
                  onClick={() =>
                    open("发布帖子", "post.create", [
                      f("title", "标题"),
                      f("body", "正文", "textarea"),
                      choices("board", "分区", ["校园", "学习", "生活"]),
                      f("images", "图片（最多九张）", "images", true),
                    ])
                  }
                >
                  发布帖子
                </button>
                <span>帖子和评论审核后公开。</span>
              </div>
              {cards(all("post"), (post) => (
                <>
                  {title(post)}
                  <p className="live-prose">{read(post, "body")}</p>
                  {Array.isArray(post.data.images) && (
                    <div className="live-images">
                      {post.data.images.map((url, index) => (
                        <img
                          src={String(url)}
                          key={index}
                          alt={`帖子图片 ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  {post.data.status === "visible" && (
                    <div className="live-actions">
                      {relationButton(post, "like", "点赞")}
                      {relationButton(post, "save", "收藏")}
                      <button
                        className="v2-button v2-button-secondary"
                        onClick={() =>
                          open(
                            "评论",
                            "comment.create",
                            [f("body", "评论内容", "textarea")],
                            { postId: post.id },
                          )
                        }
                      >
                        评论
                      </button>
                      <button
                        className="v2-button v2-button-secondary"
                        onClick={() =>
                          open("举报内容", "report.create", [reason], {
                            id: post.id,
                          })
                        }
                      >
                        举报
                      </button>
                    </div>
                  )}
                  <div className="live-comments">
                    {all("comment")
                      .filter((c) => c.data.postId === post.id)
                      .map((c) => (
                        <p key={c.id}>
                          <strong>{person(c.ownerId)}</strong> {read(c, "body")}{" "}
                          <small>{label(c.data.status)}</small>
                        </p>
                      ))}
                  </div>
                </>
              ))}
            </>
          )}
          {module === "teams" && (
            <>
              <div className="live-toolbar">
                <button
                  className="v2-button v2-button-primary"
                  onClick={() =>
                    open("发起队伍", "room.create", [
                      choices("type", "队伍类型", [
                        "study",
                        "entertainment",
                        "carpool",
                      ]),
                      f("title", "队伍名称"),
                      f("body", "说明", "textarea"),
                      f("time", "约定时间", "datetime-local"),
                      f("place", "地点"),
                      f("capacity", "容量（包含队长）", "number"),
                    ])
                  }
                >
                  发起队伍
                </button>
              </div>
              {cards(all("room"), (room) => (
                <>
                  {title(room)}
                  <p>{read(room, "body")}</p>
                  <p>
                    {read(room, "time")} · {read(room, "place")} ·{" "}
                    {read(room, "memberCount")}/{read(room, "capacity")} 人
                  </p>
                  <div className="live-actions">
                    {!room.data.isMember &&
                      button("申请加入", "room.apply", { id: room.id })}
                    {relationButton(room, "save", "收藏")}
                    {own(room) &&
                      room.data.status === "open" &&
                      button("结束队伍", "room.finish", { id: room.id })}
                    <button
                      className="v2-button v2-button-secondary"
                      onClick={() =>
                        open("举报队伍", "report.create", [reason], {
                          id: room.id,
                        })
                      }
                    >
                      举报
                    </button>
                  </div>
                  {all("roomApplication")
                    .filter((a) => a.data.roomId === room.id)
                    .map((a) => (
                      <div className="live-row" key={a.id}>
                        <span>
                          {person(a.ownerId)} · {label(a.data.status)}
                        </span>
                        {own(room) && a.data.status === "pending" && (
                          <div className="live-actions">
                            {button("同意", "room.decide", {
                              id: a.id,
                              accept: true,
                            })}
                            {button("拒绝", "room.decide", {
                              id: a.id,
                              accept: false,
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  {room.data.isMember === true &&
                    room.data.status === "open" && (
                      <>
                        <div className="live-comments">
                          {all("message")
                            .filter((m) => m.data.roomId === room.id)
                            .reverse()
                            .map((m) => (
                              <p key={m.id}>
                                <strong>{person(m.ownerId)}</strong>{" "}
                                {read(m, "body")}
                              </p>
                            ))}
                        </div>
                        <button
                          className="v2-button v2-button-secondary"
                          onClick={() =>
                            open(
                              "队伍交流",
                              "message.send",
                              [f("body", "消息", "textarea")],
                              { roomId: room.id },
                            )
                          }
                        >
                          发送消息
                        </button>
                      </>
                    )}
                  {room.data.isMember === true &&
                    room.data.status === "finished" && (
                      <button
                        className="v2-button v2-button-secondary"
                        onClick={() =>
                          open(
                            "评价同队成员",
                            "room.review",
                            [
                              {
                                key: "targetId",
                                label: "评价对象",
                                type: "select",
                                options: (Array.isArray(room.data.members)
                                  ? room.data.members
                                  : []
                                )
                                  .filter((id) => id !== me.id)
                                  .map((id) => ({
                                    value: String(id),
                                    label: person(id),
                                  })),
                              },
                              f("stars", "星级（1–5）", "number"),
                              f("comment", "评价", "textarea", true),
                            ],
                            { id: room.id },
                          )
                        }
                      >
                        队伍互评
                      </button>
                    )}
                </>
              ))}
            </>
          )}
          {module === "coffee" && (
            <>
              {(teacher || operate) && (
                <div className="live-toolbar">
                  <button
                    className="v2-button v2-button-primary"
                    onClick={() =>
                      open("开放交流时段", "coffee.slot.create", [
                        ...(operate
                          ? [
                              {
                                key: "teacherId",
                                label: "教师账号",
                                type: "select" as const,
                                options: data.people.map((p) => ({
                                  value: p.id,
                                  label: p.name,
                                })),
                              },
                            ]
                          : []),
                        ...periodFields,
                        f("capacity", "容量", "number"),
                      ])
                    }
                  >
                    开放时段
                  </button>
                  {teacher && (
                    <button
                      className="v2-button v2-button-secondary"
                      onClick={() =>
                        open("维护交流资料", "coffee.profile", [
                          f("nickname", "展示名称"),
                          f("bio", "介绍", "textarea", true),
                          f("topics", "交流话题"),
                          f("location", "默认地点"),
                          {
                            ...f("enabled", "接受交流", "checkbox"),
                            value: true,
                          },
                        ])
                      }
                    >
                      交流资料
                    </button>
                  )}
                </div>
              )}
              <h2>开放时段</h2>
              {cards(coffeeSlots, (slot) => (
                <>
                  <h3>{person(slot.ownerId)}</h3>
                  {all("teacherProfile")
                    .filter((p) => p.ownerId === slot.ownerId)
                    .map((p) => (
                      <p key={p.id}>
                        {read(p, "nickname")} · {read(p, "topics")}
                        <br />
                        {read(p, "bio")}
                      </p>
                    ))}
                  <p>
                    {when(slot.data.startAt)} 至 {when(slot.data.endAt)}
                  </p>
                  <p>
                    {read(slot, "location")} · 已占 {read(slot, "occupied")}/
                    {read(slot, "capacity")} ·{" "}
                    {slot.data.closed ? "已关闭" : "开放"}
                  </p>
                  <div className="live-actions">
                    {(own(slot) || operate) &&
                      Date.parse(read(slot, "startAt")) > Date.now() && (
                        <button
                          className="v2-button v2-button-secondary"
                          onClick={() =>
                            open(
                              "编辑交流时段",
                              "coffee.slot.update",
                              [
                                ...periodFields.map((field) => ({
                                  ...field,
                                  value:
                                    field.type === "datetime-local"
                                      ? new Date(
                                          Date.parse(read(slot, field.key)) -
                                            new Date().getTimezoneOffset() *
                                              60000,
                                        )
                                          .toISOString()
                                          .slice(0, 16)
                                      : read(slot, field.key),
                                })),
                                {
                                  ...f("capacity", "容量", "number"),
                                  value: Number(slot.data.capacity),
                                },
                                {
                                  ...f("closed", "关闭时段", "checkbox"),
                                  value: slot.data.closed === true,
                                },
                              ],
                              { id: slot.id },
                            )
                          }
                        >
                          编辑时段
                        </button>
                      )}
                    {student &&
                      !slot.data.closed &&
                      Date.parse(read(slot, "startAt")) > Date.now() &&
                      Number(slot.data.occupied) <
                        Number(slot.data.capacity) && (
                        <button
                          className="v2-button v2-button-primary"
                          onClick={() =>
                            open(
                              "预约 Coffee Chat",
                              "coffee.book",
                              [f("topic", "交流问题", "textarea")],
                              { slotId: slot.id },
                            )
                          }
                        >
                          预约
                        </button>
                      )}
                    {(own(slot) || operate) &&
                      !slot.data.closed &&
                      button("关闭时段", "coffee.slot.update", {
                        id: slot.id,
                        ...slot.data,
                        closed: true,
                      })}
                  </div>
                </>
              ))}
              <h2>预约与改期</h2>
              {cards(coffeeBookings, (booking) => (
                <>
                  {title(booking, "交流预约")}
                  <p>{slotLabel(booking.data.slotId)}</p>
                  <p>{read(booking, "topic")}</p>
                  {Boolean(booking.data.proposedSlotId) && (
                    <p className="live-pending">
                      拟改为 {slotLabel(booking.data.proposedSlotId)}
                      ，等待学生确认。
                    </p>
                  )}
                  {booking.data.status === "confirmed" && (
                    <div className="live-actions">
                      <button
                        className="v2-button v2-button-secondary"
                        onClick={() =>
                          open(
                            "取消预约",
                            "coffee.cancel",
                            [{ ...reason, optional: own(booking) }],
                            { id: booking.id },
                          )
                        }
                      >
                        取消预约
                      </button>
                      {(booking.data.teacherId === me.id || operate) &&
                        !booking.data.proposedSlotId && (
                          <button
                            className="v2-button v2-button-secondary"
                            onClick={() =>
                              open(
                                "提出改期",
                                "coffee.move",
                                [
                                  {
                                    key: "slotId",
                                    label: "新的时段",
                                    type: "select",
                                    options: coffeeSlots
                                      .filter(
                                        (s) =>
                                          s.ownerId ===
                                            booking.data.teacherId &&
                                          s.id !== booking.data.slotId &&
                                          !s.data.closed,
                                      )
                                      .map((s) => ({
                                        value: s.id,
                                        label: slotLabel(s.id),
                                      })),
                                  },
                                  reason,
                                ],
                                { id: booking.id },
                              )
                            }
                          >
                            提出改期
                          </button>
                        )}
                      {own(booking) && Boolean(booking.data.proposedSlotId) && (
                        <>
                          {button("接受改期", "coffee.answer", {
                            id: booking.id,
                            accept: true,
                          })}
                          {button("拒绝改期", "coffee.answer", {
                            id: booking.id,
                            accept: false,
                          })}
                        </>
                      )}
                    </div>
                  )}
                </>
              ))}
            </>
          )}
          {module === "alumni" && (
            <>
              <div className="live-toolbar">
                <button
                  className="v2-button v2-button-primary"
                  onClick={() =>
                    open("申请校友认证", "alumni.apply", [
                      f("major", "原专业"),
                      f("graduationYear", "毕业年份", "number"),
                      ...alumniProfileFields,
                      f("evidence", "核验说明", "textarea"),
                    ])
                  }
                >
                  申请认证
                </button>
                <button
                  className="v2-button v2-button-secondary"
                  onClick={() =>
                    open("开放校友交流时段", "alumni.slot.create", periodFields)
                  }
                >
                  开放时段
                </button>
                <button
                  className="v2-button v2-button-secondary"
                  onClick={() =>
                    open("维护校友资料", "alumni.profile", [
                      ...alumniProfileFields,
                      {
                        ...f("accepting", "接受交流", "checkbox"),
                        value: true,
                      },
                    ])
                  }
                >
                  维护资料
                </button>
              </div>
              <div className="live-cards">
                {data.alumni.profiles.map((p) => (
                  <article className="v2-panel live-card" key={p.id}>
                    <h3>
                      {p.name} · {p.major}
                    </h3>
                    <p>
                      {p.graduationYear} 届 · {p.city} · {label(p.status)}
                    </p>
                    <p>
                      {p.experience} · {p.topics}
                    </p>
                    <p>{p.bio}</p>
                    {p.owner !== me.id &&
                      p.status === "approved" &&
                      button(
                        data.alumni.follows.some((x) => x.alumniId === p.id)
                          ? "取消关注"
                          : "关注校友",
                        "alumni.follow",
                        { id: p.id },
                      )}
                    {data.alumni.slots
                      .filter((s) => s.alumniId === p.id)
                      .map((s) => (
                        <div key={s.id} className="live-row">
                          <span>
                            {when(s.startAt)} · {s.location} ·{" "}
                            {s.open ? "开放" : "关闭"}
                          </span>
                          {p.owner === me.id
                            ? button("关闭", "alumni.slot.close", { id: s.id })
                            : s.open && (
                                <button
                                  className="v2-button v2-button-secondary"
                                  onClick={() =>
                                    open(
                                      "申请校友交流",
                                      "alumni.request",
                                      [f("question", "交流问题", "textarea")],
                                      { slotId: s.id },
                                    )
                                  }
                                >
                                  申请交流
                                </button>
                              )}
                        </div>
                      ))}
                  </article>
                ))}
              </div>
              <div className="live-toolbar">
                <button
                  className="v2-button v2-button-secondary"
                  onClick={() =>
                    open("分享校友经验", "alumni.post", [
                      f("title", "标题"),
                      f("body", "经验正文", "textarea"),
                      choices("direction", "方向", ["升学", "就业"]),
                    ])
                  }
                >
                  分享校友经验
                </button>
              </div>
              <p>经验分享沿用社区审核流程，通过后在社区公开。</p>
              <h2>我的交流申请</h2>
              <div className="live-cards">
                {data.alumni.bookings.map((b) => (
                  <article className="v2-panel live-card" key={b.id}>
                    <h3>{label(b.status)}</h3>
                    <p>{b.question}</p>
                    <p>{b.reason}</p>
                    <div className="live-actions">
                      {b.student !== me.id && b.status === "pending" && (
                        <>
                          {button("确认申请", "alumni.decide", {
                            id: b.id,
                            accept: true,
                          })}
                          <button
                            className="v2-button v2-button-secondary"
                            onClick={() =>
                              open("拒绝申请", "alumni.decide", [reason], {
                                id: b.id,
                                accept: false,
                              })
                            }
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      {["pending", "confirmed"].includes(b.status) && (
                        <button
                          className="v2-button v2-button-secondary"
                          onClick={() =>
                            open(
                              "取消交流申请",
                              "alumni.cancel",
                              [{ ...reason, optional: b.status === "pending" }],
                              { id: b.id },
                            )
                          }
                        >
                          撤回 / 取消
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {module === "campus" && (
            <>
              <div className="live-toolbar">
                <button
                  className="v2-button v2-button-primary"
                  onClick={() =>
                    open("申请社团入驻", "organization.apply", [
                      f("name", "社团名称"),
                      f("description", "介绍", "textarea"),
                      f("category", "类别"),
                      f("contact", "官方联系方式"),
                    ])
                  }
                >
                  申请社团入驻
                </button>
                <button
                  className="v2-button v2-button-secondary"
                  onClick={() =>
                    open("向校园知识提问", "knowledge.ask", [
                      f("question", "问题", "textarea"),
                    ])
                  }
                >
                  校园问答
                </button>
              </div>
              {cards(all("organization"), (entity) => (
                <>
                  {title(entity)}
                  <p>{read(entity, "description")}</p>
                  <p>{read(entity, "contact")}</p>
                  {relationButton(entity, "follow", "关注")}
                </>
              ))}
              <h2>我的问答</h2>
              {cards(all("answer"), (entity) => (
                <>
                  <h3>{read(entity, "question")}</h3>
                  <p className="live-prose">{read(entity, "body")}</p>
                  <p>
                    {Array.isArray(entity.data.sources) &&
                      entity.data.sources.map(
                        (s: { title?: string; source?: string }, i) => (
                          <span key={i}>
                            {s.title} · {s.source}
                            <br />
                          </span>
                        ),
                      )}
                  </p>
                  <button
                    className="v2-button v2-button-secondary"
                    onClick={() =>
                      open("反馈回答问题", "feedback.create", [reason], {
                        answerId: entity.id,
                      })
                    }
                  >
                    反馈
                  </button>
                </>
              ))}
            </>
          )}
          {module === "notifications" && (
            <div className="live-cards">
              {data.notifications.length === 0 && <p>暂无通知。</p>}
              {data.notifications.map((n) => (
                <article className="v2-panel live-card" key={n.id}>
                  <p>{n.body}</p>
                  <small>{when(n.createdAt)}</small>
                  <div className="live-actions">
                    {n.readAt ? (
                      <span>已读</span>
                    ) : (
                      button("标为已读", "notification.read", { id: n.id })
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          {module === "profile" && (
            <>
              <section className="v2-panel live-card">
                {myProfile?.data.avatar ? (
                  <img
                    className="live-avatar"
                    src={String(myProfile.data.avatar)}
                    alt="我的头像"
                  />
                ) : null}
                <h2>{String(myProfile?.data.nickname ?? me.name)}</h2>
                <p>学校姓名：{me.name}</p>
                <p>
                  {me.email} · {me.organization || "组织未配置"}
                </p>
                <p>{roles.map(label).join(" · ") || "未授权角色"}</p>
                <button
                  className="v2-button v2-button-primary"
                  onClick={() =>
                    open("修改展示资料", "profile.save", [
                      {
                        ...f("nickname", "昵称"),
                        value: String(myProfile?.data.nickname ?? me.name),
                      },
                      {
                        ...f("avatar", "头像", "image", true),
                        value: String(all("profile")[0]?.data.avatar ?? ""),
                      },
                    ])
                  }
                >
                  修改昵称和头像
                </button>
                {myProfile?.data.avatar
                  ? button("恢复默认头像", "profile.save", {
                      nickname: myProfile.data.nickname,
                      avatar: "",
                    })
                  : null}
              </section>
              {student && (
                <>
                  <LiveTimetable
                    table={all("timetable")[0]}
                    configured={
                      data.capabilities?.timetableRecognition === "configured"
                    }
                    open={open}
                    run={run}
                  />
                  <h2>我的认证</h2>
                  <button
                    className="v2-button v2-button-secondary"
                    onClick={() =>
                      open("申请身份认证", "certification.apply", [
                        choices("kind", "认证类型", [
                          "student",
                          "club",
                          "official",
                        ]),
                        f("organization", "学院或组织"),
                        f("note", "申请说明", "textarea"),
                      ])
                    }
                  >
                    提交认证申请
                  </button>
                  {cards(all("certification").filter(own), (entity) => (
                    <>
                      {title(entity, read(entity, "organization"))}
                      <p>{read(entity, "note")}</p>
                      <p>{read(entity, "reviewNote")}</p>
                    </>
                  ))}
                  <section className="v2-panel live-card">
                    <h2>原体育服务</h2>
                    <p>
                      课程、凭证、审核与学时沿用原体育系统；需接通原服务后验收。
                    </p>
                  </section>
                </>
              )}
            </>
          )}
          {module === "admin" && (
            <>
              <ManagementTools data={data} open={open} />
              <div className="live-toolbar">
                {operate && (
                  <>
                    <button
                      className="v2-button v2-button-primary"
                      onClick={() =>
                        open("导入学校邮件", "mail.import", [
                          f("messageId", "邮件唯一标识"),
                          f("subject", "邮件主题"),
                          f("sender", "来源发件方"),
                          f(
                            "body",
                            "邮件正文（沿用显式活动字段识别）",
                            "textarea",
                          ),
                          f("cover", "活动相关附件封面", "image", true),
                        ])
                      }
                    >
                      邮件转活动
                    </button>
                    <button
                      className="v2-button v2-button-secondary"
                      onClick={() =>
                        open("维护知识", "knowledge.save", [
                          f("title", "标题"),
                          f("body", "正文", "textarea"),
                          f("keywords", "关键词（逗号分隔）"),
                          f("source", "可信来源"),
                          choices("status", "状态", ["draft", "published"]),
                        ])
                      }
                    >
                      新增知识
                    </button>
                  </>
                )}
              </div>
              {review && (
                <>
                  <h2>认证与入驻</h2>
                  {cards(
                    [
                      ...all("certification"),
                      ...all("organization").filter(
                        (o) => o.data.status === "pending",
                      ),
                    ],
                    (entity) => (
                      <>
                        {title(entity, read(entity, "organization"))}
                        <p>
                          {read(entity, "note") || read(entity, "description")}
                        </p>
                        {reviewButtons(
                          entity,
                          entity.kind === "certification"
                            ? "certification.review"
                            : "organization.review",
                        )}
                      </>
                    ),
                  )}
                  <h2>校友认证</h2>
                  <div className="live-cards">
                    {data.alumni.profiles.map((p) => (
                      <article className="v2-panel live-card" key={p.id}>
                        <h3>
                          {p.name} · {label(p.status)}
                        </h3>
                        <p>
                          {p.major} · {p.graduationYear}
                        </p>
                        <p>{p.evidence}</p>
                        <div className="live-actions">
                          {button("通过", "alumni.review", {
                            id: p.id,
                            approve: true,
                          })}
                          <button
                            className="v2-button v2-button-secondary"
                            onClick={() =>
                              open(
                                "驳回或撤销校友认证",
                                "alumni.review",
                                [reason],
                                { id: p.id, approve: false },
                              )
                            }
                          >
                            驳回 / 撤销
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <h2>内容审核</h2>
                  {cards([...all("post"), ...all("comment")], (entity) => (
                    <>
                      {title(entity, entity.kind === "comment" ? "评论" : "")}
                      <p>{read(entity, "body")}</p>
                      <div className="live-actions">
                        {["visible", "hidden"].map((status) => (
                          <button
                            className="v2-button v2-button-secondary"
                            key={status}
                            onClick={() =>
                              open(
                                status === "visible" ? "公开内容" : "隐藏内容",
                                "content.review",
                                [reason],
                                { id: entity.id, status },
                              )
                            }
                          >
                            {status === "visible" ? "公开 / 恢复" : "隐藏"}
                          </button>
                        ))}
                      </div>
                    </>
                  ))}
                  <h2>举报处理</h2>
                  {cards(all("report"), (entity) => (
                    <>
                      {title(entity, "举报")}
                      <p>{read(entity, "reason")}</p>
                      <div className="live-actions">
                        {[true, false].map((upheld) => (
                          <button
                            className="v2-button v2-button-secondary"
                            key={String(upheld)}
                            onClick={() =>
                              open("处理举报", "report.decide", [reason], {
                                id: entity.id,
                                upheld,
                              })
                            }
                          >
                            {upheld ? "举报成立" : "驳回举报"}
                          </button>
                        ))}
                      </div>
                    </>
                  ))}
                  <h2>队伍异常处置</h2>
                  {cards(all("room"), (entity) => (
                    <>
                      {title(entity)}
                      <button
                        className="v2-button v2-button-secondary"
                        onClick={() =>
                          open(
                            "处理队伍",
                            "room.moderate",
                            [
                              choices("decision", "处理方式", [
                                "hide",
                                "restore",
                                "finish",
                                "remove",
                              ]),
                              f(
                                "memberId",
                                "移除成员的账号标识",
                                undefined,
                                true,
                              ),
                              reason,
                            ],
                            { id: entity.id },
                          )
                        }
                      >
                        处置
                      </button>
                    </>
                  ))}
                </>
              )}
              {operate && (
                <>
                  <h2>邮件记录</h2>
                  {cards(all("mail"), (entity) => {
                    const record = entity.data.record as {
                      source: { subject: string };
                      status: string;
                      extraction: { issues: string[] };
                      fields: Record<string, string>;
                    };
                    return (
                      <>
                        <h3>
                          {record.source.subject} · {label(record.status)}
                        </h3>
                        <button
                          className="v2-button v2-button-secondary"
                          onClick={() =>
                            open(
                              "补充或替换活动封面",
                              "mail.cover",
                              [f("cover", "活动相关附件", "image"), reason],
                              { id: entity.id },
                            )
                          }
                        >
                          维护封面
                        </button>
                        <p>{record.extraction.issues.join("；")}</p>
                        <div className="live-actions">
                          <button
                            className="v2-button v2-button-secondary"
                            onClick={() =>
                              open(
                                "修正邮件活动",
                                "mail.correct",
                                [
                                  ...Object.entries({
                                    title: "标题",
                                    description: "介绍",
                                    startAt: "开始时间（北京时间）",
                                    endAt: "结束时间（北京时间）",
                                    location: "地点",
                                    host: "主办方",
                                    conditions: "参与条件",
                                  }).map(([key, text]) => ({
                                    ...f(
                                      key,
                                      text,
                                      key === "description"
                                        ? "textarea"
                                        : undefined,
                                      key === "host" || key === "conditions",
                                    ),
                                    value: record.fields[key],
                                  })),
                                  reason,
                                ],
                                { id: entity.id },
                              )
                            }
                          >
                            核实修正
                          </button>
                          <button
                            className="v2-button v2-button-secondary"
                            onClick={() =>
                              open(
                                "变更公开状态",
                                "mail.visibility",
                                [reason],
                                {
                                  id: entity.id,
                                  publish: record.status !== "published",
                                },
                              )
                            }
                          >
                            {record.status === "published" ? "下架" : "恢复"}
                          </button>
                        </div>
                      </>
                    );
                  })}
                  <h2>回答反馈</h2>
                  {cards(all("feedback"), (entity) => (
                    <>
                      {title(entity, "回答反馈")}
                      <p>{read(entity, "reason")}</p>
                      <button
                        className="v2-button v2-button-secondary"
                        onClick={() =>
                          open("处理反馈", "feedback.resolve", [reason], {
                            id: entity.id,
                          })
                        }
                      >
                        处理
                      </button>
                    </>
                  ))}
                </>
              )}
              {superadmin && (
                <>
                  <h2>账号与职责</h2>
                  <div className="live-cards">
                    {data.people.map((p) => (
                      <article key={p.id} className="v2-panel live-card">
                        <h3>
                          {p.name} · {label(p.status)}
                        </h3>
                        <p>{p.roles?.map(label).join(" · ") || "未授权"}</p>
                        <button
                          className="v2-button v2-button-secondary"
                          onClick={() =>
                            open(
                              "调整账号",
                              "account.update",
                              [
                                choices("status", "账号状态", [
                                  "active",
                                  "muted",
                                  "banned",
                                ]),
                                reason,
                              ],
                              { id: p.id, roles: p.roles ?? [] },
                            )
                          }
                        >
                          调整状态
                        </button>
                      </article>
                    ))}
                  </div>
                  <h2>操作审计</h2>
                  <div className="v2-panel live-card">
                    {data.audit.map((a) => (
                      <div className="live-row" key={a.id}>
                        <span>
                          {when(a.created_at)} · {person(a.actor_id)} ·{" "}
                          {a.action}
                        </span>
                        <span>{a.reason}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
      {form && (
        <Modal
          title={form.title}
          onClose={() => {
            if (!busy) setForm(null);
          }}
        >
          <EditForm
            key={`${form.action}:${String(form.fixed?.id)}`}
            form={form}
            busy={busy}
            error={formError}
            onSubmit={(input) => run(form.action, input)}
          />
        </Modal>
      )}
    </div>
  );
}
