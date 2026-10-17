import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase, type Database } from '../backend/src/database'
import { createAccount } from '../backend/src/auth'
import { Repository } from '../backend/src/repository'
import { governanceCommand } from '../backend/src/governance'

const databases: Database[] = []
afterEach(() => databases.splice(0).forEach(db => db.close()))

describe('学生个人背景偏好', () => {
  it('仅本人学生账号可切换，保留同一偏好记录中的其他设置', () => {
    const db = openDatabase(':memory:')
    databases.push(db)
    const repo = new Repository(db)
    const student = repo.person(createAccount(db, { email: 'student@example.test', password: 'Test-password-123', name: '学生', roles: ['student'] }))
    const teacher = repo.person(createAccount(db, { email: 'teacher@example.test', password: 'Test-password-123', name: '教师', roles: ['teacher'] }))
    governanceCommand(repo, student, 'preferences.searchable', {enabled: false})
    governanceCommand(repo, student, 'preferences.profilebackground', {choice: 'evening'})
    governanceCommand(repo, student, 'preferences.profilebackground', {choice: 'walkway'})
    const own = repo.all('preferences').filter(item => item.ownerId === student.id)
    expect(own).toHaveLength(1)
    expect(own[0].data).toMatchObject({searchable: false, profileBackground: 'walkway'})
    expect(() => governanceCommand(repo, student, 'preferences.profilebackground', {choice: 'external-url'})).toThrow()
    expect(() => governanceCommand(repo, teacher, 'preferences.profilebackground', {choice: 'campus'})).toThrow()
    expect(repo.all('preferences')).toHaveLength(1)
  })
})
