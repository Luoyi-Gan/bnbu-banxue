import {describe,it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {openDatabase} from '../backend/src/database'
import {createAccount,login} from '../backend/src/auth'
import {execute} from '../backend/src/commands'
import {Repository} from '../backend/src/repository'
import {searchRooms} from '../backend/src/room-search'

describe('学习组队自定义地点',()=>{
  it.each(['图书馆二楼靠窗区','线上 · 群内约定会议链接'])('保存并公开读取原地点文字，不推断坐标：%s',place=>{
    const db=openDatabase(':memory:')
    try{
      createAccount(db,{email:'custom-place@example.test',name:'地点验收',password:'Acceptance-123',roles:['student']})
      const session=login(db,'custom-place@example.test','Acceptance-123')
      const result=execute(db,session.token,'room.create',{type:'study',title:'COMP1021 · 讨论组',body:'讨论课程项目',time:'时间待商定',place,capacity:4,details:{}},randomUUID()) as {id:string}
      const stored=new Repository(db).get(result.id)
      expect(stored.data.place).toBe(place)
      expect(stored.data.details).not.toHaveProperty('coordinates')
      const page=searchRooms(db,session.account,new URLSearchParams())
      expect(page.items.find(room=>room.id===result.id)?.place).toBe(place)
    }finally{db.close()}
  })
})
