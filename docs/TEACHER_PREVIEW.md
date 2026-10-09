# 教师端本地预览

伴学主服务：`npm run dev`（4174）。

体育原应用：首次在 `integrations/sports-teacher` 执行 `npm ci`，然后在仓库根执行 `npm run dev:sports-teacher`（4186）。使用原 Vinext 开发服务器，原教师应用内的 `mock=teacher` 仅用于本地演示，不发送真实业务写入。本机为复用已安装依赖，node_modules 使用忽略提交的目录联接；其他机器正常安装即可。

- 普通教师：`http://127.0.0.1:4174/v2/teacher/coffee?previewRole=teacher`
- 体育教师：`http://127.0.0.1:4174/v2/teacher/coffee?previewRole=teacher&sportsTeacher=1`
- 学生：`http://127.0.0.1:4174/v2?previewRole=student`

开发参数只确定当前标签页的本地演示身份，生产构建不读取，教师个人资料不可修改体育资格。普通老师访问体育路径会回到 Coffee Chat。

体育应用源码来自 `new_version/BNBU-Sports-Web-new/portal-teacher-admin`，133 个原始源码、配置及资源保持字节一致，清单见 SPORTS_TEACHER_SOURCE.json。必要的原共享模块位于 `integrations/frontend/student`，原路径结构保留。没有修改原项目。移入完整应用是为了保留原功能依赖，不在伴学中开放体育管理员权限。

生产环境需另行运行原体育应用并通过 `VITE_SPORTS_TEACHER_URL` 配置可嵌入地址，使用原体育系统登录和服务端权限。伴学生产构建不会打包第二个服务，不能将开发参数作为真实身份或单点登录。

Coffee Chat 共享伴学浏览器存档；体育学生与教师原有本地演示不共用运动记录。本轮没有接入真实学校账号、体育统一身份或跨端后端数据，也没有部署。
