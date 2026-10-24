# 隐私政策与个人账号注销交接（2026-10-24）

基于甘的 `codex/ios-preview-backend-start` / `e133966`，配套 iOS 基于 `061f33e`。本次仅提交代码和本地测试，不部署生产、不修改真实用户数据。

## 接口与发布顺序

先部署后端 migration 14，再发布配套 iOS。SQLite 本地迁移版本 11。旧迁移及校验和未改动。

- `GET /api/privacy-policy`：公开版本号和中英 sections；`GET /privacy?lang=en`：无需脚本和登录的 HTML。已有 Web `/v2/privacy` 同步引用 `shared/privacy-policy.json`。反向代理应将 `/privacy` 转给 API，或在 App Store Connect 使用部署后验证可访问的 `/v2/privacy`。
- `POST /api/account/deletion/request`：当前会话 + 空对象。仅发本人邮箱；响应 `{sent,delivery,message}`，不返回验证码。邮件沿用配置的发送服务。AoKSend 必须配置明确说明“永久注销”的 `BNBU_AOKSEND_DELETION_TEMPLATE_ID`，不能借用登录邮件文案。`localOutbox` 只用于隔离开发环境。
- `POST /api/account/deletion/confirm`：当前会话；`{requestId: UUID, confirmed: true, password: string}` 或 `{requestId, confirmed:true, code:"六位专用注销码"}`。不接受账号 ID 或邮箱字段。成功为 `{deleted:true,requestId,completedAt}` 并清除 cookie。错误包括 400 验证失败、401 会话无效、403 非个人账号或跨站、409 原请求参数改变、429 限流。
- 同一次不确定结果须保留请求 UUID 和原验证信息重试。回执独立于已删除的账号表，绑定原会话和 HMAC 请求摘要，24 小时内有效。回执不能访问任何业务接口。验证码或密码失败的计数提交后才返回错误；数据库失败则整体回滚。

## 清除边界与并发

`privacy/plan.ts` 计算实体及依附记录，去掉其他队伍中的本人关系，单独处理全局 alumniState 的个人记录和依赖。外键挑战、入会能力、通知、审计/命令快照、个人问答、会话和推送均一并清理。派生 RAG 索引失效重建。不同用户独立创作的文本、平台外副本、独立学校与体育账户不被任意改写。

PostgreSQL 所有 `PostgresDatabase.transaction` 在 BEGIN 前取得连接级共享隐私锁，注销取得独占锁，避免其他业务事务在扫描与删除之间插入遗漏数据。COMMIT/ROLLBACK 后在同一连接解锁；解锁失败销毁连接，不放回连接池。这样保留读取接口在首条事务查询前设置隔离级别的能力，等待注销的 repeatable-read 也不会提前取得旧快照。业务锁与图片锁沿用固定顺序。新增写入必须继续通过该事务封装；剩余 pool 直写仅更新邮件投递/推送任务状态或退出会话，不能创建账号数据。

图片仍被实体、审计或命令回执引用时保留。未引用对象进入 `privacy_object_gc`；API 进程启动及每 30 秒重试，失败增加 attempts，不打印对象内容或凭据。对象上传和 GC 共享锁，防止刚上传、尚未写引用的对象被误删。需监控队列数量、最老 queued_at 和 attempts；COS 版本历史/复制/外部备份不等同于当前对象删除，须按实际存储策略处理。SQLite 正常业务图片内联数据库，随记录删除。

当前服务进程清理该账号学校和体育内存会话；其他服务进程中孤立的学校令牌最长 12 小时过期，旧平台会话立即无权再访问。发送给邮件、AI、学校或 Apple 服务的在途请求无法追回，已送达的消息副本不应宣称全部远程抹除。

## 备份：运营仍需完成

用户已确认运营者为珠海澄序智能科技有限公司、联系邮箱 siltotchen@gmail.com、主服务器在香港；**备份最长保留周期未知**。政策如实标明，不填入猜测的天数。对外测试/发布前请核实实际备份轮换、对象存储区域与历史版本保留、供应商处理规则，并更新政策及 App Store Connect 隐私问卷。

`account_erasure_log` 仅保存随机账号 ID 的 SHA-256 摘要及注销时间，目的是拦住恢复旧备份导致的账号复活。清单须独立于历史备份保存，并在所有相关备份不再可恢复后按运营策略清理。

提供只读维护工具（不会自动删除恢复库里的数据）：

```sh
PRIVACY_DATABASE_URL=当前数据库连接 node scripts/check-erasure-restore.mjs --export /安全位置/最新注销清单.json
PRIVACY_DATABASE_URL=隔离恢复库连接 node scripts/check-erasure-restore.mjs --check /安全位置/最新注销清单.json
```

export 使用独占新文件、0600 权限，避免覆盖旧证据。check 比对所有恢复账号 ID，不输出个人信息；有匹配时退出 1，输入/连接错误退出 2。恢复库必须保持隔离，在删除匹配账号及其依附内容、过滤对象备份并重新通过核对前不得接流量。仅通过该检查不代表供应商历史备份已清理，且必须核对清单的导出时间覆盖所有注销事件。

## 验证方式

Node 24：`node scripts/test-privacy.mjs`；真实 PostgreSQL 隔离随机 schema：`DATABASE_URL=本地测试库 node scripts/test-privacy.mjs --postgres`。脚本仅删除自己创建的 schema。覆盖密码/专用 OTP、错误计数/冷却/限流、身份限制、CSRF、会话撤销、失败回滚、丢失响应重试、并发重复、业务写入竞争、共享数据及共享图片保留、对象清理失败后重试、推送清理、公开政策。

推送回归：`DATABASE_URL=本地测试库 node scripts/test-push-postgres.mjs`。对象与 HTTP 回归：`npx vitest run tests/object-store.test.ts tests/backend-http.test.ts`。前后端类型检查和 Web 构建须通过。

全量 Vitest 本次观察到 503 通过、5 失败、39 跳过；在未修改的 e133966 临时副本独立复现相同 5 失败：`tests/sports-companion.test.tsx` 的 4 个语言/文案断言，`src/v2/sharedElementMotion.test.ts` 的 1 个滚动位置断言。本 PR 不将这些基线失败标为通过，也不改动无关体育页或动画行为。


## 2026-10-24 合并前复核

原 PR 的事务封装在 BEGIN 后先查询注销锁，破坏了 workspace、社区等读取接口的 `SET TRANSACTION ISOLATION LEVEL`；真实 PostgreSQL 读接口会报错，已作为阻塞合并问题修复。锁改为 BEGIN 前取得，提交/回滚后释放，失败连接销毁。新增隔离级别、提交/回滚解锁、读事务等待与新快照四项断言，注销 PostgreSQL 检查由 59 增至 63 项。

启用原来因缺少 `BNBU_TEST_POSTGRES_URL` 而跳过的三个测试文件：修复后 33 通过、7 失败、0 跳过。七个失败在未改动的 e133966 副本、同一个隔离 PostgreSQL 实例独立复现；涉及旧身份迁移期待、图片测试账号身份、登录限流期待、验证码格式期待、社区 HTTP 测试数据、预约时段数量、学号检索身份。不能再把“39 跳过”概括为没有额外问题；这七项仍须在对外发布前核对业务/夹具并闭环。

本轮 iOS 回执 7 项、评分规则 17 项、评分 HTTP 25 项、AppModel/Watch 73 项通过；iPhone/Watch/实时活动扩展 Release 无签名构建通过。无真实账号删除、无生产部署、无真实 APNs 投递。

本机最终以 `vitest run --maxWorkers=4` 执行全量回归：503 通过、5 失败、39 跳过，五个失败与 e133966 对照一致。首次默认并发运行曾额外出现 5 个资源校验失败；这五个文件单独运行 12/12 通过，限制并发的全量运行亦通过，不能据首次结果认定资产丢失。真实 PostgreSQL 三个文件另外执行覆盖了原 39 个跳过项（加同文件一个普通单元测试），结果为上述 33/7。推送 PostgreSQL 31 项与后端构建通过。
