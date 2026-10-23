# BNBU Sports 真实连接启用清单

以下保留准备时基线，最终启用结果见末尾。2026-10-22 准备时核对线上：学生端与 readiness 均为 HTTP 200；当时成功版本为
`resource-guard-20261020`。线上没有连接桥，`/student/companion.html` 为404；
原 AuthService 有 establishStudentSession，尚无 establishCompanionSession。
现有 api.js 已导出 storeAuthSession 与 clearApiSession，可用于单次登录页。

## 已准备与验证

- `node scripts/prepare-real-sports.mjs` 生成 `.runtime/sports-real-candidate/`，包含逐文件摘要。
- 候选镜像 `bnbu-companion-bridge:candidate-20261022` 已在体育服务器构建；从正在运行的体育后端镜像派生，仅加入连接模块及仅限连接进程的登录扩展，不覆盖原后端模块。
- 隔离容器采用无网络、256MiB内存、0.5CPU，已成功加载线上 AuthService 和连接扩展。候选未启动常驻服务，未执行生产SQL，未切换 current。
- 5项体育测试通过：签名时窗、密文完整性、邮箱身份、本人邮箱验证继承、PostgreSQL个人运动与单次入口；目录与登录依赖仍为测试替身，不能当作真实账号验证。
- 会同里4项连接测试、4项真实配置测试及服务端类型检查通过。当前4186学习预览停止启动模拟桥，缺少真实配置时明确不可用，不返回模拟账号或个人运动。

## 待确认的生产变更

批准后以 `companion-real-20261022` 作为新版本，经体育统一发布入口运行。
原生产数据库增加 `companion_sports` 独立schema的5张表、索引及用户删除清理触发器；
发布新的单次登录页、个人运动页和3个JS文件；增加仅绑定loopback的连接进程、
两条公开兑换/个人运动路由。内部签名接口不经公网转发。

现有学生首次从会同里进入体育端时，按本人已验证邮箱精确匹配。若原体育账号缺少
邮箱验证标记，会继承此次同邮箱验证并写审计，撤销原未验证会话后建立新会话。
停用、邮箱重复、归属冲突和维护状态均拒绝自动登录。个人运动不计课程学时。

## 发布顺序与核对点

1. 再查 current、统一发布保留状态、后端镜像摘要与健康状态，防止准备期间有并行发布。
2. 创建体育数据库完整备份及 schema-only 备份，校验备份目录和 `pg_restore --list`；备份不下载到本地、不在日志输出数据库凭据。
3. 核对正式机构ID和现有数据库角色；检查5张表、触发器均未安装。SQL在事务中执行，授权仅限体育应用角色使用该独立schema。
4. 新建候选发布目录，复用已接受版本；保存Nginx原配置。仅加入候选文件，不发布本地体育工作区的其他并行改动。
5. 连接进程继承体育后端的受保护运行配置与证书挂载，生成专用签名密钥，限制内存、CPU和PID；不启动媒体处理或第二份公开后端。密钥仅存受保护配置，不能进入Git或浏览器。
6. Nginx仅转发两个固定公开路由；单次登录页精确允许 `http://127.0.0.1:4186` 嵌入，其他页面保留原策略，配置检查通过再reload。
7. 通过 `sudo /usr/local/sbin/bnbu-sports-deploy run --release companion-real-20261022 --verify-script <候选目录>/verify-production.py --verify-arg=--release --verify-arg=companion-real-20261022 --verify-arg=--manifest --verify-arg=<候选目录>/manifest.json -- <激活命令>` 激活。激活命令必须完成上述备份与事务检查；独立验证脚本失败则恢复上一版本。
8. 以SSH加密隧道将本机专用端口转到生产loopback连接端口；本地受保护配置文件供 `BNBU_SPORTS_CONNECTION_FILE` 读取，学生来源固定为 `https://www.student.bnbusports.cn`。
9. 由已登录的本人账号核对真实目录匹配、单次码过期/复用拒绝、原课程与记录只读显示。个人运动写入、扫码实际入班、邮箱验证标记继承须在已授权账号范围验证，不能用合成账号或直接改验证标记代替。

## 失败恢复

- 关闭新增连接进程和隧道、恢复Nginx配置并检查reload、切回统一入口记录的上一成功版本；验证原学生端、教师端和 readiness。
- 关闭桥后新表保留为受保护的恢复资料，不自动删除已写入的真实个人运动或做全库回滚；按备份及增量记录单独处理。触发器、表和授权的卸载须核对是否已有真实数据。
- 已建立的原体育会话或邮箱验证审计按原体育规则保留，不通过批量回写伪造撤销；紧急停用连接密钥并撤销本次明确建立的会话。

## 已完成启用（2026-10-23）

用户明确批准“备份后启用真实连接”。两个版本均通过体育统一发布入口及独立验证后接受：连接版本`companion-real-20261022`，随后修复入口模块版本解析的`companion-entry-20261023`。当前为后者，前者为保留回滚版本。

- 完整备份在服务器`/var/backups/bnbu-companion-bridge/20261022T160218Z`，仅root可读，包含数据库、schema、原Nginx、版本和容器信息。database.dump为229122814字节，SHA256为`b350d28602655d9aad33e6663855955f3677a208fa197ae17a3ba4f673a9bca9`；摘要与pg_restore目录已验证。
- 事务内创建独立schema的5张连接表、索引、删除清理触发器与限定角色授权，没有改写原课程、运动记录或学时字段。
- `bnbu-companion-bridge.service`为active、容器健康，只监听127.0.0.1:4180，内存256MiB、含交换320MiB、0.5CPU、64PIDs。密钥和运行配置受保护，未进入Git或浏览器。
- 固定兑换与个人运动路由启用；无效兑换401、个人运动无Bearer401、内部签名路由公网404。学生端及readiness200，入口精确CSP已核对。
- 修复连接启动顺序：加载运行密钥后动态加载RuntimeModule，并预加载reflect-metadata。单次入口从官方首页解析同一发布快照的API/app模块，拒绝跨源和非固定模块地址。
- 首次因Nginx reload窗口的CSP检查触发回退；保留独立schema和恢复资料，确认5表全空后恢复执行，增加有界等待与备份复核。未自动DROP schema或全库回滚。后续清理曾因worker重启健康窗口报错，健康恢复后标准清理重试PASS。
- 最后核对current为companion-entry-20261023，连接、原后端、媒体worker、portal均健康。本人真实账号匹配、单次登录、课程、已核算进度和记录只读核对成功。

未以真实账号创建测试运动、提交课程凭证或实际入班；实体相机及完整课程写入尚未验收。会同里原生页面目前为本地4186预览，不能等同于其页面已部署。

重新启动可运行根目录`./Start-RealSportsPreview.ps1`。默认受保护配置在当前用户LocalAppData下`BNBU-Companion/Sports/connection.json`；脚本检查并建立SSH加密隧道，不打印密钥。
