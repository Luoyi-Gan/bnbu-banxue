import type {
  Alumni,
  CoffeeSlot,
  CheckInRecord,
  Event,
  Host,
  JourneyEntry,
  Notification,
  Organization,
  PartnerRequest,
  Post,
  Teacher,
} from '../types'

const buildEvent = (
  event: Pick<Event, 'id' | 'title' | 'subtitle' | 'cover' | 'category' | 'dateLabel' | 'timeLabel' | 'location' | 'hostId' | 'attendeeCount' | 'temporal'> &
    Partial<Event>,
): Event => ({
  slug: event.id,
  description: 'Meet curious people, share an experience, and let one campus moment lead to the next.',
  tags: [event.category, 'Campus Life'],
  startAt: '2026-10-18T19:00:00+08:00',
  endAt: '2026-10-18T21:00:00+08:00',
  capacity: 120,
  registrationMode: 'open',
  waitlistEnabled: true,
  visibility: 'public',
  featured: false,
  status: 'upcoming',
  eventType: 'standard',
  agenda: ['Welcome & introductions', 'Main experience', 'Open connection time'],
  ...event,
})

export const events: Event[] = [
  buildEvent({
    id: 'ai-agent-workshop',
    title: 'AI Agent Workshop',
    subtitle: 'Build Your First AI Agent',
    cover: 'cover-ai',
    category: 'Workshop',
    dateLabel: 'OCT 18',
    timeLabel: 'Wed · 7:30 PM',
    location: 'T2-202',
    hostId: 'ai-club',
    attendeeCount: 86,
    temporal: 'This Week',
    featured: true,
    eventType: 'workshop',
    description: 'A practical studio for turning an idea into a working AI agent. Bring a laptop; no prior agent-building experience is needed.',
    tags: ['AI', 'Build Together', 'Beginner Friendly'],
    agenda: ['19:30 — Welcome and idea sprint', '19:50 — Agent building lab', '20:45 — Demo circle and connections'],
  }),
  buildEvent({
    id: 'campus-night-run',
    title: 'Campus Night Run',
    subtitle: 'Five kilometers, one campus rhythm',
    cover: 'cover-run',
    category: '运动',
    dateLabel: 'TODAY',
    timeLabel: '7:00 PM',
    location: 'BNBU Sports Field',
    hostId: 'running-club',
    attendeeCount: 28,
    temporal: 'Today',
    status: 'live',
    eventType: 'sports',
    description: 'An easy-paced 5 km loop for every level. We warm up together, run in small pace groups, and finish with a stretch.',
    tags: ['Running', '5K', 'All Levels'],
    agenda: ['18:50 — Meet by the blue track gate', '19:00 — Group warm-up', '19:10 — Pace groups depart', '20:00 — Cool-down'],
  }),
  buildEvent({ id: 'english-corner', title: 'English Corner', subtitle: 'Stories that travel', cover: 'cover-english', category: '英语', dateLabel: 'TODAY', timeLabel: '8:00 PM', location: 'T4-105', hostId: 'english-club', attendeeCount: 16, temporal: 'Today' }),
  buildEvent({ id: 'badminton-night', title: 'Badminton Night', subtitle: 'Open courts, friendly rallies', cover: 'cover-badminton', category: '运动', dateLabel: 'OCT 19', timeLabel: '7:00 PM', location: 'Sports Center Court 3', hostId: 'badminton-team', attendeeCount: 24, capacity: 24, temporal: 'Tomorrow', eventType: 'sports' }),
  buildEvent({ id: 'board-game-night', title: 'Board Game Night', subtitle: 'Strategy, stories, and new teammates', cover: 'cover-games', category: '社团', dateLabel: 'TODAY', timeLabel: '8:30 PM', location: 'Student Commons', hostId: 'student-union', attendeeCount: 32, temporal: 'Today' }),
  buildEvent({ id: 'startup-meetup', title: 'Startup Meetup', subtitle: 'From campus problem to first prototype', cover: 'cover-startup', category: '创业', dateLabel: 'OCT 20', timeLabel: '6:30 PM', location: 'Innovation Hub', hostId: 'innovation-center', attendeeCount: 64, temporal: 'This Week', registrationMode: 'approval' }),
  buildEvent({ id: 'marketing-case-night', title: 'Marketing Case Night', subtitle: 'Decode a brand in 90 minutes', cover: 'cover-marketing', category: '比赛', dateLabel: 'OCT 21', timeLabel: '7:00 PM', location: 'T4-105', hostId: 'marketing-society', attendeeCount: 18, temporal: 'This Week', registrationMode: 'approval', eventType: 'competition' }),
  buildEvent({ id: 'alumni-founder-talk', title: 'Founder Stories: From BNBU to Day One', subtitle: 'An honest conversation with Lin Hao', cover: 'cover-alumni', category: '校友', dateLabel: 'OCT 22', timeLabel: '4:00 PM', location: 'T2 Auditorium', hostId: 'alumni-network', attendeeCount: 112, temporal: 'Weekend', eventType: 'alumni' }),
  buildEvent({ id: 'music-night', title: 'Courtyard Music Night', subtitle: 'Small stage, big campus voices', cover: 'cover-music', category: '社团', dateLabel: 'OCT 22', timeLabel: '7:30 PM', location: 'South Courtyard', hostId: 'student-union', attendeeCount: 148, capacity: null, temporal: 'Weekend' }),
  buildEvent({ id: 'photography-walk', title: 'Golden Hour Photo Walk', subtitle: 'Notice the campus differently', cover: 'cover-photo', category: '社团', dateLabel: 'OCT 23', timeLabel: '5:00 PM', location: 'Library Steps', hostId: 'student-union', attendeeCount: 21, temporal: 'Weekend' }),
  buildEvent({ id: 'sustainability-lab', title: 'Campus Sustainability Lab', subtitle: 'Design a lower-waste week', cover: 'cover-green', category: 'Workshop', dateLabel: 'OCT 24', timeLabel: '2:00 PM', location: 'T3-301', hostId: 'innovation-center', attendeeCount: 38, temporal: 'Weekend', eventType: 'workshop' }),
  buildEvent({ id: 'product-design-jam', title: 'Product Design Jam', subtitle: 'Prototype a kinder campus service', cover: 'cover-design', category: 'Workshop', dateLabel: 'OCT 25', timeLabel: '10:00 AM', location: 'Innovation Hub', hostId: 'ai-club', attendeeCount: 44, temporal: 'Next Week', eventType: 'workshop' }),
  buildEvent({ id: 'basketball-open', title: '3×3 Basketball Open', subtitle: 'Build a team on the court', cover: 'cover-basketball', category: '比赛', dateLabel: 'OCT 25', timeLabel: '4:30 PM', location: 'Outdoor Court', hostId: 'badminton-team', attendeeCount: 36, capacity: 40, temporal: 'Next Week', eventType: 'competition' }),
  buildEvent({ id: 'debate-night', title: 'Campus Debate Night', subtitle: 'Technology, trust, and tomorrow', cover: 'cover-debate', category: '学术', dateLabel: 'OCT 26', timeLabel: '7:00 PM', location: 'T5-204', hostId: 'english-club', attendeeCount: 55, temporal: 'Next Week' }),
  buildEvent({ id: 'volunteer-day', title: 'Community Volunteer Day', subtitle: 'One morning, practical impact', cover: 'cover-volunteer', category: '社团', dateLabel: 'OCT 27', timeLabel: '9:00 AM', location: 'Campus North Gate', hostId: 'student-union', attendeeCount: 72, temporal: 'Next Week' }),
  buildEvent({ id: 'career-stories', title: 'Product Career Stories', subtitle: 'Paths are made, not found', cover: 'cover-career', category: '校友', dateLabel: 'OCT 28', timeLabel: '6:00 PM', location: 'T4 Coffee Space', hostId: 'alumni-network', attendeeCount: 30, temporal: 'Next Week', eventType: 'alumni' }),
  buildEvent({ id: 'makers-market', title: 'Student Makers Market', subtitle: 'Ideas you can hold', cover: 'cover-makers', category: '创业', dateLabel: 'OCT 29', timeLabel: '1:00 PM', location: 'Central Lawn', hostId: 'innovation-center', attendeeCount: 96, capacity: null, temporal: 'Next Week' }),
  buildEvent({ id: 'language-exchange', title: 'Language Exchange Picnic', subtitle: 'Bring a phrase, leave with a friend', cover: 'cover-language', category: '英语', dateLabel: 'OCT 30', timeLabel: '3:30 PM', location: 'Lake Lawn', hostId: 'english-club', attendeeCount: 47, temporal: 'Next Week' }),
]

export const hosts: Host[] = [
  { id: 'ai-club', name: 'BNBU AI Club', shortName: 'AI', type: 'organization', verified: true, description: 'A student community for building useful, responsible AI together.', followers: 1284, tags: ['AI', 'Workshops', 'Builders'], color: '#155eef', members: ['Ming Li', 'Jia Wang', 'Yuqing Chen', 'Sophie Lau'] },
  { id: 'running-club', name: 'Running Club', shortName: 'RC', type: 'team', verified: true, description: 'Social runs, steady progress, and a welcoming pace group for everyone.', followers: 862, tags: ['Running', 'Wellbeing', 'Outdoors'], color: '#ea580c', members: ['Jun He', 'Yuqing Chen', 'Tina Zhou'] },
  { id: 'english-club', name: 'English Club', shortName: 'EC', type: 'organization', verified: true, description: 'A relaxed place to practise, listen, debate, and connect across cultures.', followers: 711, tags: ['English', 'Culture', 'Speaking'], color: '#7c3aed', members: ['Amy Chen', 'Leo Zhang', 'Mia Xu'] },
  { id: 'badminton-team', name: 'Badminton Team', shortName: 'BT', type: 'team', verified: true, description: 'BNBU varsity and open-play badminton community.', followers: 946, tags: ['Badminton', 'Training', 'Team'], color: '#059669', members: ['Yuqing Chen', 'Jia Wang', 'Han Liu'] },
  { id: 'innovation-center', name: 'Innovation & Entrepreneurship Center', shortName: 'IE', type: 'department', verified: true, description: 'Helping campus ideas become thoughtful experiments and real ventures.', followers: 1532, tags: ['Startup', 'Design', 'Mentoring'], color: '#0f766e', members: ['Professor Wang', 'Lin Hao', 'Grace Wu'] },
  { id: 'marketing-society', name: 'Marketing Society', shortName: 'MS', type: 'organization', verified: true, description: 'Cases, campaigns, and conversations for curious future marketers.', followers: 634, tags: ['Marketing', 'Cases', 'Careers'], color: '#db2777', members: ['Yuqing Chen', 'Nina Zhao', 'Sam Qiu'] },
  { id: 'student-union', name: 'BNBU Student Union', shortName: 'SU', type: 'organization', verified: true, description: 'Student-led programs that make campus life more connected.', followers: 2410, tags: ['Campus', 'Culture', 'Service'], color: '#2563eb', members: ['Alex Xu', 'Tina Zhou', 'Ray Li'] },
  { id: 'alumni-network', name: 'BNBU Alumni Network', shortName: 'AN', type: 'alumni', verified: true, description: 'Bringing alumni stories, mentorship, and new opportunities back to campus.', followers: 1870, tags: ['Alumni', 'Mentorship', 'Careers'], color: '#a16207', members: ['Lin Hao', 'Zhou Yi', 'Chen Rui'] },
]

export const teachers: Teacher[] = [
  { id: 'prof-zhang', name: '张老师', englishName: 'Professor Zhang', title: 'Associate Professor', department: '工商管理学院', bio: 'Professor Zhang studies how people make choices and how brands earn trust. Her Coffee Chats are practical, warm, and student-led.', fields: ['Marketing', 'Consumer Behavior'], topics: ['市场营销', '学业规划', '创业', '研究方向'], location: 'T4 Coffee Space', availability: 'Wednesday 15:00–17:00', color: '#d97706' },
  { id: 'prof-li', name: '李老师', englishName: 'Professor Li', title: 'Assistant Professor', department: '理工科技学院', bio: 'Works on human-centered AI systems and learning technologies.', fields: ['Computer Science', 'AI'], topics: ['AI 研究', '技术职业', '项目建议'], location: 'T2 Faculty Lounge', availability: 'Friday 14:00–16:00', color: '#2563eb' },
  { id: 'prof-wang', name: '王老师', englishName: 'Professor Wang', title: 'Entrepreneur in Residence', department: '创新创业中心', bio: 'Supports founders through early customer discovery and first experiments.', fields: ['Innovation', 'Entrepreneurship'], topics: ['创业想法', '市场验证', '团队建设'], location: 'Innovation Hub', availability: 'Tuesday 16:00–18:00', color: '#059669' },
  { id: 'prof-chen', name: '陈老师', englishName: 'Professor Chen', title: 'Lecturer', department: '人文社科学院', bio: 'Helps students communicate with clarity across cultures and contexts.', fields: ['Communication', 'Language'], topics: ['英语表达', '演讲', '跨文化交流'], location: 'T5 Commons', availability: 'Thursday 13:00–15:00', color: '#7c3aed' },
  { id: 'prof-zhao', name: '赵老师', englishName: 'Professor Zhao', title: 'Senior Lecturer', department: '通识教育学院', bio: 'Interested in wellbeing, active learning, and sustainable campus life.', fields: ['Wellbeing', 'Education'], topics: ['大学适应', '习惯设计', '体育参与'], location: 'Library Café', availability: 'Monday 10:00–12:00', color: '#ea580c' },
]

export const coffeeSlots: CoffeeSlot[] = [
  { id: 'slot-zhang-1500', teacherId: 'prof-zhang', startAt: '2026-10-21T15:00:00+08:00', endAt: '2026-10-21T15:30:00+08:00', dateLabel: 'Wed · Oct 21', timeLabel: '15:00', capacity: 1, bookingCount: 1, status: 'booked' },
  { id: 'slot-zhang-1530', teacherId: 'prof-zhang', startAt: '2026-10-21T15:30:00+08:00', endAt: '2026-10-21T16:00:00+08:00', dateLabel: 'Wed · Oct 21', timeLabel: '15:30', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-zhang-1600', teacherId: 'prof-zhang', startAt: '2026-10-21T16:00:00+08:00', endAt: '2026-10-21T16:30:00+08:00', dateLabel: 'Wed · Oct 21', timeLabel: '16:00', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-zhang-1630', teacherId: 'prof-zhang', startAt: '2026-10-21T16:30:00+08:00', endAt: '2026-10-21T17:00:00+08:00', dateLabel: 'Wed · Oct 21', timeLabel: '16:30', capacity: 1, bookingCount: 1, status: 'full' },
  { id: 'slot-li-1400', teacherId: 'prof-li', startAt: '2026-10-23T14:00:00+08:00', endAt: '2026-10-23T14:30:00+08:00', dateLabel: 'Fri · Oct 23', timeLabel: '14:00', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-li-1430', teacherId: 'prof-li', startAt: '2026-10-23T14:30:00+08:00', endAt: '2026-10-23T15:00:00+08:00', dateLabel: 'Fri · Oct 23', timeLabel: '14:30', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-wang-1600', teacherId: 'prof-wang', startAt: '2026-10-20T16:00:00+08:00', endAt: '2026-10-20T16:30:00+08:00', dateLabel: 'Tue · Oct 20', timeLabel: '16:00', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-wang-1630', teacherId: 'prof-wang', startAt: '2026-10-20T16:30:00+08:00', endAt: '2026-10-20T17:00:00+08:00', dateLabel: 'Tue · Oct 20', timeLabel: '16:30', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-chen-1300', teacherId: 'prof-chen', startAt: '2026-10-22T13:00:00+08:00', endAt: '2026-10-22T13:30:00+08:00', dateLabel: 'Thu · Oct 22', timeLabel: '13:00', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-chen-1330', teacherId: 'prof-chen', startAt: '2026-10-22T13:30:00+08:00', endAt: '2026-10-22T14:00:00+08:00', dateLabel: 'Thu · Oct 22', timeLabel: '13:30', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-zhao-1000', teacherId: 'prof-zhao', startAt: '2026-10-26T10:00:00+08:00', endAt: '2026-10-26T10:30:00+08:00', dateLabel: 'Mon · Oct 26', timeLabel: '10:00', capacity: 1, bookingCount: 0, status: 'available' },
  { id: 'slot-zhao-1030', teacherId: 'prof-zhao', startAt: '2026-10-26T10:30:00+08:00', endAt: '2026-10-26T11:00:00+08:00', dateLabel: 'Mon · Oct 26', timeLabel: '10:30', capacity: 1, bookingCount: 0, status: 'available' },
]

export const organizations: Organization[] = [
  { id: 'org-ai', hostId: 'ai-club', name: 'BNBU AI Club', category: 'Academic', description: 'Build useful AI projects with an open student community.', memberCount: 186, upcomingEventCount: 3, color: '#155eef', lead: 'Ming Li', roles: ['Organizer', 'Member', 'Advisor'] },
  { id: 'org-running', hostId: 'running-club', name: 'Running Club', category: 'Sports', description: 'Welcoming campus runs for every pace.', memberCount: 142, upcomingEventCount: 2, color: '#ea580c', lead: 'Jun He', roles: ['Captain', 'Organizer', 'Member'] },
  { id: 'org-badminton', hostId: 'badminton-team', name: 'Badminton Team', category: 'Sports', description: 'Training, open court nights, and varsity competition.', memberCount: 68, upcomingEventCount: 2, color: '#059669', lead: 'Jia Wang', roles: ['Captain', 'Member', 'Advisor'] },
  { id: 'org-english', hostId: 'english-club', name: 'English Club', category: 'Culture', description: 'Practice communication through real conversations.', memberCount: 120, upcomingEventCount: 2, color: '#7c3aed', lead: 'Amy Chen', roles: ['Organizer', 'Member'] },
  { id: 'org-marketing', hostId: 'marketing-society', name: 'Marketing Society', category: 'Academic', description: 'Turn class ideas into cases, campaigns, and connections.', memberCount: 94, upcomingEventCount: 1, color: '#db2777', lead: 'Nina Zhao', roles: ['Organizer', 'Member', 'Advisor'] },
  { id: 'org-photo', hostId: 'student-union', name: 'Photography Club', category: 'Interest', description: 'See campus life through shared walks and visual stories.', memberCount: 102, upcomingEventCount: 1, color: '#475569', lead: 'Ray Li', roles: ['Organizer', 'Member'] },
  { id: 'org-union', hostId: 'student-union', name: 'Student Union', category: 'Student Organization', description: 'Student-led service, culture, and campus programs.', memberCount: 215, upcomingEventCount: 4, color: '#2563eb', lead: 'Alex Xu', roles: ['Organizer', 'Member', 'Advisor'] },
  { id: 'org-innovation', hostId: 'innovation-center', name: 'Innovation & Entrepreneurship Center', category: 'Department', description: 'A campus home for experiments, founders, and mentors.', memberCount: 156, upcomingEventCount: 4, color: '#0f766e', lead: 'Professor Wang', roles: ['Organizer', 'Member', 'Advisor'] },
]

export const partners: PartnerRequest[] = [
  { id: 'partner-li', name: '李同学', activity: '羽毛球', level: '中级', time: '今天 20:00–22:00', location: 'BNBU Sports Center', detail: '想打双打，节奏轻松但认真。', spots: '希望找 1–2 人', color: '#059669' },
  { id: 'partner-wang', name: '王同学', activity: '夜跑', level: '5km 慢跑', time: '今晚 19:00', location: 'Sports Field', detail: '跟着 Running Club 一起跑，第一次来也可以。', spots: '还差 1 人', color: '#ea580c' },
  { id: 'partner-zhou', name: '周同学', activity: '英语', level: '日常交流', time: '周四 18:30', location: 'Library Café', detail: '为 English Corner 提前热身。', spots: '希望找 2 人', color: '#7c3aed' },
  { id: 'partner-xu', name: '徐同学', activity: '学习', level: 'Marketing Case', time: '周三 16:00', location: 'T4 Commons', detail: '一起准备 Marketing Case Night。', spots: '希望找 1 人', color: '#db2777' },
  { id: 'partner-he', name: '何同学', activity: '健身', level: '入门', time: '周五 17:00', location: 'Fitness Studio', detail: '45 分钟力量基础训练。', spots: '希望找 1–2 人', color: '#2563eb' },
  { id: 'partner-chen', name: '陈同学', activity: '比赛组队', level: '产品设计', time: '周六 10:00', location: 'Innovation Hub', detail: '组队参加 Product Design Jam。', spots: '还差设计 / 技术各 1 人', color: '#0f766e' },
  { id: 'partner-luo', name: '罗同学', activity: '篮球', level: '休闲', time: '周日 16:30', location: 'Outdoor Court', detail: '3×3 Open 前的轻松练习。', spots: '还差 2 人', color: '#d97706' },
  { id: 'partner-guo', name: '郭同学', activity: '跑步', level: '配速 6:30', time: '下周一 19:00', location: 'Campus Gate', detail: '固定每周一次，欢迎一起坚持。', spots: '开放加入', color: '#ea580c' },
]

export const posts: Post[] = [
  { id: 'post-run', author: '王同学', authorRole: '2026 Cohort', board: 'Sports', content: '有人今晚一起跑步吗？我准备参加 Campus Night Run，想找一个差不多配速的搭子。', relatedLabel: 'Campus Night Run', relatedPath: '/events/campus-night-run', likes: 24, comments: 8, time: '12 min ago' },
  { id: 'post-ai', author: 'Ming Li', authorRole: 'BNBU AI Club', board: 'Study', content: 'AI Workshop 笔记模板已经整理好，第一次做 Agent 的同学可以先看任务拆解部分。', relatedLabel: 'AI Agent Workshop', relatedPath: '/events/ai-agent-workshop', likes: 61, comments: 12, time: '34 min ago' },
  { id: 'post-coffee', author: '刘同学', authorRole: '工商管理学院', board: 'Campus', content: '第一次参加 Coffee Chat，有什么建议？想和老师聊职业方向，但不想把它变成一次面试。', relatedLabel: 'Coffee Chat', relatedPath: '/coffee-chat', likes: 37, comments: 16, time: '1 h ago' },
  { id: 'post-badminton', author: 'Badminton Team', authorRole: 'Verified Organization', board: 'Activities', content: '羽毛球队招新开始啦。周四的 Open Night 可以直接来体验，不需要提前准备装备。', relatedLabel: 'Badminton Night', relatedPath: '/events/badminton-night', likes: 88, comments: 21, time: '2 h ago' },
  { id: 'post-market', author: 'Nina Zhao', authorRole: 'Marketing Society', board: 'Study', content: 'Case Night 这次会把一份真实品牌挑战拆成消费者、定位和创意三段。', relatedLabel: 'Marketing Case Night', relatedPath: '/events/marketing-case-night', likes: 42, comments: 7, time: '3 h ago' },
  { id: 'post-music', author: 'Student Union', authorRole: 'Verified Organization', board: 'Activities', content: 'Courtyard Music Night 最后 3 个开放麦位置，欢迎原创、翻唱和器乐。', relatedLabel: 'Courtyard Music Night', relatedPath: '/events/music-night', likes: 113, comments: 29, time: '4 h ago' },
  { id: 'post-photo', author: 'Ray Li', authorRole: 'Photography Club', board: 'Life', content: '本周 Photo Walk 的主题是“校园里被忽略的蓝色”。手机就可以参加。', relatedLabel: 'Golden Hour Photo Walk', relatedPath: '/events/photography-walk', likes: 53, comments: 10, time: '5 h ago' },
  { id: 'post-startup', author: '林学长', authorRole: 'Alumni · 2020', board: 'Campus', content: '创业不是先写商业计划书。周五见面时我会分享我们如何找到第一个愿意付费的用户。', relatedLabel: 'Founder Stories', relatedPath: '/events/alumni-founder-talk', likes: 96, comments: 18, time: 'Yesterday' },
  { id: 'post-volunteer', author: 'Alex Xu', authorRole: 'Student Union', board: 'Campus', content: 'Volunteer Day 需要会摄影和会做双语引导的同学，各 2 名。', relatedLabel: 'Community Volunteer Day', relatedPath: '/events/volunteer-day', likes: 35, comments: 6, time: 'Yesterday' },
  { id: 'post-design', author: 'Grace Wu', authorRole: 'Innovation Center', board: 'Study', content: '下周 Design Jam 会从校园真实服务场景出发，不要求任何设计软件经验。', relatedLabel: 'Product Design Jam', relatedPath: '/events/product-design-jam', likes: 49, comments: 9, time: '2 days ago' },
]

export const alumni: Alumni[] = [
  { id: 'alumni-lin', name: '林学长', cohort: '2020 Cohort', role: 'Startup Founder', story: 'Built his first customer community while still on campus.', activity: '创业分享会', color: '#d97706' },
  { id: 'alumni-zhou', name: '周学姐', cohort: '2019 Cohort', role: 'Product Manager', story: 'Turns customer signals into simple product decisions.', activity: 'Product Career Coffee Chat', color: '#2563eb' },
  { id: 'alumni-chen', name: '陈学长', cohort: '2018 Cohort', role: 'Brand Strategist', story: 'Works across culture, strategy, and emerging consumer brands.', activity: 'Brand Story Studio', color: '#db2777' },
  { id: 'alumni-liu', name: '刘学姐', cohort: '2021 Cohort', role: 'AI Researcher', story: 'Explores reliable AI systems and mentors student builders.', activity: 'AI Research AMA', color: '#7c3aed' },
  { id: 'alumni-sun', name: '孙学长', cohort: '2017 Cohort', role: 'Social Impact Lead', story: 'Designs programs that connect local communities and young people.', activity: 'Community Impact Lab', color: '#059669' },
]

export const initialNotifications: Notification[] = [
  { id: 'note-1', category: 'Events', title: 'AI Agent Workshop is open', body: 'Registration is now available for the Wednesday workshop.', time: '10 min ago', read: false, path: '/events/ai-agent-workshop' },
  { id: 'note-2', category: 'Sports', title: 'Campus Night Run starts soon', body: 'Meet at the blue track gate at 18:50.', time: '22 min ago', read: false, path: '/events/campus-night-run' },
  { id: 'note-3', category: 'Coffee Chat', title: 'New Coffee Chat slots', body: 'Professor Zhang opened Wednesday afternoon slots.', time: '1 h ago', read: false, path: '/coffee-chat/teachers/prof-zhang' },
  { id: 'note-4', category: 'Organizations', title: 'Running Club posted a new event', body: 'A weekend sunrise run is now on the calendar.', time: '2 h ago', read: false, path: '/hosts/running-club' },
  { id: 'note-5', category: 'Sports', title: 'Badminton training update', body: 'Thursday training moves to Court 3.', time: '3 h ago', read: true, path: '/organizations/org-badminton' },
  { id: 'note-6', category: 'Social', title: 'Partner suggestion', body: 'A student with a similar running pace is joining tonight.', time: '4 h ago', read: true, path: '/campus/partners' },
  { id: 'note-7', category: 'Events', title: 'Startup Meetup needs approval', body: 'Your request will be reviewed by the host.', time: 'Yesterday', read: true, path: '/events/startup-meetup' },
  { id: 'note-8', category: 'Events', title: 'Badminton Night waitlist', body: 'You are currently number 3 on the waitlist.', time: 'Yesterday', read: true, path: '/events/badminton-night' },
  { id: 'note-9', category: 'Organizations', title: 'AI Club weekly digest', body: 'Three new workshops match your interests.', time: '2 days ago', read: true, path: '/hosts/ai-club' },
  { id: 'note-10', category: 'Social', title: 'New reply in Campus Community', body: 'Ming replied to your question about AI Workshop.', time: '2 days ago', read: true, path: '/campus/community' },
  { id: 'note-11', category: 'Events', title: 'Saved event reminder', body: 'Product Design Jam registration closes soon.', time: '3 days ago', read: true, path: '/events/product-design-jam' },
  { id: 'note-12', category: 'Coffee Chat', title: 'Prepare one good question', body: 'A simple guide for a useful faculty conversation.', time: '4 days ago', read: true, path: '/coffee-chat' },
]

export const initialJourney: JourneyEntry[] = [
  { id: 'journey-1', date: '2026.09', title: '加入羽毛球队', detail: 'Member · Badminton Team', kind: 'organization' },
  { id: 'journey-2', date: '2026.09', title: '完成第一次体育打卡', detail: 'GEPE101 · 1.5 hours', kind: 'sports' },
  { id: 'journey-3', date: '2026.09', title: '加入 Running Club', detail: 'A new weekly campus rhythm', kind: 'organization' },
  { id: 'journey-4', date: '2026.09', title: '参加新生校园漫步', detail: 'Met 4 new classmates', kind: 'event' },
  { id: 'journey-5', date: '2026.09', title: '完成 5km 轻松跑', detail: 'Sports Field · 42 minutes', kind: 'sports' },
  { id: 'journey-6', date: '2026.09', title: '关注 BNBU AI Club', detail: 'Workshops now appear in recommendations', kind: 'organization' },
  { id: 'journey-7', date: '2026.10', title: '参加 English Corner', detail: 'Topic: stories from home', kind: 'event' },
  { id: 'journey-8', date: '2026.10', title: '加入 AI Club', detail: 'Member · Builders group', kind: 'organization' },
  { id: 'journey-9', date: '2026.10', title: '参加 Badminton Open Court', detail: 'Played 3 doubles matches', kind: 'sports' },
  { id: 'journey-10', date: '2026.10', title: '认识新的跑步搭子', detail: 'Connected through a campus activity', kind: 'connection' },
  { id: 'journey-11', date: '2026.10', title: '完成 Marketing Case Sprint', detail: 'Team presentation · T4', kind: 'event' },
  { id: 'journey-12', date: '2026.10', title: '参与社区志愿活动', detail: 'Bilingual welcome desk', kind: 'event' },
  { id: 'journey-13', date: '2026.10', title: '第一次 Coffee Chat', detail: 'Career questions with Professor Chen', kind: 'coffee' },
  { id: 'journey-14', date: '2026.10', title: '收藏 Product Design Jam', detail: 'Saved for next week', kind: 'event' },
  { id: 'journey-15', date: '2026.10', title: '体育学时达到 16 小时', detail: '4 hours remaining in course-related activity', kind: 'sports' },
]

export const initialCheckInRecords: CheckInRecord[] = [
  { id: 'checkin-1', dateLabel: 'Oct 08, 2026', activity: 'Campus Night Run', kind: 'other', durationMinutes: 120, status: 'completed', location: 'BNBU Sports Field' },
  { id: 'checkin-2', dateLabel: 'Oct 06, 2026', activity: 'Badminton Practice', kind: 'course', durationMinutes: 90, status: 'completed', location: 'Sports Center Court 3' },
  { id: 'checkin-3', dateLabel: 'Oct 03, 2026', activity: 'Strength Session', kind: 'other', durationMinutes: 90, status: 'completed', location: 'Fitness Studio' },
  { id: 'checkin-4', dateLabel: 'Sep 29, 2026', activity: 'Campus Walk', kind: 'course', durationMinutes: 75, status: 'completed', location: 'BNBU Campus Loop' },
  { id: 'checkin-5', dateLabel: 'Sep 24, 2026', activity: 'Badminton Practice', kind: 'course', durationMinutes: 120, status: 'completed', location: 'Sports Center Court 2' },
  { id: 'checkin-6', dateLabel: 'Sep 20, 2026', activity: 'Morning Campus Run', kind: 'other', durationMinutes: 180, status: 'completed', location: 'BNBU Sports Field' },
  { id: 'checkin-7', dateLabel: 'Sep 16, 2026', activity: 'Strength Session', kind: 'other', durationMinutes: 210, status: 'completed', location: 'Fitness Studio' },
  { id: 'checkin-8', dateLabel: 'Sep 12, 2026', activity: 'Campus Walk', kind: 'course', durationMinutes: 75, status: 'completed', location: 'BNBU Campus Loop' },
]

export const currentUser = {
  id: 'student-chen-yuqing',
  name: '陈雨晴',
  studentNumber: '22301142',
  school: 'BNBU',
  faculty: '工商管理学院',
  cohort: '2026 Cohort',
  interests: ['AI', '创业', '羽毛球', '跑步', 'Marketing', '英语交流'],
}
