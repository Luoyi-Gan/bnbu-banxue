# BNBU 伴学

校园综合平台。`/workspace` 为新增的 SQLite 持久化业务入口，`/v2` 保留原浏览器本地演示。当前交付属于本地验收，不代表学校身份核验、真实邮件投递或原体育系统已经接通。

## 启动本地完整服务

```bash
npm ci
npm run dev:local
```

要求 Node.js 24。访问 http://127.0.0.1:4174/workspace ，未登录时进入统一登录页。默认数据库 `data/bnbu.sqlite`，不会自动生成学校身份。

Windows 独立验收：运行 `./Start-Local.ps1 -Acceptance`。首次会创建单独的 `data/browser-acceptance.sqlite` 和随机密码账号文件 `data/browser-acceptance-accounts.json`；重复运行保留已有数据。六个账号仅用于本地验收，不能证明学校身份。普通启动可用 `./Start-Local.ps1`。

`npm run dev` / `npm run dev:v2` 只运行前端；原视觉演示请明确访问 `/v2`。接通版的状态不会写入旧演示 localStorage。

详见 [本地交接与验收](docs/LOCAL_BACKEND_HANDOFF.md)、[API 协议](docs/BACKEND_API.md) 和 [业务规则](BUSINESS_RULES.md)。

## 功能

公告、活动与票券、搭子、社区、校园服务、Coffee Chat、校园关系图、个人主页，以及管理员公告发布和审核。

## 数据

接通版业务保存在服务端 SQLite，账号、会话、通知和业务归属按 ID 隔离。旧 `/v2` 演示仍保存在浏览器本地，素材和默认人物仅用于演示。二者不自动迁移。

## 检查与构建

```bash
npm run lint
npm run test
npm run typecheck:server
npm run build
```

构建结果输出到 `dist`，仅静态托管不能提供后端业务；本轮交付启动方式是 `dev:local`。没有执行云部署。

## 三维校园导览

活动详情接入 BNBU 3D Model 的 S1.214 标准实时模型。模型副本位于 `public/models/bnbu-campus.glb`，来源版本与 SHA-256 记录在同目录 `source.json`。原模型工程保持独立。

拖动旋转、滚轮或双指缩放、点击建筑查看；橙色为活动楼栋，蓝色为当前查看楼栋。展开与收起复用同一画布和视角，Escape 收起地图。支持键盘选择楼栋和减少动态效果偏好。

地点通过模型中的建筑 ID 匹配。T1–T8、T29、体育馆、图书馆、大学会堂、演艺厅和东大门可定位；泛称或未知地点显示待确认。精度为楼栋级，不代表室内房间或实测导航。

验证：楼栋匹配测试直接读取交付 GLB 验证 ID 存在；已检查桌面和 390px 窄屏展开、收起、建筑点击、颜色标记与 Escape 返回。
