# APNs 与实时活动服务交接（2026-10-24）

## 配置状态

代码已接入当前 PostgreSQL API。未提供付费 Apple Team、Key ID 与 `.p8`，本机日志明确显示 APNs disabled，不会伪装成功投递。用户要求开发者账号配置交由后续接手人完成。当前 iOS 本地 Personal Team 不支持 Push Notifications。

## 凭据与环境

需要付费 Team 的 APNs Auth Key；主 App Bundle ID `edu.bnbu.banxue.student`，实时活动扩展 `edu.bnbu.banxue.student.live`。主 App 开启 Push Notifications，扩展同 Team 签名。私钥放仓库外，权限仅部署账号可读。

本地 `.env.local`（已有 Git 忽略）增加以下占位项，实际值由接手人填写：

```dotenv
APNS_TEAM_ID=YOUR_PAID_TEAM_ID
APNS_KEY_ID=YOUR_KEY_ID
APNS_KEY_PATH=/run/secrets/apns.p8
APNS_BUNDLE_ID=edu.bnbu.banxue.student
```

本地 `.runtime/compose.apns.local.yaml`（Git 忽略）示例：

```yaml
services:
  api:
    volumes:
      - /absolute/private/path/AuthKey.p8:/run/secrets/apns.p8:ro
```

```sh
docker compose --env-file .env.local -f compose.postgres.yaml \
  -f .runtime/compose.iphone.local.yaml -f .runtime/compose.apns.local.yaml \
  up -d --no-deps --build api
```

路径要换成本机真实私钥路径，不把文件复制到源码/镜像。API 容器需出站访问 Apple HTTP/2 443。App 的 Debug token 对应 `api.sandbox.push.apple.com`，Release 对应 `api.push.apple.com`；推送使用主 App topic，实时活动使用主 App topic 加 `.push-type.liveactivity`，不是扩展 bundle ID。

配置只判断环境是否齐备，不等于 Apple 接受凭据。首次实际投递须查看脱敏结果，修正 `InvalidProviderToken / TopicDisallowed / BadDeviceToken` 等原因后再验收。

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
npx vitest run backend/src/push/agenda.test.ts tests/notification-preferences.test.ts tests/backend.test.ts tests/backend-http.test.ts
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

## 后续真机验收

按 iOS 仓库 `docs/NOTIFICATIONS_HANDOFF.md` 执行 Sandbox 允许/拒绝、前台抑制、后台/锁屏/冷启动、课程与活动提醒、实时活动启动/更新/结束/移除、账号切换及 Watch 已读/退出回归。每项保留设备截图和脱敏 APNs 时间/结果摘要。

官方机制：
- [ActivityKit push](https://developer.apple.com/documentation/activitykit/starting-and-updating-live-activities-with-activitykit-push-notifications)
- [APNs token authentication](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)
