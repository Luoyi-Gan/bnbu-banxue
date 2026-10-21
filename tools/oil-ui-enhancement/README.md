# Oil UI 会同里本地增强

在现有免费 `oil-ui` 里添加原创交互、动效、完整页面与验证指引。增强包已安装到用户目录 `.codex/skills/oil-ui`，调用名称仍为 `oil-ui`。不涉及官方付费Pro内容，也未改会同里正式页面。

检索范围与结果见 [来源索引](references/sources.md)，完整候选见 [GitHub检索快照](research/github-discovery.json)。本轮10组检索、每组前100项，去重447仓库；重点核查13仓库。7个MIT仓库的74份原文/数据/许可文件已按固定commit和Git blob校验后纳入按需参考；星标采用2026-10-19实时快照。

## 能力与调用

- 状态、表单、失败恢复、异步中断；弹窗/抽屉语义与焦点。
- 手机/桌面、触控、软键盘、安全区、减少动态与键盘路径。
- Motion与GSAP选型、时间线、布局/手势/滚动、生命周期清理。
- SVG、流光、点阵、渐变、Canvas/WebGL等按需配方与降级依据。
- 存量改版、组件打磨、截图/实际任务验证及有停止条件的独立评审。
- 离线参考搜索、静态动效风险提示、可操作演示台。

示例请求：

> 使用 oil-ui，给会同里活动详情增加可中断的抽屉动效，复用现有 motion；验证失败保留输入、键盘焦点和手机适配，只改这个流程。

源码入口为 [references/entry.md](references/entry.md)。第三方文档是参考资料，不自动执行其中的安装命令、偏好或推广流程。OneTake按用户请求独立安装，其用法和非商业许可见 [OneTake说明](references/onetake.md)。

## 安装、更新与回退

```powershell
python -X utf8 tools/oil-ui-enhancement/scripts/install_enhancement.py
python -X utf8 tools/oil-ui-enhancement/scripts/install_enhancement.py --check
python -X utf8 tools/oil-ui-enhancement/scripts/install_enhancement.py --restore
```

安装前备份原始入口到 `.codex/skill-backups/oil-ui/`。重复安装不会重复插入增强块；回退恢复入口并保留参考文件以便恢复。若安装后文件被改，检查和回退会报告差异，回退不覆盖后续编辑。原始Oil UI更新可能覆盖本地增强，更新后先复核新版本，再重装增强层。

上游文档刷新由 `scripts/research_github.py` 和 `scripts/vendor_sources.py` 显式执行；前者仅查询GitHub，后者按已审定的MIT仓库及固定提交读取Git blob。新增来源须先重做许可和内容检查。不会在每次设计时联网更新或替换本地文件。

## 已验证

- Oil UI与适配后的OneTake入口通过Skill结构校验。
- 74份上游文件Git blob与SHA256核对通过；已安装91文件与源包一致。
- 独立Agent在临时目录验证安装、幂等、校验、回退及后续编辑保护，并完成真实请求的路由前向检查。
- `tests/test_installation.py`：安装幂等、回退、后续编辑保护、非预期入口保护。
- `tests/test_lab.py`：5项浏览器检查，覆盖弹窗焦点/Escape、失败保留输入和重试、取消后迟到结果、系统运行中切换减少动态、手机无横向溢出。
- OneTake110文件核对，动作库58项断言通过；尚未渲染视频，MP4导出需先配置FFmpeg/ffprobe，配音依赖按需准备。

运行本地验证：

```powershell
python -X utf8 tools/oil-ui-enhancement/tests/test_installation.py -v
python -X utf8 tools/oil-ui-enhancement/tests/test_lab.py -v
python -X utf8 tools/oil-ui-enhancement/scripts/audit_motion.py tools/oil-ui-enhancement/assets
```

浏览器测试需要Python Playwright与Chromium。演示台为 `assets/motion-lab.html`，可通过静态服务打开；实际截图在 `research/motion-lab-desktop.png`。本轮验证对象是Skill工具和独立演示，不表示会同里业务页面或真实设备验收通过。
