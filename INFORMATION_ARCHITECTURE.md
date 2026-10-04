# BNBU Campus Hub — Information Architecture

> Phase 2 交付物。定义重整后的一级/二级导航、页面层级与用户流程。
> 约束：**不修改 URL Route、业务数据模型、Reducer 行为、用户状态**。以下任何 Route 调整仅为建议，不在本批次实施。

## 1. 设计目标

第一次使用平台的学生，无需学习说明即可自然回答：

```text
我在哪里？这里是做什么的？我现在是什么状态？
我下一步该做什么？哪个按钮最重要？操作完成了吗？
```

围绕主线 `Activity → Connection → Belonging`，让 Event / Organization / Coffee Chat / Community / Graph / Journey 保持连续性，而非独立孤岛。

## 2. 一级导航（统一 5 项）

桌面 Topbar 与移动 Bottom Navigation **完全一致**，消除当前割裂：

| 序号 | 入口 | 路由 | 图标（Lucide） | 定位 |
|---|---|---|---|---|
| 1 | 首页 Home | `/` | `Home` | 今天该关注什么 |
| 2 | 发现 Discover | `/discover` | `Compass` | 今天/最近能参加什么 |
| 3 | 校园 Campus | `/campus` | `UsersRound` | 校园关系与生活入口 |
| 4 | 体育打卡 Sports | `/check-in` | `Activity` | 学时进度 + 打卡任务 |
| 5 | 我的 My Campus | `/profile` | `UserRound` | 校园身份 + Journey + Graph |

### 设计理由

- 符合规格书「4–5 个核心入口」原则，每项对应一个明确用户任务。
- 移除了桌面端的 `Calendar`、`My Events`，移动端的 `Notifications`、`Profile`（改为「我的」）。
- 二级功能收进 `Campus`、`My Campus`、Topbar 工具区与头像菜单，避免一线塞入过多入口。

## 3. 二级入口归属

| 原一线入口 | 新归属 | 理由 |
|---|---|---|
| Calendar `/calendar` | My Campus（/profile）页内入口 + Campus 页内入口 | 日历是「我的时间」，归个人 |
| My Events `/my-events` | My Campus（/profile）页内入口 + Home「Upcoming」 | 我的活动是个人资产 |
| Notifications `/notifications` | **保留 Topbar 铃铛（全断点）**，移除 Bottom Nav 槽 | 通知是全局工具，不占一线 5 槽 |
| Create `/create` | Topbar Primary 按钮 + 移动 FAB | 主办方主动作 |
| Settings `/settings` | 头像菜单 | 全局设置 |
| Organizations `/campus/organizations` | Campus 模块 | 校园关系 |
| Coffee Chat `/coffee-chat` | Campus 模块 | 校园关系 |
| Community `/campus/community` | Campus 模块 | 校园关系 |
| Partners `/campus/partners` | Campus 模块 | 校园关系 |
| Alumni `/campus/alumni` | Campus 模块 | 校园关系 |
| Campus Graph `/profile/graph` | My Campus 页内 + Campus 页内入口 | 关系可视化 |
| Host `/hosts/:id` | 活动/组织详情内 | 上下文导航 |

## 4. 页面层级（Page Hierarchy）

### 4.1 学生主流程

```text
Home（Today → Next Action → Progress → Recommended → Community）
  ├─ Discover（搜索 → 筛选 → Featured → 事件网格 → Host 条）
  │    └─ Event Detail（了解 → 报名 → 状态反馈 → 票券）
  │         └─ Ticket（QR 第一优先）
  ├─ Campus（People / Organizations / Community / Connections / Opportunities）
  │    ├─ Organizations → Organization Detail（Home/Events/Members/Posts）
  │    ├─ Coffee Chat → Teacher Detail（找时间 → 填话题 → 确认）
  │    ├─ Community（帖子流 + 相关对象）
  │    ├─ Partners（活动筛选 → 邀请）
  │    └─ Alumni（复用平台对象）
  ├─ Sports Check-in（总进度 → 开始/完成 → 历史）
  └─ My Campus（Who I am → What I joined → What I experienced → Graph）
       ├─ Campus Graph（节点 → Detail Panel 解释关系）
       ├─ Calendar（Agenda 主视图）
       └─ My Events（Upcoming/Hosting/Past/Saved）
```

### 4.2 主办方流程

```text
Create Event（What → When → Where → Who → Registration → Publish）
  └─ Manage Event（Event Status → 待处理嘉宾 → Check-in Scanner → 统计）
```

## 5. 关键用户流程（保持不变，仅优化 UI 表达）

| 流程 | 现有 Route | 本次调整 |
|---|---|---|
| 活动报名 | `REGISTER_EVENT` | 状态反馈四件套（Label+Pill+Button+Copy） |
| 票券 | `/events/:id/ticket` | QR 保持第一优先 |
| 扫码签到 | `EventScanner` | 保持两模式，优化结果反馈层级 |
| 体育打卡 | `START/COMPLETE_CHECK_IN` | Timer 最突出 |
| Coffee Chat | `BOOK_COFFEE` | 保持四步心理模型 |
| 组织关系 | `TOGGLE_MEMBERSHIP/FOLLOW_HOST` | Join 主、Follow 次 |

## 6. 移动端规则

- Bottom Nav 固定 5 槽（原 6 槽，减少拥挤）。
- Notifications 通过 Topbar 铃铛可达（修复隐藏问题），不占底栏。
- Primary Action 可达：Event Detail 的 `mobile-rsvp-bar` 保持在 Bottom Nav 之上。
- 横滑 Tab/Filter 继续沿用；不压缩 Tap Target（≥44px 交互区）。

## 7. Route 调整建议（仅建议，不在本批次实施）

| 现状 | 建议 | 理由 | 状态 |
|---|---|---|---|
| `/campus/partners`、`/campus/community`、`/campus/alumni` 前缀不一致 | 统一为 `/campus/*` 命名空间（已基本一致） | 减少认知 | 已一致，无需改 |
| 无 Breadcrumb | 详情页增加 Breadcrumb | 帮助「我在哪里」 | 后续可选 |

> 本批次**不修改任何 Route**。若后续确需调整，另行评审。
