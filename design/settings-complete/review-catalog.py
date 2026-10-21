# Reviewed product terminology and interface copy. This file is an input to the saved catalogue.
from pathlib import Path
import json,re
pairs='''
会同里|Huitongli
BNBU CAMPUS · 会同里|BNBU CAMPUS · Huitongli
首页|Home
发现|Discover
校园|Campus
我的|Profile
运动|Sports
设置|Settings
日程|Schedule
会话|Chats
消息|Messages
通知|Notifications
活动|Activities
社区|Community
社团组织|Organizations
校园社区|Community
找搭子|Find teammates
校友同行|Alumni
校园探索|Explore campus
校园 AI|Campus AI
Coffee Chat|Coffee Chat
会话列表|Conversations
会话记录|Conversation history
选择一个会话|Choose a conversation
返回会话列表|Back to conversations
没有会话|No conversations
还没有会话|No conversations yet
消息与通知|Messages & notifications
通知中心|Notifications
通知与账号偏好|Notifications and account preferences
通知，暂无未读|No unread notifications
通知状态暂不可用|Notification status unavailable
通知筛选|Filter notifications
返回我的|Back to profile
返回找搭子|Back to teammates
返回运动|Back to workout
返回首页|Back to home
返回校园|Back to campus
返回校园服务|Back to campus services
返回活动|Back to activities
返回老师列表|Back to teachers
返回校友列表|Back to alumni
返回登录|Back to sign-in
返回|Back
关闭|Close
取消|Cancel
保存|Save
完成|Done
修改|Edit
添加|Add
删除|Delete
确认|Confirm
继续|Continue
返回设置|Back to settings
我的导航|Navigation
新版主导航|Main navigation
手机主导航|Mobile navigation
校园生活，随时相伴|Campus life, always connected
侧栏设置|Sidebar settings
侧栏中显示|Show in sidebar
侧栏显示顺序|Sidebar order
保存侧栏|Save sidebar
功能入口|Shortcuts
可添加的校园功能|Available campus shortcuts
打开导航|Open navigation
关闭导航|Close navigation
字体与许可|Fonts & licenses
个人设置|Personal settings
进入设置|Open settings
打开课表窗口|Open timetable
关闭课表窗口|Close timetable
个人资料|Profile
个人介绍|About me
个人认证|My certifications
个人推荐|Recommended
管理资料|Edit profile
保存资料|Save profile
姓名|Name
昵称|Nickname
邮箱|Email
学号|Student ID
完整学号|Full student ID
学校登记姓名|Registered school name
学院|School
专业|Major
身份|Identity
身份认证|Identity verification
身份已核验|Identity verified
身份已撤销|Identity revoked
学生|Student
学生本人|Student
学生身份|Student identity
学生身份核验|Verify student identity
教师|Teacher
老师|Teacher
管理员账号|Administrator account
管理|Administration
认证审核|Certification review
认证申请|Certification request
认证类型|Certification type
认证审核中|Certification pending
认证待审|Certification pending
认证审核待办|Pending certifications
审核状态|Review status
审核备注：|Review note:
审核记录：|Review history:
审核说明：|Review note:
审核队列读取失败。|Could not load the review queue. Please retry.
通过审核|Approve
通过校友认证|Verify alumni status
通过|Approve
驳回|Reject
已拒绝|Rejected
申请已通过|Application approved
申请已驳回|Application rejected
申请未通过|Application not approved
申请待处理|Application pending
待审核|Pending review
待处理|Pending
待核实|Needs verification
未核实|Unverified
已授权学生资料|Authorized student information
尚无认证记录|No certifications yet
以本人实际授权为准|Subject to your current authorization
以账号授权为准|Subject to account authorization
认证队列已处理完|No certifications awaiting review
内容审核待办|Content awaiting review
内容待审|Content awaiting review
内容队列已处理完|No content awaiting review
内容审核|Content review
内容类型|Content type
内容分类|Content category
内容|Content
正文|Body
原帖子|Original post
原帖正文不可用。|Original post content is unavailable.
社区内容|Community content
社区内容管理|Community moderation
社区屏蔽词|Community filters
词库|Word filters
词汇|Keyword
保存词汇|Save keyword
修改词汇|Edit keyword
运营工作台|Operations
运营总览|Operations overview
待办总览|Overview
处理历史|Action history
处理原因|Reason
处理状态|Status
处理图片中…|Processing image…
处理中…|Processing…
启用|Enable
启用中|Enabled
停用|Disable
已停用|Disabled
全部|All
不限|Any
不限筛选|Any
全部主办方|All hosts
全部地点|All locations
全部时间|Any time
全部活动|All activities
全部状态|All statuses
全部类型|All types
全部课程|All courses
全部关系|All relationships
全部日程|All schedules
类型|Type
状态|Status
状态未提供|Status unavailable
已删除|Deleted
已下架|Hidden
已发布|Published
展示中|Visible
已展示|Shown
结束展示|Hide
重新展示|Show again
下架|Hide
下架活动|Hide activity
确认删除帖子|Delete this post?
发布|Publish
发布帖子|Publish post
发布社区帖子|Publish community post
发布活动|Publish activity
发起校园活动|Create a campus activity
学校活动发布|Publish school activity
发布与管理我的活动|Publish and manage my activities
活动名称|Activity name
活动介绍|About this activity
活动信息|Activity information
活动分类|Activity category
活动类别|Activity category
活动类型|Activity type
活动状态|Activity status
活动记录|Activity history
活动详情|Activity details
活动资料|Activity information
活动封面|Activity cover
活动地点|Location
活动时间|Time
活动排序|Sort activities
活动日程|Activity schedule
活动楼栋|Campus building
活动安排与参与记录|Activities and participation history
浏览全部活动|Browse all activities
参与活动|Participating activities
参与队伍|My teams
参与条件：|Participation requirements:
主办方|Host
地点|Location
地点名称或地址|Place name or address
地点待商定|Location to be arranged
地点待确认|Location to be confirmed
地点未识别|Location not recognized
时间|Time
时间待商定|Time to be arranged
开始时间|Start time
结束时间|End time
约定时间|Scheduled time
人数|People
人数上限|Capacity
人|people
位老师|teachers
位搭子|teammates
门|courses
天|days
条|items
项|items
小时|hours
分钟|min
个会话|conversations
个名额|places
个组织|organizations
个结果|results
个连接|connections
个节点 ·|nodes ·
篇|posts
届|graduating class
届 ·|graduating class ·
元，可留空|CNY, optional
至|to
与|and
近|Last
第|No.
一|Mon
二|Tue
三|Wed
四|Thu
五|Fri
六|Sat
日|Sun
一二三四五六日|MTWTFSS
今天|Today
今日安排|Today's schedule
今日摘要|Today at a glance
今日日程|Today's schedule
下一项安排|Up next
下午好|Good afternoon
早上好|Good morning
中午好|Good afternoon
晚上好|Good evening
下一步|Next
下一页|Next page
上一页|Previous page
下一周|Next week
上一周|Previous week
下周|Next week
回到今天|Today
周日历|Weekly calendar
一周课程|Weekly timetable
课表|Timetable
完整课表|Full timetable
还没有个人课表|No timetable yet
导入课表|Import timetable
导入我的课表|Import my timetable
上传课表照片|Upload timetable photo
选择课表照片|Choose timetable photo
上传截图|Upload screenshot
上传自己的图片|Upload your own image
上传照片或课表截图|Upload a photo or timetable screenshot
识别课程信息|Recognize timetable
识别失败，请重试。|Recognition failed. Please retry.
取消识别|Cancel recognition
保存修正|Save corrections
导出摘要|Export summary
重新导入|Import again
课程、活动与行程|Classes, activities and plans
课程名称|Course name
课程编号|Course code
课程详情|Course details
课程状态|Course status
课程|Courses
筛选课程|Filter courses
试试其他课程名称|Try another course name
周次未识别|Week range not recognized
周次未提供|Week range unavailable
周次待核对|Check week range
上课星期|Day of week
上课地点|Classroom
上课周次|Week range
选择星期|Choose a day
选择课程星期|Choose a class day
没有匹配的课程|No matching courses
课程信息已更新。|Course information updated.
课程组队|Course project team
会同里校园生活|Huitongli campus life
丰富此刻|Make the most of now
每一种可能|Every possibility
让校园生活|Make campus life
发现校园里的|Discover campus
发现校园的更多可能|Explore more of campus
精彩活动与有趣的人|Great activities. Interesting people.
为你推荐|For you
你可能感兴趣的组织|Organizations you may like
一起，让校园更有意思|Make campus more interesting, together
校园新鲜事|What's happening
校园随手可达|Campus shortcuts
校园里的声音|Campus voices
同学们正在发生什么|What's happening around campus
遇见同好|Meet your people
认识校园里的同行者|Meet your campus community
清晰连接校园生活|Connect with campus life
让校园故事被看见|Share your campus story
分享你眼中的校园|Share your view of campus
分享见闻，交流想法|Share experiences and ideas
一起学习、运动与探索|Learn, move and explore together
在校园，|On campus,
在这里，|Here,
从这里开始。|Start here.
遇见更大的自己。|Discover more of yourself.
去校园走走|Explore campus
去看看|Explore
去登录|Sign in
去找搭子|Find teammates
同学|Student
其他同学|Other students
校园窗口|Campus window
个人主页校园封面|Profile campus cover
上一张校园照片|Previous campus photo
下一张校园照片|Next campus photo
上一张图片|Previous image
下一张图片|Next image
傍晚校园|Campus at dusk
傍晚的校园|Campus at dusk
夜间步道|Night walkway
夜色|Night
夕阳|Sunset
封面暂不可用|Cover unavailable
默认封面|Default cover
选择主页封面|Choose a profile cover
选择个人主页背景|Choose a profile background
移除封面|Remove cover
图片读取失败|Could not load image
放大|Zoom in
缩小|Zoom out
适应画布|Fit to view
重置布局|Reset layout
重置关系图|Reset network
关系|Relationships
关系网络|Connections
历史关系|Past connections
关系类型|Relationship type
关系图图例|Network legend
关系图节点类型|Network node types
关系图视图控制|Network controls
节点类型|Node types
共同成员，非好友|Shared membership, not friendships
聚焦当前连接|Focus on selected connection
展开关联成员|Show connected members
缩小关系图|Zoom out of network
连接列表与键盘操作|Connections and keyboard controls
示例关系图|Example network
退出示例|Exit example
关注|Follow
已关注|Following
关注了|Followed
关注组织|Follow organization
关注校友|Follow alumni
取消关注|Unfollow
只看已关注|Following only
收藏|Save
我的收藏|Saved
取消收藏|Unsave
还没有收藏|Nothing saved yet
点赞|Like
取消点赞|Unlike
评论|Comments
评论 ·|Comments ·
评论内容|Comment
写下你的评论|Write a comment
相邻评论：|Nearby comment:
公开帖子|Public posts
社区帖子|Community posts
社区话题|Community topics
社区热点榜|Trending in community
热点榜|Trending
热度榜|Trending
发现热度榜|Trending
热点榜话题|Trending topics
发现分类|Discover categories
精选视图|Featured view
列表视图|List view
综合|All
话题标题|Topic title
分享日常|Share a moment
创新创业|Entrepreneurship
学习|Study
生活|Life
娱乐|Entertainment
娱乐活动|Entertainment
升学|Further study
就业|Careers
讨论|Discussion
互助|Help
讲座|Talk
运动健身|Sports & fitness
演唱会|Concert
电影|Film
申请交流|Request a conversation
交流|Conversation
可交流|Available
交流方向|Topics
可交流话题|Conversation topics
可交流：|Available topics:
交流通知|Conversation updates
交流时段已开放。|Conversation slots are now available.
了解|Learn more
了解校友|View alumni
了解经历与交流机会|Explore experience and conversation opportunities
交流主题与问题|Topics and questions
交流主题（用顿号分隔）|Topics (separate with commas)
和老师聊聊|Talk with a teacher
聊聊未来|Talk about what's next
聊天区域|Chat area
聊点什么…|Write a message…
发送消息|Send message
发送中…|Sending…
消息内容|Message
消息分类|Message category
选择老师，预约交流|Choose a teacher and book a conversation
选择预约时间|Choose an appointment time
选择日期与具体时间|Choose date and time
请先选择一个时段|Choose a time slot first
确认预约|Confirm appointment
取消预约|Cancel appointment
保留原时间|Keep original time
已回应改期|Reschedule request answered
婉拒|Decline
同意|Accept
申请人|Applicant
申请人：|Applicant:
申请说明|Application note
申请状态：|Application status:
尚未收到交流申请。|No conversation requests yet.
还没有交流申请|No conversation requests yet
还没有同学预约|No student appointments yet
等待校友确认|Awaiting alumni confirmation
保存校友资料|Save alumni profile
校友|Alumni
寻找校友|Find alumni
认证校友|Verified alumni
经验发现|Explore experience
分享我的经历|Share my experience
发布经验|Share experience
经验分享已发布。|Experience published.
毕业年份|Graduation year
毕业身份核验说明|Graduation verification note
原专业|Previous major
城市|City
全国|All regions
大一|Year 1
大二|Year 2
大三|Year 3
大四|Year 4
主办方：|Host:
发件人|Sender
发件人：|Sender:
学校邮件|School email
邮件转活动|Mail to activities
邮件主题|Email subject
主题：|Subject:
邮件原文|Original email
邮件原文与识别依据|Email and extraction evidence
邮件标识|Email identifier
邮件附件封面预览|Attachment cover preview
邮件附件：|Email attachments:
演示学校邮件|Demo school email
填入示例邮件|Load example email
导入邮件内容|Import email content
活动识别记录|Extracted activities
还没有活动识别记录|No extracted activities yet
资料来源|Source
依据标识：|Source identifier:
来源：|Source:
准备图片|Preparing image
添加图片|Add image
添加照片|Add photo
选择头像|Choose avatar
填写你的昵称|Enter your nickname
至少 8 位字符|At least 8 characters
密码|Password
确认密码|Confirm password
确认新密码|Confirm new password
再次输入密码|Enter password again
请输入密码|Enter password
请输入密码。|Enter password.
邮箱地址|Email address
邮箱或管理账号|Email or admin account
邮箱或管理登录账号|Email or admin sign-in name
邮箱验证码|Email verification code
六位验证码|6-digit verification code
填写验证码|Enter verification code
输入邮件验证码|Enter email verification code
发送验证码|Send code
重新获取验证码|Resend code
获取验证码|Get code
发送找回验证码|Send reset code
登录|Sign in
登录会同里|Sign in to Huitongli
注册会同里|Join Huitongli
立即注册|Create account
完成注册|Create account
设置密码|Set password
设置新密码|Set new password
忘记密码|Forgot password
还没有账号？|No account yet?
切换账号|Switch account
注册进度|Registration progress
刷新|Refresh
重新加载|Reload
重新读取|Retry
读取中|Loading
正在连接服务|Connecting…
服务暂不可用|Service unavailable
资料暂不可读取|Profile unavailable
内容暂不可见|Content unavailable
还没有活动安排|No activities scheduled yet
安排暂时无法读取|Schedule unavailable
没有匹配的活动|No matching activities
没有匹配的组织|No matching organizations
没有匹配的老师|No matching teachers
没有匹配的队伍|No matching teams
目前没有公开帖子|No public posts yet
稍后再来看看。|Check back later.
请稍候…|Please wait…
可留空|Optional
请选择|Choose
加载更多帖子|Load more posts
加载更多评论|Load more comments
加载更多队伍|Load more teams
保存中…|Saving…
保存失败|Could not save
筛选|Filter
筛选条件|Filters
清除筛选|Clear filters
清除全部|Clear all
清除全部筛选|Clear all filters
重置活动筛选|Reset activity filters
清除搜索|Clear search
清除搜索词|Clear search
清除搜索并关闭|Clear search and close
清除关系搜索|Clear network search
已应用的筛选条件|Applied filters
隐藏|Hide
展开|Expand
固定|Pin
取消固定|Unpin
备注|Notes
补充说明|Additional notes
原因|Reason
取消修改|Cancel edits
确认提交|Confirm submission
确认放弃|Discard changes
继续保留|Keep changes
未读|Unread
已读|Read
查看详情|View details
学期进度|Semester progress
本学期|This semester
体育进度|Sports progress
体育平台|Sports platform
体育平台只读数据|Read-only sports data
体育打卡|Sports check-in
体育打卡进度|Sports progress
体育打卡进度看板|Sports progress dashboard
体育课程|Sports courses
体育课程只读看板|Read-only sports dashboard
体育课程信息待同步|Course information awaiting sync
体育数据暂不可用|Sports data unavailable
体育进度暂不可用|Sports progress unavailable
已完成学时|Completed hours
计入学时|Credited hours
不计入真实学时|Not credited as real sports hours
还需|Remaining
尚未入班|Not enrolled in a class
尚无可用的确认进度|No confirmed progress available
进度待同步|Awaiting sync
进度暂不可用|Progress unavailable
等待同步|Awaiting sync
同步|Sync
同步中|Syncing
同步体育进度|Sync sports progress
刷新体育数据|Refresh sports data
前往体育平台|Open sports platform
进入体育平台|Open sports platform
运动打卡|Sports check-in
运动打卡模拟|Workout simulation
会同里运动打卡模拟|Huitongli workout simulation
运动说明|Workout information
运动项目|Sport
运动种类|Sport
运动地点|Workout location
运动时长|Workout duration
运动计时|Workout timer
运动凭证|Workout evidence
选择照片或视频凭证|Choose photo or video evidence
运动记录|Workout records
运动记录来源|Record source
运动记录详情|Workout details
已同步的运动|Synced workouts
运动进行中|Workout in progress
运动快捷入口|Sports shortcuts
运动页面工具|Sports tools
开始运动|Start workout
结束运动|End workout
继续当前运动|Resume workout
进入打卡|Start workout
使用演示凭证|Use example evidence
准备好后开始运动|Start when you're ready
01 选择运动|01 Choose a sport
02 记录过程|02 Track your workout
03 提交凭证|03 Add evidence
记录时间|Recorded at
记录已生成|Record created
运动提交趋势|Workout submission trend
运动数据总览|Workout overview
记录状态分布|Record status breakdown
记录状态筛选|Filter record status
记录统计未提供|Record statistics unavailable
状态历史（|Status history (
已完成 (|Completed (
进行中 (|In progress (
健身|Fitness
健身训练|Fitness training
跑步|Running
游泳|Swimming
篮球|Basketball
足球|Football
网球|Tennis
羽毛球|Badminton
球类运动|Ball sports
一起运动|Work out together
一起锻炼|Train together
动起来，找回好状态|Move more. Feel better.
让每一次运动，|Make every workout
都有迹可循。|part of your story.
示例课程|Example course
课程要求|Course requirements
互动校园地图|Interactive campus map
互动地图导览|Interactive map guide
地图中心|Map center
定位当前位置|Locate current position
地图服务加载失败|Could not load map
三维地图暂时无法显示|3D map unavailable
展开三维地图|Expand 3D map
关闭地图|Close map
缩小地图|Zoom out of map
选择楼栋|Choose a building
选择校内楼栋|Choose a campus building
选择校园楼栋|Choose a campus building
选择校内地点|Choose a campus location
确认这栋楼|Use this building
也可选择楼栋查看|Or choose a building to explore
详细集合点（可选）|Exact meeting point (optional)
地点或交流方式|Location or meeting method
BNBU 3D Model · S1.214 · 建筑体量含估算，位置以现场为准|BNBU 3D Model · S1.214 · Building sizes are estimated. Check locations on site.
BNBU 3D Model · S1.214 · 建筑体量含估算，具体集合点以活动说明为准|BNBU 3D Model · S1.214 · Building sizes are estimated. See activity details for the meeting point.
一起出发|Travel together
出发地|Departure
目的地|Destination
出发时间|Departure time
车型|Vehicle type
自驾|Private car
出租车|Taxi
网约车|Ride-hailing
安静出行|Quiet trip
同行偏好|Travel preferences
同路出发|Travel together
女优先|Women preferred
男优先|Men preferred
发起新队伍|Create a team
发起组队|Create a team
管理组队|Manage teams
管理全部|Manage all
组队与申请|Teams & applications
近期组队|Recent teams
已完成的队伍|Completed teams
正在进行的队伍|Active teams
已加入|Joined
已加入成员|Members
已退出|Left
结束组队|End team
继续组队|Keep team open
组队体验评价|Team experience feedback
评价搭子|Rate teammate
评价组队伙伴|Rate teammates
合作愉快|Great collaboration
守时可靠|Punctual and reliable
沟通顺畅|Clear communication
认真负责|Responsible
专业或学院偏好|Major or school preference
能力或角色要求|Skills or role requirements
一句话描述|Short description
寻找课程项目队友|Find project teammates
协作方式和每周节奏|Collaboration and weekly schedule
确认结束并评价|End team and leave feedback
还没有申请记录|No applications yet
讨论地点（可选）|Meeting place (optional)
原专业|Previous major
学习搭子|Study partner
自述经历：|Experience:
人文社科学院|School of Humanities and Social Sciences
工商管理学院|School of Business and Management
理工科技学院|School of Science and Technology
通识教育学院|School of General Education
官方机构|Official organizations
组织分类|Organization categories
发现组织|Explore organizations
学院或组织名称|School or organization name
其他|Other
没有|None
尚无|None yet
奶蛙|Campus companion
奶娃|Campus companion
选择奶蛙的形象|Choose your companion
Enter 发送 · Shift + Enter 换行|Enter to send · Shift + Enter for a new line
JPG / PNG / WebP / MP4 / WebM · 单个 ≤30MB · 最多6个|JPG / PNG / WebP / MP4 / WebM · Up to 30 MB each · Max 6 files
JPG、PNG、WebP，最大 5 MB；头像居中裁剪。|JPG, PNG or WebP, up to 5 MB. Avatars are center-cropped.
“—”表示尚未提供，0 表示当前统计为零。已确认进度、有效记录与提交记录分别计算。|“—” means unavailable; 0 is a confirmed zero. Confirmed progress, valid records and submitted records are counted separately.
'''
p=Path('src/v2/uiEnglish.json');d=json.loads(p.read_text(encoding='utf-8'))
for line in pairs.strip().splitlines():
 k,v=line.split('|',1);d[k]=v
# Interpolation is reviewed explicitly; placeholders must never be translated or dropped.
patterns={
'{0} / 5 分':'{0} / 5','{0} · {1}':'{0} · {1}','{0} · {1} 发起':'{0} · Hosted by {1}','{0} 个启用 · {1} 个总计':'{0} enabled · {1} total','{0} 个结果':'{0} results','{0} 人':'{0} people','{0} 人等待回复':'{0} awaiting a reply','{0} 份待审核':'{0} awaiting review','{0} 届 · {1} · {2}':'Class of {0} · {1} · {2}','{0} 条':'{0} items','{0} 条匹配':'{0} matches','{0} 条已展示':'{0} shown','{0} 条符合条件的内容':'{0} matching items','{0} 条符合条件的申请':'{0} matching applications','{0} 条结果':'{0} results','{0} 条记录':'{0} records','{0} 条课程安排':'{0} class entries','{0} 节':'{0} classes','{0}s 后重发':'Resend in {0}s','{0}{1}':'{0}{1}','{0}{1} 个正在招募的队伍':'{0}{1} teams recruiting','{0}候选地点':'{0} candidate location','{0}封面':'{0} cover','{0}暂无课程记录':'{0} has no course records','{0}活动：{1}':'{0} activity: {1}','{0}的消息':'Messages from {0}','{0}筛选条件':'{0} filter','{0}经验':'{0} experience','{0}认证 · {1}':'{0} certification · {1}','{0}，当前 {1} 个赞':'{0}, {1} likes','{0}：{1}':'{0}: {1}','{0}：{1} 条提交 · {2} 条当前有效':'{0}: {1} submitted · {2} currently valid','上移{0}':'Move {0} up','下移{0}':'Move {0} down','主办方：{0}':'Host: {0}','共 {0} 条记录，有效 {1} 条':'{0} records · {1} valid','已发布 {0} · 待核实 {1} · 已下架 {2}':'{0} published · {1} to verify · {2} hidden','已完成 {0}%':'{0}% complete','已导入 {0} 条课程安排':'Imported {0} class entries','已标记：{0} · 楼栋级定位':'Marked: {0} · Building-level location','已经看完当前{0}':'You have reached the end of {0}','帖子图片 {0}':'Post image {0}','待发布图片 {0}':'Image {0} to publish','按提交日期统计：最近 {0} 天共 {1} 条记录':'By submission date: {1} records in the last {0} days','显示第 {0} 张校园照片':'Show campus photo {0}','来源：{0} · 更新于 {1}':'Source: {0} · Updated {1}','查看{0}的图片':'View image from {0}','查看帖子：{0}':'View post: {0}','查看活动：{0}':'View activity: {0}','正在查看：{0}':'Viewing: {0}','清除{0}':'Clear {0}','移除{0}':'Remove {0}','移除第 {0} 张图片':'Remove image {0}','第 {0} 张，共 {1} 张校园照片':'Campus photo {0} of {1}','评论：{0}':'Comment: {0}','通知 · {0} 条未读':'Notifications · {0} unread','通知{0}':'Notifications{0}','通知，{0} 条未读':'Notifications, {0} unread','长按拖动排序：{0}':'Hold and drag to reorder: {0}','隐藏{0}':'Hide {0}'
}
d.update(patterns)
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Reviewed',len(pairs.strip().splitlines())+len(patterns),'entries; total',len(d))
