# 香港服务器部署记录

首次部署完成时间：2026-09-05，Asia/Shanghai。

访问地址：[https://www.verityai.cn](https://www.verityai.cn/)。本次配置的域名只有 `www.verityai.cn`。

## 当前状态：旧网站内容已删除

2026-09-05 按用户要求，只删除了服务器上的旧网站内容：发布目录内的 `index.html`、JS、CSS，共 3 个文件，以及上传缓存中的 `20260905-78d2f3e.tar.gz`。本地源码和构建文件保留。

`/var/www/bnbu-campus-hub/current` 仍指向原发布目录，目前只保留空目录结构。Nginx 服务、站点配置、HTTPS 证书、证书续期配置、重载钩子和 `certbot.timer` 均保留，服务与定时器保持 active / enabled。证书验证目录 `/var/lib/letsencrypt/.well-known/acme-challenge` 保留。

删除后已验证：HTTPS 首页返回 403（空目录），`/index.html` 和旧 JS / CSS 返回 404，TLS 证书验证通过，HTTP 仍跳转 HTTPS。配置与证书的完整性检查通过；再次执行 `certbot renew --dry-run --no-random-sleep-on-renew`，模拟续期成功。

以下内容记录首次部署时的状态和验证结果，用于维护与追溯；其中网站页面的 200 结果不代表当前仍有网页内容。

## 服务器检查结果

| 项目 | 实际检查结果 |
| --- | --- |
| 公网 IP | `43.129.193.7` |
| SSH 用户 | `ubuntu`，可使用 `sudo`；该密钥不能直接登录 `root` |
| 系统 | Ubuntu 22.04.5 LTS，x86_64 |
| CPU / 内存 | 2 核 / 3.6 GiB 可见内存 |
| 磁盘 | 60 GB 云盘，根文件系统约 59 GiB，部署后约剩余 53 GiB |
| 部署前业务目录 | `/opt`、`/srv`、`/data` 为空；未发现现有网站目录或业务服务 |
| 部署前服务 | SSH、系统服务、腾讯云代理等；公网 TCP 监听只有 22 |
| 部署前软件 | 未安装 Nginx、Docker、Node.js 或所检查的常见数据库服务 |
| 主机防火墙 | UFW inactive；iptables 默认 ACCEPT，存在腾讯云代理管理的单条 IP 拒绝规则 |
| DNS | 公共解析器查询 `www.verityai.cn` 的 A 记录为 `43.129.193.7`；未查询到 AAAA 记录 |

本次没有更改云控制台安全组、DNS 或主机防火墙规则。HTTP、HTTPS 均已通过公网请求验证。

## 已部署内容

- 网站：当前工作区的 BNBU Campus Hub Demo，React / TypeScript / Vite。
- 构建源码：分支 `ux-ui-redesign`，HEAD `78d2f3e`；网站源码没有改动。
- 安装软件：Ubuntu 软件源中的 `nginx 1.18.0-6ubuntu14.20` 和 `certbot 1.21.0-1build1`。
- 发布目录：`/var/www/bnbu-campus-hub/releases/20260905-78d2f3e`。
- 当前站点：`/var/www/bnbu-campus-hub/current`，符号链接指向上述发布目录。
- Nginx 站点：`/etc/nginx/sites-available/bnbu-campus-hub.conf`。
- 静态文件配置：`/etc/nginx/snippets/bnbu-campus-hub-static.conf`。
- 配置备份：`/var/backups/bnbu-campus-hub/20260905-78d2f3e/`，目录权限为 `0700`。
- 日志：`/var/log/nginx/bnbu-campus-hub.access.log` 和 `bnbu-campus-hub.error.log`。

只上传了 `dist` 构建产物。Node.js、开发服务器、源码、`node_modules` 和本地 SSH 私钥均未上传到网站目录。系统现在监听 22、80、443；53 仅监听本机地址。

## Nginx 与 HTTPS

本目录的 `nginx-site.conf`、`nginx-static.conf`、`renew-nginx.sh` 与服务器生效文件的 SHA-256 一致。

- HTTP 301 跳转至 `https://www.verityai.cn`，保留路径和查询参数。
- React Router 页面通过 `try_files` 回退到 `index.html`，支持直接打开和刷新详情页；配置依据 [Nginx 官方文档](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)。
- `index.html` 使用 `no-cache`，带哈希的静态资源缓存一年，并启用 gzip。
- 不存在的 `/assets/` 文件返回 404；`/api/` 返回 404，因为本网站没有后端。
- 点文件路径禁止访问；ACME 验证目录单独开放。
- Let's Encrypt 证书覆盖 `www.verityai.cn`，当前到期时间为 **2026-12-04 09:09:10 +08:00**。
- `nginx.service` 和 `certbot.timer` 均已启用。证书续期使用 webroot 验证，续期后由 `/etc/letsencrypt/renewal-hooks/deploy/20-reload-nginx` 检查并重载 Nginx，机制参见 [Certbot 官方文档](https://eff-certbot.readthedocs.io/en/stable/using.html#renewing-certificates)。
- 本次未配置证书账户联系邮箱。自动续期模拟和重载脚本分别执行成功。

`nginx-http-bootstrap.conf` 仅用于首次签发证书前的 HTTP 站点；不要用它覆盖已经生效的 HTTPS 配置。

## 验证证据

| 检查 | 结果 |
| --- | --- |
| `npm run build`（包含 TypeScript 检查） | 通过；Vite 提示 JS chunk 约 508 KB 的大小警告 |
| 上传后三个构建文件 SHA-256 | 全部与本地一致 |
| `nginx -t` | 通过 |
| HTTP 首页 | 301 跳转至 HTTPS |
| HTTPS 首页 / 活动详情深层链接 | 200，证书验证通过 |
| 公网下载 JS 的 SHA-256 | 与本地一致，gzip 与缓存响应头生效 |
| 不存在的静态资源 / `/api/health` | 404 |
| `/.env` | 403 |
| 浏览器首页、活动详情、详情页刷新 | 内容正常显示；捕获的 error / warn 日志为空 |
| `certbot renew --dry-run --no-random-sleep-on-renew` | 模拟续期成功 |
| 证书部署钩子 | `nginx -t` 与 reload 成功 |

本次验证覆盖静态网站部署、TLS 和路由。当前仍为使用合成数据及浏览器 `localStorage` 的演示网站，没有真实登录、后端、数据库或跨设备数据同步。二维码载荷仍使用源码原有的演示域名，真实扫码签到不属于本次部署能力。

## 后续维护

Windows PowerShell 登录命令：

```powershell
ssh -i "C:\Users\23328\Desktop\SSH_CVM密钥\BNBU_SPORTS_HK.pem" ubuntu@43.129.193.7
```

本次将上述密钥文件的 ACL 收紧为当前 Windows 账户访问，修复了 OpenSSH 的 `bad permissions`。原 ACL 元数据保存在本机 `%TEMP%\codex-bnbu-hk-20260905\original-key-acl.sddl`；该文件不含私钥内容。

服务器检查命令：

```bash
sudo nginx -t
systemctl status nginx --no-pager
systemctl list-timers certbot.timer --no-pager
sudo certbot certificates
sudo tail -n 50 /var/log/nginx/bnbu-campus-hub.error.log
```

后续更新时，在本地重新执行 `npm run build`，将 `dist` 上传到新的 `releases/<发布编号>` 目录，校验文件后切换 `current` 符号链接。保留前一个发布目录，即可通过切回旧链接回滚网站。Nginx 已指向 `current`，仅替换静态文件无需修改站点配置。

首次发布前没有旧业务网站。`nginx-before` 备份保存的是安装 Nginx 后、配置本网站前的默认配置；`http-bootstrap.conf` 保存的是启用 HTTPS 前的本网站配置。它们都不包含 SSH 私钥。

本次没有 Git 提交；原有 `UI_STYLE_GUIDE.md` 的未提交修改保持原样。
