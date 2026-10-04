# BNBU Campus Hub Demo Walkthrough

## 三条核心讲解逻辑

1. 体育入口不是孤立打卡工具：一次运动打卡可以自然延伸为学时进度、Campus Journey、活动发现、组织关注、同学连接与成长记录。
2. 活动是校园关系的起点：主办方、老师、学生、社区内容与校友都通过同一套 Event / Host / Calendar 对象连接。
3. 学生真实参与会持续沉淀：报名、签到、加入组织、Coffee Chat 和主办活动共同形成 Campus Profile 与 Campus Graph。

## 5 分钟版本

### 0:00–0:45 Campus Today + Sports Check-in

- 打开首页 `/`。
- 指向 Today at BNBU、Sports Progress 和 Campus Journey；点击 `Open Check-in` 进入 `/check-in`。
- 在今日打卡卡片选择 `Morning Campus Run`，点击 `Start Check-in`，再点击 `Complete Check-in`。
- 指向 20 小时目标、课程相关/其他运动分解和历史记录；说明完成后状态同时进入 Campus Journey。
- 打开 `/settings`，切换 `中文` / `English`，确认导航和打卡页即时变化；这是仅保存在浏览器的 Demo 偏好。

### 0:45–2:00 Story 1：活动发现闭环

- 点击顶部 Discover。
- 打开 Featured 的 `AI Agent Workshop`。
- 展示 Host、时间、地点、参与者、流程和地图卡片。
- 点击 `Register`，在确认弹窗中再次点击 `Register`。
- 点击 `View Ticket` 展开个人二维码票券，说明载荷不含姓名或学号；再打开 My Events，确认活动显示 `Going` 且可重新进入票券页。
- 打开 Calendar，确认活动进入 Agenda。
- 打开头像 → My Campus → Campus Graph，点击 AI Agent Workshop 节点，说明 `registered` edge。

### 1:50–3:00 Story 2：活动到组织和连接

- 回到 Discover，打开 `Campus Night Run`。
- 点击 Running Club 的 `View host`，点击 `Follow`。
- 返回活动，确认报名状态为 Going，并打开个人票券。
- 切换到 Organizer 预设并进入 Manage Event：先用 `Standard` 模式扫描、核对参与者并确认签到，再切换 `Express` 演示自动签到与橙色重复扫码反馈。
- 打开 My Campus，确认 Journey 顶部增加 Night Run 签到记录。
- 打开 Campus Graph，说明 Event 的关系已从 `registered` 升级为 `participated`，Running Club 形成 `follows`。

### 3:00–4:00 Story 3：Coffee Chat 到成长档案

- 打开 Campus → Coffee Chat → 张老师。
- 选择 `15:30`，填写或保留 `Marketing Career Planning`，点击 `Confirm Booking`。
- 打开 My Events 或 Calendar，展示 Confirmed Coffee Chat。
- 打开 My Campus，展示新的 Journey；再打开 Campus Graph，点击 Professor Zhang，说明 `coffee_chat` edge。

### 4:00–5:00 Story 4：创建与审核

- 点击顶部 Create Event。
- 保留预填的 `Marketing Case Night`、Thursday 19:00、T4-105、Capacity 30、Require Approval。
- 点击 `Preview Event`，再点击 `Publish Event`。
- 在 Manage Event 的 Guest List 找到李明 `Pending`，点击 `Approve`；批准后系统才签发个人票券。
- 在二维码签到台展示有效、错误活动、失效和无效票券反馈；指出 Guest、通知、Journey 与 Graph 会同步更新，并说明这是本地 Mock 工作流而非生产权限系统。

## 10 分钟版本

### 0:00–1:30 产品全景

- 从 Campus Today 开始，解释今天、推荐、体育、Journey 与 Communities 为什么出现在同一屏。
- 打开 Campus 页面，逐项讲解 `Activity → Organization → Connection → Community → Profile → Graph`。

### 1:30–3:30 完整活动闭环

- 完整执行 Story 1。
- 在 Event Detail 额外演示 Save、Share、Host Page 和 Related Events。
- 在 Calendar 切换 Month / Week / Agenda，说明 Agenda 是当前最完整视图。

### 3:30–5:00 组织、签到与社区

- 完整执行 Story 2。
- 打开 Organizations，进入 Running Club 或 Badminton Team，演示 Join / Leave。
- 打开 Community，点赞、收藏关联 Night Run 的帖子；说明内容必须回到现实活动或组织。

### 5:00–6:30 Coffee Chat

- 完整执行 Story 3。
- 展示 Slot 的 Available / Booked / Full / Selected / Confirmed 状态和取消预约。
- 强调 Coffee Chat 复用 Activity Engine，而不是单独系统。

### 6:30–8:00 Create / Manage Event

- 完整执行 Story 4。
- 再演示 Waitlist 用户 `Move to Going`、Going 用户 `Check In`。
- 打开 My Events → Hosting 与 Event Detail，说明同一创建结果在多个页面一致展示。

### 8:00–9:00 Campus Profile 与 Graph

- 打开 My Campus，展示体育、活动、组织、兴趣和动态 Journey。
- 打开 Campus Graph，按 Event / Organization / Teacher 筛选，点击节点和关系，再点 Reset View。
- 说明图完全从统一 Demo State 派生，不存在页面内单独硬编码状态。

### 9:00–10:00 未来边界与复位

- 快速打开 Find a Partner、Alumni、Notifications，说明它们复用活动、连接与通知对象。
- 打开头像菜单 → Demo Control，切换 New Student / Active Student / Organizer。
- 最后恢复 Default Scenario，说明所有数据都是 localStorage Mock，不涉及真实学生或学校系统。

## 现场前检查

- 使用桌面浏览器和 390×844 手机尺寸各打开一次首页、Event Detail、Coffee Chat、Create Event、Profile 和 Graph。
- 先在 Demo Control 选择 `Restore Default Scenario`。
- 需要重复 Story 1 时，用 New Student 预设；需要直接演示审核时，用 Organizer 预设。
- 明确告诉观众：这是高保真未来产品 Demo，不是已上线或已连接后端的生产系统。
