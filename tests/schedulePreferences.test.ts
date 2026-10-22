import {describe,it,expect} from 'vitest'
import {openDatabase} from '../backend/src/database'
import {createAccount} from '../backend/src/auth'
import {Repository} from '../backend/src/repository'
import {governanceCommand} from '../backend/src/governance'
describe('本人日程偏好',()=>{
  it('学生按本人保存、保留其他偏好，拒绝无效日期与数量以及教师操作',()=>{
    const db=openDatabase(':memory:')
    try{
      const repo=new Repository(db)
      const actor=repo.person(createAccount(db,{email:'agenda@example.test',password:'Test-password-123',name:'学生',roles:['student']}))
      const teacher=repo.person(createAccount(db,{email:'agenda-teacher@example.test',password:'Test-password-123',name:'老师',roles:['teacher']}))
      governanceCommand(repo,actor,'preferences.searchable',{enabled:false})
      governanceCommand(repo,actor,'preferences.schedule',{homeScheduleCount:5,semesterStartDate:'2026-09-07',ownerId:teacher.id})
      governanceCommand(repo,actor,'preferences.schedule',{homeScheduleCount:2})
      expect(repo.all('preferences')).toHaveLength(1)
      expect(repo.all('preferences')[0]).toMatchObject({ownerId:actor.id,data:{searchable:false,homeScheduleCount:2,semesterStartDate:'2026-09-07'}})
      for(const input of [{homeScheduleCount:7},{homeScheduleCount:1.5},{semesterStartDate:'2026-09-08'},{semesterStartDate:'2026-02-30'},{academicCalendar:'unverified'},{}])expect(()=>governanceCommand(repo,actor,'preferences.schedule',input)).toThrow()
      governanceCommand(repo,actor,'preferences.schedule',{academicCalendar:'bnbu-2026-s1'})
      expect(repo.all('preferences')[0].data).toMatchObject({academicCalendar:'bnbu-2026-s1',homeScheduleCount:2,searchable:false})
      governanceCommand(repo,actor,'preferences.schedule',{hiddenDailyCourses:['数学','数学'],ownerId:teacher.id})
      expect(repo.all('preferences')[0]).toMatchObject({ownerId:actor.id,data:{hiddenDailyCourses:['数学'],homeScheduleCount:2,searchable:false}})
      for(const hiddenDailyCourses of ['bad',[1],[''],Array(301).fill('数学')])expect(()=>governanceCommand(repo,actor,'preferences.schedule',{hiddenDailyCourses})).toThrow()
      governanceCommand(repo,actor,'preferences.schedule',{hiddenDailyCourses:[]})
      expect(repo.all('preferences')[0].data.hiddenDailyCourses).toEqual([])
      expect(()=>governanceCommand(repo,teacher,'preferences.schedule',{homeScheduleCount:2})).toThrow()
    }finally{db.close()}
  })
})
