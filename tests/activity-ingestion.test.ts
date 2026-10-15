import { randomUUID } from 'node:crypto'
import { afterEach, expect, it } from 'vitest'
import { openDatabase } from '../backend/src/database'
import { createAccount, login } from '../backend/src/auth'
import { createApiServer } from '../backend/src/main'
import { execute, executeMailboxImport, snapshot } from '../backend/src/commands'
import { Repository } from '../backend/src/repository'
import { allowedActivitySender } from '../backend/src/activity-mailbox'
import { extractActivityScreenshot } from '../shared/v2/activityScreenshotAdapter'

const close: Array<() => void | Promise<void>> = []
afterEach(async () => { for (const stop of close.splice(0).reverse()) await stop() })
function fixture() {
  const db = openDatabase(':memory:'); close.push(() => db.close())
  for (const [name, roles] of [['admin', ['superadmin']], ['student', ['student']]] as const) createAccount(db, {email:`${name}@example.test`,password:'Test-password-123',name,roles:[...roles]})
  return {db, admin:login(db,'admin@example.test','Test-password-123'), student:login(db,'student@example.test','Test-password-123')}
}
const text = '活动名称：校园分享会\n活动介绍：讨论学习计划\n活动开始时间：2027-10-25 14:00\n活动结束时间：2027-10-25 16:00\n活动地点：图书馆\n主办方：学院'
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY8kAAAAASUVORK5CYII=', 'base64')

it('学校邮箱使用统一命令事务、去重和管理员职责', () => {
  const {db, admin, student} = fixture()
  const input = {messageId:'official-1',sender:'events@school.edu',subject:'活动通知',body:text}
  const first = executeMailboxImport(db,admin.account.id,input,'imap:official-1') as {id:string}
  expect(executeMailboxImport(db,admin.account.id,input,'imap:official-1')).toEqual(first)
  expect(new Repository(db).all('activity')).toHaveLength(1)
  expect(() => executeMailboxImport(db,student.account.id,{...input,messageId:'other'},'imap:official-2')).toThrow('邮箱导入操作账号无效')
  expect(allowedActivitySender('events@school.edu',['@school.edu'])).toBe(true)
  expect(allowedActivitySender('events@school.edu.evil.test',['@school.edu'])).toBe(false)
})

it('截图通过上传接口只进入待核实，核对后才对学生公开', async () => {
  const {db, admin, student} = fixture()
  const server = createApiServer(db,{screenshotRecognizer:async () => ({text,requestId:'ocr-test'})})
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve))
  close.push(()=>new Promise<void>(resolve=>{server.closeAllConnections();server.close(()=>resolve())}))
  const url=`http://127.0.0.1:${(server.address() as {port:number}).port}/api/activity/screenshot/import`
  const direct=await fetch(url.replace('/api/activity/screenshot/import','/api/commands'),{method:'POST',headers:{Cookie:`bnbu_session=${admin.token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'screenshot.import',requestId:randomUUID(),input:{image:`data:image/png;base64,${png.toString('base64')}`,recognizedText:text}})})
  expect(direct.status).toBe(403)
  const form=new FormData();form.set('image',new File([png],'poster.png',{type:'image/png'}))
  const forbidden=await fetch(url,{method:'POST',headers:{Cookie:`bnbu_session=${student.token}`},body:form})
  expect(forbidden.status).toBe(403)
  const response=await fetch(url,{method:'POST',headers:{Cookie:`bnbu_session=${admin.token}`},body:form})
  expect(response.status).toBe(200)
  const {data}=await response.json() as {data:{id:string}}
  const duplicate=await fetch(url,{method:'POST',headers:{Cookie:`bnbu_session=${admin.token}`},body:form})
  expect((await duplicate.json() as {data:{id:string}}).data.id).toBe(data.id)
  const repo=new Repository(db),record=repo.get(data.id,'mail')
  expect(repo.all('mail')).toHaveLength(1)
  expect((record.data.record as {status:string}).status).toBe('pending')
  expect(repo.all('activity')).toHaveLength(0)
  expect(JSON.stringify(snapshot(db,student.account))).not.toContain('ocr-test')
  expect(extractActivityScreenshot(text).fields.title).toBe('校园分享会')
  execute(db,admin.token,'mail.correct',{id:data.id,title:'校园分享会',description:'讨论学习计划',startAt:'2027-10-25T14:00:00+08:00',endAt:'2027-10-25T16:00:00+08:00',location:'图书馆',host:'学院',conditions:'',reason:'已与原海报核对'},randomUUID())
  expect(repo.all('activity')).toHaveLength(1)
  expect(snapshot(db,student.account).entities.some(e=>e.kind==='activity')).toBe(true)
  expect(JSON.stringify(snapshot(db,student.account))).not.toContain('data:image/png;base64')
})
