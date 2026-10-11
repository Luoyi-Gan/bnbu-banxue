# 伴学本地后端协议

日期：2026-10-11。业务依据为根目录 `BUSINESS_RULES.md`。本协议描述新增 `/workspace` 持久化业务入口；旧 `/v2` 演示数据不导入后端。

体育V8.1的命令、材料锁批和二进制上传/读取接口见 [SPORTS_REBUILD.md](SPORTS_REBUILD.md)。数据库迁移2新增按SHA-256保留原文件的 `sports_media_blobs`；原表和历史数据不删除。图片解析依赖sharp，视频解析依赖ffprobe-static（也可配置 `BNBU_FFPROBE` 绝对路径）。JSON请求仍限制12MiB；锁定媒体使用独立二进制入口，大小须与受理清单一致。

## 运行与身份

Node.js 24（使用 `node:sqlite`），SQLite WAL，单进程 HTTP 服务。网页在 `127.0.0.1:4174`，后端在 `127.0.0.1:4175`，浏览器仅访问同源 `/api`。默认数据库 `data/bnbu.sqlite`，可由 `BNBU_DATABASE` 指定。

邮箱注册只证明账号流程完成，不授予学校身份或业务职责。业务请求从 HttpOnly、SameSite=Strict Cookie 查找有效会话，再读取当前账号角色和状态；请求中的作者、角色、学时或审核状态不能覆盖服务端决定。密码使用独立盐和 scrypt；数据库不保存明文密码。登录会话有效期 12 小时，退出删除该会话。封禁账号保留读取和历史但不能业务写入，禁言阻止发帖、评论、聊天。

角色：`student`、`teacher`、`reviewer`、`operator`、`superadmin`。体育资格不能通过此角色接口创建，继续由原体育系统确认。超级管理员不能停用或降级唯一有效超级管理员。

## HTTP 接口

| 方法与路径 | 输入或结果 |
| --- | --- |
| GET `/api/health` | `{ok, storage, schemaVersion}` |
| POST `/api/auth/verification-codes` | `{email}`；成功 `{sent:true,delivery,message}`。十分钟有效，每邮箱六十秒间隔、最多五次核验 |
| POST `/api/auth/register` | `{email,code,password}`；成功 `{registered:true}`，不自动登录或授予角色 |
| POST `/api/auth/login` | `{email,password}`；成功 `{authenticated:true,account}`，设置 Cookie |
| POST `/api/auth/logout` | `{}`；删除当前会话 |
| POST `/api/identity/check` | 仅接受 `{}`，使用当前登录账号核验；返回 `{verified,subject,checkedAt,authorizationChanged:false}`，不改变职责或体育资格 |
| GET `/api/auth/me` | 当前账号，未经授权返回 401 |
| GET `/api/workspace` | 本人可见实体、账号、展示人员、校友、通知、本人关系；有权人员额外获得审核/运营记录 |
| POST `/api/commands` | 下述命令信封；成功 `{data:{id}}` |
| POST `/api/timetable/recognize` | 登录学生的 multipart `image`，最多 10MB JPG/PNG/WebP。有效响应 `{lessons:[...]}`，识别自身不保存课表 |

JSON 写请求必须发送 `Content-Type: application/json`，上限 12MB。浏览器写入检查 Origin 和 Sec-Fetch-Site。错误为 `{code,message}`；400 业务校验失败，401 会话无效，403 无权限，404 对象/接口不存在，409 重复或状态冲突，413 过大，429 频率限制，502/503 外部依赖失败或未配置，500 内部持久化失败。

```json
{
  "requestId": "客户端生成的唯一请求标识",
  "action": "coffee.book",
  "input": {"slotId": "服务端时段ID", "topic": "交流问题"}
}
```

同一账号同一 `requestId`、相同内容返回原结果；不同内容返回 409。所有业务命令在 `BEGIN IMMEDIATE` 内复核权限、状态、容量及冲突，同时提交业务、站内通知、审计和请求回执。失败回滚。客户端遇到响应不确定时保留同一幂等键重试，收到明确结果后才更新页面。

## 命令目录

真实身份核验适配：服务端配置 `BNBU_IDENTITY_VERIFICATION_URL` 和可选 `BNBU_IDENTITY_VERIFICATION_TOKEN`。上游接收 `{requestId,accountId,email}`，必须回传相同 requestId/email、明确布尔 verified，verified=true 时还需非空 subject。不跟随重定向；十秒超时或非法/错账号/旧请求响应返回 502；未配置返回 503，不返回假成功。角色映射和学校正式授权政策独立实施，当前不采纳上游 roles。测试只验证适配边界，不是学校真实核验。

未列出的客户端字段不能授予资格。所有 `id`、`slotId` 等来自服务端，不用姓名判断归属。日期使用带时区的 ISO 时间，邮件显式字段沿用现有北京时间格式。

| 命令 | 必填输入及可选输入 | 权限与主要约束 |
| --- | --- | --- |
| `post.create` | title, body, board；images[] | 学生；80/1000 字、最多九图，待审 |
| `comment.create` | postId, body | 学生；公开帖子、最多300字，待审 |
| `content.review` | id, status=visible/hidden, reason | 审核职责；原因、通知和审计 |
| `room.create` | type=study/entertainment/carpool,title,body,time,place,capacity | 学生；队长计入容量 |
| `room.apply` | id | 开放公开且有名额，无重复待申请 |
| `room.decide` | id=申请ID, accept | 队长；批准时再次核对容量与申请人状态 |
| `room.finish` | id | 所属队长；保留成员与历史，停止消息 |
| `room.moderate` | id,decision=hide/restore/finish/remove,reason；memberId | 审核职责；不能移除队长，通知受影响成员 |
| `room.review` | id,targetId,stars；comment,tags[] | 已结束队伍成员互评、不能自评或重复 |
| `message.send` | roomId,body | 当前公开开放队伍成员；禁言/封禁不能发 |
| `report.create` | id,reason | 学生；保存对象快照、同对象待处理举报去重 |
| `report.decide` | id,upheld,reason | 审核职责；成立下架原对象、分别通知 |
| `certification.apply` | kind=student/club/official,organization,note | 学生；相同待审申请去重 |
| `certification.review` | id,approve；reason | 审核职责；驳回和撤销须原因；不授予管理/体育资格 |
| `activity.create` | title,description,startAt,location,capacity | 已认证社团成员；保存唯一账号归属 |
| `activity.visibility` | id,publish | 本人；恢复重新核验资格 |
| `relation.set` | id,kind,enabled | 本人关系幂等；activity: like/save/participate，post: like/save，room: save，organization: follow |
| `coffee.profile` | nickname,bio,topics,location,enabled；teacherId | 教师本人或运营；有有效预约不能停用 |
| `coffee.slot.create` | startAt,endAt,location,capacity；teacherId | 教师本人或运营；未来、同教师不重叠 |
| `coffee.slot.update` | id,startAt,endAt,location,capacity,closed | 有占用不能改时间或关闭；容量不得低于占用 |
| `coffee.book` | slotId,topic | 学生；条件满足即成立，无教师再次审批 |
| `coffee.cancel` | id；reason | 当事学生、所属教师或运营；教师/运营须原因 |
| `coffee.move` | id,slotId,reason | 所属教师或运营；原占用保留、新名额预留 |
| `coffee.answer` | id,accept | 仅预约学生；再次复核时段，释放对应占用 |
| `alumni.apply` | major,graduationYear,city,direction,experience,topics,bio,evidence | 学生；复用原首版说明核验，不代表学校正式核验 |
| `alumni.profile` | city,direction,experience,topics,bio,accepting | 本人已通过资格；不改原毕业身份 |
| `alumni.review` | id,approve；reason | 审核职责；撤销关闭时段、取消未来有效申请并通知 |
| `alumni.follow` | id | 学生，不能自己关注自己；切换本人关注状态 |
| `alumni.post` | title,body,direction | 认证校友；使用同一社区待审记录 |
| `alumni.slot.create` | startAt,endAt,location | 本人认证校友；未来不重叠 |
| `alumni.slot.close` | id | 无有效申请或预约才可关闭 |
| `alumni.request` | slotId,question | 学生；最多500字，待确认不占正式预约 |
| `alumni.decide` | id,accept；reason | 仅校友本人；拒绝须原因，确认后竞争申请结束 |
| `alumni.cancel` | id；reason | 当事人；已确认取消须原因，待申请可撤回 |
| `organization.apply` | name,description,category,contact | 学生代表；同名待审/已入驻去重 |
| `organization.review` | id,approve；reason | 审核职责；通过形成同一入驻对象 |
| `organization.update` | id,description,contact,visibility,reason | 运营；公开状态不撤销入驻资格 |
| `knowledge.save` | title,body,keywords,source,status；id | 运营；修改原记录或新建 |
| `knowledge.ask` | question | 学生；只用已发布知识，返回依据，无匹配不编造 |
| `feedback.create` | answerId,reason | 本人回答；待反馈去重、保留快照 |
| `feedback.resolve` | id,reason | 运营；通知原反馈人 |
| `profile.save` | nickname,avatar | 本人；1–20字、头像最多5MB，不改学校身份 |
| `timetable.save` | lessons[]；fileName | 学生本人；复用原有效结果校验，无效不替换 |
| `timetable.correct` | lessonId,name,weekday,startTime,endTime,period,location,teacher,weeks,note | 本人已有课程，复用原修正规则 |
| `notification.read` | id | 仅接收人，重复已读不增加计数 |
| `notification.send` | recipients[],body | 运营，逐人通知；按实际通知数计算已读率 |
| `account.update` | id,status,roles[],reason | 超级管理员；禁止停用/降级唯一超级管理员 |
| `mail.import` | messageId,subject,sender,body；cover,coverName | 运营导入来源，复用原显式字段识别；不是声称接入真实学校邮箱/AI |
| `mail.correct` | id,title,description,startAt,endAt,location,host,conditions,reason | 运营；保留原值新值、原因和依据；隐藏不会自动恢复 |
| `mail.cover` | id,cover,coverName,reason | 运营补充/替换活动相关附件，保留历史 |
| `mail.visibility` | id,publish,reason | 运营下架/恢复，恢复重新校验 |

## 数据模型与访问范围

### 体育审核与补证命令

均走 `/api/commands`，保留事务、审计及幂等回执；读取 `/api/sports/workspace`。

| 命令 | 输入与限制 |
| --- | --- |
| sports.ai.manual | courseId,endAt,reason；体育总管理员，结束时间须在未来，限定原课程责任教师 |
| sports.ai.stop | id,version,reason；停止指定人工模式，已排入教师队列的任务继续处理 |
| sports.ai.retry | id,version；仅技术失败，不覆盖教学结果 |
| sports.review.decide | id,version,batchId,checksCompleted=true,decision=PASS/RETURN/INVALID；后两者需固定reason，可选publicExplanation；RETURN另需hours=24/72和canSupplementOriginal=true |
| sports.supplement.prepare | id,version,reuseIds[],files[]；本人待补证记录、未截止，文件结构沿用首版；仅准备，不是正式受理 |
| sports.supplement.reset | id,version；仅放弃未正式受理准备包，历史保留、计时和次数不重置 |
| sports.supplement.submit | id,version；本版全部材料到账且严格早于最终截止，正式受理后仅进入教师新轮次 |

补证新材料复用媒体上传接口；准备包状态为UPLOADING/READY，受理变为COMPLETE，放弃为ABANDONED。记录仍使用原运动时长、日期与分类；原始材料永久保留。workspace提供补证倒计时、公开判断、教师轮次和当前进度投影。

AI适配配置 `BNBU_SPORTS_AI_URL`、可选 `BNBU_SPORTS_AI_TOKEN` 与 `BNBU_SPORTS_AI_VALIDATION_REF`。未填写验证引用不发送媒体，进入AI_NOT_VALIDATED；引用只作为当前运维声明，真实学校样本验证与管理界面仍需完成。请求含requestId、recordId/recordVersion、batchId/batchVersion、validationRef、原材料及规则；响应须匹配四项对象/版本和requestId，包含checksCompleted=true、outcome=NORMAL/EXCEPTION、非空modelVersion。限制HTTPS或本地HTTP、20秒超时、响应64KB，不记录密钥和原始响应。验证引用不能用测试值冒充真实效果验收。

`schema_migrations` 管理版本；`accounts`、`sessions`、`email_challenges` 管理身份；`entities` 保存类型、所有人、JSON业务属性、版本和时间；`relations` 以账号、对象、类型为联合主键；`notifications` 保存独立接收及阅读状态；`audit` 追加处理记录；`command_receipts` 防止重试重复执行；`mail_outbox` 区分生成通知与实际邮件发送回执。账号与对象引用设外键；多步操作统一事务。

私聊不因管理员身份开放；队伍聊天只有当前成员可读写。学生不能读取其他人的认证说明、课表、个人通知或预约问题。作者能核对自己的待审内容；收藏引用不使下架正文继续公开。学校邮件原文和发件人只出现在运营可见的 `mail` 实体中，不在公开活动投影中。

## 外部服务适配

- `BNBU_EMAIL_DELIVERY_URL`：服务端 POST JSON `{to,subject,text,idempotencyKey}`，可配置 `BNBU_EMAIL_DELIVERY_TOKEN` Bearer token。仅收到成功 HTTP 和 `{sent:true}` 才对网页报告真实邮件已发送。
- `BNBU_LOCAL_OUTBOX=1`：显式启用开发收件箱。验证码只在本地数据库，网页明确提示没有发送真实邮件。可用 `node scripts/acceptance.mjs outbox <email>` 读取指定邮箱的最近三封开发邮件。
- `BNBU_TIMETABLE_UPSTREAM`：服务端 multipart `image`，可配置 `BNBU_TIMETABLE_TOKEN`；响应 `{lessons:[...]}`，复用原课表校验。超时/无效响应不保存原照片或替换课表。没有配置时前端不上传。
- `BNBU_SPORTS_ORIGIN`：Vite 将原 `/api/v1` 转发到原体育后端；`BNBU_SPORTS_OBJECT_ORIGIN` 可提供原对象服务 `/minio` 转发。未配置返回503，不生成替代体育数据。

正式邮箱接收、AI识别/封面生成、原体育账号统一与真实跨端审核尚需实际服务配置和联调。不得以本地夹具或适配器契约测试宣称这些外部服务已通过验收。

## 体育维护与学校日历

- sports.system.mode：version（初次0）、mode=NORMAL/MAINTENANCE、reason；进入维护另需titleZh/titleEn/bodyZh/bodyEn/estimatedRecoveryAt。服务端写入sportsPause和sportsSystemHistory，恢复仅关闭原暂停。总管理员或体育身份permissions包含SYSTEM_MODE可执行。维护时普通sports命令在幂等读取前也受阻，AI恢复治理命令只由总管理员执行。
- sports.calendar.publish：name/source/daysText/confirmed=true；daysText每行为YYYY-MM-DD,WORKDAY或YYYY-MM-DD,REST，须覆盖连续日期且包含休息日。仅总管理员，发布新不可变版本。
- sports.calendar.bind：id（未结束审核轮次）、version、calendarId、reason；明确迁移，写入sportsCalendarBinding历史，不能改写已结束轮次或原入队时间。
- workspace新增system公告/权限/历史/本人暂停摘要；维护时正常业务集合为空。正常时提供calendars/calendarRounds/slaReminders（总管理员范围），责任教师reviewRounds包含clock。无日历或覆盖不足返回明确calculationStatus及空截止，不猜测普通周一至周五。

## 平台事故与P-04技术恢复

- sports.incident.confirm：reference、evidenceRef、reason、startAt/endAt（已发生实际区间）、recordIdsText（每行或逗号分隔记录编号）。仅总管理员；事故引用唯一。写入sportsIncident、逐记录sportsPause和sportsDeadlineAdjustment，不自动改判。
- sports.incident.restore：id/version、incidentId、terminalEventId、roundId/roundVersion、reason。仅当前系统错误补证逾期、未结算归档且原剩余时间为正才恢复；错误锁定区间追加去重，原终局和已用次数不删除。写入sportsCorrection及公开事件/通知/进度版本，同事务提交。
- workspace新增总管理员范围incidents/corrections/expiryCandidates；本人及责任教师的材料投影含deadlineAdjustments。技术证据不投影给学生或教师。维护期间恢复入口关闭，须先明确恢复正常模式。

## 责任教师普通误判更正

sports.review.correct输入id/version/batchId/checksCompleted=true/decision=PASS或INVALID/publicExplanation（必填公开依据）；INVALID还需适用固定reason。仅原责任教师且当前状态VALID/INVALID、材料完整；不提供RETURN，不改变补证机会、运动原事实及素材。追加公开CORRECTION事件含前状态/原因/说明/版本，重新生成进度并通知学生。结算/归档分支当前明确报需历史报告更正入口，待同步报告版本实现后接通。

## 游泳专用协议

- sports.swim.before：courseId、file={clientId,sha256,size,mime}。有效课程成员提交JPEG/PNG原图指纹承诺，服务器记录committedAt。返回sportsSwimEvidence；此步未上传照片，不视为完整材料。
- sports.session.start新增activityType=EXERCISE/SWIM（旧客户端默认EXERCISE）。SWIM必须携带本人、本课且未绑定的beforeEvidenceId，同事务绑定，不能跨会话复用。
- sports.record.accept的activityType须匹配原会话。游泳files[]增加phase=BEFORE/AFTER/AUXILIARY，恰好一份BEFORE匹配开始前锁定指纹且至少一份AFTER，两者都须照片，仍受总计6照片/1视频限制。正常严格早于结束+15分钟；offlineDelay=true另需非空delayExplanation，严格早于结束+24小时。两者锁批续传截止均为受理+30分钟。
- 离线游泳材料全部到账后status=TEACHER_PENDING、queueSource=SWIM_OFFLINE_DELAY，保留说明、不创建AI任务、不使用补证机会。真实格式校验继续走现有二进制上传接口。
- 游泳sports.supplement.prepare的reuseIds必须保留原BEFORE和AFTER；新照片仅作AUXILIARY，不允许事后替换原取证。补证受理沿用原24/72小时窗口。

## 课程与成员管理命令

以下均仅原责任教师、当前未结算学期，沿用全局维护拦截、事务和幂等。所有命令需version和reason；追加sportsCourseHistory并通知受影响学生。

- sports.course.describe：id/name/description/confirmed=true；只改名称说明，不改发布规则。
- sports.course.enrollment：id/open:boolean；仅PUBLISHED。关闭时撤销现有有效邀请，重开不恢复旧邀请码。
- sports.enrollment.remove、sports.enrollment.restore：id为成员关系。ACTIVE→REMOVED及REMOVED→ACTIVE；恢复须课程未关闭且无同学期其他有效班。原对象ID、原记录及原会话保持。
- sports.makeup.create：courseId、version为课程版本、enrollmentId、startAt/endAt（ISO带时区）。当前有效成员，课程未关闭，开始不早于服务器当前时刻，窗口限常规截止次日00:00起七天内。返回sportsMakeup。
- sports.makeup.revoke：id/version为补练窗口，撤销后不允许依该窗口建立新运动，已有合法会话不变。
- workspace增加本人或责任教师可见makeups、由当前成员关系推导的studentStatus；教师成员投影只增加账号姓名摘要，不公开邮箱/密码或其他课程数据。

## 2026-10-13 邀请登记与自然到期宽限

已授权学生可先登记邀请、查看课程/学期/责任教师摘要，再确认入班。sports.enrollment.begin(code)保存本人sportsEnrollmentFlow及服务器startedAt、固定deadline=邀请到期+10分钟；同一账号同一邀请重复登记返回原流程，不续期。sports.enrollment.join(flowId)仅接受本人未完成流程，继续校验邀请未撤销、课程入班开放、当前学期和唯一有效班。无flowId仍可在邀请有效期内直接加入，到期后不能伪造宽限。workspace仅公开本人流程及canComplete。

33文件214项测试、双端类型检查、Lint、构建通过；含到期前登记、到期后拒绝新流程、十分钟严格端点、重复登记不续期、撤销立即终止、伪造截止无效及完成后重放拒绝。新增网页点击验收未完成，Docker仍为此前201项验证。学校首次注册、资料与邮箱绑定仍待实现，本阶段并非正式注册流程完整交付。完整目标继续进行。
