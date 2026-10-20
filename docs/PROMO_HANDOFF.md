# 会同里产品宣传页交接

交付日期：2026-10-20。独立入口 `/promo.html`，复用现有 React、Three.js、GSAP 与字体资源。业务入口、接口和数据库没有变更。

## 运行

```powershell
npm.cmd install
npm.cmd run dev -- --port 4174
```

打开 http://127.0.0.1:4174/promo.html 。宣传页自身是静态前端，可独立运行。进入产品的按钮指向现有 `/v2` 路由；登录和真实业务操作需要按项目原有方式启动后端。`npm.cmd run build` 的 Vite 多页面入口同时保留原 `index.html` 并生成 `promo.html`。发布时保留 `/promo/` 素材路径。

## REA 逆向结论

参考网址：[Elva](https://elvalabs.ai/?ref=onepagelove#)、[Flighty](https://flighty.com/?utm_source=chatgpt.com#before-fly)。

- Elva：DOM、网络记录和发布 JavaScript 证实 Three.js 场景与 HTML 文案叠加；同一物体持续存在，镜头距离、视角、旋转随叙事变化。源码包含视角 70→66.5、相机距离插值、滚轮归一化和 DPR 上限 1.5。结构为价值引入、问题、解决方式、四步流程、能力、CTA。大字号、宽留白与克制色彩比重复卡片更重要。移动端另有引导，不能据此推断其桌面动画在手机上完整复用。
- Flighty：Framer 页面中可见独立手持手机照片与屏幕图片叠层，拍摄手势提供可信的比例和实体感。未发现足以证明手部是真实 3D 模型的证据。本项目采用原创透明手持图与可替换屏幕叠层。
- 实现选择：采用现有 Three.js 和 GSAP ScrollTrigger。ScrollTrigger 是本项目的实现选择，并非声称 Elva 使用同一机制。源码分析只证明可观测实现，不代表恢复了作者工程或全部响应式规则。

REA 证据标识：

| 证据 | ID |
| --- | --- |
| Elva 浏览器场景 | `ev_5a92b0d2b3c0c06c09c8f90a60a50d9f41e2e8b544f42d7b97c12965cefd724c` |
| Elva JS 静态分析 | `ev_e938342584d5e1a80c6c01171a8bf2aad32734cbbfc43bc431d60a5d0389717f` |
| Flighty 浏览器场景 | `ev_73592d6c3b3ff4698e09e297f96906bbeeba9745f74a858bab34e409e72e1f60` |

Elva 首次采样默认 reduced-motion；源码与后续浏览器观察用于补充运动机制。静态分析有未解析节点，未把推断当作完整恢复。参考站原始源码、图片、品牌素材不进入交付资源。

## 页面与动画分镜

| 章节 | 产品内容 | 手机与屏幕 |
| --- | --- | --- |
| 校园很大。生活，近一点。 | 首页校园窗口与安排 | 右侧轻倾斜，真实首页静帧，缓慢悬浮 |
| 下课之后，还有好戏。 | 活动发现 | 连续移向左侧，屏幕混合过渡到真实活动页录像 |
| 你的「一起吗」，有人回应。 | 搭子与组队 | 回到右侧，旋转和缩放配合真实搭子列表 |
| 换个视角，认识校园。 | 现有完整校园地图 | 左侧停留，展示一期学习资源中心透视特写 |
| 校园的每一面，都在你手里。 | 四类功能回顾 | 原创手持照片，四个按钮切换真实屏幕并同步入口 |
| 使用引导 | Web 入口、FAQ、隐私与字体许可 | 清晰 CTA，无虚构下载入口 |

滚动章节有停留区间与过渡区间；ScrollTrigger scrub 平滑追随滚动。屏幕纹理预加载，GPU 混合叠加轻微位移，正向和反向滚动都保持连续。活动视频使用独立色彩转换，避免过曝。手持区切屏采用 650ms 透明度与位置过渡。

## 文件与素材

- `src/promo/Promo.tsx`：叙事、章节导航、手持切屏、可访问性与降级。
- `src/promo/phone.ts`：原创参数化设备、材质、光照、屏幕 shader、资源释放。
- `src/promo/promo.css`：独立样式、断点、字体、布局。
- `public/promo/*.png`：首页、发现、搭子、地图真实当前前端截图。
- `public/promo/discover.webm`：真实活动页上下滚动录像，静音循环；未播放时用截图。
- `public/promo/hand-phone.png`：内置 ImageGen 原创生成，1024×1536 透明图；并非 Flighty 原图。

UI 捕获使用只读 acceptance SQLite 中标记 `previewFixture=1` 的演示记录，加浏览器 API 拦截和虚构账户。没有生产账号、真实用户资料或数据库写入。地图直接来自项目自带完整查看器，保留地图署名。页面页脚也披露演示数据与 Web 入口性质。

手持图最终提示要求：自然右手、浅至中肤色、正面钛金属手机、柔和左上棚拍光、正确指节和拇指、手臂从右下进入；屏幕空白、无品牌文字、透明背景。后续编辑清理透明区域。原始生成调用文件名 `call_c3d8afe49af842cfb106aa468f782832.png`，交付副本为 `public/promo/hand-phone.png`。

捕获和检查脚本在 `artifacts/promo-20261020/`。脚本通过 `PLAYWRIGHT_MODULE` 指定 Playwright 模块，`CHROME_PATH` 指定 Chrome；默认使用可导入的 `playwright-core` 和 Windows Chrome。重新捕获需本地演示数据库及运行中的前端。先运行 `capture-product.mjs`，再运行 `capture-map.mjs` 覆盖为地图特写；录像更新后建议裁掉首次加载片段。脚本不属于生产运行依赖。

## 测试与已修复问题

- TypeScript 检查、ESLint 和生产构建通过。首次构建因 Windows 系统临时目录中的 esbuild 文件删除权限失败；改用项目下的临时目录后成功。构建保留现有混合静态/动态导入提示，以及大于 500kB 的 bundle 提示；宣传页主 bundle gzip 约 141kB。
- 真实 Chromium 检查 1440×900、834×1194、390×844、320×700，四个章节截图共 16 张；844×390 低高度布局改为顺序阅读。
- 检查章节导航、手持四屏切换及目标链接、FAQ、静态阅读/恢复动态、运行中减少动态偏好变化、WebGL 不可用降级、产品 CTA 到达 `/v2`。
- 自动检查无页面异常。3 秒本地 headless 滚动采样约 430 帧，中位间隔约 7ms，P95 约 7.3ms，无超过 33.4ms 的间隔；各次精确数值见 `validation.json`。该数据只描述当前机器与采样，不保证所有设备 60 FPS。
- 修复 StrictMode 清理时空引用、平板手机裁边、视频色彩偏亮、手机竖屏比例偏小、地图视角过远、手持控件距结果过远。
- 独立复审记录见 `artifacts/promo-20261020/independent-review.md`。审阅者未以正常速度完整观看录像，时间层面的主观“丝滑”仍需真实设备复核。

DPR 上限 1.5；离开舞台或页面隐藏时停止视频与渲染；减少动态或 WebGL 失败时显示完整静态内容。生产 CDN、真实 iPhone/Safari、低端 Android 和真实业务登录不在本次本地验收范围内。

## 独立部署准备（2026-10-20，尚未上线）

用户授权部署到 `www.bnbuplatform.cn`，要求保留其他业务。外部 DNS 查询得到 `43.129.193.7`。本机 SSH 握手与直连 HTTPS 超时；通过当前本地 HTTP 代理的 HTTPS 请求也未成功。因此尚未读取现有 Nginx 配置，未执行任何远端修改。

已新增 `scripts/package-promo.mjs`：构建后只收集宣传页及其 JS/CSS 依赖、字体、图标、截图与录像，将资源引用改为独立 `/huitongli-promo/` 前缀，生成 SHA256SUMS 和 manifest.json。不包含业务应用 bundle、后台或数据库。

```powershell
node scripts/package-promo.mjs artifacts/promo-20261020/release-20261020
```

本次发布包 14 个资源文件，共 18,718,148 字节，主要体积来自现有中文字体。本地独立 HTTP 服务加载成功，标题正确，WebGL canvas 出现，无页面异常或 HTTP 资源错误。压缩包位于本地忽略目录 `artifacts/promo-20261020/promo-20261020.tar.gz`，SHA256 为 `87659033980B5B17AA99FB1D9E9357900D271691EB70BBE9B4B718168643E1FF`。

恢复连接后的步骤：先核查现有主站根路径、产品链接、隐私/许可页面和全部站点配置，记录业务 HTTP 与容器状态；备份配置；上传到独立版本目录并核对散列；只增加资源前缀和已授权首页入口；执行 nginx -t 后平滑 reload；复核宣传页、各业务入口/API 与容器启动时间。必须先确认根路径切换不会截断现有业务入口，产品 CTA 也需映射到实际可用地址。保留原配置与旧入口用于回滚，不停止或重建业务容器。
