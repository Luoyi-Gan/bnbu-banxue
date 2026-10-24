# Docker 参数与基线回归修复（2026-10-24）

## 交付范围

修改 `compose.postgres.yaml`、`compose.yaml`、邮件加载器、PostgreSQL 预约历史读取及对应测试。仅在独立本机 PostgreSQL 容器的随机 schema 验证；未升级现有预览服务，未执行生产部署或迁移。真实邮件、AI、体育、APNs 和课表照片识别的服务配置/验收状态未因此改变。

## 参数接线

下列环境变量已传入 PostgreSQL `api` 和 SQLite `bnbu` 服务；不会注入前端服务。除体育模式默认 `real` 外，下表新增连接参数均默认空值。

| 服务 | 参数 |
| --- | --- |
| 邮件 | `BNBU_EMAIL_PROVIDER`、`BNBU_EMAIL_DELIVERY_URL`、`BNBU_EMAIL_DELIVERY_TOKEN` |
| AoKSend | `BNBU_AOKSEND_APP_KEY`、`BNBU_AOKSEND_TEMPLATE_ID`、`BNBU_AOKSEND_CODE_VARIABLE`、`BNBU_AOKSEND_LOGIN_TEMPLATE_ID`、`BNBU_AOKSEND_DELETION_TEMPLATE_ID` |
| AI | `BNBU_STUDY_DEEPSEEK_KEY`、`DEEPSEEK_API_KEY`、`BNBU_STUDY_AI_PROVIDER`、`BNBU_STUDY_AI_URL`、`BNBU_STUDY_AI_TOKEN` |
| 体育 | `BNBU_SPORTS_BRIDGE_ORIGIN`、`BNBU_SPORTS_BRIDGE_SECRET`、`BNBU_SPORTS_WEB_ORIGIN`、`BNBU_SPORTS_MODE` |
| 课表及身份外部适配 | `BNBU_TIMETABLE_UPSTREAM`、`BNBU_TIMETABLE_TOKEN`、`BNBU_IDENTITY_VERIFICATION_URL`、`BNBU_IDENTITY_VERIFICATION_TOKEN` |

部署者应把实际值放在仓库外受限的环境文件，通过 Compose 的 `--env-file` 指定，或使用已有私有覆盖配置。宿主机的 JSON 配置不会自动进入容器；本次未增加挂载、写入密钥或连接真实外部服务。对外提供服务时必须显式设置 `BNBU_LOCAL_OUTBOX=0`，默认值 `1` 仅保留本地预览兼容。

AoKSend provider 使用 `aoksend`，发送地址为既有 `https://apiv2.aoksend.com/index/api/send_email`；通用模板、验证码变量和 key 仍按原加载器校验。注销模板必须单独配置，登录模板或通用模板不能作为回退。文件配置的字段名称与上述环境变量一致；显式环境值（含空字符串）优先于文件。旧配置缺少注销模板不会阻塞原登录，但不能发送注销验证码。

仅解析配置的验证命令：

```sh
node scripts/test-deployment-config.mjs
```

该脚本使用临时空环境文件和虚构配置值，检查两套 Compose 的透传、默认值及前端隔离，共 128 个断言；不读取用户 `.env` 或 JSON 配置，不打印渲染后的密钥，不启动容器。

## 12 项旧失败逐项处理

| 编号 | 原失败 | 根因与处理 |
| --- | --- | --- |
| Web 1 | 体育源失败看板 | 中文断言受 Node 的系统英语语言影响；测试明确保存中文设备偏好，继续验证不可用状态与无虚构统计 |
| Web 2 | 学生体育授权投影 | 同上；保留源失败后隐藏旧统计、维持图表布局的断言 |
| Web 3 | 学生体育加载/失败页 | 同上；保留未知进度占位、无 GPS/提交能力的断言 |
| Web 4 | 教师体育加载/重试页 | 同上；保留 busy、重试和错误内容断言 |
| Web 5 | 详情返回的滚动位置 | 旧用例把同信息流的帖子当作跨路由卡片；帖子按现有规则恢复原 scrollTop，店铺/社团做位置补偿。扩展三种目标断言，没有改变生产动画 |
| PG 1 | 校园身份迁移 | `slice(0,-1)` 在新增迁移后不再表示“迁移 9 之前”；改为按版本 `<9` 建立旧库，继续验证迁移与幂等 |
| PG 2 | 图片外部持久化 | 原账号没有校园身份；使用独立已核验学生，并对未审核图片验证本人可见、他人不可见。整个测试文件共用一个临时对象目录，防止中途换目录使已有引用失效；保留伪造引用拒绝和写失败回滚 |
| PG 3 | 密码错误次数持久化 | 旧测试仍查全局账号锁；按既有来源限流规则验证 12 次失败后同来源被限、失败不建 session、不同来源正确密码可登录、窗口过后可重试 |
| PG 4 | 注册验证码错误计数 | 原测试用非六位输入，先触发格式校验；分别验证非法格式不计挑战尝试、五次格式合法但错误的验证码持久计数并失效 |
| PG 5 | HTTP 社区权限 | 邮箱注册本身不授予校园身份；先断言 403，再明确准备已核验学生，继续验证发布、审核、可见性及幂等 |
| PG 6 | Coffee Chat 完整历史 | **实际数据缺陷**：按当前操作者筛选的通用审计漏掉另一方操作。现在单独读取本人参与预约的完整历史，按时间/写入顺序排列；师生及有权运营均验证四步、改期原因和接受结果，无关账号仍不可见 |
| PG 7 | 学号搜索 | 请求人缺少核验身份；先验证 403，再补测试身份，继续验证精确匹配、未核验目标不可见及隐私字段边界 |

这些修改没有放开生产身份门禁、恢复旧的全局账号锁、减少预期历史条数或新增跳过项。学校认证只在隔离测试中准备合成身份。

## 验证

- 全量 Vitest（含真实本机 PostgreSQL）：101 个文件、552 项通过，0 失败、0 跳过；运行命令为设置隔离 `BNBU_TEST_POSTGRES_URL` 后 `npx vitest run --maxWorkers=4`。
- Docker 静态配置：128 项通过，无容器部署。
- 前后端 TypeScript 检查通过。
- PostgreSQL 注销 63 项断言、推送 31 项检查通过，使用隔离 schema 与替身 transport，未发送真实邮件或 APNs。
- 变更代码 lint 与 Web 生产构建通过；构建仍提示部分 chunk 超过 500 kB，本轮没有扩展为打包体积优化。

本次不证明香港服务器已经配置服务或完成 migration 14，也不证明真实 APNs、邮件或真机链路验收。生产部署继续等待用户授权。
