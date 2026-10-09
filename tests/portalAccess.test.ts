import { describe, expect, it } from 'vitest'
import { canAccessPortal, portalHome, resolvePortalRole } from '../src/v2/portalAccess'
import type { Role } from '../src/v2/model'

describe('portal separation', () => {
  const paths = { student: ['/v2', '/v2/me', '/v2/sports', '/v2/activities/event'], teacher: ['/v2/teacher', '/v2/teacher/activities', '/v2/teacher/activities/event'], admin: ['/v2/admin', '/v2/admin/verifications', '/v2/admin/moderation'] }
  for (const role of ['student', 'teacher', 'admin'] as Role[]) {
    it(`${role} can enter only its own portal`, () => {
      for (const owner of Object.keys(paths) as Role[]) {
        for (const path of paths[owner]) expect(canAccessPortal(role, path), `${role}: ${path}`).toBe(owner === role)
      }
      expect(canAccessPortal(role, portalHome[role])).toBe(true)
    })
  }
  it('keeps tab identity separate from legacy shared role and defaults unknown identities to student', () => {
    expect(resolvePortalRole('student', 'admin')).toBe('student')
    expect(resolvePortalRole('teacher', 'student')).toBe('teacher')
    expect(resolvePortalRole(null, 'admin')).toBe('admin')
    expect(resolvePortalRole(null, 'unknown')).toBe('student')
  })
  it('does not mistake similar path prefixes for authorized portals', () => {
    expect(canAccessPortal('admin', '/v2/administrator')).toBe(false)
    expect(canAccessPortal('teacher', '/v2/teachers')).toBe(false)
  })
})
