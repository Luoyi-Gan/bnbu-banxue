import type { Workspace } from "./api";
import type { OpenForm } from "./ConnectedApp";

export function ManagementTools({
  data,
  open,
}: {
  data: Workspace;
  open: OpenForm;
}) {
  const roles = data.account.roles,
    operate = roles.some((r) => ["operator", "superadmin"].includes(r)),
    superadmin = roles.includes("superadmin");
  const reason = {
    key: "reason",
    label: "处理原因",
    type: "textarea" as const,
  };
  return (
    <>
      {operate && (
        <>
          <h2>通知投递</h2>
          <div className="v2-panel live-card">
            <p>选择接收人发送站内通知，接收人的已读状态独立记录。</p>
            <button
              className="v2-button v2-button-secondary"
              onClick={() =>
                open("发送业务通知", "notification.send", [
                  ...data.people.map((p) => ({
                    key: `recipient_${p.id}`,
                    label: p.name,
                    type: "checkbox" as const,
                    optional: true,
                  })),
                  { key: "body", label: "通知正文", type: "textarea" },
                ])
              }
            >
              发送通知
            </button>
            {data.notificationBatches?.map((batch) => (
              <p key={batch.id}>
                {new Date(batch.createdAt).toLocaleString("zh-CN", {
                  timeZone: "Asia/Shanghai",
                })}{" "}
                · 已产生 {batch.total} 份通知，已读 {batch.read} 份
                {batch.readRate === null
                  ? ""
                  : `（${Math.floor(batch.readRate * 100)}%）`}
              </p>
            ))}
          </div>
          <h2>知识维护</h2>
          <div className="live-cards">
            {data.entities
              .filter((e) => e.kind === "knowledge")
              .map((e) => (
                <article key={e.id} className="v2-panel live-card">
                  <h3>{String(e.data.title)}</h3>
                  <p>{String(e.data.body)}</p>
                  <p>来源：{String(e.data.source)}</p>
                  <button
                    className="v2-button v2-button-secondary"
                    onClick={() =>
                      open(
                        "编辑知识",
                        "knowledge.save",
                        [
                          {
                            key: "title",
                            label: "标题",
                            value: String(e.data.title),
                          },
                          {
                            key: "body",
                            label: "正文",
                            type: "textarea",
                            value: String(e.data.body),
                          },
                          {
                            key: "keywords",
                            label: "关键词",
                            value: String(e.data.keywords),
                          },
                          {
                            key: "source",
                            label: "可信来源",
                            value: String(e.data.source),
                          },
                          {
                            key: "status",
                            label: "公开状态",
                            type: "select",
                            value: String(e.data.status),
                            options: [
                              { value: "published", label: "发布" },
                              { value: "draft", label: "停止公开" },
                            ],
                          },
                        ],
                        { id: e.id },
                      )
                    }
                  >
                    编辑
                  </button>
                </article>
              ))}
          </div>
          <h2>已入驻社团维护</h2>
          <div className="live-cards">
            {data.entities
              .filter(
                (e) =>
                  e.kind === "organization" && e.data.status === "approved",
              )
              .map((e) => (
                <article key={e.id} className="v2-panel live-card">
                  <h3>{String(e.data.name)}</h3>
                  <p>{String(e.data.contact)}</p>
                  <button
                    className="v2-button v2-button-secondary"
                    onClick={() =>
                      open(
                        "维护社团资料",
                        "organization.update",
                        [
                          {
                            key: "description",
                            label: "社团介绍",
                            type: "textarea",
                            value: String(e.data.description),
                          },
                          {
                            key: "contact",
                            label: "官方联系方式",
                            value: String(e.data.contact),
                          },
                          {
                            key: "visibility",
                            label: "公开状态",
                            type: "select",
                            value: String(e.data.visibility),
                            options: [
                              { value: "visible", label: "公开" },
                              { value: "hidden", label: "下架" },
                            ],
                          },
                          reason,
                        ],
                        { id: e.id },
                      )
                    }
                  >
                    维护
                  </button>
                </article>
              ))}
          </div>
        </>
      )}
      {superadmin && (
        <>
          <h2>职责授权</h2>
          <p>
            填写授权依据。邮箱注册和普通认证不自动授予管理职责；体育资格由原系统管理。
          </p>
          <div className="live-cards">
            {data.people.map((p) => (
              <article key={p.id} className="v2-panel live-card">
                <h3>{p.name}</h3>
                <button
                  className="v2-button v2-button-secondary"
                  onClick={() =>
                    open(
                      "调整业务职责",
                      "account.update",
                      [
                        ...Object.entries({
                          student: "学生",
                          teacher: "教师",
                          reviewer: "审核员",
                          operator: "运营",
                          superadmin: "超级管理员",
                        }).map(([role, text]) => ({
                          key: `role_${role}`,
                          label: text,
                          type: "checkbox" as const,
                          value: p.roles?.includes(role) ?? false,
                          optional: true,
                        })),
                        reason,
                      ],
                      { id: p.id, status: p.status },
                    )
                  }
                >
                  设置职责
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
