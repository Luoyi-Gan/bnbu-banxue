import type { Post } from './model'

export interface AlumniProfile {
  id: string
  owner: string
  name: string
  major: string
  graduationYear: number
  city: string
  direction: '升学' | '就业'
  experience: string
  topics: string
  bio: string
  evidence: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNote: string
  accepting: boolean
}
export interface AlumniSlot { id: string; alumniId: string; startAt: string; endAt: string; location: string; open: boolean }
export type AlumniBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'withdrawn' | 'cancelled' | 'expired' | 'unavailable'
export interface AlumniBooking { id: string; slotId: string; student: string; question: string; status: AlumniBookingStatus; reason: string; createdAt: string }
export interface AlumniData {
  profiles: AlumniProfile[]
  follows: { student: string; alumniId: string }[]
  slots: AlumniSlot[]
  bookings: AlumniBooking[]
  notices: { id: string; recipient: string; body: string; read: boolean; at: string }[]
  history: { id: string; actor: string; objectId: string; action: string; reason: string; at: string }[]
}

export const alumniSeed: AlumniData = {
  profiles: [
    { id: 'alumni-lin', owner: 'alumni-account-lin', name: '林知夏', major: '金融学', graduationYear: 2023, city: '香港', direction: '升学', experience: '商科硕士毕业 · 申请经验分享', topics: '选校定位、申请材料、跨专业申请', bio: '愿意聊聊从准备申请到适应研究生生活的经历，也欢迎带着具体问题来交流。', evidence: '演示校友资料', status: 'approved', reviewNote: '演示认证', accepting: true },
    { id: 'alumni-zhou', owner: 'alumni-account-zhou', name: '周远', major: '计算机科学与技术', graduationYear: 2022, city: '深圳', direction: '就业', experience: '软件工程师 · 互联网行业', topics: '实习准备、技术面试、第一份工作', bio: '从校园项目到实际工作，分享自己走过的弯路。欢迎一起讨论如何准备第一份实习。', evidence: '演示校友资料', status: 'approved', reviewNote: '演示认证', accepting: true },
  ],
  follows: [], bookings: [], notices: [], history: [],
  slots: [
    { id: 'alumni-slot-lin', alumniId: 'alumni-lin', startAt: '2026-10-18T14:00:00+08:00', endAt: '2026-10-18T14:30:00+08:00', location: '线上交流，确认后双方商定会议方式', open: true },
    { id: 'alumni-slot-zhou', alumniId: 'alumni-zhou', startAt: '2026-10-19T19:00:00+08:00', endAt: '2026-10-19T19:30:00+08:00', location: 'BNBU 资源中心', open: true },
  ],
}

export const alumniSeedPosts: Post[] = [
  { id: 'alumni-post-application', alumniId: 'alumni-lin', title: '申请季开始前，先整理自己的经历', body: '这是一篇演示经验分享。建议先把课程项目、实习和感兴趣的研究问题整理成清单，再逐个查阅学校的官方申请要求。个人经历只能作为参考，具体要求以院校发布的信息为准。', board: '校友升学', author: '林知夏', date: '10月9日', status: 'visible', comments: [], likes: 0 },
  { id: 'alumni-post-career', alumniId: 'alumni-zhou', title: '第一次找实习，如何讲清楚校园项目？', body: '这是一篇演示经验分享。可以从问题、本人负责的工作、做出的取舍和结果四个方面准备项目介绍。简历里保留真实经历，遇到不了解的面试问题也可以坦诚说明自己的思考过程。', board: '校友就业', author: '周远', date: '10月8日', status: 'visible', comments: [], likes: 0 },
]
