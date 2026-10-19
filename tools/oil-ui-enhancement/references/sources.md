# 来源与按需阅读

检索日期：2026-10-19（Asia/Shanghai）。`github-discovery.json` 记录10组检索、每组前100项与命中总数，去重447个仓库；`inspected-repositories.json` 记录13个重点仓库的真实 Skill 路径与提交。结果有 GitHub 检索排序与每组100项的覆盖边界，不是对全站或全部代码逐项审计。仓库 star 不是单个 Skill 的安装数或质量保证。

## 已纳入的 MIT 文档

| 来源 | 核验时仓库 star | 纳入内容 | 入口 |
| --- | ---: | --- | --- |
| [Emil Kowalski 官方 Skills](https://github.com/emilkowalski/skills) | 47415 | animate、动效改进/评审、性能、术语和动效机会识别 | `upstream/emilkowalski__skills/skills/` |
| [GSAP 官方 Skills](https://github.com/greensock/gsap-skills) | 16615 | 8个官方模块：core、timeline、React、ScrollTrigger、plugins、performance、utils、frameworks | `upstream/greensock__gsap-skills/skills/` |
| [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | 9857 | 动效性能、可访问性、基础界面约束 | `upstream/ibelick__ui-skills/skills/` |
| [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | 8031 | 状态工作台、界面与可访问性评审 | `upstream/jakubkrehel__skills/skills/` |
| [design-motion-principles](https://github.com/kylezantos/design-motion-principles) | 1354 | 创建/审查模式、动效cookbook、性能与减少动态 | `upstream/kylezantos__design-motion-principles/skills/design-motion-principles/` |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | 98927 | 当前有效的 taste-skill 设计与改造方法 | `upstream/Leonxlnx__taste-skill/skills/taste-skill/` |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 137295 | UX条目、快速参考与完整页面检查依据 | `upstream/nextlevelbuilder__ui-ux-pro-max-skill/` |

所有原始文件保留字节内容、版权与MIT许可；为避免重复自动触发，原 `SKILL.md` 存为 `GUIDE.md`，作为按需技术参考。`sources.lock.json` 保存仓库、固定commit、原路径、Git blob SHA、SHA256与本地路径。这74份文档、数据和许可文件作为按需参考读取，共用现有 oil-ui 入口。上游文档提到但未纳入的脚本、图片和安装器不能假定存在。

## 已检索但未直接合入

- `anthropics/skills`：182027 stars，仓库各子目录独立许可；本轮不用其体积较大的泛用合集替代定向参考。
- `vercel-labs/agent-skills`：32611 stars，API未识别仓库许可证；本轮仅登记路径与来源，不依据空license字段复制文件。
- `remotion-dev/skills`：5335 stars；本机已有 Remotion Skill，视频任务可按其现有许可与工具使用，不把视频渲染库引入网页交互。
- `Jakubantalik/transitions.dev`：5408 stars，根许可为自定义许可；本轮未完成其各子目录逐项授权核对，不复制。
- `iart-ai/motion-skills`：889 stars，当前检出的树没有 `SKILL.md`；不把README展示的能力当作可直接安装模块。
- `nateherkai/scroll-craft`：3643 stars，MIT；适合沉浸展示，已用项目现有GSAP方法覆盖当前需要，不整包叠加其布局偏好。
- `Rkj0123/motion-ui-skill`：1 star，MIT；虽被网页检索多次推荐，未满足本轮高star优先要求。
- `acumenix/claude-code-frontend-design-toolkit`：0 star、仓库license未识别；作为发现线索，不作为可信汇编来源。
- Motion、GSAP、Anime.js、React Spring、Magic UI、React Bits 在发现清单中作为实现库/组件目录登记，不称为已安装 Skill。每个实际复用文件仍须核对独立许可。
- [OneTake](https://github.com/feitangyuan/onetake)：2671 stars，PolyForm Noncommercial；按用户请求独立安装，不纳入MIT参考集合。

## 使用冲突的处理

技术参考保留原文以便追溯，但其中的角色设定、安装命令、默认框架、提交/删除策略、暂停确认和固定视觉风格不直接执行。GSAP文档偏好GSAP不意味着迁移已有Motion；通用UI表格的零毫秒禁忌不意味着禁止即时反馈；评审不能替代真实交互测试。最终按用户目标、仓库规则及本增强入口判断。

同样，不照搬“所有CSS动画都在主线程外”“transform一定GPU加速”或“键盘触发一律禁止动画”等绝对表述。具体渲染路径依赖属性、浏览器、合成层与负载，使用官方文档和实际测量判断；键盘焦点应即时可用，减少动态偏好优先。高star不免除这些技术核查。

本地原创整合层采用MIT许可，见增强包根目录 LICENSE。各上游许可证位于对应 upstream 仓库目录；库运行时许可证单独核对。安装或阅读不意味着生产、商业发布或付费服务授权。
