# 课表照片识别

更新：2026-10-24。支持 iOS 与 Web 的照片预览 → 明示同意 → OCR 草稿 → 编辑核对 → 确认保存。学校 MIS 同步保持独立。

## 部署

本实现直接调用腾讯云 `RecognizeTableAccurateOCR` V3（`UseNewModel: false`），按表格单元格的半开行列区间解析课程，无需另建识别服务或让 DeepSeek 接收照片。

在仓库外的受保护环境文件中配置，并向 API 容器透传：

```dotenv
BNBU_TIMETABLE_PROVIDER=tencent
BNBU_TIMETABLE_OCR_SECRET_ID=<专用服务端密钥>
BNBU_TIMETABLE_OCR_SECRET_KEY=<专用服务端密钥>
BNBU_TIMETABLE_OCR_REGION=ap-guangzhou
```

两套 Compose 已透传这四个变量。不要填写在 `VITE_*`、iOS、Git 或公开日志。腾讯云账号需启用表格识别 V3、具备调用权限和可用额度；按实际部署核实区域、数据处理规则和隐私说明。使用专用权限受限密钥，不复用其他功能密钥。未配齐时 workspace 的 `timetableRecognition` 为 `external-service-required`，客户端仍支持手动添加。

兼容已有上游：`BNBU_TIMETABLE_PROVIDER=upstream`、`BNBU_TIMETABLE_UPSTREAM=https://…`，可选 `BNBU_TIMETABLE_TOKEN`。仅 HTTPS 或本机 HTTP 测试地址；禁止跳转。未显式选 provider 时优先已有 upstream，再使用配齐密钥的腾讯云。上游仍接收 multipart `image`，但图片已转 JPEG 并移除元数据；返回 `{lessons:[…]}`，响应限 512 KiB。

依赖新增 sharp 0.35.5；构建时保留为 Node 外部依赖，镜像需要包含其目标平台的 optional 二进制包。无需新增数据库迁移，沿用现有 `security_rate_events`（最新后端 schema 14）。

## 接口与数据保护

- `POST /api/timetable/recognize`：登录学生、账号状态与来源校验后接收一张 `image`。非空 JPG/PNG/WebP ≤10 MiB、≤4000 万像素、单帧；检查真实格式，纠正方向、缩至最长边 2800、转 JPEG、移除 EXIF。转换后 base64 ≤10 MiB。
- iOS 在上传前也解码校验、调整方向和尺寸；系统可读取的 HEIC 转 JPEG。选图不会立即上传。
- 返回 `{lessons, provider, requiresConfirmation:true}`；每项初始 `needsReview:true`。**该接口不写入课表，也不保存原图或完整 OCR 原文。** 不向 OCR 附加账号、会话或平台密码。
- `timetable.save` 的照片确认输入必须含 `source:"photo"`、识别开始前的 `expectedTableId` / `expectedVersion`（首次导入为 `""` / `0`）。版本冲突返回 409，不覆盖并发修改；保存仍只能写当前登录学生自己的课表。已有手动添加与学校同步接口不变。
- 每账号最多 6 次/分钟、30 次/24 小时，每来源地址最多 30 次/分钟；数据库短事务协调多 API 实例，SDK 网络调用不占数据库事务。限制按 socket 地址计，不信任任意转发头；经共享反向代理部署需评估来源限额。
- 腾讯 SDK 超时 35 秒；外部上游 45 秒，iOS/Web 60 秒。客户端取消或切换账号丢弃草稿；服务端发现断连丢弃结果。已发出的腾讯请求可能继续计费，不能承诺撤回。
- 400/413：图片无效/过大；401/403：身份/权限/来源；422：无法可靠解析表格；429：识别限流；502：上游失败；503：未配置。错误不包含密钥和 provider 原始诊断。

## 支持与边界

支持周一至周日的中英文表头（星期横向或纵向）、合并多个时间行的课程，以及含课程名/星期的逐行列表。保留可识别的起止时间、节次、地点、教师、周次及备注；未知字段留空。精确重复去重，周次/星期/地点不同的同名课程保留。

不从节次猜学校作息，不猜单双周，不把跨多个星期列的合并格擅自分配给某一天。最多 100 项课程；每项可在确认前修改、删除或补充。过于复杂、无星期标识、模糊或跨日课程需要换图或手工输入。OCR 会有漏字、错字；即使字段齐全也必须用户核对。

## 验证与上线验收

`tests/timetable-ocr.test.ts` 验证解析器；`timetable-provider.test.ts` 验证真实 SDK 调用形状和配置；`timetable-import.test.ts` 对 SQLite 和真实 PostgreSQL 跑 HTTP/权限/图片/并发冲突/限流/取消回归。设置独立数据库 `BNBU_TEST_POSTGRES_URL` 可启用 PostgreSQL 测试；每例随机 schema 并清理。

iOS 仓库 `Tests/Timetable` 提供只绑定 127.0.0.1 的合成 OCR fixture 与 `TimetableImportUITests`，测试真实相册选择、同意、取消、重复选图、编辑确认、保存及重进页面。云 OCR 在测试中使用明确的替身，不能声称真实腾讯识别准确率通过。

部署后需用获得授权的真实课表照片验证中文/英文、合并格、倾斜与低清图片；确认服务商额度、实际区域、错误提示、弱网及 iCloud 照片下载。核查识别前旧课表不变、确认后手机/Watch 同步、不同账号隔离。不要用学校 MIS 同步成功代替照片识别验收。

API 依据：[腾讯云表格识别 V3](https://cloud.tencent.com/document/api/866/86721)。


## PR #2 合并复核（2026-10-24）

原 PR 全量 590 项通过。复核新增边界测试发现并修复两处问题：

1. 首份课表照片确认与 MIS 持久化使用不同锁，可同时查到“无课表”并各自创建。PostgreSQL `timetable.save` / `timetable.correct` 现在先获取与 MIS 相同的本人课表锁，再读取版本。增加真实 PostgreSQL 的受控交错测试：MIS 先持有锁并创建，照片确认返回 409，只保留一份 MIS 课表。
2. `2:00-3:00 PM`、`下午2:00-3:00` 曾被解析为凌晨 02:00–03:00。当前只自动解析不带时段限定的 24 小时制；带 AM/PM 或中文时段的范围留空并保留原文备注。覆盖课程列表、周课表时间标签和多个时间块拒绝，避免生成错误的上午提醒。

新增测试在修改前复现失败，修复后通过。本轮依然没有调用真实腾讯云或部署生产；图片准确率、真机 HEIC/iCloud 和 Watch 实际同步仍需按上文验证。

复核最终结果：104 个文件、597 项测试通过，零失败/跳过；Compose 152 项、前后端类型检查、lint、Web/后端构建通过。配套 iOS 的业务 smoke、AppModel/Watch 76 项、Release 无签名构建与独立模拟器照片导入 UI 测试（1 项）通过。
