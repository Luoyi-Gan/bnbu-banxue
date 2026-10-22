# 社团公开资料核对 · 2026-10-22

本次检索学校学生事务处、迎新网、公开社团介绍及社区手册线索，入库以学校可逐项核对的名单为准。全网检索无法证明穷尽所有账号、历史组织及未公开组织。

- 主名单与分类介绍：https://sao.bnbu.edu.cn/students/interest_clubs/name_list.htm
- 学术类：https://sao.bnbu.edu.cn/info/1150/1286.htm
- 体育运动类：https://sao.bnbu.edu.cn/info/1150/1288.htm
- 其他类：https://sao.bnbu.edu.cn/info/1150/1290.htm
- 官方英文介绍（57个）：https://sao.bnbu.edu.cn/en/info/1149/1279.htm
- 迎新招新页面（另述59个）：https://yx.bnbu.edu.cn/info/1611/6593.htm
- 另一迎新入口（另述58个）：https://yx.bnbu.edu.cn/yxy1/stzx.htm
- 官方社团咨询渠道：https://sao.bnbu.edu.cn/students/interest_clubs/process_guidance.htm

逐行名录共57项：学术11、文化艺术13、体育运动23、义工服务5、其他5。未把“58/59”总数之差补成未经核实的组织。名录中的英文名和中文名保留原对应关系，表格合并文字通过中英文边界拆分；中文名称、简介和类别可检索。当前没有从第三方联系人名单收集个人手机号。

data/campus-clubs.json为结构化事实目录；data/campus-club-summaries.json为简要改写后的介绍。经典映室的介绍标明只有名录及英文名事实。统一咨询邮箱明确属于SAO-ICMC，不伪装为57个社团各自的联系邮箱。现已为36个社团补充可核对的学校公开报道宣传图及活动照片；21个社团继续使用文字封面。配图逐项来源及限制见CAMPUS_CLUB_IMAGES.md。

更新名单运行node --use-system-ca scripts/collect-campus-clubs.mjs；脚本检查名称唯一性、至少50项及每项有人工整理简介，结构异常会停止。随后审核目录差异，通过scripts/import-campus-clubs.mjs显式导入本地服务；已存在的名称跳过，后续维护走原运营操作。

本地验证：430×932与1440×1000，关注/取消关注和刷新恢复，搜索与类别，列表至详情及返回，减少动态，无横向溢出、无页面脚本错误。证据在.runtime/campus-upgrade/；包含真实模型一次测试的用量，来源为当前本地共享目录。本轮未部署。
