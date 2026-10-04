# BNBU Campus Hub Demo

BNBU Campus Hub 是一套完全独立、本地运行的高保真校园综合平台概念 Demo。它不是生产系统，也不连接现有 BNBU Sports、Web、Android、Backend、OpenAPI 或任何真实学生数据。

## 产品定位

平台以 Activity 为核心对象，演示一条连续的产品逻辑：

`Activity → Organization → Connection → Community → Campus Profile → Campus Graph`

活动让学生发现校园，活动背后的主办方让学生看见组织与老师；体育打卡、报名、签到、关注、加入组织、预约 Coffee Chat 和寻找搭子会沉淀到统一的校园旅程与关系图中。Coffee Chat、Alumni 和 Organizations 都复用活动、主办方、日历、通知与档案逻辑，不是相互割裂的系统。

## 启动

```powershell
cd C:\Users\23328\Desktop\new_version\bnbu-campus-hub-demo
npm install
npm run dev
```

默认地址：`http://127.0.0.1:4173`

质量检查：

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## 技术栈

- React 19 + TypeScript
- Vite
- React Router
- Lucide Icons
- 原生 CSS 设计系统与响应式布局
- React Context + `useReducer` 统一状态
- `qrcode.react` 生成可解析的个人活动票券二维码
- localStorage 本地持久化
- Vitest 状态逻辑测试

## 页面与路由

| 页面 | 路由 | 目的 |
| --- | --- | --- |
| Campus Today | `/` | 今日活动、体育进度、推荐、社区与 Upcoming |
| Sports Check-in | `/check-in` | 今日打卡、进行中计时、课程/其他运动学时、历史记录 |
| Discover Events | `/discover` | 搜索、分类、日期筛选与活动发现 |
| Event Detail | `/events/:id` | 活动详情、RSVP、候补、审批状态与签到 |
| Event Ticket | `/events/:id/ticket` | 个人二维码票券、有效/已使用/失效状态与隐私说明 |
| Host Page | `/hosts/:id` | 主办方关注、活动、成员与社区关联 |
| Campus Calendar | `/calendar` | Agenda 主视图及 Month / Week 概念视图 |
| My Events | `/my-events` | Upcoming、Hosting、Past、Saved |
| Create Event | `/create` | 现代活动创建、预览与发布 |
| Manage Event | `/manage/:id` | Guest List、审批、候补转正与 Standard / Express 二维码签到台 |
| Campus | `/campus` | 平台逻辑与校园模块入口 |
| Organizations | `/campus/organizations` | 组织发现、关注与加入 |
| Organization Detail | `/organizations/:id` | 组织主页、活动、成员与 Posts |
| Coffee Chat | `/coffee-chat` | 老师发现与可预约时间 |
| Teacher Detail | `/coffee-chat/teachers/:id` | Slot 选择、主题填写、确认与取消 |
| Find a Partner | `/campus/partners` | 围绕活动和兴趣发送搭子邀请 |
| Community | `/campus/community` | 关联现实校园对象的轻社区 |
| Alumni | `/campus/alumni` | 复用 Event / Host / Coffee Chat 的概念模块 |
| Notifications | `/notifications` | 分类、已读与关联页面跳转 |
| My Campus | `/profile` | 体育、活动、组织、兴趣与动态 Journey |
| Campus Graph | `/profile/graph` | 从统一 Demo State 派生的可交互关系图 |
| Settings | `/settings` | 中英语言切换、Demo 数据复位与打卡入口 |

## 数据结构

`src/types/index.ts` 定义 Event、Host、Registration、Teacher、CoffeeSlot、CoffeeBooking、Organization、PartnerRequest、Post、Alumni、Notification、JourneyEntry、GraphNode、GraphEdge 与 Guest。

`src/data/mockData.ts` 提供 18 个活动、8 个主办方、8 个组织、5 位老师、12 个 Coffee Chat Slot、8 个找搭子对象、10 个社区帖子、5 位校友、12 条通知和 15 条初始 Campus Journey。

`src/store/demoReducer.ts` 是所有页面的单一状态逻辑来源；Campus Graph 通过 `deriveGraph(state)` 动态派生，不维护第二份图数据。

## Demo State 与 localStorage

所有跨页面交互保存在同一个 key：

`bnbu-campus-hub-demo:v1`

状态包括报名、活动票券、扫码记录、收藏、关注、组织成员关系、Coffee Chat 预约、搭子邀请、帖子点赞/收藏、通知、创建的活动、Guest 状态、体育打卡记录、进行中打卡和 Campus Journey。刷新浏览器后状态继续保留；旧状态会在读取时补齐新字段，语言偏好单独保存在 `bnbu-campus-hub-demo:language:v1`。

头像菜单中的 Demo Control 支持：

- Switch to New Student
- Switch to Active Student
- Switch to Organizer
- Restore Default Scenario / Reset Demo Data

## Mock 边界

全部身份、活动、老师、成员、通知、地图、签到时间、参与者、帖子与审核均为合成 Mock 数据。活动票券会生成真实可解析的二维码，但载荷只包含活动 ID 和不透明票券码。Demo 不包含真实登录、学校统一身份认证、真实后端、数据库、摄像头扫码、邮件、短信、GPS、地图 API、实时聊天、AI 审核、图数据库、正式权限或成绩写入；活动二维码签到不会增加体育学时。

本地状态变化只代表交互 Demo 成功，不代表任何服务器、学校系统或生产流程已完成。

## 推荐演示路径

详见 [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)。核心 Story 现在覆盖体育打卡与学时进度、活动报名、组织与签到、Coffee Chat 与成长档案、活动创建与 Guest 审批。

## 未来连接真实后端

若未来进入产品化，应保持当前对象边界，但用后端 API 替换 Demo Store：服务端负责身份、角色、组织范围、对象所有权、报名状态、容量、幂等、版本并发、审计与通知；客户端只负责展示、采集和非权威提示。不得把 localStorage 数据迁移为生产事实。
