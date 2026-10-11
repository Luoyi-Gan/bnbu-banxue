# Docker 本地启动

2026-10-11：已验证 Docker Desktop Linux 引擎 29.8.2、Compose 5.5.1 可用，`docker compose config --quiet` 通过。首次构建访问 `auth.docker.io/token` 超时，尚未完成镜像构建、容器运行或容器内验收。网络恢复后重试以下步骤。

此入口用于本地开发验收，运行 Vite 和现有 Node/SQLite 服务。与 Windows 启动入口使用相同端口，先停止原启动终端中的服务，再运行：

```powershell
docker compose up --build -d
docker compose ps
docker compose logs --tail 80 bnbu
```

浏览器访问 http://127.0.0.1:4174/workspace 。仅向宿主机回环地址发布网页端口；API 通过网页代理访问。SQLite 位于独立的 `bnbu-data` 命名卷，现有 Windows `data` 不会复制进镜像，也不会自动迁移。默认不创建测试账号、不启用本地邮件箱。

如需独立测试账号，可在服务启动后执行：

```powershell
docker compose exec bnbu node scripts/acceptance.mjs prepare
docker compose exec bnbu node scripts/acceptance.mjs sports
```

这两个命令创建卷内 `data/browser-acceptance.sqlite` 和 `data/browser-acceptance-accounts.json`，不写默认业务数据库。然后将 compose 的 `BNBU_DATABASE` 改为 `/app/data/browser-acceptance.sqlite`，增加 `BNBU_LOCAL_OUTBOX: "1"`，执行 `docker compose up -d` 重建容器。通过 `docker compose cp bnbu:/app/data/browser-acceptance-accounts.json ./data/docker-acceptance-accounts.json` 将测试凭据保存到本地忽略目录（先确保本地 `data` 目录存在）。测试角色不代表学校真实身份。

`docker compose down` 停止容器并保留数据卷；不要加 `-v`，否则会删除卷内业务数据。源文件改变后需要重新构建。外部邮件、学校核验和 AI 等服务仍须另行配置，Docker 不会自动提供这些能力。

2026-10-12 按用户要求重试 `docker compose build`：Docker 引擎 29.8.2仍可响应；获取 Node 基础镜像的 Docker Hub OAuth token 再次连接超时，失败发生在依赖安装与应用构建之前。容器启动仍未验证，不能归因于应用代码或报告构建成功。
