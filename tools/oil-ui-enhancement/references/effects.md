# 特效与场景配方目录

这些是实现选择，不强制每个页面出现。先说明它帮助用户理解什么，既有品牌与任务优先。

| 效果 | 实现起点 | 限制与降级 |
| --- | --- | --- |
| 按压与选中切换 | CSS opacity / translate；现有状态切换 | 键盘仍立即定位焦点，无 hover 依赖 |
| 卡片展开为详情 | Motion layout / GSAP Flip，真实对象保持身份 | 保留链接语义与返回位置；减少动态直接显示 |
| 抽屉/微展开 | 现有弹层 + 短 transform / opacity | 焦点和遮罩跟随可操作状态，不做嵌套弹层堆叠 |
| 拖动排序 | 现有排序数据 + Motion layout / GSAP Draggable | 有键盘替代、取消与失败恢复；视觉位置不是保存结果 |
| SVG 线条与路径 | stroke-dashoffset、Motion 路径或 GSAP 插件 | 用 SVG 原生语义或可见文本说明数据，不虚构地图路线 |
| 流光与聚焦描边 | 局部伪元素 transform、SVG 路径 | 不持续追踪大面积 pointermove；触屏和减少动态保留静态描边 |
| 点阵与轻背景 | 小范围 Canvas、稀疏静态 SVG | 离屏/后台暂停；限制 DPR、粒子数；正文对比优先 |
| 渐变与材质 | 静态底图、局部低频 transform | 不持续动画整页 blur/filter；无 WebGL 时保留可读静态底 |
| 滚动揭示/视差 | IntersectionObserver、原生 scroll/view timeline，或现有 ScrollTrigger | 不隐藏核心首屏；不锁滚动；用户能直接读完 |
| 校园 3D 场景 | 项目既有 viewer、Three.js / OGL | 模型许可、加载占位、失败回退、相机移动不产生业务事实 |
| 数字变化与进度 | 有真实前后值才插值，文本同步 | 未知保持“—”，不是动画到0；减少动态显示最终真实值 |

新组件优先在当前设计变量中探索一两个识别点，其余区域安静。不要把现成特效目录全部铺进首页。性能疑问读取 `upstream/ibelick__ui-skills/skills/fixing-motion-performance/GUIDE.md`；GSAP 插件细节读取官方模块。Magic UI、React Bits、Anime.js、React Spring 等记录在检索证据中，当前没有自动安装其运行库或整批复制组件。
