# APNs 与实时活动服务交接（2026-10-24）

## 配置状态

同一个 PostgreSQL API 现在可按设备注册时的 `sandbox` / `production` 环境选择各自的 APNs 私钥和 Key ID。普通通知、提醒和实时活动均走同一环境路由。iOS Debug 使用 Sandbox；TestFlight / App Store Release 使用 Production。

会同里付费团队为 `2X7N2NAF7P`；主 App 已注册 `com.runjizhou.huitongli`，实时活动扩展为 `com.runjizhou.huitongli.live`，Watch 为 `com.runjizhou.huitongli.watchkitapp`。账户侧已创建独立的 Sandbox / Production APNs 密钥与发布证书，实际私钥不在仓库。本文是部署配置交接，未部署生产，未验证真实 APNs 送达。

## 同一后端的双环境配置（推荐）

在仓库外的受保护环境文件中填写：

```dotenv
APNS_TEAM_ID=2X7N2NAF7P
APNS_BUNDLE_ID=com.runjizhou.huitongli
APNS_SANDBOX_KEY_ID=YOUR_SANDBOX_KEY_ID
APNS_PRODUCTION_KEY_ID=YOUR_PRODUCTION_KEY_ID
# 这两个是宿主机上的绝对路径；不要把 .p8 复制到源码或镜像。
APNS_SANDBOX_KEY_FILE=/absolute/private/path/AuthKey_Sandbox.p8
APNS_PRODUCTION_KEY_FILE=/absolute/private/path/AuthKey_Production.p8
```

使用提交的可选 `compose.apns.yaml`，将两把钥匙分别只读挂载到容器，缺少文件时禁止自动创建空目录：

```sh
docker compose --env-file /absolute/private/server.env \
  --env-file /absolute/private/apns.env \
  -f compose.postgres.yaml -f compose.apns.yaml config --quiet
# 经过部署授权并完成数据库/图片备份后再执行：
docker compose --env-file /absolute/private/server.env \
  --env-file /absolute/private/apns.env \
  -f compose.postgres.yaml -f compose.apns.yaml up -d --no-deps --build api
```

容器内 `APNS_SANDBOX_KEY_PATH=/run/secrets/apns-sandbox.p8`、`APNS_PRODUCTION_KEY_PATH=/run/secrets/apns-production.p8` 由覆盖文件设置。直接启动 Node 时，使用这两个 KEY_PATH 变量指定进程实际可读路径，KEY_FILE 仅供 Compose 挂载使用。私钥文件权限设为仅运行账号可读，确保容器运行用户可读；不要在工单或日志中粘贴私钥、JWT 或设备 token。

`compose.postgres.yaml` 的 `APNS_BUNDLE_ID` 默认已改为 `com.runjizhou.huitongli`，并支持环境变量覆盖。SQLite Compose 不运行 APNs worker，不因透传变量而宣称支持推送。API 需出站访问 Apple HTTP/2 443。

## 选择规则、缓存与兼容

- 任意一个 `APNS_SANDBOX_KEY_ID/KEY_PATH` 或 `APNS_PRODUCTION_KEY_ID/KEY_PATH` 非空时，整个进程进入分环境模式。每个环境必须同时有自己的 Key ID、Key Path 和共享 Team ID；缺失时明确不可用，不借用旧通用密钥或另一环境的密钥。Compose 默认透传的空值不算启用分环境模式。
- 只有全部分环境设置为空时，保留旧 `APNS_KEY_ID` + `APNS_KEY_PATH` + `APNS_TEAM_ID` 单密钥模式。只有确实兼容两环境的旧密钥才能同时用于两类设备；现在创建的环境专属密钥应使用新配置，不能靠兼容模式扩展 Apple 授予的权限。
- JWT 缓存按环境隔离，45 分钟刷新；Team ID、Key ID、路径或文件身份/修改时间变化会使对应缓存失效。修改 Docker 环境变量需重建 API 容器；替换只读挂载文件建议重建容器，确保 bind mount 指向新文件。
- 注册/实时活动接口返回的 `configured` 只反映该设备环境的配置字段是否齐备，不表示文件可读或 Apple 接受凭据。只配置一侧时该侧仍能工作；另一侧待发任务按既有退避重试，直到恢复或过期，不因缺配置删除设备 token。
- 同一安装切换 APNs 环境时，取消旧待发任务并清理旧实时活动绑定，避免旧环境 token 被新环境复用；新设备注册和新任务继续走原账号/会话权限检查。
- 普通通知使用主 App Topic `com.runjizhou.huitongli`；实时活动使用 `com.runjizhou.huitongli.push-type.liveactivity`，不是 `.live` 扩展标识。

首次实际投递需核对脱敏错误与设备结果，区分 `InvalidProviderToken`、`BadEnvironmentKeyIdInToken`、`TopicDisallowed`、`BadDeviceToken` 等原因。配置和自动化测试通过不等于真实推送成功。

## 数据与接口

增量迁移 **13** 新增 `notifications.target`、`push_devices`、`push_live_bindings`、`push_outbox`。保留所有既有业务数据；本机已应用。不要修改已部署迁移 SQL，后续变更追加迁移。

接口均用现有 Cookie 会话及账号门禁：

- `GET /api/notifications?category=全部&unread=1&cursor=...`：每页 40，稳定游标，返回全量未读数。
- `GET /api/notifications/:id`：仅本人正文。
- `POST /api/notifications/read-all`：全部本人未读，不受分页/筛选限制。
- `POST /api/push/register`：安装 ID、安装 secret、环境、token、语言、权限、独立设备偏好；服务端从会话确定账号。
- `POST /api/push/unbind`：撤销设备、token 和排队任务。
- `POST /api/push/activity`：安排实例、活动 ID、更新 token、active/dismissed/ended 状态；校验本人真实安排。

业务通知和 outbox 同事务提交。队伍聊天是独立推送事件；私信与队伍消息 payload 不含聊天正文。旧 notification 字段保留，SQLite 原业务继续运行；本轮推送只在 PostgreSQL 启用。

## 调度、过期与运维

- 每 30 秒调度，复用 Web 校历/课表/预约规则投影未来 7 天，使用来源实例/版本/设备/类型去重。
- 事务外 HTTP/2 调 APNs；每次领取带租约与 `FOR UPDATE SKIP LOCKED`，失败指数退避，过期停止；发送前复核会话、账号、通知已读、成员资格、偏好和安排版本。
- APNs 发送是至少一次语义：进程在 Apple 接受后、写入 sent 前崩溃仍可能重发。使用稳定 collapse ID 降低重复展示，不能承诺分布式“恰好一次”。
- 同设备一项实时活动；开始/结束/改期会重选，更新每 15 分钟推进 stale-date，结束不超过系统 8 小时限制；失败的远程启动释放调度槽，避免阻塞后续安排。
- 远程开始后必须从设备回传该活动的更新 token。若系统未唤醒 App/未回传，服务端无法更新或提前结束；卡片 stale-date 会提示待刷新，不能把这种情况视为联调通过。
- 登录会话失效/撤销后暂停该绑定投递，重新登录注册恢复。此版本不另创长期推送会话。
- `push_outbox.last_error` 仅保存 APNs 原因字符串；勿导出 payload/token/secret_hash 到工单或日志。记录 sent 是 Apple 接受证据，不是设备到达证据。
- 关闭服务：移除 APNS_* 环境变量并重建 API。回滚旧代码可保留迁移 13 的附加表/列，不删数据库卷，不逆向删除业务数据。

安全查看聚合状态：

```sql
SELECT kind,status,count(*) FROM push_outbox GROUP BY kind,status ORDER BY kind,status;
SELECT kind,status,last_error,count(*) FROM push_outbox
WHERE last_error IS NOT NULL AND last_error<>'' GROUP BY kind,status,last_error;
SELECT enabled,environment,authorization_status,count(*) FROM push_devices
GROUP BY enabled,environment,authorization_status;
```

## 可复现测试

Node 24；安装仓库锁定依赖后：

```sh
npm run typecheck:server
npx vitest run backend/src/push/apns.test.ts backend/src/push/agenda.test.ts tests/notification-preferences.test.ts tests/backend.test.ts tests/backend-http.test.ts
node scripts/test-deployment-config.mjs
# 使用本地测试数据库；仅创建/删除随机 push_test_* schema
DATABASE_URL='postgresql://...' node scripts/test-push-postgres.mjs
```

现有 Docker 本机无需暴露数据库密码：

```sh
node scripts/test-push-postgres.mjs --bundle-only
docker cp .runtime/push-test/integration.mjs bnbu-postgres-local-api-1:/app/backend/dist/push-integration.mjs
docker exec bnbu-postgres-local-api-1 node /app/backend/dist/push-integration.mjs
```

集成测试仅对随机 schema 操作，finally 删除自身 schema；不会对 public schema 创建测试账号。测试传输为替身，不发送真实 APNs。

本轮结果：全量 Vitest 106 个文件、626 项通过（含 18 项 APNs 单测），零失败、零跳过；真实隔离 PostgreSQL 推送专项 43 项、Compose 静态配置 183 项通过。JWT 单测使用临时 EC 密钥校验 ES256 签名、交错环境路由、缓存隔离/过期/轮换和配置缺失，HTTP/2 为替身，不调用 Apple。

## 后续真机验收

按 iOS 仓库 `docs/NOTIFICATIONS_HANDOFF.md` 执行 Sandbox 允许/拒绝、前台抑制、后台/锁屏/冷启动、课程与活动提醒、实时活动启动/更新/结束/移除、账号切换及 Watch 已读/退出回归。每项保留设备截图和脱敏 APNs 时间/结果摘要。

官方机制：
- [ActivityKit push](https://developer.apple.com/documentation/activitykit/starting-and-updating-live-activities-with-activitykit-push-notifications)
- [APNs token authentication](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)
