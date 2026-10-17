# 体育打卡界面优化与迁移对接（2026-10-17）

## 参考与实现
只读参考 BNBU Sports 本地项目 `C:/Users/23328/Desktop/new_version/BNBU-Sports-Web-new/frontend/student/js/screens/dashboard.js`、`checkin.js` 及 `index.html`。原首页以今日打卡、班级状态、进行中运动、累计进度、分项进度组织内容；打卡流程为 Idle → Active ↔ Paused → Finished → Submitted。

会同里采用“今日运动入口 → 学期进度 → 记录概览 → 状态筛选列表”的布局。手机单列，760px以上双栏。大图封面改为紧凑课程信息，沿用当前会同里绿色视觉。记录支持全部、待处理、有效、等待检查、待补充、无效及技术处理筛选，默认4条，支持展开和详情。待处理合并 pending 与 supplement，概览与列表采用同一口径。

## 当前边界

更新：后续用户已授权内部前端模拟流程，以下外跳入口描述已被替代，详见 `../artifacts/sports-demo-20261017/README.md`。正式接口对接清单仍适用。
- 新页面组件 `src/v2/sports/StudentSportsPage.tsx`；独立样式 `studentSports.css`。旧页面导出名 ReferenceSports 保留，路由无改动。
- 复用 sportsSummary、sportsProgressLabel、recordGroup，保留授权身份过滤、不可用数据保护和服务端资格口径；有效记录数量不转换成学时。
- 继续使用当前本地模拟数据；未写数据库或新增运动接口。网络失败保留错误提示，未知值为“—”。
- `sportsPlatformEntry` 集中保存现有 `/student/` 入口。点击是进入现有体育应用，不会在会同里创建运动或静默提交资料。平台内的实际登录、运动、上传和学时核算需后续独立验收。

## 后续迁移适配清单
|区域|现有来源|下一步对接|
|---|---|---|
|课程与学期|sports.progress.course / semester|课程选择、selectedEnrollmentId、有效在班状态；不要用页面角色推定授权|
|有效学时|completedHours / targetHours / remainingHours / percent|复用原服务端累计投影及 qualificationStatus，保留每日/每周限制说明|
|今日打卡|现有体育平台入口|checkInTimeWindow、canStartExercise 与服务端开始许可；无数据不能显示“当前可打卡”|
|进行中运动|尚未迁入|恢复会话、计时、暂停/继续、结束、重复提交幂等；先处理跨页面与断网恢复|
|凭证|体育平台处理|照片原图、视频、上传队列、草稿、重试、提交上下文与泳项规则|
|记录详情|既有授权记录及审核状态|凭证查看、补充材料、审核原因、creditedSeconds及未计入原因；审核有效和计入学时分开|
|分项进度/本周额度|当前接口未提供|读取权威分类学时与周额度后再展示，不能从记录条数估算|
|身份和通知|现有各平台会话|明确共享认证/单点登录方案，保持原课程权限和本人记录范围|

迁移建议：先统一只读字段和入口，再接入恢复会话与计时，最后迁入凭证、补交及审核反馈。每阶段使用真实测试账号、移动设备、断网恢复与重复提交用例验收。不要直接复制原 app 全局状态到会同里 workspace。

## 验证
lint、TypeScript/Vite 构建通过；reference 与 sports-companion 两个测试文件13项通过，覆盖授权身份过滤、源不可用与页面渲染。浏览器验证393px手机、320px窄屏及桌面布局，并检查待处理筛选与记录详情。本地展示验证不代表体育平台提交或真实运动验收。

源码和截图精确路径本地提交；保留既有暂存工作。本轮不修改 BNBU Sports 原项目。
