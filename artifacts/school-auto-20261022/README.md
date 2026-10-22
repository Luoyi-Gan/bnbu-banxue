# 学校登录后自动同步

学校登录完成时，自动读取iSpace课程、当前日历、各课程附件目录，以及MIS本人学期时间表。学习工具自动填充课程与资料；MIS写入原本人课表，复用原课表板、首页安排和课前提醒。5门MIS课程与11个iSpace课程空间分别计数。

`live-summary.json` 是授权测试账号的实时汇总，包含自动同步状态、数量和页面验证结果，不含账号、邮箱、密码、令牌或学校课件。`verify.mjs` 从调用进程环境读取测试凭据，验证页面登录、现有课表、自动资料目录，以及没有手动同步请求。真实界面截图只留在忽略的 `.runtime/school-auto-sync-mobile.png`。

本次实测：11个课程空间、5门实际MIS课程、10段上课时间、3项截止事项、11门目录共461条文件记录；状态complete且MIS成功。iSpace附件目录按课程预读，原件在打开时读取。MIS实际课程时间通过现有数据表出现在原课表；同学期复用已确认校历，未知学期或特殊周次明确待核对。

课程日历只把明确due/close的未来事项加入DDL，排除测验开放时间；重复同步按学校事件ID更新，保留个人完成状态和提醒设置。学期周课表更新前备份手动来源，不改个人重复安排。网络、SSO额外验证或解析失败保留旧表并显示失败。

学校访问限制为固定HTTPS来源，独立CookieJar，SSO密码按学校公钥SM2加密，不持久保存；到达MIS后不执行其菜单跳转。仅失败GET可有限重试，密码POST不自动重发。协议从当前官方页面响应与功能研究中确认，独立实现，没有复制外部GPL业务代码。

参考：[学校SSO](https://sso.bnbu.edu.cn/#/login)、[学校iSpace说明](https://itsc.bnbu.edu.cn/info/1414/5339.htm)、[SM2库](https://github.com/JuneAndGreen/sm-crypto)、[CookieJar](https://github.com/salesforce/tough-cookie)、[HTML解析](https://cheerio.js.org/docs/basics/loading/)。

SQLite及真实学校接口已验证。PostgreSQL使用相同同步策略，尚未在真实实例复验；本轮未部署。学校网络曾出现间歇错误，成功汇总证明本次连通，失败分支也保留原数据，不保证外部学校服务持续可用。
