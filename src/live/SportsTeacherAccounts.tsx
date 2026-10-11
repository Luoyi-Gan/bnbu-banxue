import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
export function SportsTeacherAccounts({
  imports,
  open,
  busy,
}: {
  imports: LiveEntity[];
  open: OpenForm;
  busy: boolean;
}) {
  return (
    <section className="v2-panel live-card">
      <h2>批量建立教师账号</h2>
      <p>
        先粘贴UTF-8
        CSV并逐行预览。必填employee_id,name,email，可选college；不要在CSV中填写密码。学校邮箱域名须已由服务端配置。
      </p>
      <button
        disabled={busy}
        onClick={() =>
          open("预览教师CSV", "sports.teachers.preview", [
            {
              key: "csv",
              label: "CSV内容",
              type: "textarea",
              value: "employee_id,name,email,college\n",
            },
          ])
        }
      >
        校验并预览
      </button>
      {imports.map((batch) => (
        <details key={batch.id}>
          <summary>
            {batch.data.status === "CREATED" ? "已建立" : "待确认预览"} ·{" "}
            {batch.id}
          </summary>
          <table>
            <thead>
              <tr>
                <th>行</th>
                <th>工号</th>
                <th>姓名</th>
                <th>学校邮箱</th>
                <th>学院</th>
                <th>校验</th>
              </tr>
            </thead>
            <tbody>
              {(
                batch.data.rows as {
                  row: number;
                  employeeId: string;
                  name: string;
                  email: string;
                  college: string;
                  errors: string[];
                }[]
              ).map((row) => (
                <tr key={row.row}>
                  <td>{row.row}</td>
                  <td>{row.employeeId}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.college}</td>
                  <td>{row.errors.join("；") || "通过"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {batch.data.canCreate === true && (
            <button
              disabled={busy}
              onClick={() =>
                open(
                  "确认整批建立教师",
                  "sports.teachers.create",
                  [
                    {
                      key: "initialPassword",
                      label: "本批初始密码（至少8位，大小写字母和数字）",
                      type: "password",
                    },
                    {
                      key: "confirmPassword",
                      label: "再次填写初始密码",
                      type: "password",
                    },
                    {
                      key: "confirmed",
                      label:
                        "已逐行核实真实教师与学校邮箱，初始密码将通过受控方式告知",
                      type: "checkbox",
                    },
                  ],
                  { id: batch.id, version: batch.version },
                )
              }
            >
              确认建立整批账号
            </button>
          )}
        </details>
      ))}
    </section>
  );
}
