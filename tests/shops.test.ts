import {afterEach,describe,expect,it} from 'vitest';
import {createApiServer} from '../backend/src/main';
import type {AddressInfo} from 'node:net';
import {randomUUID} from 'node:crypto';
import {openDatabase,type Database} from '../backend/src/database';
import {authenticate,createAccount,login} from '../backend/src/auth';
import {execute} from '../backend/src/commands';
import {Repository} from '../backend/src/repository';
import {shopRead,shopPolicy} from '../backend/src/shops';
import {runSync,runAsync} from '../backend/src/storage/effects';

const databases:Database[]=[];
afterEach(()=>{for(const db of databases.splice(0))db.close()});
function setup(){
  const db=openDatabase(':memory:');databases.push(db);const repo=new Repository(db);
  const account=(name:string,roles:string[])=>{const email=`${name}@example.test`;createAccount(db,{email,name,password:'Test-password-123',roles});return authenticate(db,login(db,email,'Test-password-123').token)};
  const admin=account('admin',['superadmin']),student=account('student',['student']),other=account('other',['student']),teacher=account('teacher',['teacher']);
  const token=(actor:typeof admin)=>login(db,`${actor.name}@example.test`,'Test-password-123').token;
  const tokens=new Map([admin,student,other,teacher].map(actor=>[actor.id,token(actor)]));
  const run=(actor:typeof admin,action:string,input:Record<string,unknown>,requestId=randomUUID())=>execute(db,tokens.get(actor.id)!,action,input,requestId) as {id:string};
  const read=(actor=student,query='')=>runSync(shopRead(repo,actor,new URLSearchParams(query)));
  const create=()=>run(admin,'shop.save',{name:'测试食堂',category:'餐饮',scope:'campus',address:'测试校区一楼',description:'测试店铺',images:[]}).id;
  return {db,repo,admin,student,other,teacher,run,read,create,tokens};
}
describe('校园探店共享数据与权限',()=>{
  it('HTTP读取执行会话与管理权限，返回新建的共享店铺',async()=>{
    const {db,admin,student,tokens,create}=setup(),id=create();
    const server=createApiServer(db);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const origin=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try{
      expect((await fetch(origin+'/api/shops')).status).toBe(401);
      const headers={cookie:`bnbu_session=${tokens.get(student.id)}`};
      const response=await fetch(origin+'/api/shops',{headers});expect(response.status).toBe(200);expect((await response.json()).shops[0].id).toBe(id);
      expect((await fetch(origin+'/api/shops?admin=1',{headers})).status).toBe(403);
      expect((await fetch(origin+'/api/shops?admin=1',{headers:{cookie:`bnbu_session=${tokens.get(admin.id)}`}})).status).toBe(200);
    }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()))}
  });

  it('仅管理员维护店铺，学生仅看公开店铺，写入幂等且审计',()=>{
    const {db,admin,student,teacher,run,read,repo}=setup();
    const input={name:'测试店铺',category:'咖啡',scope:'outside',address:'测试路',images:[]};
    expect(()=>run(student,'shop.save',input)).toThrow('管理员');expect(()=>read(teacher)).toThrow('身份');expect(()=>read(student,'admin=1')).toThrow('职责');
    const requestId=randomUUID(),first=run(admin,'shop.save',input,requestId),second=run(admin,'shop.save',input,requestId);
    expect(first).toEqual(second);expect(repo.all('shop')).toHaveLength(1);
    expect(db.prepare("SELECT count(*) AS count FROM audit WHERE action='shop.save'").get()?.count).toBe(1);
    run(admin,'shop.visibility',{id:first.id,version:1,status:'hidden',reason:'资料核对'});
    expect(read().shops).toEqual([]);expect(()=>read(student,`id=${first.id}`)).toThrow('不可查看');
    expect((read(admin,'admin=1').shops as unknown[])).toHaveLength(1);
  });
  it('点评文字图片校验、屏蔽词、所有权和版本冲突',()=>{
    const {admin,student,other,run,repo,create}=setup(),shopId=create();
    const review=run(student,'shop.review.create',{shopId,body:'味道不错',dish:'面条',images:['data:image/png;base64,aGVsbG8=']});
    expect(()=>run(other,'shop.review.update',{id:review.id,version:1,body:'篡改',images:[]})).toThrow('本人');
    run(student,'shop.review.update',{id:review.id,version:1,body:'更新体验',images:[]});
    expect(()=>run(student,'shop.review.update',{id:review.id,version:1,body:'旧版',images:[]})).toThrow('已更新');
    expect(()=>run(student,'shop.review.create',{shopId,body:'',images:[]})).toThrow();
    expect(()=>run(student,'shop.review.create',{shopId,body:'体验',images:['javascript:alert(1)']})).toThrow('图片');
    run(admin,'keyword.save',{word:'测试禁词'});
    expect(()=>run(student,'shop.review.create',{shopId,body:'测试禁词',images:[]})).toThrow('屏蔽词');
    expect(repo.all('shopReview')).toHaveLength(1);
  });
  it('店铺暂停公开阻止新增点评且隐藏点评，恢复后仅返回公开内容',()=>{
    const {admin,student,run,read,repo,create}=setup(),id=create();
    const review=run(student,'shop.review.create',{shopId:id,body:'测试点评',images:[]});
    run(admin,'shop.visibility',{id,version:1,status:'hidden',reason:'暂停公开'});
    expect(()=>run(student,'shop.review.create',{shopId:id,body:'不能新增',images:[]})).toThrow('暂停');
    run(admin,'shop.review.moderate',{id:review.id,version:1,status:'hidden',reason:'核查'});
    run(admin,'shop.visibility',{id,version:2,status:'visible',reason:'恢复店铺'});
    expect((read(student,`id=${id}`).reviews as unknown[])).toHaveLength(1);
    expect((read(student,`id=${id}`).shops as {reviewCount:number}[])[0].reviewCount).toBe(0);
    expect(()=>run(student,'shop.review.update',{id:review.id,version:2,body:'试图恢复',images:[]})).toThrow('不能编辑');
    expect(repo.get(review.id).data.status).toBe('hidden');
  });
  it('举报防重、处置联动、软删除不可恢复，隐私投影不泄露身份',()=>{
    const {admin,student,other,run,read,repo,create,db}=setup(),id=create();
    repo.create('profile',student.id,{nickname:'测试昵称'});repo.create('preferences',student.id,{profilePreview:false});
    const review=run(student,'shop.review.create',{shopId:id,body:'测试体验',images:[]});
    const publicView=(read(other,`id=${id}`).reviews as {author:string;ownerId?:string}[])[0];
    expect(publicView.author).toBe('校园同学');expect(publicView.ownerId).toBeUndefined();expect(JSON.stringify(publicView)).not.toContain(student.email);
    const report=run(other,'shop.report',{id:review.id,reason:'疑似无关内容'});
    expect(()=>run(other,'shop.report',{id:review.id,reason:'再次举报'})).toThrow('待处理');
    expect(()=>run(student,'shop.report',{id:review.id,reason:'举报自己'})).toThrow();
    expect(()=>run(other,'shop.report.decide',{id:report.id,version:1,upheld:true,reason:'伪造'})).toThrow('职责');
    run(admin,'shop.report.decide',{id:report.id,version:1,upheld:true,reason:'核查成立'});
    expect(read(other,`id=${id}`).reviews).toEqual([]);
    expect(repo.get(report.id).data.status).toBe('upheld');
    expect(Number(db.prepare("SELECT count(*) AS count FROM notifications WHERE event LIKE 'shop.%'").get()?.count)).toBe(2);
    run(student,'shop.review.delete',{id:review.id,version:2});
    expect(()=>run(admin,'shop.review.moderate',{id:review.id,version:3,status:'visible',reason:'恢复'})).toThrow('已删除');
  });
  it('异步存储驱动复用同一权限与投影规则，点评分页保留店铺详情',async()=>{
    const {repo,admin,student,create}=setup(),id=create();
    await runAsync(shopPolicy(repo,student,'shop.review.create',{shopId:id,body:'异步驱动',images:[]}));
    for(let index=0;index<21;index++)repo.create('shopReview',student.id,{shopId:id,body:`内容${index}`,images:[],status:'visible'});
    const view=await runAsync(shopRead(repo,student,new URLSearchParams(`id=${id}&page=2`)));
    expect(view.shops).toHaveLength(1);expect(view.reviews).toHaveLength(2);expect(view.hasMore).toBe(false);
    await expect(runAsync(shopPolicy(repo,student,'shop.visibility',{id,version:1,status:'hidden',reason:'越权'}))).rejects.toThrow('管理员');
    const adminView=await runAsync(shopRead(repo,admin,new URLSearchParams('admin=1')));expect(adminView.canManage).toBe(true);
  });
});
