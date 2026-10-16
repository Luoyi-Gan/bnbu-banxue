import { afterEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { openDatabase, type Database } from '../backend/src/database';
import { createAccount, login } from '../backend/src/auth';
import { execute } from '../backend/src/commands';
import { communityView } from '../backend/src/community-view';
import { Repository } from '../backend/src/repository';
import { roomDetail, searchRooms } from '../backend/src/room-search';
import { createApiServer } from '../backend/src/main';

const databases: Database[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close() });

function setup() {
  const db = openDatabase(':memory:');
  databases.push(db);
  const make = (name: string) => {
    const email = `${name}@example.test`;
    const id = createAccount(db,{email,name,password:'Test-password-123',roles:['student']});
    return {id,token:login(db,email,'Test-password-123').token};
  };
  const a = make('student-a'), b = make('student-b');
  const run = (actor: typeof a, action: string, input: Record<string,unknown>) => execute(db,actor.token,action,input,randomUUID()) as {id:string};
  return {db,a,b,run,repo:new Repository(db)};
}

describe('社区真实互动与作者隐私', () => {
  it('只按主动打开标识计数，作者可见数字，75 帖时榜单关闭，76 帖时按七天互动排名', () => {
    const {db,a,b,run,repo} = setup();
    const first = run(a,'post.create',{title:'帖子一',body:'正文',board:'校园'});
    const second = run(a,'post.create',{title:'帖子二',body:'正文',board:'学习'});
    for (let index=0;index<73;index++) repo.create('post',a.id,{title:`填充 ${index}`,body:'正文',board:'校园',status:'visible'});
    const opened = randomUUID();
    run(b,'post.view',{id:first.id,openId:opened});
    run(b,'post.view',{id:first.id,openId:opened});
    run(b,'post.view',{id:first.id,openId:randomUUID()});
    expect(communityView(db,a.token).hotLists.overall).toEqual([]);
    expect(communityView(db,a.token).posts.find(post=>post.id===first.id)?.viewCount).toBe(2);
    expect(communityView(db,b.token).posts.find(post=>post.id===first.id)).not.toHaveProperty('viewCount');
    expect(() => run(b,'post.view',{id:second.id,openId:opened})).toThrow('其他帖子');
    const filler = repo.create('post',a.id,{title:'第 76 帖',body:'正文',board:'学习',status:'visible'});
    run(b,'relation.set',{id:second.id,kind:'like',enabled:true});
    run(b,'comment.create',{postId:second.id,body:'这是一条评论'});
    expect(communityView(db,b.token).hotLists).toMatchObject({eligiblePostCount:76,overall:[second.id,first.id],byBoard:{校园:[first.id],学习:[second.id]}});
    db.prepare('UPDATE post_views SET viewed_at=? WHERE post_id=?').run('2020-01-01T00:00:00.000Z',first.id);
    expect(communityView(db,b.token).hotLists.overall).toEqual([second.id]);
    run(a,'post.delete',{id:filler.id});
    expect(communityView(db,b.token).hotLists.overall).toEqual([]);
    run(a,'post.delete',{id:first.id});
    expect(() => run(b,'post.view',{id:first.id,openId:randomUUID()})).toThrow('不可查看');
  });
});

describe('找搭子服务端筛选', () => {
  it('公开开放队伍按结构条件和地点片段筛选，成员名单受限并分批读取', () => {
    const {db,a,b,run,repo} = setup();
    const sport = run(a,'room.create',{type:'sport',title:'羽毛球',body:'周末运动',time:'周六上午',place:'体育馆南门',capacity:4,details:{startsAt:'2026-10-20T09:00',sportType:'羽毛球',locationScope:'campus',extraCost:false,genderPreference:'any',placeAddress:'珠海市金湾区'}});
    const carpool = run(a,'room.create',{type:'carpool',title:'去珠海站',body:'一起出发',time:'周六',place:'学校南门',capacity:4,details:{startsAt:'2026-10-20T10:00',departurePlace:'学校南门',destinationPlace:'珠海站'}});
    const hidden = run(a,'room.create',{type:'sport',title:'隐藏运动',body:'保密',time:'周六',place:'体育馆',capacity:4,details:{startsAt:'2026-10-20T09:00',sportType:'羽毛球',locationScope:'campus',extraCost:false,genderPreference:'any'}});
    repo.save(repo.get(hidden.id),{visibility:'hidden'});
    const params = new URLSearchParams({type:'sport',location:'金湾',sportType:'羽毛球',extraCost:'no'});
    const filtered = searchRooms(db,repo.person(b.id),params);
    expect(filtered.items.map(room=>room.id)).toEqual([sport.id]);
    expect(filtered.items[0].memberCount).toBe(1);
    expect(filtered.items[0].members).toEqual([]);
    expect(searchRooms(db,repo.person(b.id),new URLSearchParams({type:'carpool',location:'珠海站'})).items.map(room=>room.id)).toEqual([carpool.id]);
    expect(searchRooms(db,repo.person(b.id),new URLSearchParams({type:'carpool',departureLocation:'学校南',destinationLocation:'珠海'})).items.map(room=>room.id)).toEqual([carpool.id]);
    expect(searchRooms(db,repo.person(b.id),new URLSearchParams({type:'carpool',departureLocation:'珠海站'})).items).toEqual([]);
    expect(searchRooms(db,repo.person(b.id),new URLSearchParams('type=sport&sportType=%E8%B7%91%E6%AD%A5&sportType=%E7%BE%BD%E6%AF%9B%E7%90%83')).items.map(room=>room.id)).toEqual([sport.id]);
    expect(() => roomDetail(db,repo.person(b.id),hidden.id)).toThrow('不可查看');
    for(let index=0;index<26;index++) repo.create('room',a.id,{type:'study',title:`学习 ${index}`,body:'课程',time:'商议',place:'图书馆',capacity:4,members:[a.id],status:'open',visibility:'visible'});
    const first = searchRooms(db,repo.person(b.id),new URLSearchParams());
    expect(first.items).toHaveLength(24);
    expect(first.nextCursor).toBeTruthy();
    const second = searchRooms(db,repo.person(b.id),new URLSearchParams({cursor:first.nextCursor!}));
    expect(second.items).toHaveLength(4);
    expect(new Set([...first.items,...second.items].map(room=>room.id)).size).toBe(28);
  });
  it('HTTP 接口要求学生身份，并复用公开队伍与浏览隐私边界', async () => {
    const {db,a,b,run,repo} = setup();
    const room = run(a,'room.create',{type:'sport',title:'跑步',body:'一起跑',time:'晚上',place:'操场',capacity:3,details:{startsAt:'2026-10-20T20:00',sportType:'跑步',locationScope:'campus',extraCost:false,genderPreference:'any'}});
    const hidden = run(a,'room.create',{type:'sport',title:'隐藏队伍',body:'不公开',time:'晚上',place:'操场',capacity:3,details:{startsAt:'2026-10-20T20:00',sportType:'跑步',locationScope:'campus',extraCost:false,genderPreference:'any'}});
    repo.save(repo.get(hidden.id),{visibility:'hidden'});
    const post = run(a,'post.create',{title:'跑步话题',body:'正文',board:'校园'});
    const server = createApiServer(db);
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      expect((await fetch(`${origin}/api/rooms`)).status).toBe(401);
      const found = await fetch(`${origin}/api/rooms?type=sport&location=%E6%93%8D%E5%9C%BA`,{headers:{cookie:`bnbu_session=${b.token}`}});
      expect(found.status).toBe(200);
      expect((await found.json()).items.map((item:{id:string})=>item.id)).toEqual([room.id]);
      expect((await fetch(`${origin}/api/rooms/${hidden.id}`,{headers:{cookie:`bnbu_session=${b.token}`}})).status).toBe(404);
      const viewed = await fetch(`${origin}/api/commands`,{method:'POST',headers:{cookie:`bnbu_session=${b.token}`,'content-type':'application/json'},body:JSON.stringify({action:'post.view',input:{id:post.id,openId:randomUUID()},requestId:randomUUID()})});
      expect(viewed.status).toBe(200);
      const authorFeed = await (await fetch(`${origin}/api/community`,{headers:{cookie:`bnbu_session=${a.token}`}})).json();
      const visitorFeed = await (await fetch(`${origin}/api/community`,{headers:{cookie:`bnbu_session=${b.token}`}})).json();
      expect(authorFeed.posts.find((item:{id:string})=>item.id===post.id).viewCount).toBe(1);
      expect(visitorFeed.posts.find((item:{id:string})=>item.id===post.id)).not.toHaveProperty('viewCount');
    } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
  });
});
