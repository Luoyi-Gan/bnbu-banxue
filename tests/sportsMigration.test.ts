import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { sportsStudentHref } from '../src/v2/sportsEntry'
import manifest from '../docs/SPORTS_STUDENT_SOURCE.json'

describe('Sports student migration', () => {
  it('preserves every original runtime file byte for byte', () => {
    for (const file of manifest.files) {
      const bytes = readFileSync(new URL(`../public/student/${file.path}`, import.meta.url))
      expect(createHash('sha256').update(bytes).digest('hex'), file.path).toBe(file.sha256)
    }
  })
  it('only requests the existing local preview on loopback hosts', () => {
    expect(sportsStudentHref('127.0.0.1')).toBe('/student/index.html?entry=checkin&preview=student')
    expect(sportsStudentHref('localhost')).toContain('preview=student')
    expect(sportsStudentHref('example.com')).toBe('/student/index.html?entry=checkin')
    expect(sportsStudentHref('127.0.0.1.example.com')).not.toContain('preview=')
  })
})
