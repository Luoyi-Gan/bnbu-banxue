import { useState } from "react";
import { api, command } from "./api";
type Admin = {
  id: string;
  identityId: string;
  loginName: string;
  name: string;
  email: string;
  department: string;
  status: string;
  permissions: string[];
  version: number;
};
type Directory = {
  permissions: string[];
  items: Admin[];
  candidates: { id: string; name: string; email: string }[];
};
const labels: Record<string, string> = {
  COURSES_VIEW: "课程查看",
  SEMESTERS: "学期管理（高风险）",
  ACCOUNTS: "用户与账号",
  FEEDBACK: "学生反馈",
  GLOBAL_RULES: "全局规则（高风险）",
  SYSTEM_MODE: "系统模式（高风险）",
  HELP: "帮助中心",
  AUDIT: "审计查询",
};
export function SportsAdministrators() {
  const [data, setData] = useState<Directory | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState<Admin | null>(null),
    [show, setShow] = useState(false);
  const [personId, setPersonId] = useState(""),
    [loginName, setLoginName] = useState(""),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [department, setDepartment] = useState(""),
    [permissions, setPermissions] = useState<string[]>([]),
    [password, setPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState("");
  async function refresh() {
    setData(await api<Directory>("/api/sports/administrators"));
  }
  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  function open(row: Admin | null) {
    setEdit(row);
    setShow(true);
    setPersonId("");
    setLoginName(row?.loginName ?? "");
    setName(row?.name ?? "");
    setEmail(row?.email ?? "");
    setDepartment(row?.department ?? "");
    setPermissions(row?.permissions ?? []);
    setPassword("");
    setConfirmPassword("");
  }
  return (
    <details className="v2-panel live-card">
      <summary>独立分管理员账号</summary>
      <p>独立登录名及密码；停用仅撤销此管理账号登录。初次登录须本人改密。</p>
      <button disabled={busy} onClick={() => void run(refresh)}>
        刷新管理员与已核验人员
      </button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <p>
            分管理员{data.items.length}人，启用
            {data.items.filter((i) => i.status === "ACTIVE").length}
            人，可分配权限{data.permissions.length}项
          </p>
          <button disabled={busy} onClick={() => open(null)}>
            创建分管理员
          </button>
          {data.items.map((row) => (
            <div key={row.id}>
              <p>
                {row.name} · {row.loginName} · {row.email} ·{" "}
                {row.status === "ACTIVE" ? "已启用" : "已停用"}
              </p>
              <p>{row.permissions.map((p) => labels[p]).join("、")}</p>
              <button
                disabled={busy}
                onClick={() => {
                  if (
                    !window.confirm(
                      `确认已完成全部职责移交并删除？\n姓名：${row.name}\n账号：${row.loginName}\n学校邮箱：${row.email}\n管理登录资料将删除，业务历史保留，原个人账号不受影响。`,
                    )
                  )
                    return;
                  void run(async () => {
                    await command("sports.admins.delete", {
                      id: row.identityId,
                      version: row.version,
                      name: row.name,
                      loginName: row.loginName,
                      email: row.email,
                      confirmed: true,
                      handoverConfirmed: true,
                    });
                    setShow(false);
                    await refresh();
                  });
                }}
              >
                删除管理账号
              </button>
              <button disabled={busy} onClick={() => open(row)}>
                编辑资料和权限
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  const disabling = row.status === "ACTIVE";
                  if (
                    !window.confirm(
                      `${disabling ? "确认已完成职责移交并停用" : "启用"} ${row.name}（${row.loginName}）？${disabling ? "所有管理登录将失效，原学生／教师登录不受影响。" : "仅恢复当前已分配权限。"}`,
                    )
                  )
                    return;
                  void run(async () => {
                    await command("sports.admins.state", {
                      id: row.identityId,
                      version: row.version,
                      status: disabling ? "DISABLED" : "ACTIVE",
                      confirmed: true,
                      handoverConfirmed: disabling,
                    });
                    await refresh();
                    setShow(false);
                  });
                }}
              >
                {row.status === "ACTIVE" ? "停用" : "启用"}
              </button>
            </div>
          ))}
          {show && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !window.confirm(
                    `确认${edit ? "更新" : "创建"} ${name}（${loginName}）\n学校邮箱：${email}\n部门：${department}\n全部${permissions.length}项权限：${permissions.map((p) => labels[p]).join("、")}`,
                  )
                )
                  return;
                void run(async () => {
                  await command(
                    edit ? "sports.admins.edit" : "sports.admins.create",
                    {
                      ...(edit
                        ? { id: edit.identityId, version: edit.version }
                        : {
                            personId,
                            loginName,
                            initialPassword: password,
                            confirmPassword,
                          }),
                      name,
                      email,
                      department,
                      permissions,
                      confirmed: true,
                    },
                  );
                  setPassword("");
                  setConfirmPassword("");
                  setShow(false);
                  await refresh();
                });
              }}
            >
              <fieldset disabled={busy}>
                {!edit && (
                  <label>
                    已核验人员
                    <select
                      required
                      value={personId}
                      onChange={(e) => {
                        setPersonId(e.target.value);
                        const p = data.candidates.find(
                          (p) => p.id === e.target.value,
                        );
                        setName(p?.name ?? "");
                        setEmail(p?.email ?? "");
                      }}
                    >
                      <option value="">请选择</option>
                      {data.candidates.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}（{p.email}）
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  登录账号（创建后不可修改）
                  <input
                    required
                    readOnly={!!edit}
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                  />
                </label>
                <label>
                  姓名
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  学校邮箱
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label>
                  所属部门
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </label>
                {data.permissions.map((p) => (
                  <label key={p}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(p)}
                      onChange={(e) =>
                        setPermissions(
                          e.target.checked
                            ? [...permissions, p]
                            : permissions.filter((v) => v !== p),
                        )
                      }
                    />
                    {labels[p]}
                  </label>
                ))}
                {!edit && (
                  <>
                    <label>
                      初始密码
                      <input
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                    <label>
                      确认初始密码
                      <input
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </label>
                  </>
                )}
                <button type="submit">核对并保存</button>
                <button
                  type="button"
                  onClick={() => {
                    setShow(false);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  取消
                </button>
              </fieldset>
            </form>
          )}
        </>
      )}
    </details>
  );
}
