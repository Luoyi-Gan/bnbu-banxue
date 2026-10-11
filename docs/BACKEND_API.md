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
