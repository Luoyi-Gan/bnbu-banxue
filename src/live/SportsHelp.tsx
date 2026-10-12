import { useEffect, useState } from "react";
import { api, command, type LiveEntity } from "./api";
const categories: Record<string, string> = {
  LOGIN: "登录与验证码",
  ENROLLMENT: "加入课程与补正",
  EXERCISE: "打卡与学时",
  EVIDENCE: "凭证上传",
  COURSES: "课程与成绩",
  EXEMPTION: "免测",
  CERTIFICATION: "组织认证",
  NOTIFICATIONS: "通知",
  MAINTENANCE: "维护期间操作",
  FEEDBACK: "服务反馈",
};
const statuses: Record<string, string> = {
  published: "已发布",
  draft: "草稿",
  archived: "已下线",
};
const blank = {
  titleZh: "",
  titleEn: "",
  bodyZh: "",
  bodyEn: "",
  keywords: "",
  category: "LOGIN",
  weight: "0",
};
type Draft = typeof blank;
export function SportsHelp() {
  const [lang, setLang] = useState("zh"),
    [data, setData] = useState<{
      manage: boolean;
      articles: LiveEntity[];
    } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(0);
  const [edit, setEdit] = useState<{
      article: LiveEntity | null;
      original: Draft;
    } | null>(null),
    [draft, setDraft] = useState(blank),
    [preview, setPreview] = useState("zh"),
    [reviewed, setReviewed] = useState<string[]>([]);
  async function refresh() {
    setData(await api(`/api/sports/help?lang=${lang}`));
  }
  useEffect(() => {
    let live = true;
    setData(null);
    api<{ manage: boolean; articles: LiveEntity[] }>(
      `/api/sports/help?lang=${lang}`,
    )
      .then((v) => {
        if (live) {
          setData(v);
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [lang]);
  function begin(article: LiveEntity | null) {
    const original = article
      ? {
          titleZh: String(article.data.titleZh),
          titleEn: String(article.data.titleEn),
          bodyZh: String(article.data.bodyZh),
          bodyEn: String(article.data.bodyEn),
          keywords: (article.data.keywords as string[]).join(", "),
          category: String(article.data.category),
          weight: String(article.data.weight),
        }
      : blank;
    setEdit({ article, original });
    setDraft(original);
    setReviewed([]);
    setError("");
  }
  function close() {
    if (
      !busy &&
      (!edit ||
        JSON.stringify(draft) === JSON.stringify(edit.original) ||
        window.confirm("关闭会丢失未保存修改，确认放弃？"))
    )
      setEdit(null);
  }
  async function save(publish: boolean) {
    setBusy(true);
    setError("");
    try {
      if (
        (publish || edit?.article?.data.status === "published") &&
        reviewed.length < 2
      )
        throw new Error("请先核对中文和英文预览，并确认内容符合当前业务规则。");
      if (!draft.weight.trim()) throw new Error("请输入有效排序权重。");
      await command("sports.help.save", {
        ...draft,
        weight: Number(draft.weight),
        publish,
        ...(edit?.article
          ? {
              id: edit.article.id,
              version: edit.article.version,
              updatedAt: edit.article.updatedAt,
            }
          : {}),
      });
      setEdit(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }
  async function transition(a: LiveEntity) {
    const target = a.data.status === "published" ? "archived" : "published";
    if (
      !window.confirm(
        `${String(lang === "zh" ? a.data.titleZh : a.data.titleEn)}：${statuses[String(a.data.status)]} → ${statuses[target]}。${target === "archived" ? "内容和历史仍保留。" : "请确认文章适用于当前系统。"}`,
      )
    )
      return;
    setBusy(true);
    try {
      await command("sports.help.state", {
        id: a.id,
        version: a.version,
        updatedAt: a.updatedAt,
        status: target,
      });
      await refresh();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  const filtered = (data?.articles ?? []).filter(
    (a) =>
      (!category || a.data.category === category) &&
      (!status || a.data.status === status) &&
      [
        a.data.title,
        a.data.titleZh,
        a.data.titleEn,
        ...(data?.manage ? (a.data.keywords as string[]) : []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const current = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / 5) - 1),
  );
  return (
    <section className="v2-panel live-card">
      <h2>体育帮助中心</h2>
      <button disabled={busy || !!edit} onClick={()=>void refresh().catch(e=>{setData(null);setError(e.message);})}>刷新当前内容</button>
      <label>
        语言
        <select
          value={lang}
          onChange={(e) => {
            setLang(e.target.value);
            setPage(0);
          }}
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      {data?.manage && (
        <>
          <button disabled={busy || !!edit} onClick={() => begin(null)}>
            新建双语文章
          </button>
          {Object.entries(statuses).map(([s, label]) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(0);
              }}
            >
              {label} {data.articles.filter((a) => a.data.status === s).length}
            </button>
          ))}
        </>
      )}
      {edit && (
        <div
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            }
          }}
        >
          {(
            [
              "titleZh",
              "titleEn",
              "bodyZh",
              "bodyEn",
              "keywords",
              "weight",
            ] as const
          ).map((key) => (
            <label key={key}>
              {
                {
                  titleZh: "中文标题",
                  titleEn: "英文标题",
                  bodyZh: "中文正文（可含Markdown）",
                  bodyEn: "英文正文（可含Markdown）",
                  keywords: "关键词（中英文逗号分隔）",
                  weight: "排序权重",
                }[key]
              }
              <textarea
                disabled={busy}
                value={draft[key]}
                onChange={(e) => {
                  setDraft({ ...draft, [key]: e.target.value });
                  setReviewed([]);
                }}
              />
            </label>
          ))}
          <label>
            分类
            <select
              disabled={busy}
              value={draft.category}
              onChange={(e) => {
                setDraft({ ...draft, category: e.target.value });
                setReviewed([]);
              }}
            >
              {Object.entries(categories).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          {["zh", "en"].map((l) => (
            <button
              key={l}
              onClick={() => {
                setPreview(l);
                setReviewed([...new Set([...reviewed, l])]);
              }}
            >
              {l === "zh" ? "核对中文预览" : "核对英文预览"}
            </button>
          ))}
          <h3>{preview === "zh" ? draft.titleZh : draft.titleEn}</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {preview === "zh" ? draft.bodyZh : draft.bodyEn}
          </pre>
          <p>
            预览用于核对内容，不承诺Markdown排版。发布内容须符合现行规则，不得包含密码、验证码或他人隐私。
          </p>
          <button disabled={busy} onClick={() => void save(false)}>
            保存
            {edit.article ? statuses[String(edit.article.data.status)] : "草稿"}
          </button>
          {edit.article?.data.status !== "published" && (
            <button disabled={busy} onClick={() => void save(true)}>
              保存并
              {edit.article?.data.status === "archived" ? "重新上线" : "发布"}
            </button>
          )}
          <button disabled={busy} onClick={close}>
            关闭编辑
          </button>
        </div>
      )}
      <label>
        搜索标题{data?.manage ? "或关键词" : ""}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
      </label>
      <label>
        分类
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          <option value="">全部</option>
          {Object.entries(categories).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => {
          setQuery("");
          setCategory("");
          setStatus("");
          setPage(0);
        }}
      >
        清除筛选
      </button>
      {!data && !error && <p>正在读取当前发布内容…</p>}
      {data && !filtered.length && <p>没有符合条件的文章。</p>}
      {filtered.slice(current * 5, current * 5 + 5).map((a) => (
        <article key={a.id}>
          <h3>
            {String(
              data?.manage
                ? lang === "zh"
                  ? a.data.titleZh
                  : a.data.titleEn
                : a.data.title,
            )}
          </h3>
          <p>
            {categories[String(a.data.category)]} ·{" "}
            {new Date(a.updatedAt).toLocaleString()}
          </p>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(
              data?.manage
                ? lang === "zh"
                  ? a.data.bodyZh
                  : a.data.bodyEn
                : a.data.body,
            )}
          </pre>
          {data?.manage && (
            <>
              <p>
                {statuses[String(a.data.status)]} · 关键词{" "}
                {(a.data.keywords as string[]).join("、")}
              </p>
              <button disabled={busy || !!edit} onClick={() => begin(a)}>
                编辑
              </button>
              <button
                disabled={busy || !!edit}
                onClick={() => void transition(a)}
              >
                {a.data.status === "published"
                  ? "下线"
                  : a.data.status === "draft"
                    ? "发布"
                    : "重新上线"}
              </button>
            </>
          )}
        </article>
      ))}
      <p>
        <button disabled={current === 0} onClick={() => setPage(current - 1)}>
          上一页
        </button>{" "}
        {current + 1} / {Math.max(1, Math.ceil(filtered.length / 5))}{" "}
        <button
          disabled={(current + 1) * 5 >= filtered.length}
          onClick={() => setPage(current + 1)}
        >
          下一页
        </button>
      </p>
    </section>
  );
}
