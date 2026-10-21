# 动效目的、选型与实现

## 选机制

| 需要表达的变化 | 优先选择 | 完成条件 |
| --- | --- | --- |
| 按压、焦点、颜色、单一进出 | 现有 CSS transition / WAAPI | 反馈及时，不依赖动画确认业务 |
| React 条件显示、共享布局、手势 | 已安装的 `motion/react` | 稳定 key、进出协调、可中断、卸载清理 |
| 多阶段时间线、SVG、精确滚动编排 | 已安装 GSAP | scope、context revert、媒体条件与触发器清理 |
| 视频发布片、一镜到底演示 | 独立 OneTake 或用户指定视频工具 | 固定时间帧、分镜与渲染验证；先看许可 |
| 粒子、复杂着色器、3D | 现有 Canvas / OGL / Three.js | 渲染生命周期、降级图、资源释放与实测预算 |

对会同里先检查 `package.json`：现有 `motion`、`gsap`、`ogl`、`three` 可按需使用，不为了参考示例额外引入 Framer Motion、React Spring、Lenis 或其他同类库。

## 为每个关键动效写五项

目的（指向/反馈/空间连续/呈现数据变化）、触发、运动对象和属性、可中断方式、减少动态或性能不足时的结果。高频操作尽量短或直接显示结果；展示型场景才允许更明显的镜头和较长节奏。可用 100–160ms 按压反馈、160–240ms 小浮层、220–320ms 抽屉作为起点，实际以距离、输入频率和内容可读性调整，不作为硬上限。

以 transform 和 opacity 承担主要移动；测量先集中读、再集中写。尺寸变化只在小且隔离的区域按需要使用，避免整页反复 layout。临时添加的 will-change 在过渡后撤销，不假定任何动画天然在 GPU 上流畅。

需要更细的创建、改进或评审依据时，按需读 `upstream/emilkowalski__skills/skills/animate/GUIDE.md`、`improve-animations/GUIDE.md`、`review-animations/GUIDE.md` 或 `animation-performance/GUIDE.md`。这是作者自己维护的MIT参考；若文档建议的技术或宿主工具与当前环境不同，保留方法并映射到已有工具，不自动迁移动效库。

## React 与 Motion

- 使用现有 `motion/react` 入口。`MotionConfig reducedMotion="user"` 作为基础设置；`useReducedMotion` 明确控制自定义的镜头、路径、手势或画布动画。Motion 的内置减少动态行为不会自动覆盖所有自定义系统。
- 离场使用 AnimatePresence 时维护稳定、真实对象 key；需要等待离场时说明对输入和焦点的处理。布局动画不得把 CSS 顺序与屏幕阅读器顺序分离。
- 动画对象首次渲染应可读。只有在运行环境和减少动态处理已就绪时才隐藏待入场内容，避免脚本失败后永久 opacity:0。
- 拖动由指针捕获/已有手势机制管理；交互被取消、组件卸载或权限变化时停止，最终位置由产品数据确认。

官方参考：https://motion.dev/docs/react-accessibility 。完整 cookbook 可按需读 `upstream/kylezantos__design-motion-principles/skills/design-motion-principles/references/motion-cookbook.md`；其中旧包名和框架前提须映射到当前项目版本。

## GSAP

项目已经安装 `@gsap/react` 时可使用 useGSAP；未安装时可以现有 React effect、ref、`gsap.context()` 与 `ctx.revert()` 实现清理，不把新 hook 包当先决条件。事件处理器创建的动画也要纳入 context 或显式清理；contextSafe 不替代移除事件监听与撤销网络请求。

ScrollTrigger 的 pin、scrub、refresh 基于实际滚动容器。字体和图片改变布局后再测量；卸载和媒体条件变化时清理触发器。不得为展示效果劫持整个业务界面的滚动。

按需读取 `upstream/greensock__gsap-skills/skills/` 下对应 `gsap-core`、`gsap-react`、`gsap-timeline`、`gsap-scrolltrigger`、`gsap-performance` 或 `gsap-plugins` 的 GUIDE。Skill 文档 MIT 与 GSAP 库本身的许可证分开核查。
