# 会同里运动入口与 BNBU Sports 联动

## 当前实现

### 2026-10-23 原生适配与真实连接更新

- 本节优先于下方历史的嵌入方案和未部署描述。默认入口为会同里RealSportsDashboard，提供概览、课程、记录筛选/分页/详情、个人运动和扫码入口，没有原平台iframe和第二套底部导航。
- 生产连接已按用户批准启用，备份和版本见SPORTS_REAL_ACTIVATION.md；4186本地页面读取真实Sports数据。
- 新增固定只读操作`sports.dashboard`与`sports.records`。服务端兑换体育会话，逐次核对原/me归属，访问令牌仅内存缓存最多5分钟或到期前10秒，401清缓存；投影白名单不转发令牌、位置、媒体和其他学生资料，不开放任意路由代理。
- 原学时进度与目标直接读取，缺失保持null。有效记录的计入时长为0时不使用实际时长替代。已有账号无课程/记录仍保持已有分支；只有目录确认不存在才显示新用户两入口。
- 课程计时、凭证提交和申请从显式独立窗口入口进入原体育端完成，使用原单次登录；个人运动使用真实独立服务，扫码最终仍在体育平台确认入班。
- 新增原生适配测试3项与连接回归5项通过，前后端类型检查、范围lint通过。430/320/1440宽度、深色/减少动态、课程、记录详情/分页、错误保留、未知进度、零记录老账号及新用户/个人运动入口通过。证据`.runtime/real-sports-native/verification.json`，浏览器夹具未产生体育写入。

### 原有协议与隔离演示记录

- 会同里后端只从当前已登录、有效学生的服务端账号读取邮箱，并核对本人邮箱已验证。客户端不能提交查询邮箱、体育用户ID或角色。
- 原体育平台以同一组织中的学生账号邮箱精确匹配，忽略大小写，同时兼容旧账号未填 normalized 字段的情况。旧平台邮箱不要求再次带验证标记，账号是否存在与是否有记录/是否入班无关；重复邮箱、锁定或停用账号报错，不进入新用户分支。
- 已有账号通过私有桥建立原体育会话，使用90秒一次性兑换码打开原 BNBU Sports 学生端；URL不携带访问令牌。旧平台正常账号缺少邮箱验证标记时，以会同里已核验的同邮箱控制权补齐标记、递增版本并审计，撤销旧未验证会话，避免原界面再次要求绑定邮箱。原课程打卡、凭证、成绩和学时读写继续走原体育 API，因此两端使用相同业务事实。
- 新账号提供扫码入班和个人运动。扫码沿用原平台 `<id>.<secret>` 邀请格式，支持原 `/student/?invite=...` 和 `/join/...` 链接；相机优先使用 BarcodeDetector，不支持时使用项目已有 jsQR。识别只填入邀请码，最终在原体育端确认班级、身份和入班；失败不假报入班成功。
- 个人运动无需班级，服务端建立、计时、暂停、继续和结束。存放在 Sports 数据库独立 `companion_sports` schema，不写课程记录/学时。首次入班后仍不会把个人记录追认成课程学时。两端个人运动页面读取同一 owner/session 表，15秒轮询并在聚焦时刷新。
- 个人运动归属同时关联会同里本人ID、已证明控制的邮箱及匹配的体育账号ID。关联发生冲突时拒绝自动合并。计时只采用数据库时间；暂停不累计；版本冲突重新读取；同一用户最多一条未结束记录。

## 配置与运行边界

Sports 代码位置：`C:/Users/23328/Desktop/new_version/backend/src/companion-bridge/`。运行独立的内部桥进程，不启动第二份媒体处理任务。它复用原 AuthService、令牌验证、会话撤销检查和维护状态，只增加独立个人运动表。

1. 在体育数据库备份及部署流程中，审核后执行 `tools/companion-bridge/schema.sql`。创建独立 schema，并为原用户删除安装清理触发器；原账号执行既有删除后同步清理个人运动及未兑换入口，不改旧课程、记录及成绩字段。安装后按Sports既有数据库角色授予独立schema的USAGE及表DML权限，保证原账号删除清理和内部桥均可访问；会同里与浏览器不直接取得体育数据库凭据。该步骤本轮未在生产执行。
2. 桥进程沿用 Sports 后端的运行环境，另外配置 `COMPANION_BRIDGE_SECRET`（随机至少32字符）、`COMPANION_BRIDGE_ORGANIZATION_ID`、`COMPANION_BRIDGE_WEB_ORIGIN`，可选 `COMPANION_BRIDGE_PORT`（默认4180）。构建后从 Sports backend 运行 `node dist/companion-bridge/main.js`。
3. 会同里配置 `BNBU_SPORTS_BRIDGE_ORIGIN`、同一个 `BNBU_SPORTS_BRIDGE_SECRET`、`BNBU_SPORTS_WEB_ORIGIN`。见 `backend/movement.env.example`。
4. 桥只绑定 loopback。内部 `/internal/companion-sports` 仅通过受控私网/TLS路由供会同里访问；带30秒时间窗、请求体签名及数据库唯一nonce。不得把共享密钥交给浏览器。两端服务器须保持时间同步。
5. 体育学生端同源转发 `/api/companion-bridge/handoff` 和 `/api/companion-bridge/personal` 到桥进程。前者仅兑换随机的一次性码；后者要求原 Sports Bearer 令牌，并重新检查学生、组织、账号、会话和有效期。不要公开转发内部签名端点。
6. 发布新增 `student/companion.html`、`student/personal.html` 和对应JS，以及学生端个人运动入口。本地学生预览通过 `COMPANION_BRIDGE_PORT=4180` 仅转发两个公开桥路由，通过 `COMPANION_WEB_ORIGIN` 显式允许指定会同里嵌入；默认保留 DENY。正式发布也须为指定会同里来源配置精确的 CSP `frame-ancestors` 和相机/麦克风 Permissions-Policy；保留 HTTPS；会同里宿主页也只向所配置的Sports来源委派camera/microphone。不要使用 `*`。浏览器不支持嵌入时可点击“独立打开”，重新生成单次入口。
7. Sports 的生产变更必须走其根目录 AGENTS.md 规定的统一发布入口，并独立验收备份、回滚、账号映射、原课程流程及移动相机。

## 本地验证证据

- 会同里相关2个测试文件8项通过：原邀请格式、恶意地址、未配置状态、本人身份、HTTP请求签名、零记录老账号状态及页面渲染。
- `new_version/backend/test/integration/companion-bridge.test.ts` 在真实嵌入 PostgreSQL（PGlite）执行 schema 和SQL：暂停/继续/结束、重复开始/结束、版本冲突、跨客户端同一记录、一次性码及nonce重复拒绝、入口频率限制及原体育账号删除时的个人数据清理。账号目录、AuthService和令牌在此测试中为受控替身，不代表真实体育账号验收。
- 本地浏览器使用独立 synthetic 运动验收账号，验证新用户两个入口、个人计时、暂停、刷新恢复及保存记录；测试记录不计入课程学时。证据在 `artifacts/movement-integration-20261021/`。
- Sports桥3项协议测试验证签名篡改、过期、密文完整性及旧邮箱规范化；另1项原AuthService测试验证同邮箱验证继承、旧会话撤销和不同邮箱/停用拒绝。原体育入班、邮箱确认和登录恢复14项回归测试、预览配置3项测试通过；前端构建在工作区临时目录重跑通过（首次因Windows系统临时目录访问拒绝失败），前后端类型检查及范围ESLint通过。
- **尚未验收**：真实 Sports 数据库账号目录、原平台真实会话完整登录、有效/失效课堂二维码与实际入班、实体手机相机及跨站 iframe 权限。当前本地桥使用明确标识的空账号目录及独立测试库；未连接或部署生产。

## 独立本地演示

`tools/companion-bridge/local-preview.mts` 仅在 `APP_ENV=local` 且 `COMPANION_BRIDGE_TEST_ONLY=1` 时启动，并绑定 loopback。它模拟“没有原体育账号”，使用真实 PGlite SQL保存个人运动，进程结束会清空测试库。需要通过 `BNBU_PGLITE_TEST_MODULE` 指向本地安装的PGlite模块，且配置仅本地测试用的桥密钥；此脚本不用于真实账号或正式同步。

### 一次启动本地页面（2026-10-22 修复）

在会同里根目录运行 `./Start-Local.ps1 -Acceptance`：先准备独立验收库，再为清单中原有的两个合成学生显式添加测试邮箱验证记录，最后启动隔离运动桥与4174/4175页面服务。初始化命令 `node scripts/acceptance.mjs sports` 可重复执行；不会给老师、管理员、真实机构账号添加验证。

体育源码默认位于相邻目录 `../new_version`，可通过 `BNBU_LOCAL_SPORTS_ROOT` 指定。它须已安装backend中的tsx和PGlite依赖。启动器复用其 `tools/companion-bridge/local-preview.mts`，生成仅本次进程使用的随机签名密钥，不读取生产环境文件。只允许loopback和固定的browser-acceptance.sqlite、本地邮件箱；退出会同里服务会停止测试桥，个人运动测试库随之清空。

没有体育源码时，可用 `./Start-Local.ps1 -Acceptance -WithoutSports` 预览其他页面；该模式不承诺运动连接可用。普通启动和生产启动不会自动添加测试验证记录，也不会启动此模拟体育目录。扫码页可预览，但该隔离桥不模拟原体育身份或课堂入班完成。
