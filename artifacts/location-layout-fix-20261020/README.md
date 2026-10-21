# 真实定位与布局检查

真实定位对照：Windows 原生定位和系统 Edge 均返回位置，报告精度 55 米；Edge 实际校园探索页面已显示真实蓝点和精度圈。内置浏览器两阶段请求仍超时。因此不能把本机内置预览超时等同于全部浏览器均不可用，也不能宣称其具体内部故障已修复。

- `real-location-check.html`：只调用真实 Geolocation 的独立检查页，无固定坐标；只显示成功状态、授权状态及精度。
- `edge-real-success.png`：Edge 独立真实定位成功，精度 55 米，权限 granted。
- `real-map-status.png`：实际会同里地图的定位成功状态控件。裁去地图，避免在 Git 留存用户真实位置。
- `iab-location-result.png`：内置浏览器仍未返回位置。
- `campus-toolbar.png`：课表、搜索、通知排列；课表图标右侧显示文字。
- `discovery-tabs.png`：四列等宽发现分类。
- `alumni-bookings.png`：通知与预约卡片，过时预约没有取消原因输入框。

验证：五个相关测试文件共 29 项通过；构建、类型检查、范围 ESLint 通过。浏览器检查了 466 像素页面和 320 像素校园工具栏。最后一次 320 像素首页截图因用户拒绝浏览器访问而未完成，后续未继续浏览器操作。

参数依据：[MDN Geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)；系统定位设置依据：[Microsoft Windows location service](https://support.microsoft.com/en-us/windows/privacy/windows-location-service-and-privacy)。此交付为本地验证，未发布生产。
