# BNBU Campus Hub — UX/UI Redesign Audit

> 本文是 `bnbu-campus-hub-demo` 全平台 UX/UI 重整的 Phase 1 交付物。
> 结论基于真实代码审计（`src/**` + `src/styles/global.css`）与 `UI_STYLE_GUIDE.md` 交叉核对，不依据猜测。
> 审计基线：React 19、Vite、React Router、Lucide、`qrcode.react`；状态由 `demoReducer` 统一管理。

## 0. 审计原则

本次重整围绕一条主线，而不是「Hero → Card → Gradient → Animation」：

```text
User Intent → Information → Action → Feedback → Next Step
```

优先级（严格从高到低）：用户任务清晰度 → 信息架构 → 交互直觉 → 状态反馈 → 视觉层级 → 一致性 → 响应式 → Accessibility → 动效 → 装饰。

**绝对不破坏**：`DemoState` / `DemoAction` / `demoReducer` / Registration State Machine / Ticket Lifecycle / Coffee Booking / Check-in / `deriveGraph` / Notifications / Journey 写入 / Route / 数据形状。凡是业务阻碍 UX 之处，只记录为 `UX BLOCKER`，不偷偷改。

## 1. 总体结论

品牌 DNA（暖纸背景、BNBU 蓝、Editorial 大标题、圆角卡片、内容优先、年轻但克制）是健康的，不应推倒重来。真正的问题不在视觉方向，而在**一致性、导航割裂、状态反馈不完整、以及部分页面 Card Soup** 四类。

严重度定义：

- **P0**：阻碍任务完成
- **P1**：明显影响体验
- **P2**：一致性问题
- **P3**：视觉优化

## 2. 分页审计

### 2.1 Home（`/`）

| 维度 | 结论 |
|---|---|
| User Goal | 快速知道「今天该关注什么、下一步做什么、我在校园的进度」 |
| Current Problem | 首屏同时出现：问候 Hero、深色 Today 舞台、体育进度卡、Campus Journey 卡、推荐区、社群、Upcoming —— **没有单一的视觉主行动**。多个 CTA（打开打卡 / 关系图 / 查看档案 / 发现全部）竞争。 |
| Severity | P1 |
| Proposed Change | 重新排序为「Today → Next Action → Progress → Recommended → Community」，每屏只保留一个最明确的 Primary CTA。体育卡与 Journey 卡合并为一个「今日进度」区，避免两个同等权重卡片并排抢注意力。 |

### 2.2 Discover（`/discover`）

| 维度 | 结论 |
|---|---|
| User Goal | 「我今天/最近能参加什么」 |
| Current Problem | 搜索框与 Topbar 搜索是两个不同尺寸/圆角的实现（58px/16px vs 50px/11px）；「Featured Event」在无筛选时占据大面积但内容与下方卡片重复；Event Card 状态（going/pending/waitlist）依赖右上角小 Pill，2–3 秒内不易判断报名状态。 |
| Severity | P2（搜索不一致）；P1（状态可见性） |
| Proposed Change | 统一 Search 原语；Featured 区只保留真正差异化内容或降级；Event Card 用更明确的「状态 + 时间 + 地点」第一眼层级。 |

### 2.3 Event Detail（`/events/:id`）

| 维度 | 结论 |
|---|---|
| User Goal | 了解活动 → 判断 → 报名 → 知道结果 → 之后看票券 |
| Current Problem | 封面大标题（92px）抢占注意力，报名侧栏在移动端退化为 `mobile-rsvp-bar`，但**状态反馈不完整**：`pending` 只显示 Pill，没有「已发送申请，主办方将审核」的支持文案。 |
| Severity | P1 |
| Proposed Change | 按 Primary/Secondary/Tertiary 重排；报名状态用「Label + Status Pill + Button + Supporting Copy」四件套完整表达。 |

### 2.4 Ticket（`/events/:id/ticket`）

| 维度 | 结论 |
|---|---|
| User Goal | 打开票券 → 让工作人员扫二维码 |
| Current Problem | QR 已是视觉第一优先级（白静区、高对比、大尺寸），设计合理。仅 P3 级小问题：`ticket-page-orb` 装饰元素在 `prefers-reduced-motion` 下仍占位。 |
| Severity | P3 |
| Proposed Change | 保留沉浸式设计；确认 reduced-motion 下装饰无残留动效。 |

### 2.5 Sports Check-in（`/check-in`）

| 维度 | 结论 |
|---|---|
| User Goal | 看总学时进度 → 开始/完成一次打卡 |
| Current Problem | 总学时、课程、其他三条进度用 3 张卡表达，Active Session 的 Timer 是「最主要信息」但字体与布局不够突出；`Start Check-in` 与 `Complete` 的权重在 Active 态下未充分区分。 |
| Severity | P2 |
| Proposed Change | 任务型 UI 优先：进度环形图 + 一条明确的 Active Session 卡（Timer 最大）；减少装饰性 Hero 对功能的挤压。 |

### 2.6 Campus（`/campus`）

| 维度 | 结论 |
|---|---|
| User Goal | 校园关系与校园生活的入口 |
| Current Problem | 5 个模块卡（Organizations/Coffee Chat/Partner/Community/Alumni）同权重排列，形成 Card Soup；「Activity → connection → belonging」故事条信息密度低、装饰性强。 |
| Severity | P1 |
| Proposed Change | 重组为 People / Organizations / Community / Connections / Opportunities 分组，而非 5 张同权卡。 |

### 2.7 Coffee Chat（`/coffee-chat`）

| 维度 | 结论 |
|---|---|
| User Goal | 找老师 → 了解 → 找时间 → 说话题 → 确认 |
| Current Problem | 教师卡第一眼信息够用（名字/领域/可约时段），但「Coffee Cup」装饰占用 Hero 大量空间；时段选择面板与说明文字层级可再紧凑。 |
| Severity | P2 |
| Proposed Change | 教师卡保持「是谁/负责什么/最近什么时候有空」第一眼；Hero 装饰降权。 |

### 2.8 Organizations（`/campus/organizations`、`/organizations/:id`）

| 维度 | 结论 |
|---|---|
| User Goal | 发现组织 → 关注/加入 |
| Current Problem | Follow 与 Join 是两个并排动作，但视觉权重接近，用户难以判断「哪个是主行动」。 |
| Severity | P2 |
| Proposed Change | Join 作为 Primary、Follow 作为 Secondary/Ghost，明确主次。 |

### 2.9 Profile（`/profile`）与 Campus Graph（`/profile/graph`）

| 维度 | 结论 |
|---|---|
| User Goal | 「这是我的校园轨迹」 |
| Current Problem | Profile 的 Sports 数字（16/20h、80%）与 Check-in 页重复且部分硬编码；Campus Graph 的节点点击后 Detail Panel 已能解释关系，但缺少「这段关系从哪里产生」的源头说明（规格书 §16）。 |
| Severity | P1（Profile 数据一致）；P2（Graph 解释） |
| Proposed Change | Profile 复用 `getCheckInSummary` 而非硬编码；Graph Detail 增加「Connection created by: …」说明。 |

### 2.10 Notifications（`/notifications`）

| 维度 | 结论 |
|---|---|
| User Goal | 判断「发生了什么/为什么相关/是否需要行动/点哪」 |
| Current Problem | 所有通知同一视觉层级，未区分 Informational 与 Action Required；**移动端 Topbar 铃铛被 `display: none` 隐藏**，移动用户找不到通知入口。 |
| Severity | P0（移动铃铛消失）；P1（层级未区分） |
| Proposed Change | 修复移动铃铛可见性；通知列表区分需行动（如「等待审批」）与纯信息，视觉上分级。 |

### 2.11 Create Event（`/create`）

| 维度 | 结论 |
|---|---|
| User Goal | 降低创建活动认知负担 |
| Current Problem | 五段表单一次性暴露全部字段；封面模板按钮触发**原生 `alert()`**，与全站 Modal/Toast 体系冲突；字段无统一 Error/Help/Required 状态。 |
| Severity | P0（原生 alert 破坏产品 UI 一致性）；P1（字段顺序） |
| Proposed Change | 用 Toast/Modal 替代 `alert()`；字段按 What→When→Where→Who→Registration→Publish 顺序，Advanced Options 后置。 |

### 2.12 Manage Event（`/manage/:id`）

| 维度 | 结论 |
|---|---|
| User Goal | 事件状态 → 需要处理的嘉宾 → 签到 → 统计 |
| Current Problem | 5 张 Metric 卡放在最顶抢空间，「需要我处理的 pending/waitlist」反而排在下方；Guest 列表与 Scanner 视觉密度偏高（可接受，属工作台）。 |
| Severity | P2 |
| Proposed Change | 把「待处理嘉宾」提为第一优先，统计卡降为次要信息。 |

### 2.13 次级页面（Calendar / My Events / Host / Partners / Community / Alumni / Settings / 404）

| 页面 | 问题 | Severity |
|---|---|---|
| Calendar | Month/Week 是概念视图，Agenda 为主，交互清楚；仅横向滚动体验可优化 | P3 |
| My Events | Tab 计数逻辑清晰，Card 宽度行样式统一度可提升 | P2 |
| Host | Hero + 关注动作合理；成员列表信息密度低 | P3 |
| Partners | 邀请按钮状态清晰（已发送/发送） | P2 |
| Community | 帖子流 + 侧栏结构清楚，相关对象关联设计好 | P2 |
| Alumni | 复用平台说明到位 | P3 |
| Settings | 语言切换反馈好（role=status） | P2 |
| 404 | Empty State 复用合理 | P3 |

## 3. 跨页一致性问题（来自 UI_STYLE_GUIDE §22，逐条确认）

1. **Color proliferation**：正式 Token 仅 8 个，其余 muted/border/off-white/语义色均为 raw value，存在多组相近灰。
2. **Radius proliferation**：相似 Card 混用 18/19/20/21/22px。
3. **Shadow proliferation**：仅 `--shadow` 命名，按钮/搜索/Sticky/Modal/Ticket 各自硬编码。
4. **Spacing proliferation**：大量 5–35px 中间值，未形成 Scale。
5. **Typography drift**：650/730/750/850/900 字重并存；9–13px 小字号密集。
6. **Control height drift**：Button 42/34/40 之外还有 31/36/38/46px。
7. **Search variants**：Discover 58px/16px vs App 50px/11px。
8. **Feedback conflict**：`CreateEventPage` 用原生 `alert()`。
9. **Form incompleteness**：无统一 Error/Help/Required/Loading；Checkbox 依赖原生 accent。
10. **Component abstraction gap**：Button/Field/Tag/Panel 是 CSS class 约定，非共享 React Primitive。
11. **Missing states**：无 Skeleton/Spinner/Network Error/Drawer/Destructive Button/Breadcrumb。
12. **Raw Surface values**：`white`/`#fff`/`--paper` 混用。
13. **Motion drift**：三档 Token 与 .16/.18/.2/.22/.25/.45/.52/.56/1.25/5/7s 并存。
14. **Mobile pattern difference**：RSVP 是固定底栏，Modal 仍居中而非 Bottom Sheet。
15. **Accessibility gap**：Modal 有 `role=dialog`/Escape，但无完整 Focus Trap/Return。

## 4. 桌面/移动导航割裂

- 桌面主导航 6 项：Home / Discover / Calendar / Campus / Sports Check-in / My Events。
- 移动底部导航 6 项：Home / Discover / Check-in / Campus / Notifications / Profile。
- **末位项不同**：桌面把 Calendar+My Events 提到一线，移动把 Notifications+Profile 提到一线。两套导航语义不一致。
- **移动端铃铛被隐藏**（`.top-actions > .notification-button { display: none }`），通知入口在移动端消失。

→ 已在 `INFORMATION_ARCHITECTURE.md` 中提出统一 5 项方案。

## 5. Accessibility 缺口

| 项 | 现状 |
|---|---|
| Focus Visible | ✅ 全局 `:focus-visible` 3px 蓝色 ring |
| Keyboard | ⚠️ Profile Menu、搜索 Modal 无完整键盘循环 |
| Modal Focus Trap | ❌ 无 |
| Modal Focus Return | ❌ 无 |
| Escape | ✅ Modal 已支持 |
| ARIA | ⚠️ `role=dialog`/`aria-modal`/`aria-label` 有，但部分 `aria-pressed`/`aria-expanded` 不全 |
| Semantic HTML | ⚠️ 多处 `div` 承担按钮语义（如 `notification-dot`、`graph-node` 用 button 但 label 结构待完善） |
| Contrast | ⚠️ 部分 9px 灰字（如 `#999da2`）对比度不足 |
| Touch Target | ⚠️ 部分小按钮 <44px（视觉小但交互区未保证） |
| Screen Reader | ⚠️ 装饰元素 `aria-hidden` 部分缺失 |
| Reduced Motion | ✅ 已支持，需确认 Ticket 装饰 orb 同步 |

## 6. UX BLOCKER 记录（业务阻碍，仅记录不修改）

| 项 | Current behavior | Problem | Recommended business change | Impact |
|---|---|---|---|---|
| Profile 体育数据硬编码 | `ProfilePage` 写死 `16 / 20h`、`80%`、`课程 6/10`、`其他 10/10` | 与 Check-in 页真实派生数据不同步，用户报名/打卡后 Profile 不更新 | Profile 复用 `getCheckInSummary(state)` | 需允许 Profile 读取派生状态（不涉及 reducer 修改，属 UI 层取值调整） |
| 通知「Action Required」语义 | 通知只有 `read` 布尔，无 action/priority 字段 | 无法在 UI 层区分需行动 vs 纯信息 | 可选：给 Notification 增加可选 `action` 标记 | 涉及数据形状，暂不实施 |

> 注：第 1 条「Profile 复用 `getCheckInSummary`」本质是 UI 层取值方式调整（读 `state` 而非硬编码），不改变 reducer 行为，判定为允许范围内的 UI 修正；已在 Batch 计划中纳入。

## 7. 审计结论摘要

- 品牌与视觉方向**保留**，不动颜色基调、Editorial 气质、圆角卡片、内容优先。
- 首要工作是**统一设计系统 + 修导航割裂 + 补状态反馈 + 消 Card Soup**，而非新增装饰。
- 最紧急（P0）两处：移动端通知入口消失、Create Event 原生 `alert()`。
