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

## 2026-10-13 体育管理权限边界

新增统一固定八项权限：COURSES_VIEW、SEMESTERS、ACCOUNTS、FEEDBACK、GLOBAL_RULES、SYSTEM_MODE、HELP、AUDIT。只有有效体育管理员身份可获对应权限；体育总管理员具备全部管理权限，但不取得责任教师业务。修正原学期/模板命令只检查体育管理员角色的缺口：学期创建编辑切换强制SEMESTERS，模板发布仅总管理员；GLOBAL_RULES不能发布模板。课程目录须COURSES_VIEW，系统模式复用统一权限判定，网页学期和模板入口使用服务器返回的administratorAccess。

33文件215项测试与双端类型、Lint、构建通过，覆盖未授权拒绝、分管理员学期授权、GLOBAL_RULES禁止发布模板、收回权限后立即拒绝。测试夹具明确给治理负责人总管理员身份，未放宽产品权限。新增浏览器验收未完成，Docker仍对应此前201项。分管理员创建/资料治理/停用删除、个人改密和首次改密门禁尚待实现；其余六项权限对应未实现业务也未因此宣称完成。

## 2026-10-13 教师和管理员本人改密

sports.password.change(version,currentPassword,newPassword,confirmPassword)仅有效教师或体育管理员本人执行，version绑定本人sportsIdentity。校验当前密码、新密码非空及确认一致；成功同事务更新scrypt凭据、清除mustChangePassword、注销其他会话、保留当前会话并通知。普通审计仅记录结果ID，不写入原密码和新密码。体育个人密码不继承伴学注册8–128字符规则；登录也能使用这种个人密码。教师维护期间禁止，管理员维护期间保留安全改密入口。网页使用密码类型输入框。

33文件217项测试、双端类型、Lint、构建通过，验证短个人密码、原密码失效、当前会话保留、其他登录失效、错误密码/确认不一致原子拒绝、教师与管理员维护差异、审计无明文密码。浏览器点击验收未完成。首次改密的全业务门禁、账号创建/停用删除和邮箱自助找回仍待完成；本轮只交付本人改密链，不表示完整账号治理完成。整体目标继续。

## 2026-10-13 首次改密门禁

体育teacher/admin身份mustChangePassword=true时，所有业务命令在幂等回执读取前拒绝（仅sports.password.change例外）。体育角色与记录读取同样检查；体育工作台仅返回身份、必要模式公告和firstLoginOnly，关闭治理权限/历史；通用工作台返回空业务集合，避免通过伴学审计或其他身份绕过。媒体、课表识别、身份核验受阻；网页只显示首次改密入口，保留退出。教师维护期间仅公告并保留门禁；管理员可本人改密，但不能借维护治理跳过门禁。成功改密清除标记后重新获取当前数据。

33文件219项测试、双端类型、Lint、构建通过。新增实际HTTP验证首次工作台无课程/通用业务/审计、媒体403 PASSWORD_CHANGE_REQUIRED；命令测试覆盖旧幂等请求不能绕过、改密后恢复、维护AI治理仍受阻。新增网页点击验收未完成。账号创建流程尚须设置临时密码标记；现有独立测试账号未被擅自重置为初始密码状态。账号创建/停用删除/自助找回及其余完整业务继续推进。

## 2026-10-13 教师批量建号

sports.teachers.preview(csv)要求ACCOUNTS权限，支持粘贴UTF-8 CSV及引号/逗号字段；列仅employee_id,name,email与可选college，禁止密码列，每批1–500行。逐行校验必填、学校域名、批内工号/邮箱重复及现有账号冲突，保存本人预览。sports.teachers.create(id,version,confirmed,initialPassword,confirmPassword)再次全量校验与权限检查，初始密码至少8位且含大小写字母和数字，两次一致；任何失败整批回滚。确认明确要求逐行核实真实教师邮箱和受控告知初始密码。

新账号保存独立scrypt凭据、teacher角色及体育身份，自动mustChangePassword=true；密码不在CSV、预览、业务实体或审计中保存明文。workspace仅有ACCOUNTS权限者可读取本人的teacherImports预览。网页已接通预览表和确认建号，无后台代改个人密码功能。

配置BNBU_SCHOOL_EMAIL_DOMAINS为逗号分隔的已确认学校域名，未配置拒绝建号。正式域名已向用户询问，尚未确认；Start-Local.ps1 -Acceptance在未指定域名时仅设example.test，用于用户已授权的独立本地测试，不证明学校身份。实际运行环境当前也仅配置此测试域名。

33文件221项测试、双端类型、Lint、构建通过；验证带引号CSV、整批成功、首次改密门禁、密码无明文持久化、未配置域名拒绝、密码列拒绝、重复行、预览后冲突整批不建。新增网页点击、正式学校域名/实际教师身份未验收。教师账号删除与历史主体处理、分管理员治理、学生注册及其他完整范围继续进行。

## 2026-10-13 体育学生反馈

sports.feedback.submit(type,description)仅体育学生本人；类型BUG/SUGGESTION/ACCESSIBILITY/PRIVACY/OTHER，服务器生成编号、时间和NEW状态，忽略客户端指定处理状态/处理人。sports.feedback.reply(id,version,status,reply)要求FEEDBACK权限，每次必须填写公开回复，状态只能PROCESSING/TECHNICAL/RESOLVED/CLOSED；允许关闭后重新跟进，不能回NEW。追加不可覆盖的sportsFeedbackReply，含处理人姓名、顺序、时间、前后状态及公开内容，通知原学生。反馈不改写任何教学事实。

workspace提供feedback、feedbackReplies、canManageFeedback；学生仅本人、授权管理员全部，教师无访问权。管理员读取当前姓名/邮箱和已知学号（缺少时不编造）；学生不取得管理端身份补充字段。网页具备数量概况、编号/身份/描述搜索、分类和状态筛选、清除筛选、六条分页、公开历史及回复入口。

33文件223项全量测试通过，随后补强不同学生隔离和同时间回复顺序，课程/账号/反馈20项复测通过；双端类型、Lint、构建通过。新增网页点击未验收；历史主体注销后的身份清理须随注销流程补齐，不宣称已完成注销隐私验收。学校域名仍待确认，账号治理、名单/OCR、认证免测、成绩与结算等完整范围继续。

## 2026-10-13 帮助中心与正式教师域名确认

用户明确正式教师邮箱为@bnbu.edu.cn，正式环境未覆盖BNBU_SCHOOL_EMAIL_DOMAINS时默认仅bnbu.edu.cn；Acceptance显式使用example.test测试域名。域名不是身份真实性证明，仍须授权管理员逐行核实。此前“正式域名待确认”是历史状态，本决定已解除该待确认项。

帮助管理要求HELP权限。sports.help.save输入id/version/updatedAt（编辑时）、titleZh/titleEn/bodyZh/bodyEn/keywords/category/weight/publish；关键词按中英文逗号拆分、去空去重，权重接受有限小数及负数。草稿至少双语标题与分类，任何公开保存需双语正文和关键词。sports.help.state仅允许draft→published、published→archived、archived→published，检查版本及打开时更新时间，无删除/回退草稿。每次追加sportsHelpHistory前后内容、操作者与结果，首次发布事实保留，无发布通知。

GET /api/sports/help?lang=zh|en：授权管理员取得编辑源，学生仅当前语言已发布标题、正文和分类，不含另一语言、关键词、权重或历史。教师无帮助管理资格，维护及首次改密期间不能读取普通帮助。网页有状态概况、搜索分类、五条分页、双语编辑预览、关闭/Escape未保存提示、发布/下线确认及刷新当前内容；正文按文本核对，不执行HTML或承诺Markdown排版。

33文件225项全量回归通过，新增正式域名测试后对应23项复测通过，合计226项；类型/Lint/构建通过。新增网页点击尚未验收，暂无植入测试帮助文章。整体目标仍含账号治理、名单/OCR、免测/认证、内部成绩、结算报告及真实服务联调。

## 2026-10-13 耐力跑换算表

数据库迁移3一次性建立V8.1四套表及404行：男大一/二1000米、男大三/四1000米、女大一/二800米、女大三/四800米。分别100分截至239/249/229/239秒，99至1分连续3秒一档，0分至600秒；等级按95/92/60阈值，首段保留规定备注。迁移不覆盖已维护表，健康接口从数据库读取实际迁移版本。

sports.conversion.add/edit/remove要求GLOBAL_RULES，id/version绑定所选表，rowId绑定原行。新增编辑输入min/max非负整数、score整数0–100、grade、可选note；删除需confirmed=true。每次验证完整表从0连续、无间隙重叠、较慢用时不增分及等级一致，失败不写；成功追加sportsConversionHistory前后整表与版本。没有批准、启用、批量发布或越权模板治理入口。

workspace仅授权管理员取得conversionTables，网页可切换四表、编辑、确认删除和末尾追加。convertEndurance按性别/年级组/项目唯一匹配整数秒，返回当时表版本及行；异常不猜测邻近分数。该函数仍待连接教师原始用时确认及结果持久化，不能将独立计算测试表述为成绩导入完成。

33文件228项测试、类型/Lint/构建通过，验证四表404行、上下闭边界、错项目与超范围拒绝、学生不可见、间断/等级/权限/版本拒绝和历史前值。新增浏览器验收未完成，内部成绩与免测/认证等剩余流程继续进行。

## 2026-10-13 教师内部最终成绩

sports.grade.save(enrollmentId,version,score)仅原课程责任教师，version为现有草稿版本或初次0；成绩接受32位INT完整范围，不强制0–100、不绑定进度。保存新的草稿及追加修改历史，禁止备注和其他附加字段。sports.grade.publish(id,version)将当前草稿发布为独立sportsGradePublication，关联前版、序号、原草稿版本和教师，原版不覆盖；不产生学生通知或更改运动分钟。

workspace仅责任教师取得gradeDrafts/gradePublications，学生和管理员均为空。教师课程卡中填写/修改、确认发布及查看历次内部版本；学生页面没有成绩入口。关闭课程仍可处理已有学生成绩；已结算或归档的分支明确要求历史报告更正入口，目前该分支尚未接通，不以拒绝覆盖代替完整历史更正交付。

33文件230项测试、双端类型、Lint、构建通过。验证120和-5可发布、顺序及前驱保留、学生/管理员隔离、无学生分数通知、不改进度、备注/非整数/超INT/权限/版本/结算拒绝。新增网页点击与真实学校正式成绩渠道未验收。原始用时/OCR、免测/认证、正式名单、结算报告、账号治理及其他完整范围继续。

## 2026-10-13 耐力跑原始事实与冻结换算

sports.endurance.confirm(enrollmentId,version,event,seconds,testDate,confirmed=true)仅责任教师。首次version=0，更正须当前sportsEndurance版本；event只接受800/1000，seconds非负整数，日期须合法且不在未来，必须明确确认。不接受手工分数、指定表或额外字段。新记录要求已发布课程有效成员；关闭或移出后只可更正已有事实，结算/归档须后续报告更正入口。

每次确认保存当前sportsEndurance并追加不可覆盖sportsEnduranceRevision。服务端读取唯一已核验sportsIdentity的sex(MALE/FEMALE)及当前year(1–4)，据此选择项目及JUNIOR/SENIOR；教师不能从录入请求指定这些字段。现有本地验收身份尚未填写这些人口属性，不假造资料，因此会明确换算不可用。正式注册资料采集及年级维护仍须后续接通。已知性别与项目冲突拒绝；缺资料、缺唯一表或区间不匹配时保留原始事实和UNAVAILABLE原因。成功换算保存表ID、版本、原行、分数和等级；表变更不重算旧结果，相同原始事实重复确认也不触发重算。

workspace增加enduranceRecords/enduranceHistory。责任教师取得本人课程完整内容；学生投影只含原始项目、秒数、日期及必要课程/版本标识，管理员无此教学明细。通知只含原始事实，不携带分数、等级或换算原因。不改变运动分钟、进度或教师最终成绩。教师课程卡逐人核对、更正，学生查看原始记录与确认历史。此入口是人工逐人确认；电子表格/OCR导入、免测及结算后更正未完成，不以人工入口替代这些需求。

33文件233项测试全部通过，双端类型、Lint和构建通过；已有大块构建提示仍存在。验证原始事实及更正、旧换算冻结、学生/管理员隔离、无分数通知、资料/区间不足、非法输入、权限、版本、关闭更正和结算阻止。新增浏览器点击尚未验收。Docker此前230项验证对应8699738，此次新增分支为Windows验证。

## 2026-10-13 耐力跑CSV草稿与批量核对

sports.endurance.import(courseId,csv)读取五列表头student_number,name,event,time,test_date，允许顺序变化；当前命令入口最多200,000字符、1–500行。复用教师CSV解析器，原始CSV和错误/重复行保留。网页可选择UTF-8 CSV或粘贴内容，直接读表不经OCR。新批次要求未结算、未归档、已发布课程；只登记受理时本班有效成员范围。

sports.endurance.row(id,version,row,reason,exclude?)：未确认行可对照原件更正五字段，或明确排除并说明原因；排除行可再次核对恢复，确认行不可覆盖。每次追加sportsEnduranceImportHistory。按学号唯一匹配sportsIdentity，再精确核对账号姓名、项目/性别、测试日期和用时；用时只接受整数秒或m:ss，不自动解释4.30。重复学号所有相关行均标疑，不以姓名猜测或合并身份。正式体测版本或匹配关系变化须重新核对该行。

sports.endurance.batch.confirm(id,version,rows,confirmed=true)要求所选行全部为无疑点待处理行；调用同一原始体测确认逻辑，在execute事务内保存，任一失败全部回滚。成功行标CONFIRMED并关联结果，其余行保持待处理；只有全部确认或明确排除才COMPLETE。已受理批次在关闭/移出后可继续原有效成员处理，服务器内部传递受理范围，客户端不能伪造该范围。结算/归档仍要求未完成的历史报告更正流程。学生和管理员均不取得草稿、原始CSV或行核对历史。

workspace新增仅责任教师可读的enduranceImports；前端支持原件对照、逐行疑点、修正/排除、勾选范围和确认声明。33文件236项测试、双端类型、Lint和构建通过。测试涵盖部分确认、错误整批阻止、重复行处理、明确4:30、记录版本竞争、CSV上限、权限投影、关闭续办和数据库故障回滚。新增网页点击未验收。XLSX、纸质OCR原图/识别服务、正式学生身份资料与名单、免测认证及结算继续进行；本轮CSV技术入口不代表全部电子表格文件范围已完成。

## 2026-10-13 XLSX成绩单上传与工作表选择

POST /api/sports/workbooks/:courseId接收application/octet-stream，最大100MB；上传前、读取结束及异步解析后重新校验登录、首次改密、体育教师、责任课程、维护和课程可受理状态。解析在独立Worker内完成，30秒上限、512MB V8堆限制；这些是本地资源边界，不代表完成恶意压缩文件或大文件生产压测。固定exceljs4.4.0依赖和package-lock，解析器用法参考[上游文档](https://github.com/exceljs/exceljs)。安装输出存在传递依赖弃用提示，后续生产依赖治理仍需单独验证。

原始XLSX以SHA256存入既有BLOB表，sportsEnduranceSource保留课程、源文件摘要/字节数、工作表提取及受理时有效成员；同教师同课同摘要重复上传复用原受理记录。文件与受理元数据同事务保存，留上传审计。GET /api/sports/workbook-sources/:id仅责任且原受理教师下载原件；学生、管理员和其他教师拒绝，响应no-store且attachment。原件不经OCR，不执行公式；不需要客户端把文件转CSV后再声称保留XLSX。

工作簿最多32表，每表最多500个人员行和200,000提取字符，保留空白间隔后的实际Excel源行号。第一非空行为五字段，可用学号/姓名/项目/用时/测试日期或对应英文字段；未知表头在草稿建立时拒绝。标准日期单元格转日期；公式、合并单元格、错误值、日期型用时及不安全数值标疑，明确核对修正前不能确认。错误工作表列出原因，不能静默删除数据后宣称成功。

sports.endurance.source.import(id,sheet)读取服务器已解析的指定表，复用CSV核对、修正/排除和事务批量确认；同一源表重复选择返回同一批次。合法原件已受理后课程关闭仍可建立原范围草稿，不能引入受理后新增成员，结算/归档仍拒绝直接覆盖。workspace仅责任教师取得enduranceSources，网页支持上传、查看各表解析状态、选择表和下载原件。

Windows34文件240项测试、双端类型、Lint、构建通过。新增测试覆盖XLSX中文表头/日期/源行号、公式疑点、损坏文件、原始字节一致、同源去重、关闭续办、解析期间关闭后拒绝且无孤立文件，以及真实HTTP上传下载的跨角色与跨站限制。新增浏览器点击未验收，纸质OCR、正式名单/身份资料、免测认证、结算报告等完整范围继续。

## 2026-10-13 纸质成绩单OCR可配置接口

用户确认没有真实OCR服务，先保留接口。POST /api/sports/ocr-sources/:courseId接受multipart/form-data的images文件列表，每批1–20张JPEG/PNG/WebP、合计100MB；服务器检查类型、单帧、40百万像素上限并完整解码。原始字节按SHA256进入既有BLOB表；图片顺序及摘要组成批次摘要，同教师同课同批重传复用。受理时保存有效成员范围，原图只由本人责任教师读取。GET /api/sports/ocr-sources/:sourceId/images/:imageId返回原图、no-store；学生、管理员和其他教师不能访问。

上传完成尝试识别；未配置BNBU_SPORTS_OCR_URL保存FAILED/OCR_NOT_CONFIGURED，原图保留，不生成识别行。配置URL仅HTTPS或本机HTTP，拒绝重定向；可选BNBU_SPORTS_OCR_TOKEN以Bearer发送。识别POST JSON为schemaVersion:1、requestId、sourceId、images[{id,sha256,mime,size,contentBase64}]；不把密钥或上游原始错误写入日志。25秒请求时限、1MiB响应上限；错误统一OCR_TECHNICAL_FAILURE。

上游须返回JSON：requestId、sourceId、imageHashes（与请求原图顺序一致）、rows数组1–500项。每行须包含imageId、row(1–10000)、studentNumber/name/event/time/testDate（均原始短文本）、reviewRequired布尔值、issues字符串数组。imageId须属于原批，图号/行号组合不得重复，响应请求ID/源ID/摘要必须完全匹配。上游应将低可信、错行等标reviewRequired或issues；最终教师确认永远保留。正常返回READY，只建立服务器源提取，打开后复用既有sports.endurance.source.import与核对批次；疑点行不能直接批量确认，修正须原因与历史，对应原图ID和行号保留。

POST /api/sports/ocr-sources/:sourceId/recognize JSON{version}显式重试。PROCESSING请求35秒内不允许重入，超时可重试且旧版本响应不得写入。成功READY或已有核对草稿不能重新识别覆盖原来源；失败可继续重试。异步前后重验登录、身份、维护、责任归属及未结算/未归档；已受理来源允许课程关闭后继续原范围核对。识别过程留下sportsOcrHistory状态记录。

35文件244项Windows测试、双端类型、Lint、构建通过。测试覆盖未配置不造数据、重复/伪造图片拒绝、低可信行修正后才确认、关闭续办、上游对象/图片错配与正确重试、旧版本拒绝，以及真实HTTP上传与原件读取权限。测试上游为受控协议服务、图片为明确测试夹具，真实OCR服务和本校手写准确率尚未验证；没有在本地验收库植入识别假结果。新增网页点击未验收。正式名单、身份资料、免测认证、结算报告等完整范围继续。

## 2026-10-13 正式名单快照与注册核对

sports.roster.preview(courseId,csv)仅责任教师，当前粘贴CSV入口最多200,000字符、1–500行；两列表头student_number,name或学号,姓名，保留重复/错误原行与原CSV。新草稿要求课程已发布、未结算、未归档；关闭前已受理草稿仍可继续。sports.roster.row(id,version,row,studentNumber,name,reason)修正/恢复原行，exclude=true明确排除，sportsRosterRowHistory记录前后值及依据，不修改账号资料。

sports.roster.confirm(id,version,basisVersion,confirmed=true)要求保留行字段完整，生成不可覆盖sportsRosterSnapshot及规则版本、原始行数和确认时间。重复身份允许保留为正式学校名单的核对差异，不静默去重。sportsRosterBasis按basisVersion切换当前基准，sportsRosterHistory追加前后快照关联。sports.roster.restore(id,basisVersion,confirmed=true,reason)只回退核对基准；原成员、打卡、进度和快照不改写，结算/归档须后续历史报告更正。

reconcileRoster实时按学号主键、姓名辅助分为COMPLETE/INCOMPLETE/CONFLICT及OUTSIDE成员。完整匹配必须有唯一已核验学生身份、姓名一致、有效本班成员，同时sportsIdentity.schoolEmailVerified=true且schoolEmail等于当前accounts.email。该字段仅为后续正式绑定服务的写入约定，当前未增加教师或学生自行设置接口；独立本地验收身份不会因已登录就被假定已验证学校邮箱。正式邮箱绑定及身份采集仍待接通。未知注册人员仍在学校名单分母，名单外有效成员不在分母；冲突/重复时denominator与registrationPercent为null，避免虚报100%。

workspace给责任教师rosterDrafts/rosterSnapshots/rosterBases/rosterChecks；学生仅studentRosterChecks的courseId/status，不回放别人名单姓名。具有COURSES_VIEW的管理员仅当前非草稿课程rosterSummaries数量，不取得原始名单或学生身份行。网页接通草稿校对、快照确认、四类核对、名单外成员与版本回退；注册匹配比例明确不等于运动达标或体测完成。

36文件248项Windows测试、双端类型、Lint、构建通过。验证不建号不入班、邮箱验证与当前邮箱绑定、重复分母未知、明确排除保留原行、基准回退不动教学事实、分角色投影、500行限制、结构/版本/结算拒绝和关闭续办。当前为CSV粘贴基础入口，原规则要求的100MB电子文件及名单专用XLSX/纸质OCR、多列综合名单和导出仍未完成；不可将成绩单导入能力当作学校名单输入已完成。注销身份脱敏及正式报告冻结仍须与账号注销/结算一起验收。新增网页点击未验收，完整目标继续。

## 2026-10-13 学校名单CSV/XLSX原件

POST /api/sports/roster-files/:courseId/csv或xlsx接收application/octet-stream，1字节至100MB；仅未关闭、未结算、未归档课程的责任教师受理，解析前后复核登录、首次改密和维护门禁。CSV严格UTF-8并按CSV语法直接读表，BOM/CRLF和引号可用；原字节完整保留，提取时仅清理单元格外围空白。XLSX复用独立Worker解析框架，采用学校名单学号/姓名字段定位而非成绩单五列协议。必需列唯一，可含其他学校列；原件保留所有列。每表最多500个人员行，重复/错误行计入；提取有效字段仍有200,000字符技术上限与XLSX30秒/512MB堆限制，未宣称完成100MB复杂工作簿生产压测。

原件BLOB与sportsRosterSource（课程、格式、摘要、大小、工作表）同事务保存，另有来源历史和不含名单正文的上传审计。同教师同课程相同摘要复用原件。GET /api/sports/roster-sources/:id仅原受理责任教师下载完整文件，no-store/attachment；学生与管理身份不授予原件访问权。

sports.roster.source.import(id,sheet)将服务器选定工作表接入既有学校名单草稿，不由客户端提交替代提取结果。保存sourceId、sheet及实际Excel源行号；同源同表复用草稿。公式/合并单元格等疑点阻止正式确认，须逐字段核对后清除；只有学校附加列而缺身份字段的行也保留为待核对，不静默消失。原件已受理后允许课程关闭继续原核对链；结算/归档不能直接改历史。学校附加列不会写入账号资料。

workspace给责任教师rosterSources，网页支持CSV/XLSX选择上传、源文件下载、工作表选择、源行号和疑点提示；继续复用快照确认及回退。36文件251项Windows测试、双端类型、Lint通过，本轮前端构建通过。新增测试覆盖CSV原字节一致/去重、关闭续办、XLSX附加列/原行号/公式疑点/缺身份行保留、真实HTTP权限隔离、UTF-8拒绝、501行与超过100MB拒绝；既有五列成绩单回归通过。新增网页点击未验收；学校纸质名单专用OCR、综合报告导出、正式学校身份绑定、免测认证和结算等完整范围继续。

## 学校纸质名单OCR与项目容器复验

遵循用户“暂时没有OCR服务，先保留可配置接口”的决定。POST /api/sports/roster-ocr/:courseId受理纸质学校名单，复用原图校验、100MB总量、最多20图、责任教师访问、异步复核、原字节留存和识别状态历史；保存为sportsRosterSource/sourceType=OCR。名单不走五字段成绩单协议，不直接建账号、入班或保存成绩。未配置BNBU_SPORTS_OCR_URL时返回OCR_NOT_CONFIGURED，保留原图，不生成伪识别结果。

上游请求增加purpose：名单ROSTER，成绩单ENDURANCE。ROSTER响应必须原样回传purpose，行仅提取studentNumber/name；共同必需requestId、sourceId、imageHashes及每行imageId、row、reviewRequired、issues。成绩单仍取原五字段，兼容旧响应不含purpose；如带purpose必须为ENDURANCE。类型错配与对象/原图错配均记技术失败。原图读取与手动重试继续使用/api/sports/ocr-sources/:id/images/:imageId、/:id/recognize。纸质名单不能走电子文件下载接口。

成功识别后sports.roster.source.import(id,sheet=0)生成教师私有核对草稿，保留原图ID、图上行号、疑点原因。疑点必须修正留痕或明确排除后才能确认；全空识别行也保留为待核对，不能因CSV过滤静默丢失。原件已经受理后可关闭续办，结算或归档不允许直接更正。共享网页组件支持名单和成绩单，名单核对行可打开对应原图，仍须明确确认学校快照。

验证：Windows及Docker Linux均36文件254项测试通过，前后端类型检查、Lint、前端构建通过（仍有现有大块打包提示）。项目docker compose build成功，验证容器healthy；容器内部/api/health和/workspace均HTTP200。受控OCR测试覆盖疑点修正、业务类型错配、空白行保留、关闭续办、原图权限与未配置不造数据。只验证适配协议，不代表真实OCR准确率或学校身份服务已验证；新增网页未完成浏览器点击验收。Windows本地验收服务已重启加载代码，保留原验收数据库。

仍待：综合名单/正式报告导出、学校身份与邮箱绑定、免测认证、结算与历史报告更正、账号治理及完整业务交叉验收。真实OCR仍为可配置依赖，完整目标继续。

## 教师综合名单与当前教学报告

按V8.1教师8.3，新增GET /api/sports/course-reports/:courseId及.csv，仅责任教师、通过首次改密且正常模式可用；其他教师、学生和管理员均不能读取整班报告。学生既有接口继续只提供本人名单核对、原始体测和进度，管理员继续仅治理摘要。导出不包含最终成绩、换算分、等级、备注或原图。

当前报告明确标记CURRENT_TEACHING_REPORT，含课程ID/版本、名单快照与基准版本、生成时间、V8.1、分母及原始/排除行数、结算状态和未解决事项。每行分列注册核对、成员状态、体测录入、两类计入/目标、剩余目标、达标、异常待办、未结束会话和待首版材料；实际运动分钟、无效记录实际分钟和有效可计未计分钟分开。未唯一关联身份行保持未知，不关联相似姓名；冲突成员独立列出不重复混入学校分母。无确认名单不虚报完成。纸质/电子原件未建立核对草稿、未完成草稿等仍列为未解决事项。

提取只读calculateProgress，与审核写入sportsProgress共享同一精确选择算法及原最优集合保留规则；读报告不会生成进度、成绩、名单或结算事实。CSV为UTF-8 BOM，正确转义引号/逗号/换行，对可能被表格软件解释为公式的文字加前置单引号，原业务字段不改写。网页支持按需生成、分列查看及导出最新文件；文件生成时间为最终统计时点。

验证：36文件257项Windows测试通过；前后端类型、Lint、前端构建通过（既有大块提示仍在）。新增测试覆盖同日最优计入与无效分钟、体测与注册分开、冲突不合并、未知分母、读报告不改事实、公式转义、不包含分数/备注、跨角色/跨教师HTTP拒绝、首次改密及维护拒绝。重启本地验收服务后，独立教师测试账号读取真实验收课程，JSON报告与CSV均HTTP200。新增网页没有浏览器点击验收；本轮新代码未重新构建Docker，上轮容器验证对应纸质名单阶段。

尚未完成：免测认证及其报告字段、正式结算阻塞核对和冻结报告、更正版及账号注销后的历史脱敏、正式学校身份邮箱绑定、完整端到端验收。当前报告明确展示这些限制，不能作为已结算正式报告；完整目标继续。

## 免测与组织认证申请、证明和进度联动

按V8.1教师10.3/11.3、学生9.3/9.4及参考仓库applications协议，学生先上传有效JPEG/PNG/WebP证明，再正式提交sports.application.submit(courseId,applicationType,assetIds)。认证还须certificationKind=SCHOOL_TEAM或STUDENT_CLUB、organizationOrTeamName、validFrom/validTo，分类原样保存，不从组织名称推断。新申请须已发布未结算、未归档课程的有效成员；本地上传准备不等于已受理申请。

POST /api/sports/application-assets/:courseId[/applicationId]原字节上传单张证明，最大10MB，服务端解码检查单帧图片、40MP技术上限、MIME与内容一致；异步前后重新验证身份和课程状态。原件复用BLOB存储，assets有上传人、课程和原申请上下文；正式绑定时验证本人、同课、未占用和用途。同一申请首次及全部补充累计最多3张，每次至少一张，绑定与正式申请/历史/通知/幂等回执同事务；不是打卡两版限制。GET /api/sports/application-assets/:id原图no-store，本人可读，责任教师只可读正式绑定证明；其他学生、其他教师和管理员无权读取。

sports.application.decide(id,version,decision,reason)仅原责任教师，SUBMITTED可APPROVE/REJECT/REQUEST_SUPPLEMENT，公开说明留历史和站内通知。sports.application.supplement(id,version,assetIds)仅原学生且SUPPLEMENT_REQUIRED，追加原申请后回SUBMITTED；不增加补证时限或打卡补证次数，保留首次提交时间和每次受理时间。关闭/移出不截断此前合法申请，结算/归档须后续报告更正流程。

批准免测形成当前sportsExemption，原证明与教师历史保留。学生当前体测投影显示免测，普通用时和对应旧用时历史不在该学生投影回放；不删原教师证据，不生成普通换算，不增加运动进度或改变成绩。普通用时直接录入及批量确认均阻止覆盖免测，综合报告显示EXEMPT并不误列体测缺失。

批准组织认证时输入relatedMinutes/otherMinutes，两类分别0至本类目标，合计不超过1200。生成两类sportsCertification当前事实及版本历史，sports.certification.adjust/revoke要求原责任教师、申请版本及公开原因；撤销停止贡献但保留原认可量和历史。重新使用既有精确计入算法追加sportsProgress，认证不消耗运动日/周名额；无运动记录的学生也能看到认证进度。学生/教师只读自己的关联申请、证明、处理和认可历史；综合报告新增申请待办。

网页接通类型/组织选择、日期、图片提交、缩略图、补充、教师三种决定及认可调整/撤销和历史。重试保留已上传ID并复用通用命令幂等机制。教师可辨认申请人姓名；免测显示及教师用时入口同步。

验证：Windows及Docker Linux均37文件263项测试通过，前后端类型、Lint和前端构建通过。测试包括原件字节/格式/10MB、未正式绑定教师不可读、跨角色/跨教师拒绝、累计3张及关闭移出续办、免测不改成绩进度/不披露普通用时、认证两类额度/调整/撤销和无运动进度、失败事务回滚、旧版本/幂等、真实HTTP绑定读取和维护/首次改密门禁。最后的首次提交时间保留调整另通过申请专项6项回归。浏览器新增点击未验收；证明均独立测试图片，不是实际医疗/校队证明。

业务待确认：累计三张已经用满时，原规则没有明确教师再次要求补充的收尾方式，已向用户询问“禁止再要求补图”或“仅文字补充”。未收到答复前不新增文字补充协议或擅自放宽图片上限；此边界尚未闭环，不能宣称申请全场景完成。其余待办为正式身份/邮箱绑定、结算阻塞与冻结报告、更正版、账号治理及完整跨端验收。

## 首次考核结算与冻结报告

按V8.1教师12节及参考course_workflow结算协议，sports.settlement.prepare(id,version)只接受课程身份和版本，由服务端读取完整本班来源，返回READY/BLOCKED准备记录及具体待办；客户端不能提交统计行、来源令牌或“已无阻塞”标记。当前共享SQLite是本地各业务能力的权威来源，无外部分页或空列表兜底。清单摘要绑定完整课程成员（含移出）、相关身份与账号事实、课程/学期/模式，以及名单、体测、成绩、申请、运动、材料和相关事件来源的版本与内容。

开始确认前须原收尾期已结束或课程明确关闭。低于1200分钟不是阻塞。未结束会话、没有受理回执但仍在24小时内的首次材料窗口、待传批次、技术/审核/補证、名单差异和导入草稿、申请、缺体测/免测、未发布最终成绩及事故影响的旧逾期复核均继续阻塞。不会为清队列批量判无效。普通/游泳合法首版最大24小时已过且从未建立材料记录的会话保留实际时间及“窗口已过未提交”计数，不伪造审核记录；当前报告和CSV也区分此计数与仍有效的待材料窗口。

sports.settlement.confirm(id,version,confirmed=true)在通用写事务锁内重新读取全部来源和待办，只有准备READY、当前无待办、摘要完全一致才发布。课程成员新增、相关来源内容或版本变化均拒绝旧准备；不能靠先前准备绕过新待办。首次保存sportsSettlementReport序号1、固定报告行、源清单/成员ID、内容摘要、确认时间与课程当前指针；同时关闭新业务起点并置SETTLED，更新准备状态及站内通知。精确幂等重放不创建第二版或移动指针。这里只实现首次结算，旧事实更正必须后续授权更正版，不覆盖原版。

GET /api/sports/settlement-reports/:id[.csv]仅原责任教师、通过首次改密且正常模式可读，归档后仍取得同一版本；不重新取当前缓存数据。CSV携带冻结报告ID、序号与内容摘要。整班冻结报告不向学生/管理员公开，不含最终分数、换算分或备注；学生现有本人事实与课程结算状态继续可见。学期切换除课程SETTLED标记外，还须对应真实冻结报告及课程/学期匹配，孤立旧标记不能作为归档凭据。

网页接通准备、查看具体待办和固定名单、核对后确认及下载固定版本。Windows38文件269项测试、双端类型、Lint、构建通过（原大块提示仍在）。新增测试覆盖未达标合法结算、来源/成员漂移拒绝、只读来源保护、首版窗口无回执也阻塞、真实过期不伪造无效、多个合法待办不被修改、幂等、未完成不能归档及孤立标记拒绝、冻结版本归档后权限与HTTP导出。本地独立教师验收课程准备HTTP200且为BLOCKED，明确五类现存问题：新业务起点仍开放、无确认名单、运动待审、无体测和缺最终成绩；未发布任何虚假正式结算。新增网页未浏览器点击验收，本轮未重新Docker构建。

剩余：历史旧事实更正与报告更正版、复杂平台事故定向复核、超时首版已锁材料的教学收尾、正式身份/邮箱绑定和账号治理，以及三图用满后补充方式的用户待决边界。所有已实现能力不代表完整目标已验收。

## 用户更新：证明按每次上传限三张

用户明确“补图的另外算一次上传，一次上传就只能三张”。此最新决定覆盖固定V8.1来源和旧交接中的“同一申请累计三张”约束。首次提交和每次补充均独立要求1–3张；不另设累计张数或补充次数上限。保留原申请、全部原图及各次提交历史，补充仍须处于要求补充状态，单张10MB和格式/权限/版本校验继续沿用。

后端绑定校验与网页数量校验、提示已同步。测试证明首次3张、第二次3张、第三次1张可连续受理且累计7张保留，单次4张拒绝；关闭/移出后的原受理链继续有效。申请专项6项、前后端类型和Lint通过。此前“三图用满”业务待决已解决，不新增文字补充流程。完整项目其余待办仍按最新结算阶段交接继续。


## 结算后成绩/体测更正版阶段

新增 sports.correction.apply：kind=GRADE|ENDURANCE，id为原正式成绩发布/已有体测记录，version为原对象版本，previousReportId为当前冻结报告，reason为非空更正原因（最多1000字符），confirmed=true；GRADE另传score（INT32），ENDURANCE另传event/seconds/testDate。仅原责任教师、已结算课程可用，归档后仍可用；不接受统计、成员或内部绕过开关。必须属于原冻结成员且有对应报告行，成员集合漂移、旧发布已有后继、未变化事实或过期报告均拒绝。

复用已有成绩发布/体测确认约束，在命令事务内保存事实历史、sportsHistoricalCorrection与新sportsSettlementReport；新报告含previousId/correctionId/correctionReason、连续序号、来源摘要和内容摘要。只替换原冻结行的体测事实，成绩更正保留报告统计；原姓名、成员范围、无关统计和旧报告不重算。失败回滚，幂等不重复。普通已结算写入口继续拒绝，学生仅收到不含分数及原因的更正通知；报告及更正原因仅责任教师读取。网页原成绩/体测区已接通更正表单，冻结下载保留全部版本。

验证：Windows及Docker Linux各38文件272项测试通过，覆盖归档更正、旧版本不变、冻结身份保留、幂等、越权/漂移拒绝、隐私、原体测历史、失败无半次更正。双端TypeScript、ESLint、Vite构建通过（原500KB大块提示保留）。Docker镜像重新构建成功，配置摘要sha256:665a11740f78743b6e12b7e967621daf53595c92b80f4cf6fb120b2b44c82011；独立验证容器healthy，内部API4175与网页4174均HTTP200，验证后已移除容器。宿主本地Acceptance服务已重启，不改测试业务事实；新增网页尚未浏览器点击验收。

剩余：审核/认证/免测/名单等其他旧事实更正与复杂P04定向复核，超时已锁材料收尾，正式身份邮箱绑定及账号治理、自动提醒、完整跨端验收与整体文档核对。OCR仍按用户决定保留可配置接口；每次上传独立最多三张的规则已确认落实，无累计三张待决。完整goal继续，不宣称整体流程交付完成。


## 历史审核与认证报告更正版

sports.correction.apply新增kind=REVIEW|CERTIFICATION，沿用原id/version/previousReportId/reason/confirmed。REVIEW的id为原sportsRecord，decision=PASS|INVALID，batchId绑定现有完整材料，checksCompleted=true，判无效另传reviewReason固定原因码；reason是必填学生可见更正依据。不得RETURN或新增补证。CERTIFICATION的id为原已批准申请，decision=ADJUST|REVOKE；ADJUST另传relatedMinutes/otherMinutes，复用原分类目标/合计上限与有效认可校验。原普通入口仍拒绝结算/归档写入，客户端不能通过historicalCorrection字段绕过。

原记录无enrollmentId时服务端按原课程与owner唯一定位冻结成员，不能由客户端指定。事务内保存原教学更正历史、进度投影、历史更正对象和连续报告新版本，只更新原冻结成员行的有效分类/总量/剩余、无效及有效未计入分钟，保留其他原统计与身份。原材料、会话时长、补证次数与旧报告不变。审核及认证公开原因由原业务通知提供，内部成绩仍不向学生暴露。原网页审核按钮与认证调整/撤销在SETTLED课程转入此更正版入口。

验证：Windows及Docker Linux各38文件274项测试通过；双端类型、Lint、前端构建通过（保留原500KB大块提示）。新增测试证明归档后纠正45分钟同日记录会重新选中35分钟有效记录，实际80分钟保持；检查未确认/RETURN/越权拒绝，原材料/会话/补证不变，幂等只发一版。认证额度300→110→0对应三份冻结报告，超目标失败回滚，普通入口不能绕过。镜像重建成功，配置摘要sha256:df8e8e55e77d301c7cb07599e0f3db4f654f23c12080df1bbe64ad8e4546e49e；本轮运行容器测试，未另起健康检查容器。宿主Acceptance服务已更新，未将测试伪造材料写入验收库；新增网页尚未点击验收。

剩余：免测及名单历史更正、复杂P04定向复核、超时已锁材料收尾、正式身份邮箱绑定和账号治理、自动提醒，以及完整跨端与整体规则核对。OCR保持可配置接口，真实学校/AI/邮件接入依赖保持；完整goal未完成。


## 误批免测撤销、缺测处理与旧备注审计

用户确认结算后撤销误批免测，无原体测则显示未录入、出报告更正版、保持结算，不安排补测；补充要求提供手动补测录入，已结课时弹出提示并保留缺测，转人工处理。当前未结课耐力跑手动入口沿用真实项目/整数秒/实际日期；CLOSED或SETTLED且无原体测时按钮只提示，服务端继续拒绝新增。原事实更正不受此新增限制替代，仍按既有历史更正版规则。

sports.exemption.revoke(id,version,reason)用于未结算原责任教师撤销当前有效免测；必须绑定原EXEMPTION申请，保留证明、原批准及撤销历史并公开原因。结算后使用sports.correction.apply(kind=EXEMPTION,id为当前免测对象,version,previousReportId,reason,confirmed=true)，不能普通入口绕过。撤销后已有原体测恢复展示且不改用时/换算；无原体测则冻结新报告原行标NOT_RECORDED，并记录ENDURANCE_NOT_RECORDED未解决项，保持课程/学期状态及运动进度、内部成绩。原报告完整保留，幂等不重复撤销或创建报告。

GET /api/sports/historical-final-grade-remarks?purpose=...&publicationId=...&cursor=... 接通V8.1 H19.7旧备注读取。purpose必填最多500字，publicationId可选；分页50条，随机游标绑定教师/用途/筛选与15分钟期限。所有有效体育教师可跨原责任范围读取旧备注；学生及仅管理员身份拒绝，首次改密/维护门禁继续适用。专用正向字段清单只含publicationId/courseId/enrollmentId/remark/publishedAt，不含分数。每页在同一事务先写audit（actor/purpose/对象ID/serverReadAt，无备注正文和分值），审计失败不返回内容或产生游标。普通成绩草稿/发布工作台现在按字段清单投影，不绕过审计暴露旧备注，存储旧记录保持。教师页面新增明确用途、可选对象筛选和下一页入口，页面不持久缓存，响应no-store。

验证：Windows和Docker Linux各39文件280项测试通过；双端TypeScript、ESLint、Vite构建通过（原500KB大块提示保留）。新增覆盖误批免测撤销有/无旧体测、旧报告/证明/历史保留、无补测新事实、已关闭未结算时缺测仍阻塞首次结算、越权/幂等；旧备注跨责任教师读取、普通投影无备注、学生/管理员/失效身份拒绝、游标绑定、审计失败闭锁与HTTP no-store。宿主测试教师专用读取HTTP200/0条，并确实新增读取审计，未伪造旧备注。Docker构建完成，镜像配置sha256:704dda7592b30d15d9c0de869a7f597f45914f9d2365f7276d9af27a0a3e326a；本轮做容器测试未另起健康验证容器。最终宿主Acceptance服务已重启。新增网页及弹窗未浏览器点击验收。

剩余：名单历史更正、复杂平台事故定向复核、超时锁定材料收尾、正式身份邮箱绑定及账号治理、自动提醒、完整浏览器跨端与规则逐项验收。OCR仍按用户要求保留可配置接口。以上进展不代表整体goal完成。


## 首版材料超时的教师收尾

用户明确接受：已锁首版文件30分钟内未齐且无已确认平台故障时，由原责任教师核对原因，选择退回唯一一次补证补齐原材料或明确判无效，不能直接判有效。worker在NORMAL模式按严格端点扫描首版UPLOADING批次，未齐则保存TRANSFER_DEADLINE_MISSED批次与TRANSFER_PENDING记录、缺失对象清单、公开事件及双方通知，并启动原教师审核轮次。不会自动无效/有效，不改时长、原文件清单或补证次数；补证包及合法后继不被误处理，重复扫描不重复通知。维护时不写入判断，原明确传输截止不因扫描时间倒改。

sports.transfer.decide(id,version,batchId,decision=RETURN|INVALID,reason固定原因码,publicExplanation必填,checksCompleted=true)，RETURN另需hours=24|72及canSupplementOriginal=true。仅原责任教师、原首版超时批次、未结算/归档记录可处理。确认事故区间与原传输窗口重叠时拒绝按个人超时裁决，保留技术复核；不能借人工模式或客户端标志直接通过。沿用既有六类原因与动作适用性；退回关闭当前教师轮次，补证完整受理再开一轮，SLA继续学校日历与暂停规则。

传输超时退回会保留transferOriginBatchId。补证准备以SHA256/MIME/字节长度逐项匹配原批全部必需文件，已到账可引用，未到账必须上传同一原文件；缺文件、换文件、额外文件均拒绝。游泳的原前/后阶段和前证据关联由服务器沿用，不允许事后补拍替代。全部到账才正式受理，原批及部分原对象状态不覆盖；受理后教师正常复核，仍不能二次退回。网页已显示超时、原材料、两种处理按钮、审核时限和补证限定提示。

验证：Windows及Docker Linux各40文件285项测试通过；前后端类型、Lint、构建通过（原大块提示保留）。新增覆盖严格端点、维护不写入、重复扫描、原对象不变、本人/教师权限、不能直接通过、普通和游泳完整补证链、未齐不能受理、换文件拒绝、第二次退回拒绝、平台事故阻止个人裁决及明确无效幂等。镜像重建成功，配置sha256:e26cf8867d4eea754be25cc944b9979a20f2baf1b3c6711fb6264bffb6195c1d；本轮仅运行容器测试，未另起健康验证容器。宿主Acceptance服务已更新。新增网页未点击验收。

剩余：已确认平台故障影响首版传输的恢复及复杂P04定向复核、名单历史更正、正式身份邮箱绑定/账号治理、期末自动提醒，以及整体规则与浏览器跨端验收。个人原因超时收尾不再是完全缺失入口；平台故障不会被本入口当作个人逾期清除。完整goal继续。


## 常规截止前14天自动提醒

新增checkDeadlineReminders，课程发布成功后及现有worker定期处理时在共享事务内调用。复用只读buildCourseReport作为完整本班事实来源，HTTP报告仍由courseReport保留原责任教师及模式权限门禁；内部投影不新增公开接口。按Asia/Shanghai截止日期零点前14日开始，未到期不发送。发布仍须原可行性检查，提醒逻辑不为晚发布放宽1200分钟约束；已有发布事实进入窗口、服务恢复或后加入成员，均使用当次实际发送时间。

有效成员本人剩余目标或运动/材料/申请待办、缺体测时提醒；已全部完成不发送，不向移出成员发新运动目标提醒。责任教师只在名单/材料/审核/申请/体测/成绩等待办仍存在时提醒。通知标记sportsDeadlineReminder保存课程、原截止日期、收件人角色、dueAt/sentAt及最小状态证据，不存成绩分值。标记与通知原子提交，发送存储失败可重试；原截止、收件人和角色同一组合只发一次，已读不重发。关闭课程仍可提醒既有教学待办，不开补练或入班；结算/非当前学期/维护不发新提醒，恢复NORMAL重核当前状态。现有站内通知中心直接显示，无新增邮件依赖。

验证：Windows与Docker Linux各41文件289项测试通过，前后端类型、Lint、构建通过（原大块提示保留）。新测试覆盖上海14天边界、未完成/已完成分流、教师有待办才提醒、当前时间补发与维护恢复、移出/关闭不重新开放、结算归档跳过、已读/重复扫描不重发、通知失败回滚以及不含分数。Docker镜像重建成功，配置sha256:85be7a8e70577d5a6317c3ad20ae3242acf1846553394e23c2adccb254499249；本轮容器测试未另起健康验证容器。宿主Acceptance服务已重启，新提醒未浏览器逐项验收。

剩余主要事项：已确认平台故障首版传输恢复、复杂P04定向复核、名单历史更正、正式身份邮箱绑定/账号治理及完整浏览器与规则逐项验收。真实学校身份、学校日历、AI和邮件依赖仍须按各适配文档配置；OCR按用户决定保留可配置接口。完整goal继续。

## 学生／教师账号只读目录与独立管理登录决定

GET /api/sports/accounts/students 或 /teachers，须当前有效体育管理员ACCOUNTS权限、已完成首次改密、NORMAL模式。支持q（姓名、学号/工号、学院、部门、专业、行政班）、college精确匹配、status、limit=1–100默认20、cursor及id。返回items/total/nextCursor；游标所指结果已变化返回409要求刷新，身份重复409不静默合并。明细仅允许当前身份资料字段，不包含凭据、权限配置、成绩、备注或材料；邮箱必须与当前账号的明确核验绑定一致。响应no-store。学生ACTIVE/PENDING依据当前学期有效关系，教师状态只读，不提供学生/教师状态或资料修改入口。网页/workspace体育管理区域已接线。

验证：Windows与Docker Linux各42文件293项测试通过；前后端类型、Lint、构建通过，原500KB分块提示保留。新增测试覆盖查询无副作用、当前/历史学期与移出状态、邮箱换绑不沿用核验、组合筛选、分页、重复身份、权限撤销、首次改密、维护门禁和HTTP禁止缓存。Docker镜像重建成功，配置sha256:12b75fa6186e7069bd7e832fcd9233225c011841fa4f59b3ebc1526aa60ce60f；本轮运行容器测试，未另起健康验证容器。宿主Acceptance服务已更新；新增目录未浏览器点击验收。

用户本轮确认分管理员使用独立管理登录账号，停用不得影响其原学生/教师登录。该决定已记录业务规则；下一步实现独立凭据/登录名与账号治理，不能将当前只读目录称为完整账号治理。仍有平台故障首版传输恢复、复杂P04复核、名单历史更正、正式身份与邮箱流程、完整规则和浏览器验收等未完成项。OCR按已确认决定保留可配置接口。完整goal继续。

## 独立分管理员账号：建号、资料权限编辑、启停及登录

schema v4事务重建accounts，新增login_kind=PERSONAL|ADMIN与唯一login_name，邮箱唯一键为(email,login_kind)。旧行按PERSONAL保留原ID和所有关联；关闭外键检查仅限迁移事务外围，提交前foreign_key_check，不合格回滚，finally恢复外键。迁移前一致备份before-admin-namespaces.sqlite；本地Acceptance迁移后integrity_check=ok、foreign_key_check=[]。普通注册/邮箱登录/教师批量邮箱冲突检查限定PERSONAL，避免同邮箱管理账号挤占原身份。现有总管理员仍使用原邮箱登录，不自动转换角色或凭据。

POST /api/auth/admin-login {loginName,password}为独立管理登录入口，规范化小写登录名，使用共享scrypt与会话机制，但限流键按登录空间区分；不接受学校邮箱替代登录名，停用返回ACCOUNT_DISABLED且不签发会话。GET /api/sports/administrators只向当前总管理员返回管理账号正向字段及已核验人员候选，不含密码、凭据或私有身份扩展。首次改密、维护和权限门禁继续生效，旧幂等请求也先校验总管理员职责。

命令sports.admins.create：personId,loginName,name,email,department可选,permissions,initialPassword,confirmPassword,confirmed=true。选择当前有效且存在verified体育身份的PERSONAL人员，仅建立独立ADMIN账号与admin体育身份，不复制教师/学生角色。至少一项固定权限，禁止额外字段、重复邮箱或登录名。初始密码只需非空且相等，mustChangePassword=true。sports.admins.edit：id为身份对象ID、version,name,email,department,permissions,confirmed；拒绝登录名和任何密码字段，邮箱变更清除旧邮箱核验。sports.admins.state：id,version,status=ACTIVE|DISABLED,confirmed，停用另需handoverConfirmed=true；撤销仅此管理账号的会话，启用不复活旧会话、不恢复已收回权限。所有写入复用统一事务、版本、回执及审计，并追加sportsAdminHistory。

网页/v2/login增加独立分管理员登录类型，/workspace总管理员体育区域提供已核验人员选择、创建、资料权限编辑和启停。保存前显示完整权限及高风险标记，普通编辑不显示密码字段；初次登录继续原本人改密入口。当前尚未提供删除/本人注销和已验证邮箱密码找回，不宣称完整账号治理完成。

验证：Windows/Docker Linux各43文件297项测试通过，双端类型、Lint与构建通过（原大块提示保留）。覆盖同邮箱不同凭据、首改门禁、本人改密与其他会话失效、管理停用保留原个人登录、启用仅当前权限、重复/越权/非法字段回滚、实际HTTP Cookie/门禁和旧库迁移外键。Docker镜像重建成功，配置sha256:a4cb0247e54fa1b54831394ba25f846a58175e76ebab85b802ae539f2b05c80b。本轮运行容器测试，未另起健康验证容器。

宿主实际HTTP验收已通过：建立local.sports.admin.one、首次门禁、本人改密、停用后原管理会话401、原教师会话仍200、启用后重新登录并查询学生目录。该独立本地测试账号留在启用状态，权限ACCOUNTS/HELP；凭据仅本地data/admin-acceptance-account.json，非秘密结果data/admin-acceptance-result.json，均不提交Git。网页尚未点击验收。剩余包括删除和注销历史匿名化、正式邮箱绑定/找回、平台故障恢复/复杂复核、名单历史更正及全流程规则和浏览器验收；真实外部依赖见前述配置，OCR继续可配置接口。完整goal继续。

## 独立分管理员删除／本人注销

schema v5在现有账号主键空间增加HISTORY内部主体，email/password_hash/name/organization/login_name均须为NULL、roles为空、status=banned；CHECK及不可恢复登录触发器约束，认证显式拒绝HISTORY。其作用是保留历史外键，不是可用账号或停用资料。迁移保持旧PERSONAL/ADMIN行及关联，提交前检查外键；本地迁移前before-admin-history.sqlite一致备份已保存。Repository.people排除历史主体，person只提供已注销占位名和空当前邮箱，不能据旧资料恢复当前身份。

sports.admins.delete仅总管理员；sports.account.close仅本人独立管理账号，不适用总管理员或原个人账号。输入id（sportsIdentity ID）、version、name、loginName、email、confirmed=true、handoverConfirmed=true；字段与当前资料不符返回409。首次改密及维护门禁仍有效，注销前须先改初始密码。GET /api/sports/administrator-self仅返回本人独立管理员的删除核对字段，无管理其他人员能力。网页总管理员列表增加删除确认，独立分管理员增加本人注销确认，展示姓名、登录名和邮箱；成功注销返回登录页。

同一命令事务删除该管理主体身份资料、会话、收件通知、关系和旧回执，清空当前登录及资料字段；清除sportsAdminHistory前后资料副本中的姓名、邮箱和部门，保留权限、状态、业务内容和必要历史关联。追加删除事件与统一审计。审计失败则全部回滚，不能发生资料已删除但审计失败的半状态。同邮箱个人注册email_challenges属于个人登录空间，不能连带清除。管理员邮箱找回尚未接入；未来目的与主体绑定的管理员挑战必须接入本删除清理链。

验证：Windows与Docker Linux各43文件299项测试通过；前后端类型、Lint与构建通过（原大块提示保留）。新增覆盖最新资料核对、权限/交接确认、资料副本清理、凭据NULL、历史内容/外键保留、个人验证码与登录隔离、历史主体禁止恢复、本人注销及审计失败回滚。镜像重建成功，配置sha256:1f8842b1d40cf87e44dd6eded397e2041333b6d495649c11ed1a1c88efb8e179；本轮运行容器测试，未另起健康验证容器。

宿主实际HTTP验收建立两名临时管理账号，分别总管理员删除与本人注销，旧会话和旧凭据均401，同邮箱原学生登录仍200。只删除本轮临时账号，原常用local.sports.admin.one继续保留；结果data/admin-deletion-acceptance.json。验收库integrity_check=ok、foreign_key_check=[]；新增网页未点击验收。下一步仍需管理员验证邮箱/找回，正式学校身份流程、教师和学生注销治理、平台故障恢复/复杂复核、名单历史更正及全流程规则与浏览器验收，完整goal继续。
