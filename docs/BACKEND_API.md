# 伴学本地后端协议

更新：2026-10-12。业务依据为根目录 `BUSINESS_RULES.md`。本协议描述 `/v2` 三端及 `/workspace` 共用的伴学后端。体育仅预留独立数据源的只读接入；本项目不提供体育写入命令。

旧体育写入协议已撤回并本地存档，不再作为伴学接口。当前 `/api/sports/*` 和 `/api/v1/*` 不提供业务服务，`sports.*` 命令被拒绝。真实只读源的表结构与身份映射部署时核实。

## 运行与身份

Node.js 24；当前交付为 PostgreSQL（compose.postgres.yaml），前端入口 127.0.0.1:4188，API 仅通过同源 /api 代理访问。后端源码位于 backend/src。SQLite 作为可选本地开发适配保留，默认文件 data/bnbu.sqlite；两种存储环境不自动迁移。

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

同一账号同一 `requestId`、相同内容返回原结果；不同内容返回 409。所有业务命令在数据库事务内复核权限、状态、容量及冲突（SQLite 使用 `BEGIN IMMEDIATE`，PostgreSQL 使用对应事务和并发控制），同时提交业务、站内通知、审计和请求回执。失败回滚。客户端遇到响应不确定时保留同一幂等键重试，收到明确结果后才更新页面。

## 命令目录

真实身份核验适配：服务端配置 `BNBU_IDENTITY_VERIFICATION_URL` 和可选 `BNBU_IDENTITY_VERIFICATION_TOKEN`。上游接收 `{requestId,accountId,email}`，必须回传相同 requestId/email、明确布尔 verified，verified=true 时还需非空 subject。不跟随重定向；十秒超时或非法/错账号/旧请求响应返回 502；未配置返回 503，不返回假成功。角色映射和学校正式授权政策独立实施，当前不采纳上游 roles。测试只验证适配边界，不是学校真实核验。

未列出的客户端字段不能授予资格。所有 `id`、`slotId` 等来自服务端，不用姓名判断归属。日期使用带时区的 ISO 时间，邮件显式字段沿用现有北京时间格式。

| 命令 | 必填输入及可选输入 | 权限与主要约束 |
| --- | --- | --- |
| `post.create` | title, body, board；images[] | 学生；80/1000 字、最多九图，待审 |
| `comment.create` | postId, body | 学生；公开帖子、最多300字，待审 |
| `content.review` | id, status=visible/hidden；reason | 审核职责；首次通过可不填原因，隐藏/恢复按状态规则要求原因；通知和审计 |
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
| `coffee.profile` | nickname,bio,topics,location；enabled,teacherId | 教师本人或运营；有有效预约不能停用 |
| `coffee.slot.create` | startAt,endAt,location,capacity；teacherId | 教师本人或运营；未来、同教师不重叠 |
| `coffee.slot.update` | id,startAt,endAt,location,capacity,closed | 有占用不能改时间或关闭；容量不得低于占用 |
| `coffee.book` | slotId,topic | 学生；条件满足即成立，无教师再次审批 |
| `coffee.cancel` | id；reason | 当事学生、所属教师或运营；教师/运营须原因 |
| `coffee.move` | id,slotId,reason | 所属教师或运营；原占用保留、新名额预留 |
| `coffee.answer` | id,accept | 仅预约学生；再次复核时段，释放对应占用 |
| `alumni.apply` | studentNumber,major,graduationYear,city,direction,experience,topics,bio,evidence | 学生；复用原首版说明核验，不代表学校正式核验 |
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

## 补充 HTTP 接口

| 方法与路径 | 输入或结果 |
| --- | --- |
| POST `/api/auth/sign-in` | `{identifier,password}`；当前统一登录，服务端识别个人邮箱或独立管理登录名 |
| POST `/api/auth/admin-login` | `{loginName,password}`；兼容独立管理登录 |
| POST `/api/auth/email/request` | 当前个人账号邮箱验证码发送，不授予学校职责 |
| POST `/api/auth/email/confirm` | `{code}`；核对本人邮箱 |
| GET `/api/community` | 当前账号可见的帖子、评论与本人点赞收藏关系 |
| GET `/api/students/search?number=...` | 完整独立学号精确查找，遵守本人可搜索设置，不从邮箱推导 |
| GET `/api/accounts/students`、`/api/accounts/teachers` | 有账号管理权限的只读目录；查询字段以 account-directory.ts 为准 |
| GET `/api/accounts/administrators` | 总管理员读取独立管理账号目录 |
| GET `/api/accounts/administrator-self` | 本人独立管理账号注销核对资料 |
| GET `/api/accounts/admin-email` | 本人管理邮箱验证状态 |
| POST `/api/accounts/admin-email/request` | 空对象，向本人当前管理邮箱发送验证挑战 |
| POST `/api/accounts/admin-email/confirm` | `{challengeId,code}`，仅核验本人挑战 |

独立管理账号命令为 `accounts.admins.create/edit/state/delete`、`accounts.close`、`accounts.password.change`，复用同一 `/api/commands` 信封。权限与身份来自 companionIdentity，不能沿用旧体育身份字段或命名空间。准确字段、版本和职责移交校验见 `backend/src/accounts/` 及对应 PostgreSQL 适配；首次改密和本人操作门禁由服务端执行。

补充伴学命令：`preferences.preview`、`preferences.searchable`、`preferences.reminders` 保存本人设置；`mail.split` 和 `mail.revise` 处理管理员已核对的拆分及更正关联，要求 confirmed、expectedVersion 和原因；更正关联还要求 targetMailId、targetVersion。邮件接口需运营权限，不是开放收件 webhook。校园 AI 的反馈接口保留，但按用户决定不在原答案下增加反馈按钮。

## 数据与部署边界

账号、实体、通知、关系、审计与幂等回执保存在伴学数据库；图片字节由本地对象卷或 COS 保存。原体育历史迁移表若已存在，保留迁移校验和与历史数据，不作为运行时业务来源，也不连接外部体育库执行迁移。

`/api/workspace` 仅返回当前账号可见内容。封禁或失去教师职责的账号不进入无关用户的教师发现列表；当事人预约历史保留。未接通体育源返回 `sports:null` 和不可用状态，不能冒充确认无课。

外部邮件投递、学校核验、课表识别和 COS 参数见 `docs/LOCAL_BACKEND_HANDOFF.md`；体育只读源和活动收件邮箱由用户确认留到部署时配置。腾讯云 OCR 已开通不代表结构化课表适配已经联通。当前返回路径与错误边界以 `backend/src/postgres-api.ts` 和测试为准。

校园 AI 形象偏好：preferences.aiicon，学生本人提交 choice（yellow/kitty/custom），可选 image 为 JPG/PNG/WebP data URL。custom 要求已有或本次上传图片；保存到本人的 preferences，不向其他账号投影。
