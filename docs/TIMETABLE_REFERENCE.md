# BNBU ME 课表参考与实现范围

参考仓库：https://github.com/Rainchen537/BNBUME-client ，核对源码版本 `8b8e7f55e2b5660272ab918f04a688a51870dd51`。按用户指定 REA 技能的源码目标规则，直接阅读完整 Flutter 源码；没有进行或声称二进制反编译。参考项目为 GPL-3.0-only，本次独立实现交互行为，未移植 Dart 源码或资源。

主要证据：`lib/pages/schedule_page.dart`、`lib/widgets/schedule_week_pager.dart`、`lib/models/academic_calendar.dart`、`lib/models/timetable_data.dart`、`lib/models/exam_timetable.dart`、`lib/widgets/fixed_schedule_editor.dart`、`lib/models/fixed_schedule_transfer.dart`。

| 参考能力 | 会同里当前状态 |
| --- | --- |
| 周网格、日列表、切周、回到当前日期、当前时间线 | 本轮实现；手机默认日列表，周网格支持横向查看 |
| 校历、周次、节假日与补课日期 | 已按用户提供PDF实现第一学期；其他学期可设周一 |
| 课程详情、教师、地点、周次 | 已有个人课程修正；保留地图跳转 |
| 学校 MIS 登录与课表刷新、多学期同步 | 待实现；当前为既有图片识别导入，未接入学校 MIS |
| DDL 展示与提醒 | 待实现 |
| 固定安排、TA 课程绑定与周次选择 | 待实现 |
| 固定安排配置导入导出及冲突确认 | 待实现 |
| 个人考试安排与学校教师目录链接 | 待实现；不从校历考试阶段推造个人考试 |

视觉方向：保留会同里米白、青绿色与悬浮玻璃面板；周次导航、视图切换和课程内容各一层，课程名与地点优先，教师与周次作为次要信息。课程同名保持一致色块，重叠课程并排。减少动态模式取消卡片位移动效。

本轮验收包含实际学生会话、两种课表视图、阅读周、课程详情及全局课表窗口；未进行独立视觉评审。
