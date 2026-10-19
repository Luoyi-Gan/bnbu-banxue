# OneTake 已安装：如何使用

仓库：https://github.com/feitangyuan/onetake 。本次安装固定提交 `415758128aa45cc54340df40d8109363447f582e`，Skill入口为用户目录 `.codex/skills/onetake/SKILL.md`；独立源码在桌面 `onetake-source`，保留Git历史。

它适合10–30秒的产品发布片、预告片和界面功能演示，配音演示可更长。主要产物是可按时间定位的HTML构图和渲染视频。每段画面让一个元素延续到下一段，避免标题卡和页面轮流替换。它可按产品截图重建视觉操作，不因此证明真实后端功能可用。

## 直接用自然语言调用

```text
使用 onetake，为会同里做一支15秒的非商业学习用功能演示。
沿用校园照片、文楷和MiSans，展示“查看今日安排→打开活动详情→返回首页”。
先给我三种镜头概念；界面以我选定的首页方案为准。
先做可播放HTML和关键帧预览，确认后再渲染1080p30草稿。
未接入的交互写入交付说明，画面保留项目要求的本地模拟标识。
```

可以附参考片、截图或当前可访问的本地页面。没有参考片时说明没有，先从产品素材与镜头概念开始，不捏造参考分析数据。选定概念后再写时间段、内容、运动对象、停顿和延续关系。完成HTML预览并检查关键帧后渲染草稿，确认后才考虑4K60。

## 看它自带的动作

本机可运行：

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory C:/Users/23328/.codex/skills/onetake
```

然后打开 http://127.0.0.1:4187/gallery/gallery.html ，选择动作；`?demo=ribbon&play` 为自动播放示例。动作库是1920×1080画布，窄边栏可打开更大的浏览器窗口查看。

## 运行前核对

- 已运行 `node scripts/test_motion.js`，全部动作库数学与确定性检查通过。
- 原始上游description长1260字符，超过Codex校验上限；本机只将该字段缩短到319字符。原件已备份，110个文件除这项入口元数据外与固定提交一致，许可与功能正文保持原内容。
- 当前 Python 可导入 playwright、numpy、scipy、Pillow、matplotlib、opencv，Playwright Chromium可执行文件存在。
- 系统PATH尚无 `ffmpeg` / `ffprobe`；imageio_ffmpeg自带一个ffmpeg二进制，但这不等于原始OneTake脚本能直接调用完整工具链。实际MP4渲染前先配置这两个命令并跑一次短草稿。配音依赖另行按需准备。
- 本次完成Skill安装、文件核对和动作库测试，未渲染成片，未验证中文配音、完整视频oracle或4K输出。

## 许可

上游采用 **PolyForm Noncommercial 1.0.0**，免费版限非商业使用，版权与Required Notice必须保留。商业发布前确认相应授权，不把免费版代码复制到MIT增强包或会同里产品代码中。官方说明和完整条款在仓库LICENSE，安装未改变它的许可。
