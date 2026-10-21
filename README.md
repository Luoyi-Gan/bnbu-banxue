# BNBU 伴学

校园综合平台。原 `/v2` 学生、教师及管理员页面已连接伴学后端，`/workspace` 保留业务工作台入口。后端位于 `backend/`，当前本地交付采用 PostgreSQL 与前后端独立 Docker。体育仅保留独立平台的只读可视化接入边界，未配置时明确不可用；本地验收不代表真实学校身份、邮件或云服务已接通。

## 推荐：启动前后端独立 Docker

在仓库根目录 PowerShell 执行；已有数据卷须沿用创建时的数据库密码：

```powershell
$env:BNBU_POSTGRES_PASSWORD = '替换为本地数据库密码'
docker compose -f compose.postgres.yaml up -d --build
docker compose -f compose.postgres.yaml ps
Invoke-RestMethod http://127.0.0.1:4188/api/health
```

访问 http://127.0.0.1:4188/v2/login 。数据库和 API 不发布宿主机端口；前端通过同源代理访问 API。不会自动授予学校身份或管理权限。参数、对象存储、持久化及测试说明见 [PostgreSQL Docker 指南](docs/POSTGRES_DOCKER.md)。停止使用 `docker compose -f compose.postgres.yaml down`，保留数据卷，不加 `-v`。

## 可选：SQLite 开发服务

```bash
npm ci
npm run dev:local
```

要求 Node.js 24。访问 http://127.0.0.1:4174/workspace ，未登录时进入统一登录页。默认数据库 `data/bnbu.sqlite`，不会自动生成学校身份。

Windows 独立验收：运行 `./Start-Local.ps1 -Acceptance`。首次会创建单独的 `data/browser-acceptance.sqlite` 和随机密码账号文件 `data/browser-acceptance-accounts.json`；重复运行保留已有数据。六个账号仅用于本地验收，不能证明学校身份。普通启动可用 `./Start-Local.ps1`。

`npm run dev` / `npm run dev:v2` 只运行前端，需要另行启动后端；`/v2` 业务数据读取服务端，不能仅靠静态页面完成业务操作。

找搭子地点输入可选接入高德地图 JS API 2.0。前端构建时同时配置 `VITE_AMAP_KEY` 和指向已配置安全代理、以 `/_AMapService` 结尾的 `VITE_AMAP_SECURITY_HOST`；Docker 构建对应设置 `BNBU_AMAP_KEY`、`BNBU_AMAP_SECURITY_HOST`。安全代理须由部署方保存高德安全密钥并转发相关请求，配置方式见[高德官方说明](https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode)。未配置时保留手动填写地点。地图只用于定位、缩放、拖动和中心点浏览，地点由用户明确选定或填写。社区浏览量和热点榜前端只读取服务端的作者私有浏览数字及榜单结果；对应统计接口未接通时不生成演示数字。

详见 [本地交接与验收](docs/LOCAL_BACKEND_HANDOFF.md)、[API 协议](docs/BACKEND_API.md) 和 [业务规则](BUSINESS_RULES.md)。

### 学校活动邮件与截图识别

管理员活动页会显示收件邮箱和截图 OCR 的配置状态。部署时设置 `BNBU_ACTIVITY_MAIL_HOST`、`BNBU_ACTIVITY_MAIL_USER`、`BNBU_ACTIVITY_MAIL_PASSWORD`、`BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS`（逗号分隔的完整邮箱或 `@school.edu` 域名）以及 `BNBU_ACTIVITY_MAIL_OPERATOR_ID`（已有且已启用的运营或超级管理员账号 ID）；端口默认 993，邮箱文件夹默认 `INBOX`。服务端每分钟读取未读邮件，只导入允许的发件人；成功写入后标记已读。字段完整的单场活动自动发布，缺项进入待核实。现有自动提取使用邮件正文中的明确字段行，例如“活动开始时间：2027-10-25 14:00”；自由格式邮件仍需管理员核对。

截图识别另需 `BNBU_ACTIVITY_OCR_SECRET_ID` 和 `BNBU_ACTIVITY_OCR_SECRET_KEY`，可选 `BNBU_ACTIVITY_OCR_REGION`。管理员上传 PNG/JPG 活动海报或通知截图后，服务端调用腾讯云通用印刷体高精度识别，保存原图和识别文字。每张截图都先进入待核实，管理员核对并保存完整信息后才公开。未配置凭据时该入口显示不可用；本地演示不代表真实学校邮箱或 OCR 已连接。

## 功能

公告、活动与票券、搭子、社区、校园服务、Coffee Chat、校园关系图、个人主页，以及管理员公告发布和审核。

## 数据

Docker 交付的业务数据保存在 PostgreSQL；可选开发入口仍支持 SQLite。账号、会话、通知和业务归属按 ID 隔离。部分界面偏好和明确标记的课表示例保留浏览器本地状态，不代替后端业务记录。两种数据库环境不自动迁移，测试身份不代表学校核验。

## 检查与构建

```bash
npm run lint
npm run test
npm run typecheck:server
npm run build
```

构建结果输出到 `dist`，仅静态托管不能提供后端业务；推荐交付启动方式是 `compose.postgres.yaml`。2026-10-20 已将当前会同里前后端发布至 [会同里](https://www.bnbuplatform.cn/v2)，部署、演示数据及回滚记录见 [本次发布记录](deploy/hk/RELEASE_20261020.md)。

## 三维校园导览

活动详情接入 BNBU 3D Model 的 S1.214 标准实时模型。模型副本位于 `public/models/bnbu-campus.glb`，来源版本与 SHA-256 记录在同目录 `source.json`。原模型工程保持独立。

拖动旋转、滚轮或双指缩放、点击建筑查看；橙色为活动楼栋，蓝色为当前查看楼栋。展开与收起复用同一画布和视角，Escape 收起地图。支持键盘选择楼栋和减少动态效果偏好。

地点通过模型中的建筑 ID 匹配。T1–T8、T29、体育馆、图书馆、大学会堂、演艺厅和东大门可定位；泛称或未知地点显示待确认。精度为楼栋级，不代表室内房间或实测导航。

验证：楼栋匹配测试直接读取交付 GLB 验证 ID 存在；已检查桌面和 390px 窄屏展开、收起、建筑点击、颜色标记与 Escape 返回。
