# 体育 V8.1 重建状态

用户于 2026-10-11 明确以 `new_need_version_sports` 现有体育规则为准。来源 main `50b0005e02bc93d5c5de089bbe8842e1d0576966`；四份规则原文及逐文件哈希保存在 `sports-v81/`。参考仓库自身的业务后端只到 Foundation，不把其历史 Mock/Contract 验证当成现成业务实现。

## 已实现，尚未代表完整体育验收

- `server/sports/session-clock.ts`：服务端 ACTIVE 累计、PAUSED 排除、固定上海业务日期、结束冻结、非法状态拒绝；5 项测试。
- `server/sports/credit.ts`：依照来源设计 A-04～A-13 的联合动态规划；日一条、周2/3/4、30/45/60门槛、单次60、两类1200目标、认证优先、原完整最优组合保留、时间/ID平局。6 项测试含80组8候选穷举交叉核对及新增候选单调性。仅接收审核模块明确有效的一致候选，不猜测缺失审核状态；尚未做生产规模压测。
- `server/sports/courses.ts`：体育独立身份、学期创建/编辑/切换、模板发布、课程草稿/发布/关闭、邀请码生成/撤销、已验证学生直接入班。操作走现有命令事务，业务/通知/审计/幂等回执共同提交；需要版本的操作拒绝过期版本。
- 课程发布检查实际尚可运动的日期与时间窗、日周限制和分类目标可达性，不借未来可能认证掩盖不合理配置。规则锁定后不能用草稿保存更改。`610/590`目标仅20个可用计入日期的反例拒绝发布。
- `GET /api/sports/workspace`：教师看本人课程与邀请，学生看本人入班课程且不见邀请码列表，体育管理员只读当前未关闭课程；普通伴学管理员不因角色自动取得体育身份。课程链5项集成测试使用真实SQLite/事务命令，但不是浏览器验收。

体育资格暂以服务端 `sportsIdentity` 实体独立表达（role=student/teacher/admin、status=verified），公共命令没有创建该资格的入口。`Start-Local.ps1 -Acceptance` 显式为原独立测试账号建立体育身份，不创建课程、运动或学时事实；真实核验与权限映射仍分离。

- `server/sports/sessions.ts`：数据库事务内唯一未结束会话、当前学期/成员/日期及每日时间窗检查，开始/暂停/继续/结束均保存事件与规则快照。关闭课程不抹去原会话的结束入口。客户端传入时长无效，更新必须匹配版本；4项集成测试覆盖隔离、重复、时间边界和暂停排除。
- `/workspace/sports`：管理员开学期和模板、教师建课/发布/邀请/关闭、学生入班和运动计时。成功写入立即刷新，读取服务器时间，刷新不重置计时。
- 2026-10-11浏览器使用独立账号完整操作以上主链。暂停时8秒，服务停止并重启后仍为8秒，继续并结束后20秒、可计0分钟。此为短会话持久化验收，不是30分钟运动或有效学时证明。截图：`artifacts/acceptance/sports-session-persistent.png`。

## 现有命令协议

都使用 `/api/commands` 通用 `{action,input,requestId}`，返回 `{data:{id}}`；从体育 workspace 读取结果。命令名称如下：

| 命令 | 输入 |
| --- | --- |
| sports.semester.create / update | name,academicYear,type=FIRST/SECOND/SUMMER,startDate,endDate；update另需id/version |
| sports.semester.activate | id,version；旧学期有未完成结算课程时拒绝 |
| sports.template.publish | name；仅固定V8.1模板，不允许传任意公式 |
| sports.course.save | semesterId,templateId,name,description,threshold,weeklyLimit,relatedTarget,otherTarget,startDate,deadlineDate,settlementDate,startTime,endTime；编辑另需id/version |
| sports.course.publish / close | id,version；close另需reason |
| sports.invitation.create | courseId,minutes可选（5–120，默认30） |
| sports.invitation.revoke | id,version |
| sports.enrollment.join | code；当前已核验体育学生直接入班，不审批 |
| sports.session.start | courseId；规则和开始时刻由服务器读取 |
| sports.session.pause / resume / end | id,version；客户端不能指定时长 |

日期使用 `YYYY-MM-DD`，时间窗使用上海当日 `HH:mm`，deadlineDate为常规截止日（含当天），其后完整七天收尾，settlementDate最早为第八天。课程每天相同时间窗；未来若需要不同日期差异窗口，应扩展协议并保持可达性检查精确。

## 未完成的完整范围

1. 正式体育身份初始化、教师首次改密与账号治理、学校邮箱/邀请注册流程与自然到期十分钟宽限。
2. 剩余体育网页接线、成员移出/恢复、邀请入班开放开关、课程名称说明修正、收尾补练、结算/归档前阻塞核对。
3. 材料草稿恢复、凭证捕获与服务器媒体验真/存储、首次材料受理和同批续传。
4. AI初审真实适配、技术队列与受控人工模式、公开六类原因、一次补证、逾期、版本绑定和教师权限。
5. 学校工作日日历SLA、系统维护及事故暂停区间、P-04纠错；未配置校历不能猜48小时。
6. 计入投影与前驱版本持久化、有效认证分类抵扣、教师审核变更后的重算和用户可见原因。
7. 官方名单、OCR草稿确认、耐力跑用时与内部换算、免测/认证、内部成绩及历史备注访问边界。
8. 体育帮助、反馈、通知、管理员固定权限、历史主体注销脱敏、报表/结算及跨角色浏览器验收。

这些均保留在原goal范围内，不以完成算法或若干测试替代完整业务交付。下一步推进材料、审核与计入联动；其他分支逐项实现验证。
