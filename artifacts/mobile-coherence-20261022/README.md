# 手机端整体协调检查 · 2026-10-22

本地 acceptance 模拟学生数据，前端 http://127.0.0.1:4174。属于桌面浏览器手机视口检查，不代表真实手机或生产验收。

## 修改

- 手机共用页面横向基础间距16px；普通页底部预留96px，含发布按钮的页面预留160px，并计入设备安全区。
- 找搭子与探店移除重复的大块尾部留白，发布按钮保持在导航上方；课表快捷入口在手机端只保留首页和校园页。
- Coffee Chat 分类使用单行横向胶囊，教师卡20px圆角、时段16px圆角，预约操作可换行。
- 修复活动详情旧规则隐藏 continuity-icon 的问题，恢复底部点赞和收藏图标。
- 限制表单最小宽度，窄屏日期时间双列改为单列。

## 验证

- 360×852、393×852、430×932：社区、找搭子、Coffee Chat、探店，共12次路由/视口检查；document.scrollWidth 与 clientWidth 相等，记录见 audit.json。
- 393px 补查个人中心、运动、组织；430px 补查首页、校园、设置；393px 活动详情底部两个图标约18×18px，实际显示正常。
- 社区最末卡片操作区与发布按钮分离；探店末尾文字可完整滚动至底部导航上方。
- TypeScript、ESLint通过；stateContinuity.test.ts 3项测试通过。
- 已恢复临时视口，浏览器回到首页。

## 图片

community-393.png、partners-393.png、coffee-393.png、shops-393.png 为最终样式；activity-detail-393.png 为图标恢复；home-430.png、campus-430.png、settings-430.png 为补查。me-393.png、sports-393.png、organizations-393.png 为本轮中间补查截图。before-activities.png、before-shops.png 展示原底部遮挡。

本轮未逐页验收教师和管理端、深色模式、真实手机键盘及刘海安全区。截图中的店铺/活动来源以页面标签为准，本地示例不表示真实店铺。
