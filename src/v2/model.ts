import { alumniSeed, alumniSeedPosts, type AlumniData } from './alumniModel'
export const studentName = '陈雨晴'
export const v2StorageKey = 'bnbu-campus-v2-demo:v1'
export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
export const todayLabel = () => new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
export const timeLabel = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

export type Role = 'student' | 'admin' | 'teacher'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
export type RoomType = 'carpool' | 'entertainment' | 'study'
export interface Comment { id: string; author: string; body: string; date: string; status: 'visible' | 'pending' | 'hidden' }
export interface Post { alumniId?: string; id: string; title: string; body: string; board: string; author: string; date: string; likes: number; status: 'visible' | 'pending' | 'hidden'; comments: Comment[] }
export interface Room { id: string; type: RoomType; title: string; body: string; time: string; place: string; buildingId?: string; capacity: number; members: string[]; owner: string; status: 'open' | 'finished'; requests: string[] }
export interface Conversation { id: string; title: string; messages: { id: string; from: string; body: string; time: string }[]; unread: number }
export interface Verification { id: string; name: string; kind: 'student' | 'club' | 'official'; organization: string; note: string; status: ReviewStatus; reviewNote: string; date: string }
export interface LocalEvent { ownerId?: string; host?: string; id: string; title: string; description: string; startAt: string; location: string; capacity: number; status: 'published' | 'draft'; registrations: number }
export interface V2State {
  alumni?: AlumniData
  profile?: { nickname: string; avatar: string }
  role: Role
  announcements: unknown[] // Legacy history only.
  posts: Post[]
  rooms: Room[]
  conversations: Conversation[]
  verifications: Verification[]
  savedPosts: string[]
  savedRooms: string[]
  likedPosts: string[]
  applications: { roomId: string; status: ReviewStatus }[]
  eventRegistrations: Record<string, 'going' | 'pending' | 'waitlist'>
  participatingActivities: string[]
  localEvents: LocalEvent[]
  coffeeBookings: string[]
  joinedOrganizations: string[]
  notifications: { id: string; title: string; body: string; path: string; read: boolean; date: string }[]
  preferences: { messages: boolean; teams: boolean; searchable: boolean; profilePreview: boolean }
  aiMessages: { id: string; from: 'user' | 'assistant'; body: string; sourcePath?: string; sourceLabel?: string }[]
  aiPinnedSources: string[]
  aiIconChoice: 'yellow' | 'kitty' | 'custom'
  aiCustomIcon: string
}

export const initialV2State: V2State = {
  role: 'student',
  alumni: alumniSeed,
  announcements: [],
  posts: [
    ...alumniSeedPosts,
    { id: 'post-study', title: '你最喜欢哪处学习空间？', body: '想找一个适合小组讨论的地方，欢迎分享你的推荐。', board: '校园', author: '林同学', date: '10月8日', likes: 12, status: 'visible', comments: [{ id: 'comment-seed', author: '李明', body: '资源中心靠窗的位置很舒服。', date: '10月8日', status: 'visible' }] },
    { id: 'post-english', title: '周末英语口语练习', body: '计划周六下午练习一小时，话题可以一起商量。', board: '学习', author: '王嘉', date: '10月7日', likes: 7, status: 'visible', comments: [] },
    { id: 'post-run', title: '推荐的校园夜跑路线？', body: '想从体育场出发跑 3 公里，欢迎分享路线。', board: '生活', author: '周然', date: '10月6日', likes: 5, status: 'visible', comments: [] },
  ],
  rooms: [
    { id: 'room-car', type: 'carpool', title: '周五去珠海站拼车', body: '从学校南门出发，时间可在群里微调，费用均摊。', time: '周五 17:30', place: '学校南门', capacity: 4, members: ['李明', '周然'], owner: '李明', status: 'open', requests: [] },
    { id: 'room-ball', type: 'entertainment', title: '周末羽毛球双打', body: '轻松打球，水平不限，记得带球拍。', time: '周六 19:00', place: '体育馆 3 号场', capacity: 4, members: ['王嘉', '林同学', studentName], owner: '王嘉', status: 'open', requests: [] },
    { id: 'room-ai', type: 'study', title: 'AI Agent Workshop 复盘小组', body: '交流 Workshop 笔记和项目想法，一起做出下一个原型。', time: '周日 15:00', place: '资源中心', capacity: 6, members: [studentName, '许宁'], owner: studentName, status: 'open', requests: ['李明'] },
  ],
  conversations: [
    { id: 'chat-ball', title: '周末羽毛球双打', messages: [{ id: 'm1', from: '王嘉', body: '周末见！场地已经预约好了。', time: '18:42' }], unread: 1 },
    { id: 'chat-ai', title: 'AI Agent Workshop 复盘小组', messages: [{ id: 'm2', from: '许宁', body: '我会带上活动笔记。', time: '17:16' }], unread: 1 },
  ],
  verifications: [{ id: 'verify-club', name: '校园摄影社', kind: 'club', organization: '校园摄影社', note: '申请社团认证，用于核实社团成员身份。', status: 'pending', reviewNote: '', date: '10月8日' }],
  savedPosts: [], savedRooms: [], likedPosts: [], applications: [], eventRegistrations: {}, participatingActivities: [], localEvents: [], coffeeBookings: [], joinedOrganizations: [],
  notifications: [{ id: 'n1', title: '新的组队申请', body: '李明申请加入你的 AI Agent 复盘小组', path: '/v2/partners/teams', read: false, date: '今天' }],
  preferences: { messages: true, teams: true, searchable: true, profilePreview: true },
  aiMessages: [{ id: 'ai-hello', from: 'assistant', body: '你好，我是奶蛙。可以帮你查找活动、校园服务和自己的安排。当前内容为本地演示数据。' }],
  aiPinnedSources: ['/v2/activities', '/v2/campus'],
  aiIconChoice: 'yellow', aiCustomIcon: '',
}


export const roomTypeName: Record<RoomType, string> = { carpool: '拼车', entertainment: '娱乐', study: '学习' }
