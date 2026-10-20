# 校园探索定位验证

正常入口：`http://127.0.0.1:4174/v2/campus/explore`。用户点击定位按钮后才申请浏览器位置，成功后标记蓝点、精度圈并显示精度，可清除。

- `real-timeout.png`：本机真实请求返回超时，页面提供重试提示；没有虚构成功定位。
- `simulated-location.html`：隔离的测试页面，明确标注固定校内样本，仅本页替换定位 API；加载同一份正式地图运行时代码。
- `simulated-marker.png`：固定样本成功渲染蓝点与十八米精度圈。
- `simulated-cleared.png`：清除后移除标记并恢复原视角。

正常页面没有模拟坐标入口。测试样本不写入业务数据。检查只证明本地浏览器渲染与反馈，不证明当前设备或实体手机在校内成功定位。

验证：构建、范围 ESLint、四个地图测试文件共 18 项通过。浏览器定位要求安全环境与用户许可，参考 [MDN Geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)。
