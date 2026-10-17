# Campus Editorial 回退记录（2026-10-17）

用户要求撤回 Campus Editorial 学生端视觉升级，恢复该轮开始前的状态。

- 反向应用 7ccc5fd 保存的 integration.patch，恢复 main.tsx、student.tsx、字体 NOTICE、BUSINESS_RULES、ADMIN_COMPLETION 五个混合文件。本轮恢复后与 .git/editorial-baseline 对应备份逐项文本相等。
- 移除 7ccc5fd 新增的14个样式、字体、文档与证据文件；历史提交保留，可追溯。
- 先前参考图页面与本地模拟数据保留。后端/API与数据库未改动。
- npm run build、npm run lint 通过；构建保留既有大包和重复 import 提示。
- 本地浏览器打开 /v2，原有版式与模拟数据正常显示，截图 home-restored.png。没有进行生产或真实设备验收。
- 本轮精确路径提交回退删除项和本记录，保留先前32项暂存内容。混合文件恢复发生在工作区，符合上一轮 integration.patch 的归档方式。
