# 校园探索沉浸式地图

校园探索 `/v2/campus/explore` 的 3D 地图铺满浏览器视口，左上角保留悬浮返回入口。地图原有平移、旋转、缩放、图层与光影工具继续可用。默认收起搜索和信息面板，点击建筑后浮出对应楼栋、活动及组队信息，可关闭继续浏览。

地图继续使用现有完整 viewer 与同源消息桥接，地点选择弹窗沿用原布局。

本地验证：

- `npm run build`、`npm run lint` 通过。
- `tests/campusMapMigration.test.ts`、`tests/campusLocations.test.ts` 共 6 项通过。首次运行遇到系统临时目录 EPERM，切换临时目录至 `.runtime/test-temp` 后通过。
- 浏览器检查手机窗口与 1440 × 900 桌面视口；桌面 iframe 边界为 x=0、y=0、宽约 1440、高 900。
- 已操作建筑点选、详情显示及返回校园服务，再从校园地图入口重新进入。
- 截图：`mobile.png`、`desktop.png`。属于本地浏览器验证，未做实体手机验收。
