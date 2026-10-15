import { describe, expect, it } from 'vitest'
import { studentCertifications } from './studentCertifications'

const certification = (id: string, kind: string, status: string, createdAt: string) => ({
  id, kind: 'certification', ownerId: 'student-a', version: 1, createdAt, updatedAt: createdAt,
  data: { kind, status, organization: id, note: '申请说明' },
})

describe('studentCertifications', () => {
  it('keeps an older approved club certification effective after a newer rejection', () => {
    const data = {
      account: { id: 'student-a' },
      entities: [
        certification('club-approved', 'club', 'approved', '2026-10-01T00:00:00Z'),
        certification('student-rejected', 'student', 'rejected', '2026-10-02T00:00:00Z'),
        { ...certification('other-user', 'club', 'approved', '2026-10-03T00:00:00Z'), ownerId: 'student-b' },
      ],
    }
    const result = studentCertifications(data)
    expect(result.records.map(record => record.id)).toEqual(['student-rejected', 'club-approved'])
    expect(result.hasApprovedCertification).toBe(true)
    expect(result.canPublishActivity).toBe(true)
  })

  it('does not treat a non-club approval or a revoked club record as activity qualification', () => {
    const data = {
      account: { id: 'student-a' },
      entities: [
        certification('student-approved', 'student', 'approved', '2026-10-02T00:00:00Z'),
        certification('club-revoked', 'club', 'rejected', '2026-10-01T00:00:00Z'),
      ],
    }
    expect(studentCertifications(data).canPublishActivity).toBe(false)
    expect(studentCertifications(null).records).toEqual([])
  })
})
