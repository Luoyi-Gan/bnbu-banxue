import {randomUUID} from 'node:crypto'
import {afterEach,expect,it} from 'vitest'
import {openDatabase} from '../backend/src/database'
import {createAccount,login} from '../backend/src/auth'
import {execute,snapshot} from '../backend/src/commands'
import {Repository} from '../backend/src/repository'
import {communityFeed,communityPostDetail,communitySocial} from '../backend/src/community-page'
import {communitySocialPolicy} from '../backend/src/community-social'
import {runAsync,type BusinessRepository} from '../backend/src/storage/effects'

const databases:ReturnType<typeof openDatabase>[]=[]
afterEach(()=>{for(const db of databases.splice(0))db.close()})
function fixture(){
  const db=openDatabase(':memory:');databases.push(db)
  const user=(name:string,roles=['student'])=>{const email=`${name}@example.test`;createAccount(db,{email,name,password:'Acceptance-123',roles});return login(db,email,'Acceptance-123')}
  const a=user('author'),b=user('reader'),reviewer=user('reviewer',['reviewer']),repo=new Repository(db)
  const command=(actor:typeof a,action:string,input:Record<string,unknown>,requestId=randomUUID())=>execute(db,actor.token,action,input,requestId) as {id:string}
  const post=(actor=a,title='校园里的一个下午')=>command(actor,'post.create',{title,body:'记录校园生活',board:'校园',images:[]}).id
  const read=(actor:typeof a,q='')=>communityFeed(db,actor.token,new URLSearchParams(q))
  return {db,a,b,reviewer,repo,command,post,read}
}

it('个人私信持久化、幂等并只向原参与者提供，屏蔽后停止发送',()=>{
  const {db,a,b,reviewer,command,post,repo}=fixture();post(a);post(b)
  const request=randomUUID(),input={targetId:b.account.id,body:'你好，想聊聊校园摄影。'}
  const sent=command(a,'direct.send',input,request)
  expect(command(a,'direct.send',input,request)).toEqual(sent)
  expect(repo.all('directMessage')).toHaveLength(1)
  const chat=(token:string,id:string)=>communitySocial(db,token,new URLSearchParams({person:id,list:'chat'}))
  expect(chat(b.token,a.account.id).messages).toMatchObject([{body:input.body,mine:false}])
  expect(chat(a.token,b.account.id).messages).toMatchObject([{body:input.body,mine:true}])
  expect(chat(reviewer.token,a.account.id).messages).toEqual([])
  expect(snapshot(db,reviewer.account).entities.some(e=>e.kind==='directMessage')).toBe(false)
  expect(communitySocial(db,b.token,new URLSearchParams('list=inbox')).conversations).toMatchObject([{id:a.account.id,body:input.body}])
  expect(()=>command(a,'direct.send',{targetId:a.account.id,body:'自己'})).toThrow('自己')
  expect(()=>command(a,'direct.send',{targetId:b.account.id,body:' '})).toThrow()
  command(b,'social.block',{targetId:a.account.id,enabled:true})
  expect(()=>command(a,'direct.send',input)).toThrow('互动')
  expect(chat(b.token,a.account.id).messages).toHaveLength(1)
})

it('私信拒绝陌生目录账号和失效身份，发送频率受控',()=>{
  const {db,a,b,reviewer,command,post}=fixture()
  expect(()=>command(a,'direct.send',{targetId:b.account.id,body:'x'})).toThrow('不可访问')
  post(b)
  expect(()=>command(reviewer,'direct.send',{targetId:b.account.id,body:'x'})).toThrow('不能发送')
  for(let n=0;n<20;n++)command(a,'direct.send',{targetId:b.account.id,body:`消息${n}`})
  expect(()=>command(a,'direct.send',{targetId:b.account.id,body:'过量'})).toThrow('频繁')
  db.prepare("UPDATE accounts SET status='muted' WHERE id=?").run(b.account.id)
  expect(()=>command(a,'direct.send',{targetId:b.account.id,body:'x'})).toThrow('不可私信')
})

it('草稿只返回本人内容，发布原子消费草稿且重试不会重复发帖',()=>{
  const {db,a,b,command,repo}=fixture()
  const draft=command(a,'draft.save',{title:'未发布的想法',body:'私人草稿',board:'校园',images:[]})
  expect(communitySocial(db,b.token,new URLSearchParams(`draft=${draft.id}`)).draft).toBeNull()
  expect(()=>command(b,'draft.save',{id:draft.id,title:'盗改',body:'x',board:'校园',images:[]})).toThrow('本人')
  const request=randomUUID(),input={title:'正式校园记录',body:'完整正文',board:'校园',images:[],draftId:draft.id}
  const result=command(a,'post.create',input,request)
  expect(command(a,'post.create',input,request)).toEqual(result)
  expect(repo.all('post')).toHaveLength(1)
  expect(repo.get(draft.id).data.status).toBe('published')
  expect(()=>command(a,'post.create',input)).toThrow('草稿')
  expect(repo.all('post')).toHaveLength(1)
})

it('编辑保留对象关系并检查所有权、版本、词库和处置状态',()=>{
  const {a,b,reviewer,repo,command,post,db}=fixture(),id=post()
  const entity=repo.get(id),input={id,title:'编辑后的标题',body:'补充后的正文',board:'学习',images:[],version:entity.version}
  command(b,'relation.set',{id,kind:'save',enabled:true})
  expect(()=>command(b,'post.update',input)).toThrow('本人')
  command(a,'post.update',input)
  expect(repo.related(b.account.id,id,'save')).toBe(true)
  expect(repo.get(id).data.board).toBe('学习')
  expect(()=>command(a,'post.update',input)).toThrow('已更新')
  repo.create('communityKeyword',reviewer.account.id,{word:'禁止示例',enabled:true})
  const latest=repo.get(id)
  expect(()=>command(a,'post.update',{...input,version:latest.version,body:'禁止示例'})).toThrow()
  expect(repo.get(id).version).toBe(latest.version)
  command(reviewer,'content.review',{id,status:'hidden',reason:'测试处置'})
  expect(()=>command(a,'post.update',{...input,version:repo.get(id).version})).toThrow('不能编辑')
  expect(communityFeed(db,b.token,new URLSearchParams()).posts).toEqual([])
})

it('编辑草稿保存回原帖，不创建重复笔记，也不能绕过新版本',()=>{
  const {a,repo,command,post}=fixture(),id=post(),version=repo.get(id).version
  const draft=command(a,'draft.save',{sourcePostId:id,sourceVersion:version,title:'继续编辑',body:'草稿正文',board:'校园',images:[]})
  expect(()=>command(a,'post.create',{title:'x',body:'x',board:'校园',images:[],draftId:draft.id})).toThrow('原帖子')
  command(a,'post.update',{id,version,draftId:draft.id,title:'继续编辑',body:'草稿正文',board:'校园',images:[]})
  expect(repo.all('post')).toHaveLength(1)
  expect(repo.get(draft.id).data.status).toBe('published')
})

it('关注为幂等关系，关注流联动；屏蔽解除双向关注并禁止后续访问和互动',()=>{
  const {db,a,b,command,post,read}=fixture(),id=post();post(b,'其他作者笔记')
  command(b,'social.follow',{targetId:a.account.id,enabled:true});command(b,'social.follow',{targetId:a.account.id,enabled:true})
  expect(read(b,'view=following').posts.map(p=>p.id)).toEqual([id])
  expect(communitySocial(db,a.token,new URLSearchParams()).profile).toMatchObject({followers:1})
  expect(db.prepare("SELECT count(*) AS n FROM notifications WHERE event='community.follow'").get()?.n).toBe(1)
  command(a,'social.follow',{targetId:b.account.id,enabled:true})
  command(b,'social.block',{targetId:a.account.id,enabled:true})
  expect(read(b).posts.map(p=>p.id)).not.toContain(id)
  expect(()=>communityPostDetail(db,b.token,id)).toThrow('无法')
  expect(()=>command(b,'relation.set',{id,kind:'like',enabled:true})).toThrow('无法')
  expect(()=>command(b,'comment.create',{postId:id,body:'评论'})).toThrow('无法')
  expect(()=>command(b,'post.view',{id,openId:randomUUID()})).toThrow('无法')
  expect(communitySocial(db,a.token,new URLSearchParams()).profile).toMatchObject({followers:0,following:0})
  command(b,'social.block',{targetId:a.account.id,enabled:false})
  expect(read(b,'view=following').posts).toEqual([])
  expect(communityPostDetail(db,b.token,id).post.id).toBe(id)
})

it('评论回复绑定同帖，赞评论可取消且通知不重复；删除父评论不删除他人的回复',()=>{
  const {db,a,b,command,repo,post}=fixture(),id=post(),other=post()
  const root=command(b,'comment.create',{postId:id,body:'这张图很好看'})
  expect(()=>command(a,'comment.create',{postId:other,body:'跨帖回复',replyToId:root.id})).toThrow('回复对象')
  const reply=command(a,'comment.create',{postId:id,body:'谢谢你',replyToId:root.id})
  expect(repo.get(reply.id).data.parentId).toBe(root.id)
  command(a,'comment.like',{id:root.id,enabled:true});command(a,'comment.like',{id:root.id,enabled:true})
  let detail=communityPostDetail(db,a.token,id).post
  expect(detail.comments.find(c=>c.id===root.id)).toMatchObject({likes:1,liked:true})
  expect(detail.commentCount).toBe(2)
  expect(db.prepare("SELECT count(*) AS n FROM notifications WHERE event='community.commentlike'").get()?.n).toBe(1)
  expect(()=>command(a,'comment.delete',{id:root.id})).toThrow('本人')
  command(b,'comment.delete',{id:root.id})
  detail=communityPostDetail(db,a.token,id).post
  expect(detail.comments.map(c=>c.id)).toEqual([reply.id])
  expect(detail.commentCount).toBe(1)
  expect(()=>command(a,'comment.like',{id:root.id,enabled:true})).toThrow('不可查看')
})

it('真实赞藏数量共享；他人的收藏和赞过列表不公开，资料隐私继续生效',()=>{
  const {db,a,b,command,repo,post,read}=fixture(),id=post()
  command(b,'relation.set',{id,kind:'like',enabled:true});command(b,'relation.set',{id,kind:'save',enabled:true})
  expect(communityPostDetail(db,b.token,id).post).toMatchObject({likes:1,saves:1,commentCount:0})
  expect(communityPostDetail(db,b.token,id).post).not.toHaveProperty('viewCount')
  expect(read(b,`author=${b.account.id}&view=saved`).posts.map(p=>p.id)).toEqual([id])
  expect(()=>read(a,`author=${b.account.id}&view=liked`)).toThrow('本人')
  repo.create('profile',a.account.id,{nickname:'私密昵称',avatar:'私密头像',bio:'私密简介'})
  repo.create('preferences',a.account.id,{profilePreview:false})
  const view=communitySocial(db,b.token,new URLSearchParams(`person=${a.account.id}`))
  expect(JSON.stringify(view)).not.toContain('私密')
  expect(view.profile).toMatchObject({name:'author',appreciations:2})
})

it('不感兴趣只改变本人流，可撤销；举报与管理员处置使用同一内容',()=>{
  const {db,a,b,reviewer,command,post,read}=fixture(),id=post()
  command(b,'social.dismiss',{id});expect(read(b).posts).toEqual([]);expect(read(a).posts).toHaveLength(1)
  command(b,'social.dismiss',{id,enabled:false});expect(read(b).posts).toHaveLength(1)
  const report=command(b,'report.create',{id,reason:'内容不实，需要核对'})
  expect(()=>command(b,'report.create',{id,reason:'再次举报'})).toThrow('待处理')
  command(reviewer,'report.decide',{id:report.id,upheld:true,reason:'确认不实'})
  expect(read(a).posts).toEqual([])
  expect(()=>communityPostDetail(db,b.token,id)).toThrow('不可查看')
  expect(db.prepare("SELECT count(*) AS n FROM notifications WHERE recipient_id=? AND event='report.decide'").get(b.account.id)?.n).toBe(1)
  expect(communitySocial(db,b.token,new URLSearchParams('list=reports')).reports).toMatchObject([{status:'upheld',resolution:'确认不实'}])
  post(b,'读者的公开笔记')
  expect(communitySocial(db,a.token,new URLSearchParams(`person=${b.account.id}&list=reports`)).reports).toEqual([])
})

it('异步存储执行同一关注策略，并拒绝伪造图片与外部对象',async()=>{
  const {a,b,repo,post}=fixture();post()
  const asyncRepo=new Proxy(repo,{get(target,key){const value=Reflect.get(target,key);return typeof value==='function'?(...args:unknown[])=>Promise.resolve(value.apply(target,args)):value}}) as unknown as BusinessRepository
  await runAsync(communitySocialPolicy(asyncRepo,b.account,'social.follow',{targetId:a.account.id,enabled:true}))
  expect(repo.all('socialEdge')[0].data).toMatchObject({kind:'follow',enabled:true})
  await runAsync(communitySocialPolicy(asyncRepo,b.account,'direct.send',{targetId:a.account.id,body:'异步私信'}))
  expect(repo.all('directMessage')[0].data.body).toBe('异步私信')
  await expect(runAsync(communitySocialPolicy(asyncRepo,b.account,'social.follow',{targetId:b.account.id,enabled:true}))).rejects.toThrow('自己')
  await expect(runAsync(communitySocialPolicy(asyncRepo,a.account,'draft.save',{title:'x',body:'x',board:'校园',images:['https://unknown.invalid/image.jpg']}))).rejects.toThrow('有效')
})

it('草稿修改检查版本且有容量上限，工作区不泄露草稿和屏蔽内容',()=>{
  const {db,a,b,repo,post,command}=fixture(),id=post()
  const draft=command(a,'draft.save',{title:'私人草稿',body:'不可外泄的正文',board:'校园',images:[]})
  const original=repo.get(draft.id)
  command(a,'draft.save',{id:draft.id,version:original.version,title:'新草稿',body:'新正文',board:'校园',images:[]})
  expect(()=>command(a,'draft.save',{id:draft.id,version:original.version,title:'旧版本覆盖',board:'校园',images:[]})).toThrow('已更新')
  expect(JSON.stringify(snapshot(db,b.account))).not.toContain('不可外泄')
  command(b,'relation.set',{id,kind:'save',enabled:true})
  command(b,'social.block',{targetId:a.account.id,enabled:true})
  expect(snapshot(db,b.account).entities.some(e=>e.id===id)).toBe(false)
  for(let index=0;index<49;index++)repo.create('postDraft',a.account.id,{status:'draft',title:'容量测试'})
  expect(()=>command(a,'draft.save',{title:'第51份',board:'校园',images:[]})).toThrow('已满')
})

it('校友经验在服务端先筛选再分页，不受前20篇普通笔记影响',()=>{
  const {a,repo,read}=fixture()
  for(let index=0;index<30;index++)repo.create('post',a.account.id,{title:`普通笔记${index}`,body:'普通正文',board:'校园',status:'visible'})
  for(let index=0;index<25;index++)repo.create('post',a.account.id,{title:`校友经验${index}`,body:'就业分享',board:'校友就业',alumniId:'alumni-a',status:'visible'})
  const first=read(a,'alumni=all&limit=20'),second=read(a,'alumni=all&page=2&limit=20')
  expect(first).toMatchObject({total:25,hasMore:true})
  expect(second).toMatchObject({total:25,hasMore:false})
  expect(first.posts).toHaveLength(20);expect(second.posts).toHaveLength(5)
  expect(first.posts.every(p=>p.alumniId==='alumni-a')).toBe(true)
  expect(new Set([...first.posts,...second.posts].map(p=>p.id)).size).toBe(25)
})

it('超过一页评论仍返回真实总数，列表与详情计数一致',()=>{
  const {db,a,b,repo,post,read}=fixture(),id=post()
  for(let index=0;index<53;index++)repo.create('comment',b.account.id,{postId:id,body:`评论${index}`,status:'visible'})
  const first=communityPostDetail(db,a.token,id),second=communityPostDetail(db,a.token,id,2)
  expect(first).toMatchObject({commentsHasMore:true,commentPage:1})
  expect(first.post.comments).toHaveLength(50);expect(second.post.comments).toHaveLength(3)
  expect(first.post.commentCount).toBe(53)
  expect(read(a).posts.find(p=>p.id===id)?.commentCount).toBe(53)
})

it('社区简介使用本人资料保存，关闭资料预览后不向他人返回',()=>{
  const {db,a,b,repo,command,post}=fixture();post()
  command(a,'profile.save',{nickname:'校园作者',avatar:'',bio:'摄影与校园记录'})
  expect(communitySocial(db,b.token,new URLSearchParams(`person=${a.account.id}`)).profile).toMatchObject({bio:'摄影与校园记录'})
  expect(()=>command(a,'profile.save',{nickname:'校园作者',avatar:'',bio:'长'.repeat(101)})).toThrow('100')
  repo.create('preferences',a.account.id,{profilePreview:false})
  expect(communitySocial(db,b.token,new URLSearchParams(`person=${a.account.id}`)).profile).toMatchObject({bio:'',avatar:'',name:'author'})
})

it('本人封面和简介共同保存，旧偏好兼容且关闭预览不泄露自选背景',()=>{
  const {db,a,b,repo,command,post}=fixture();post()
  const image='data:image/webp;base64,UklGRg=='
  const read=(token:string)=>communitySocial(db,token,new URLSearchParams({person:a.account.id})).profile
  command(a,'profile.save',{nickname:'校园作者',avatar:'',bio:'记录校园的光',cover:image})
  expect(read(a.token)).toMatchObject({cover:image,bio:'记录校园的光'})
  expect(read(b.token)).toMatchObject({cover:image})
  expect(()=>command(a,'profile.save',{nickname:'覆盖',avatar:'',bio:'未保存',cover:'https://external.invalid/image.webp'})).toThrow('背景')
  expect(read(a.token)).toMatchObject({name:'校园作者',bio:'记录校园的光',cover:image})
  command(a,'preferences.profilebackground',{choice:'flowers'})
  expect(read(b.token)).toMatchObject({cover:'flowers',bio:'记录校园的光'})
  command(a,'profile.save',{nickname:'校园作者',avatar:'',bio:'新的简介'})
  expect(read(a.token)).toMatchObject({cover:'flowers',bio:'新的简介'})
  repo.create('preferences',a.account.id,{profilePreview:false})
  expect(read(b.token)).toMatchObject({name:'author',avatar:'',bio:'',cover:'lakeside'})
  expect(read(a.token)).toMatchObject({cover:'flowers'})
})

it('关注与搜索筛选不改变全社区75帖热榜门槛，屏蔽作者不泄露到热榜',()=>{
  const {a,b,repo,command,post,read}=fixture(),id=post()
  for(let index=0;index<75;index++)repo.create('post',b.account.id,{title:`普通公开笔记${index}`,body:'正文',board:'校园',status:'visible'})
  command(b,'relation.set',{id,kind:'like',enabled:true})
  command(b,'social.follow',{targetId:a.account.id,enabled:true})
  expect(read(b,'view=following').hotLists).toMatchObject({eligiblePostCount:76,overall:[id]})
  command(b,'social.block',{targetId:a.account.id,enabled:true})
  const hot=read(b).hotLists
  expect(hot.eligiblePostCount).toBe(76);expect(hot.overall).not.toContain(id)
})
