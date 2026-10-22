# 校园指南公开资料与收录范围

查阅日期：2026-10-22。入口：`/v2/campus?service=directory`。

## 当前收录

共194项，数据位于shared/v2/campusContacts.ts，网页与校园AI复用同一来源。

| 分类 | 项目数 |
| --- | ---: |
| 住宿生活 | 20 |
| 教务学业 | 58 |
| 网络与账号 | 5 |
| 图书馆 | 6 |
| 校园服务 | 26 |
| 医疗与支持 | 8 |
| 成长与发展 | 33 |
| 学院与部门 | 23 |
| 学校概览 | 15 |

包括12个苑舍、一期与二期房型、调宿与报修、教务处在校生目录的课程/学籍/考试/证明/表格入口、学校联系页公开的29个学院或部门、物业公开服务与表格、网络与图书馆服务、心理支持、发展交流及学校概览。

数据层级明确区分：45项公开资料正文或联系方式已核对；149项来自已查阅的官方导航目录，其目标页办理细则未逐项核对。每项保存source、sourceLabel、checkedAt和verification；目录入口的说明仅概括事项，不补造费用、期限、办公地点或办理资格。来源页面列出的联系方式不代表实时接听或到场验证。

## 主要官方来源

- [学校公开联系方式](https://www.bnbu.edu.cn/about_us/contact_us.htm)：公开部门名称、电话及公共邮箱。
- [学校组织架构](https://www.bnbu.edu.cn/en/info/1031/1592.htm)：学院与行政支持单位。
- [学生事务处苑舍概况](https://sao.bnbu.edu.cn/campus/hostel_life/hostel_life/overview.htm)：12个苑舍及住宿支持目录。
- [一期宿舍](https://sao.bnbu.edu.cn/campus/hostel_life/hall_facilities/phase_campus_1.htm)、[二期宿舍](https://sao.bnbu.edu.cn/campus/hostel_life/hall_facilities/phase_campus_2.htm)、[宿舍调整](https://sao.bnbu.edu.cn/campus/hostel_life/adjustment.htm)。
- [教务处校历及在校生导航](https://ar.bnbu.edu.cn/current_students/student_handbook/Academic_Calendar.htm)。
- [物业管理处](https://emo.bnbu.edu.cn/)：报修、安全、交通、场地与公开表格。
- [ITSC网络指南](https://itsc.bnbu.edu.cn/en/User_Guide/Campus_Network.htm)。
- [图书借阅](https://lrc.bnbu.edu.cn/info/1023/1111.htm)、[设施预约](https://lrc.bnbu.edu.cn/en/Services_Facilities/Facility_Reservation.htm)、[参考咨询](https://lrc.bnbu.edu.cn/info/1022/1110.htm)。

BNBU ME参考范围：本地源码8b8e7f5的目录采用分类、组织、职责、联系方式、来源等结构；assets/catalog/bnbu_directory.json只有空organizations数组。此次没有其远端目录数据，未访问私有接口，也未复制GPL客户端实现。公开事实重新从学校来源整理。

## 链接检查

本次对194个不同目标地址进行低并发检查：158个HTTP 200，34个HTTP 403，学工系统HTTP 401，Portal本次连接失败。未收到HTTP 404。HTTP 403仅说明程序请求受限，不能据此声称目标内容已核对；HTTP 200也不表示办理细则已逐条验证。公开导航中的受限入口保留原链接，供本人在学校网站核对与登录。

本地证据：.runtime/directory-research/coverage.json、link-check.json；界面证据.runtime/campus-guide/verification.json及手机、宿舍、联系、桌面与320px窄屏截图。导航目录可能包含旧表格或不同学年内容，目录不把这些日期转写成当前截止时间。

## 维护边界

这是一份按已查阅学校公开目录整理的校园指南，不声称已收齐全网所有页面、历史新闻或登录后的内部资料。宿舍内部人员位置、私人电话、本人课表和学校登录数据不混入公开名录。平台已发布校园知识独立显示并沿用原权限。

新增资料先核对学校来源，按稳定ID查重并填写分类、来源和日期；无法验证的细则留空或只保留目录入口。更新后运行campusGuide与campus-ai测试，确认网页、搜索和AI使用同一份资料。
