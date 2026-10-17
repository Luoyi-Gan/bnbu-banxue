import { BookOpen, CalendarDays, Coffee, GraduationCap, House, MapPinned, MessageCircle, Network, Newspaper, Sparkles, UserRound, UsersRound, type LucideIcon } from 'lucide-react'
import type { SidebarItemId } from '../../shared/v2/sidebarLayout'

export type SidebarEntry = { id: SidebarItemId; label: string; path: string; icon: LucideIcon; kind: 'core' | 'campus' }

export const studentSidebarCatalog: SidebarEntry[] = [
  {id: 'home', label: '首页', path: '/v2', icon: House, kind: 'core'},
  {id: 'discover', label: '发现', path: '/v2/activities', icon: CalendarDays, kind: 'core'},
  {id: 'campus', label: '校园', path: '/v2/campus', icon: UsersRound, kind: 'core'},
  {id: 'conversations', label: '会话', path: '/v2/messages', icon: MessageCircle, kind: 'core'},
  {id: 'me', label: '我的', path: '/v2/me', icon: UserRound, kind: 'core'},
  {id: 'community', label: '校园社区', path: '/v2/community', icon: Newspaper, kind: 'campus'},
  {id: 'partners', label: '找搭子', path: '/v2/partners', icon: UsersRound, kind: 'campus'},
  {id: 'alumni', label: '校友同行', path: '/v2/alumni', icon: Network, kind: 'campus'},
  {id: 'explore', label: '校园探索', path: '/v2/campus/explore', icon: MapPinned, kind: 'campus'},
  {id: 'ai', label: '校园 AI', path: '/v2/ai', icon: Sparkles, kind: 'campus'},
  {id: 'organizations', label: '社团组织', path: '/v2/organizations', icon: GraduationCap, kind: 'campus'},
  {id: 'coffee', label: 'Coffee Chat', path: '/v2/coffee', icon: Coffee, kind: 'campus'},
  {id: 'sports', label: '体育打卡', path: '/v2/sports', icon: CalendarDays, kind: 'campus'},
  {id: 'teaching', label: '教学支持', path: '/v2/campus?service=teaching', icon: BookOpen, kind: 'campus'},
  {id: 'academic', label: '学术讨论', path: '/v2/campus?service=academic', icon: MessageCircle, kind: 'campus'},
]

export const studentSidebarById = Object.fromEntries(studentSidebarCatalog.map(entry => [entry.id, entry])) as Record<SidebarItemId, SidebarEntry>
