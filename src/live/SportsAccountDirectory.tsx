import { useState } from "react";
import { api } from "./api";
type Row = {
  id: string;
  identityId: string;
  name: string;
  studentNumber: string | null;
  employeeId: string | null;
  organizationId: string | null;
  college: string;
  department: string;
  major: string | null;
  administrativeClass: string | null;
  sex: string | null;
  year: number | null;
  title: string | null;
  status: string;
  verifiedEmail: string | null;
  updatedAt: string;
  version: number;
};
type Page = { items: Row[]; nextCursor: string | null; total: number };
const statusLabels: Record<string, string> = {
  ACTIVE: "有效",
  PENDING: "待入当前教学班",
  DISABLED: "已停用",
  RECOVERY_REQUIRED: "需恢复",
};
export function SportsAccountDirectory() {
  const [kind, setKind] = useState("students"),
    [q, setQ] = useState(""),
    [college, setCollege] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState<Page | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [history, setHistory] = useState<string[]>([""]);
  async function read(cursors = [""]) {
    setBusy(true);
    setError("");
    setPage(null);
    try {
      const query = new URLSearchParams({
        q,
        college,
        status,
        cursor: cursors.at(-1) ?? "",
        limit: "20",
      });
      const value = await api<Page>(
        "/api/sports/accounts/" + kind + "?" + query,
      );
      setPage(value);
      setHistory(cursors);
    } catch (e) {
      setError(e instanceof Error ? e.message : "读取失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="v2-panel live-card">
      <summary>学生／教师账号只读查询</summary>
      <p>
        仅展示当前身份资料和状态。账号资料不会授予课程成员、教学处理或密码访问权限。
      </p>
      <label>
        类别
        <select
          value={kind}
          disabled={busy}
          onChange={(e) => {
            setKind(e.target.value);
            setStatus("");
            setPage(null);
          }}
        >
          <option value="students">学生</option>
          <option value="teachers">教师</option>
        </select>
      </label>
      <label>
        关键词
        <input
          value={q}
          disabled={busy}
          placeholder="姓名、学号／工号、学院、专业或行政班级"
          onChange={(e) => {
            setQ(e.target.value);
            setPage(null);
          }}
        />
      </label>
      <label>
        学院／部门精确筛选
        <input
          value={college}
          disabled={busy}
          onChange={(e) => {
            setCollege(e.target.value);
            setPage(null);
          }}
        />
      </label>
      <label>
        状态
        <select
          value={status}
          disabled={busy}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(null);
          }}
        >
          <option value="">全部</option>
          {(kind === "students"
            ? ["ACTIVE", "PENDING"]
            : ["ACTIVE", "DISABLED", "RECOVERY_REQUIRED"]
          ).map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </label>
      <button disabled={busy} onClick={() => void read()}>
        查询／刷新
      </button>
      {error && <p role="alert">{error}</p>}
      {page && (
        <>
          <p>
            匹配{page.total}人 · 第{history.length}页
          </p>
          <table>
            <thead>
              <tr>
                <th>学号／工号</th>
                <th>姓名</th>
                <th>学院／部门</th>
                <th>{kind === "students" ? "行政班级" : "职称"}</th>
                <th>状态与只读详情</th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((r) => (
                <tr key={r.identityId}>
                  <td>{r.studentNumber ?? r.employeeId}</td>
                  <td>{r.name}</td>
                  <td>{r.college}</td>
                  <td>{r.administrativeClass ?? r.title}</td>
                  <td>
                    {statusLabels[r.status]}
                    <details>
                      <summary>资料详情</summary>
                      <p>
                        用户ID：{r.id}；组织ID：{r.organizationId ?? "未提供"}
                      </p>
                      <p>
                        部门：{r.department || "未提供"}；专业：
                        {r.major || "未提供"}；性别：
                        {r.sex === "MALE"
                          ? "男"
                          : r.sex === "FEMALE"
                            ? "女"
                            : "未提供"}
                        ；年级：{r.year ?? "未提供"}
                      </p>
                      <p>已核验当前邮箱：{r.verifiedEmail ?? "尚未核验"}</p>
                      <p>
                        身份资料更新时间：{r.updatedAt}；版本：{r.version}
                      </p>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            disabled={busy || history.length < 2}
            onClick={() => void read(history.slice(0, -1))}
          >
            上一页
          </button>
          <button
            disabled={busy || !page.nextCursor}
            onClick={() => void read([...history, page.nextCursor!])}
          >
            下一页
          </button>
        </>
      )}
    </details>
  );
}
