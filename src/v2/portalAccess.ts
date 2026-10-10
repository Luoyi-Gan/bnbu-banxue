import type { Role } from './model'

export function resolvePortalRole(session: unknown, legacy: unknown): Role {
  const valid = (role: unknown): role is Role => role === 'student' || role === 'teacher' || role === 'admin'
  return valid(session) ? session : valid(legacy) ? legacy : 'student'
}

export const portalHome: Record<Role, string> = {
  student: '/v2',
  teacher: '/v2/teacher/coffee',
  admin: '/v2/admin',
}

export function portalForPath(path: string): Role {
  if (path === '/v2/admin' || path.startsWith('/v2/admin/')) return 'admin'
  if (path === '/v2/teacher' || path.startsWith('/v2/teacher/')) return 'teacher'
  return 'student'
}

export function canAccessPortal(role: Role, path: string) {
  return role === portalForPath(path)
}
