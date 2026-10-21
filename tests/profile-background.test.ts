import { afterEach, describe, expect, it } from 'vitest'
import { openDatabase, type Database } from '../backend/src/database'
import { createAccount } from '../backend/src/auth'
import { Repository } from '../backend/src/repository'
import { governanceCommand } from '../backend/src/governance'

const databases: Database[] = []
afterEach(() => databases.splice(0).forEach(db => db.close()))

describe('学生个人背景偏好', () => {
  it('封面保存保留简介与其他人的资料，并拒绝外部链接', () => {
    const db=openDatabase(':memory:');databases.push(db)
    const repo=new Repository(db)
    const actor=repo.person(createAccount(db,{email:'cover@example.test',password:'Test-password-123',name:'学生',roles:['student']}))
    const other=repo.person(createAccount(db,{email:'other@example.test',password:'Test-password-123',name:'同学',roles:['student']}))
    governanceCommand(repo,actor,'profile.save',{nickname:'校园同学',avatar:'',bio:'喜欢摄影',cover:'lakeside'})
    governanceCommand(repo,other,'profile.save',{nickname:'另一位同学',avatar:'',cover:'campus'})
    const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN2kAAAAASUVORK5CYII='
    governanceCommand(repo,actor,'profile.save',{nickname:'校园同学',avatar:'',cover:image,ownerId:other.id})
    expect(repo.all('profile').find(p=>p.ownerId===actor.id)?.data).toMatchObject({cover:image,bio:'喜欢摄影',nickname:'校园同学'})
    expect(repo.all('profile').find(p=>p.ownerId===other.id)?.data.cover).toBe('campus')
    expect(()=>governanceCommand(repo,actor,'profile.save',{nickname:'校园同学',avatar:'',cover:'https://example.test/cover.png'})).toThrow()
    governanceCommand(repo,actor,'profile.save',{nickname:'校园同学',avatar:'',cover:'lakeside'})
    expect(repo.all('profile').find(p=>p.ownerId===actor.id)?.data).toMatchObject({cover:'lakeside',bio:'喜欢摄影'})
  })
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
