# 移动端材质与动效检查

2026-10-22，本地模拟学生数据，前端 4174。浏览器视口 393×852；桌面回归 1200×800。

- `before-activities.png` / `after-activities.png`：同一活动发现页的修改前后对比。
- `after-filter.png`：活动内联筛选。
- `after-detail.png`：活动展开落位；DOM 中共享转场结束标记保留，独立入场 animation 为 none。
- `after-team.png`：组队弹窗拖动释放阶段；最终回位记录另见 audit.json。
- `after-settings-dark.png` / `after-filter-dark.png`：深色设置和筛选的实际界面。
- `after-map.png`：地图抽屉向上拖动后吸附，约 626px；页面 scrollY 为 0。
- `after-layout-filter.png`：活动筛选列表。
- `audit.json`：实际 DOM 的材质、溢出、吸附高度、回弹结束清理、减少动态、桌面导航记录。

通用弹窗实际生效为面板 backdrop-filter:none + 遮罩 blur(6px)；导航为 blur(18px) saturate(118%)，边缘伪元素不再额外模糊。相关界面未发现横向溢出。活动两轮连续打开返回完成；组队短拖最终清除位移与临时状态，长拖后弹窗卸载。浏览器控制台检查没有 error 日志。

不提交业务表单，不产生报名、组队或预约数据。测试后恢复“跟随系统”主题、正常动态并重置临时视口。截图和原生指针操作属于浏览器检查，不能替代真机多点触控、FPS、输入延迟和 GPU 成本测量。

34 项相关测试、类型检查、改动文件 ESLint 通过。默认构建遭遇 esbuild 临时文件删除权限错误；替换临时目录仍复现。补充 `vite build --target esnext --minify false` 打包通过，默认压缩构建保留为验证限制。
