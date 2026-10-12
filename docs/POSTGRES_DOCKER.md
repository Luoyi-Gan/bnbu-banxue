# 独立前端与 PostgreSQL 本地环境

此环境与原 `compose.yaml` 的 SQLite 环境独立，入口为 `http://127.0.0.1:4188/v2/login`。当前仍在迁移管理接口，不代表全部业务已验收。

在仓库根目录 PowerShell 执行：

```powershell
$env:BNBU_POSTGRES_PASSWORD = '替换为本地数据库密码'
docker compose -f compose.postgres.yaml up -d --build
docker compose -f compose.postgres.yaml ps
Invoke-RestMethod http://127.0.0.1:4188/api/health
```

密码放入连接 URL，当前配置要求使用 URL 安全字符（字母、数字、连字符、下划线）。不要提交真实密码。若需要代理，按当前电脑代理配置设置 HTTP_PROXY/HTTPS_PROXY 后构建。

前端 Nginx 只负责原页面静态文件和 `/api/` 反向代理；API 运行 `backend/dist/postgres.mjs`，启动自动执行有校验和的数据库迁移。PostgreSQL 和 API 不发布宿主机端口。浏览器沿用同源 HttpOnly 会话 Cookie，数据库内容在 `postgres-data` 卷持久保存。

```powershell
docker compose -f compose.postgres.yaml logs --tail 100 api
docker compose -f compose.postgres.yaml down
```

`down` 保留数据卷；不要加 `-v`，除非明确要删除整个独立测试数据库。该环境不会复制或覆盖原 `data/browser-acceptance.sqlite`，也不会自动创建有权限的账号。

本配置启用本地邮件收件箱，不发送学校邮件。真实腾讯云部署还需要 HTTPS、正式邮件及身份服务、COS 配置，并将来源白名单和 Cookie Secure 配置切换为正式域名。本地启动成功不证明这些外部服务已联通。

本地冒烟验证：运行 node scripts/docker-postgres-smoke.mjs。脚本创建随机测试账号、明确授予本地学生职责，验证注册与登录、设置保存、数据库/API 重启后的会话及数据保留、退出失效。它会重启本配置的数据库及 API 容器，请仅用于独立本地测试环境；不会读取或修改原 SQLite 验收服务。测试账号保留在独立测试库中，密码不输出。

