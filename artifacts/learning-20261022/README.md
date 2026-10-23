# 学习工具设计与验证

界面沿用会同里青绿、米白、现有字体。主任务是从课表进入学习工具、保存个人安排或阅读本人资料。页顶提供课表与学习工具切换，避免先滚过完整课表；手机分类横向滚动，容器收缩到实际视口。

主操作有按压反馈，分类切换及初次进入轻微淡入；系统与平台减少动态偏好关闭这些动效。文件名、来源、学校连接状态、页码及错误保留，精简重复介绍。阅读正文与问答按连续任务排布，官方办事搜索使用结果列表。

## 运行证据

- 隔离 SQLite 预览：前端 `http://127.0.0.1:4186`，API `http://127.0.0.1:4187/api/health`。从既有合成验收数据库备份创建 `.runtime/learning-preview.sqlite`，未修改原验收库。
- `preview.mjs` 启动隔离预览；`verify.mjs` 验证真实邮箱验证码请求、安排刷新读取、课件分页、AI未配置错误、权限限制、办事搜索、每张截图无水平溢出、减少动态。合成邮箱的验证码只从隔离本地发件箱读取，不发送真实邮件。
- `manifest.json` 和PNG为本地浏览器证据，手机393×852、桌面1440×1000。学校真实数据没有截图或写入此目录。
- 已使用用户授权的测试学校账号实际验证：Moodle账号登录成功，返回11门课程，日历、课程内容、课程评分接口成功；学校PDF下载及提取成功，34页、15,651个文字字符。仅记录汇总，不保存账号、密码、学校令牌或课件内容。原版本平台学校登录要求首次邮箱核对；后续按用户最新要求取消，该历史测试步骤已被直接登录流程替代。

## 数据与接口

SQLite与PostgreSQL共用学习策略；新增实体种类复用既有存储，不改旧迁移校验和。学校会话仅存服务端内存，邮箱登录不可读取其他会话的学校课程、资料和成绩。个人安排与资料只查询本人；管理员职责不授予个人资料读取权。当前部署要求单进程或会话粘滞；重启重新学校登录。

Moodle调用固定来源 `https://ispace.bnbu.edu.cn`，包括 `login/token.php`、`core_webservice_get_site_info`、`core_user_get_users_by_field`、`core_enrol_get_users_courses`、`core_calendar_get_calendar_upcoming_view`、`core_course_get_contents`、`gradereport_user_get_grade_items`。保持TLS校验，拒绝重定向，学校令牌不返回浏览器。

来源：[Moodle官方Web services说明](https://docs.moodle.org/dev/Web_services)、[学校iSpace说明](https://itsc.bnbu.edu.cn/info/1414/5339.htm)、[iSpace校外网络提示](https://ispace.bnbu.edu.cn/)。BNBU ME只作为功能与协议研究参照，没有复制其GPL代码。

## 当前边界

- 正式考试、座位表、最终成绩和GPA尚无MIS自动同步；提供学校SSO入口，个人考试和iSpace测验明确标注来源。
- 站内提醒仅在打开网页时检查，未实现关页后台通知、邮件或系统推送。
- 个人PDF/TXT支持阅读，扫描PDF没有文字时提示。PPT、Word等文件暂需在iSpace下载转换；当前问答范围为一页。
- 用户已选择DeepSeek。运行时设置 `BNBU_STUDY_AI_PROVIDER=deepseek`，服务端使用 `BNBU_STUDY_DEEPSEEK_KEY` 或进程环境 `DEEPSEEK_API_KEY`。固定官方HTTPS Chat Completions，模型deepseek-flash、关闭thinking、最多输出2000 tokens，只发送当前页最多24000字符及问题；前端明确勾选DeepSeek与单独计费。密钥未写入文件。当前4186预览已从本机既有用户环境加载密钥，完成一次真实合成课件问答，输入85、输出53 tokens，无缓存命中，截图为第2页解释。学校课件内容没有发送给AI。生产环境需要单独配置密钥并部署。
- 仍支持显式自有服务端 `BNBU_STUDY_AI_URL`（HTTPS）、`BNBU_STUDY_AI_TOKEN`，协议接收 `{question,page,content,instruction,requestId}`、返回 `{answer:string}`，作为部署扩展；本次实际选择与界面披露为DeepSeek。
- PostgreSQL路径通过类型检查；尚未在真实PostgreSQL实例执行本轮用例。

## 视觉评审

初轮独立截图评审6.5/10，发现手机横向撑宽、学习入口过深、阅读区域层级弱、办事页标题换行。已收缩Grid列、增加页顶切换、增强阅读面板并减少办事页顶栏操作；随后重新截图并逐张验证无水平溢出。完整长页截图中固定工具栏的位置受拍摄时滚动影响，阅读区另保存实际视口截图。复评8.3/10；随后进一步将手机五个分类全部展示、增加文件打开箭头、补充连接依赖说明、预留底部导航空间，并保存阅读提交区域的实际视口截图。最终验证记录见交接文件。

最终验证：前后端类型检查、lint与31项相关测试通过；最终常规浏览器脚本使用 `--password-login` 连续3轮通过，避免重复发送验证码和调用付费AI。邮箱验证码完整UI流程已在此前单独通过。真实DeepSeek证据另存 `manifest-ai-live.json` 与 `reader-answer-mobile.png`，常规回归不覆盖真实回复截图。
