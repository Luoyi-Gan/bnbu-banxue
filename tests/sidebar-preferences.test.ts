import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase, type Database } from '../backend/src/database'
import { createAccount } from '../backend/src/auth'
import { Repository } from '../backend/src/repository'
import { governanceCommand } from '../backend/src/governance'
import { defaultSidebarItems, parseSidebarItems, sidebarCoreIds } from '../shared/v2/sidebarLayout'

const databases: Database[] = []
afterEach(() => databases.splice(0).forEach(db => db.close()))

describe('学生侧栏偏好', () => {
  it('保存任意顺序与校园功能显隐，同时保留本人的其他偏好', () => {
    const db = openDatabase(':memory:')
    databases.push(db)
    const repo = new Repository(db)
    const student = repo.person(createAccount(db, {email: 'student@example.test', password: 'Test-password-123', name: '学生', roles: ['student']}))
    const other = repo.person(createAccount(db, {email: 'other@example.test', password: 'Test-password-123', name: '其他学生', roles: ['student']}))
    const teacher = repo.person(createAccount(db, {email: 'teacher@example.test', password: 'Test-password-123', name: '教师', roles: ['teacher']}))
    governanceCommand(repo, student, 'preferences.profilebackground', {choice: 'evening'})
    const selected = ['organizations', 'coffee', 'me', 'home', 'discover', 'campus', 'conversations']
    governanceCommand(repo, student, 'preferences.sidebarnav', {items: selected})
    expect(repo.all('preferences').find(item => item.ownerId === student.id)?.data).toMatchObject({sidebarItems: selected, profileBackground: 'evening'})
    expect(repo.all('preferences').some(item => item.ownerId === other.id)).toBe(false)
    expect(parseSidebarItems(selected)).toEqual(selected)
    expect(parseSidebarItems(defaultSidebarItems)).toEqual(defaultSidebarItems)
    expect(() => governanceCommand(repo, student, 'preferences.sidebarnav', {items: [...sidebarCoreIds, 'home']})).toThrow()
    expect(() => governanceCommand(repo, student, 'preferences.sidebarnav', {items: sidebarCoreIds.slice(1)})).toThrow()
    expect(() => governanceCommand(repo, student, 'preferences.sidebarnav', {items: [...sidebarCoreIds, '/v2/admin']})).toThrow()
    expect(() => governanceCommand(repo, teacher, 'preferences.sidebarnav', {items: sidebarCoreIds})).toThrow()
    expect(repo.all('preferences').find(item => item.ownerId === student.id)?.data.sidebarItems).toEqual(selected)
  })
})
