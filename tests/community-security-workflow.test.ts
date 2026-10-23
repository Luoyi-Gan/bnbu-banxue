import {randomUUID} from 'node:crypto';
import {afterEach,expect,it} from 'vitest';
import {openDatabase,transaction} from '../backend/src/database';
import {authenticate,createAccount,issueCode,login} from '../backend/src/auth';
import {Repository} from '../backend/src/repository';
import {snapshot} from '../backend/src/commands';
import {communityFeed,communityPostDetail} from '../backend/src/community-page';
import {moderationPage} from '../backend/src/community-moderation-page';
import {requestStudentIdentity,reviewStudentIdentity,listStudentIdentityRequests} from '../backend/src/student-identity-workflow';
import {requestPasswordReset,completePasswordReset} from '../backend/src/password-reset';
import {rankCommunity,rankHotSummaries,type CommunityCandidate} from '../backend/src/community-ranking';

const databases:ReturnType<typeof openDatabase>[]=[];
afterEach(()=>{for(const db of databases.splice(0)) db.close()});
const database=()=>{const db=openDatabase(':memory:');databases.push(db);return db};
const account=(db:ReturnType<typeof openDatabase>,name:string,roles:string[]=[])=>{
  const email=`${name}@example.test`;
  const id=createAccount(db,{email,name,password:'Acceptance-123',roles});
  return {...login(db,email,'Acceptance-123'),id,email};
};

it('无身份账号的工作区不暴露 108 人名录或隐藏学号',()=>{
  const db=database(),stranger=account(db,'new-user'),repo=new Repository(db);
  for(let i=0;i<108;i++) {
    const id=createAccount(db,{email:`student-${i}@example.test`,name:`同学${i}`,password:'Acceptance-123',roles:['student'],organization:'私有学院'});
    repo.create('companionIdentity',id,{role:'student',status:'verified',studentNumber:`S${100000+i}`});
    if(i===0) repo.create('preferences',id,{searchable:false});
  }
  const view=snapshot(db,stranger.account);
  expect(view.people).toHaveLength(1);
  expect(view.people[0].id).toBe(stranger.id);
  expect(view.entities).toEqual([]);
  expect(JSON.stringify(view)).not.toContain('S100000');
  expect(JSON.stringify(view)).not.toContain('私有学院');
  expect(()=>communityFeed(db,stranger.token,new URLSearchParams())).toThrow('核验');
},20000);

it('三千帖工作区保持有界，社区与审核按页返回并提供评论上下文',()=>{
  const db=database(),author=account(db,'author',['student']),reader=account(db,'reader',['student']),reviewer=account(db,'reviewer',['reviewer']);
  const insert=db.prepare('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)');
  const now=new Date().toISOString();
  transaction(db,()=>{for(let i=0;i<3000;i++) insert.run(randomUUID(),'post',author.id,JSON.stringify({title:`校园话题 ${i}`,body:'正常内容',board:'校园',status:'visible'}),now,now)});
  const first=communityFeed(db,reader.token,new URLSearchParams('page=1&limit=20'));
  const second=communityFeed(db,reader.token,new URLSearchParams('page=2&limit=20'));
  expect(first).toMatchObject({total:3000,page:1,hasMore:true});
  expect(first.posts).toHaveLength(20);
  expect(second.posts).toHaveLength(20);
  expect(new Set([...first.posts,...second.posts].map(post=>post.id)).size).toBe(40);
  const ownWorkspace=snapshot(db,author.account);
  expect(ownWorkspace.entities.filter(item=>item.kind==='post')).toHaveLength(50);
  expect(JSON.stringify(ownWorkspace).length).toBeLessThan(200_000);
  const post=first.posts[0];
  new Repository(db).create('comment',reader.id,{postId:post.id,body:'具体评论',status:'visible'});
  const moderation=moderationPage(db,reviewer.account,new URLSearchParams('kind=comment'));
  expect(moderation.items).toHaveLength(1);
  expect(moderation.items[0]).toMatchObject({postTitle:post.title,postExcerpt:'正常内容',body:'具体评论'});
  expect(communityPostDetail(db,reader.token,post.id).post.comments).toHaveLength(1);
});

it('身份申请经校方依据人工确认后授权，撤销后立即失去学生资格',async()=>{
  const db=database(),student=account(db,'student'),reviewer=account(db,'reviewer',['reviewer']),admin=account(db,'super',['superadmin']);
  const repo=new Repository(db);
  repo.create('verifiedEmail',student.id,{email:student.email,source:'registration-code'});
  const old=process.env.BNBU_IDENTITY_VERIFICATION_URL;
  delete process.env.BNBU_IDENTITY_VERIFICATION_URL;
  try {
    const pending=await requestStudentIdentity(db,student.account,{studentNumber:'STU2026001',schoolName:'测试学生'});
    expect(pending.status).toBe('pending');
    expect(authenticate(db,student.token).roles).toEqual([]);
    const queue=listStudentIdentityRequests(db,reviewer.account,new URLSearchParams('query=STU2026001'));
    expect(queue.items).toHaveLength(1);
    const request=queue.items[0];
    expect(()=>reviewStudentIdentity(db,reviewer.account,{id:request.id,version:request.version,decision:'approve',reason:'已核对'})).toThrow('依据');
    reviewStudentIdentity(db,reviewer.account,{id:request.id,version:request.version,decision:'approve',reason:'已核对学校在读名册',evidenceId:'registry-2026-001'});
    expect(authenticate(db,student.token).roles).toContain('student');
    const verified=repo.get(request.id);
    reviewStudentIdentity(db,admin.account,{id:request.id,version:verified.version,decision:'revoke',reason:'学校名册已撤销该在读记录'});
    expect(authenticate(db,student.token).roles).not.toContain('student');
  } finally {if(old===undefined) delete process.env.BNBU_IDENTITY_VERIFICATION_URL; else process.env.BNBU_IDENTITY_VERIFICATION_URL=old}
});

it('已验证邮箱可找回密码并撤销旧会话，错误验证码计次',async()=>{
  const db=database(),student=account(db,'reset-user'),repo=new Repository(db);
  repo.create('verifiedEmail',student.id,{email:student.email});
  const unknown=await requestPasswordReset(db,'unknown@example.test','test-source',true);
  const known=await requestPasswordReset(db,student.email,'test-source',true);
  expect(unknown).toEqual(known);
  const mail=db.prepare("SELECT body FROM mail_outbox WHERE recipient=? AND subject='伴学找回密码' ORDER BY created_at DESC LIMIT 1").get(student.email) as {body:string};
  const code=mail.body.match(/\d{6}/)![0];
  expect(()=>completePasswordReset(db,{identifier:student.email,code:'000000',password:'New-Password-123'})).toThrow();
  expect(db.prepare('SELECT attempts FROM password_reset_challenges WHERE account_id=?').get(student.id).attempts).toBe(1);
  expect(completePasswordReset(db,{identifier:student.email,code,password:'New-Password-123'})).toEqual({reset:true});
  expect(()=>authenticate(db,student.token)).toThrow();
  expect(()=>login(db,student.email,'Acceptance-123')).toThrow();
  expect(login(db,student.email,'New-Password-123').account.id).toBe(student.id);
});

it('同一来源无法向超过二十个邮箱连续发码，十一轮错误口令不封死账号',()=>{
  const db=database(),student=account(db,'login-user');
  for(let i=0;i<20;i++) expect(issueCode(db,`recipient-${i}@example.test`,'one-source').sent).toBe(true);
  expect(()=>issueCode(db,'recipient-20@example.test','one-source')).toThrow('频繁');
  for(let i=0;i<11;i++) expect(()=>login(db,student.email,'wrong-password','attacker-source')).toThrow();
  expect(login(db,student.email,'Acceptance-123','owner-source').account.id).toBe(student.id);
});

it('个人排序与搜索只使用社区行为、内容和时间，热榜无数量门槛',()=>{
  const now=Date.now(),createdAt=new Date(now-86_400_000).toISOString();
  const candidate=(id:string,board:string,title:string):CommunityCandidate=>({id,ownerId:'author',board,title,body:'说明',author:'作者',createdAt,status:'visible'});
  const posts=[candidate('a','学习','学习资料'),candidate('b','校园','校园资料')];
  const metrics={views:new Map<string,number>(),likes:new Map<string,number>(),comments:new Map<string,number>()};
  const ranked=rankCommunity(posts,{}, {board:new Map([['校园',4]]),viewed:new Set()},metrics,now);
  expect(ranked.map(post=>post.id)).toEqual(['b','a']);
  expect(rankCommunity(posts,{query:'资料 校园'}, {board:new Map(),viewed:new Set()},metrics,now).map(post=>post.id)).toEqual(['b']);
  expect(rankHotSummaries(Array.from({length:75},(_,index)=>candidate(String(index),'校园','帖子')),metrics).overall).toEqual([]);
  expect(rankHotSummaries(Array.from({length:1},(_,index)=>candidate(String(index),'校园','帖子')),{...metrics,views:new Map([['0',1]])}).overall).toEqual(['0']);
});
