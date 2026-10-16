import type {PoolClient} from 'pg';
import {demand,type Account} from '../auth';
import {projectCommunity} from '../community-view';
import {rankCommunity,rankHotSummaries,type CommunityCandidate,type CommunityMetrics,type CommunitySignals} from '../community-ranking';
import {projectDisplayPeople} from '../display-people';
import type {Entity} from '../repository';
import type {AlumniData} from '../../../shared/v2/alumniModel';
import type {PostgresDatabase} from './postgres';
import {PostgresAuth} from './postgres-auth';
import {PostgresRepository,decodePostgresEntity} from './postgres-repository';

type CountRow={id:string;count:string};
const map=(rows:CountRow[])=>new Map(rows.map(row=>[row.id,Number(row.count)]));
const community=(actor:Account)=>demand(actor.roles.length>0 && actor.status!=='banned','请先完成校园身份核验。',403);
async function metrics(client:PoolClient,cutoff:string):Promise<CommunityMetrics> {
  const [views,likes,comments]=await Promise.all([
    client.query<CountRow>('SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=$1 GROUP BY post_id',[cutoff]),
    client.query<CountRow>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=$1 GROUP BY entity_id",[cutoff]),
    client.query<CountRow>("SELECT data::jsonb->>'postId' AS id,count(*) AS count FROM entities WHERE kind='comment' AND data::jsonb->>'status'='visible' AND created_at>=$1 GROUP BY data::jsonb->>'postId'",[cutoff]),
  ]);
  return {views:map(views.rows),likes:map(likes.rows),comments:map(comments.rows)};
}
async function signals(client:PoolClient,actorId:string,cutoff:string):Promise<CommunitySignals> {
  const board=new Map<string,number>();
  const add=(rows:{board:string;count:string}[],weight:number)=>{for(const row of rows) if(row.board) board.set(row.board,(board.get(row.board)??0)+Number(row.count)*weight)};
  const [views,likes,comments,viewed]=await Promise.all([
    client.query<{board:string;count:string}>("SELECT p.data::jsonb->>'board' AS board,count(*) AS count FROM post_views v JOIN entities p ON p.id=v.post_id WHERE v.viewer_id=$1 AND v.viewed_at>=$2 GROUP BY board",[actorId,cutoff]),
    client.query<{board:string;count:string}>("SELECT p.data::jsonb->>'board' AS board,count(*) AS count FROM relations r JOIN entities p ON p.id=r.entity_id WHERE r.account_id=$1 AND r.kind='like' AND r.created_at>=$2 GROUP BY board",[actorId,cutoff]),
    client.query<{board:string;count:string}>("SELECT p.data::jsonb->>'board' AS board,count(*) AS count FROM entities c JOIN entities p ON p.id=c.data::jsonb->>'postId' WHERE c.kind='comment' AND c.owner_id=$1 AND c.created_at>=$2 GROUP BY board",[actorId,cutoff]),
    client.query<{id:string}>('SELECT DISTINCT post_id AS id FROM post_views WHERE viewer_id=$1 AND viewed_at>=$2',[actorId,cutoff]),
  ]);
  add(views.rows,1);add(likes.rows,4);add(comments.rows,3);
  return {board,viewed:new Set(viewed.rows.map(row=>row.id))};
}
async function candidates(client:PoolClient,actor:Account,withBody:boolean) {
  const body=withBody?"COALESCE(p.data::jsonb->>'body','')":"''";
  const result=await client.query<{id:string;ownerId:string|null;createdAt:string;title:string;body:string;board:string;status:string;author:string}>(`SELECT p.id,p.owner_id AS "ownerId",p.created_at AS "createdAt",COALESCE(p.data::jsonb->>'title','') AS title,${body} AS body,COALESCE(p.data::jsonb->>'board','') AS board,p.data::jsonb->>'status' AS status,CASE WHEN (SELECT data::jsonb->>'profilePreview' FROM entities WHERE kind='preferences' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1)='false' THEN COALESCE(a.name,'已注销用户') ELSE COALESCE((SELECT data::jsonb->>'nickname' FROM entities WHERE kind='profile' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1),a.name,'已注销用户') END AS author FROM entities p LEFT JOIN accounts a ON a.id=p.owner_id WHERE p.kind='post' AND (p.data::jsonb->>'status'='visible' OR (p.owner_id=$1 AND p.data::jsonb->>'status'='pending'))`,[actor.id]);
  return result.rows as CommunityCandidate[];
}
async function projection(client:PoolClient,actor:Account,entities:Entity[]) {
  const ids=[...new Set([actor.id,...entities.map(item=>item.ownerId).filter((id):id is string=>!!id)])];
  const accounts=(await client.query<{id:string;name:string;organization:string;status:Account['status'];roles:string}>("SELECT id,name,organization,status,roles FROM accounts WHERE id=ANY($1::text[]) AND login_kind<>'HISTORY'",[ids])).rows.map(row=>({...row,roles:JSON.parse(row.roles) as string[]}));
  const repo=new PostgresRepository(client);
  const [profiles,preferences]=await Promise.all([repo.all('profile'),repo.all('preferences')]);
  const people=projectDisplayPeople(actor,accounts,new Set(ids),preferences.filter(item=>ids.includes(item.ownerId??'')),profiles.filter(item=>ids.includes(item.ownerId??'')));
  const postIds=entities.filter(item=>item.kind==='post').map(item=>item.id);
  const [likeRows,viewRows,relations,alumni]=await Promise.all([
    client.query<CountRow>("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND entity_id=ANY($1::text[]) GROUP BY entity_id",[postIds]),
    client.query<CountRow>('SELECT post_id AS id,count(*) AS count FROM post_views WHERE post_id=ANY($1::text[]) GROUP BY post_id',[postIds.filter(id=>entities.find(item=>item.id===id)?.ownerId===actor.id)]),
    client.query<{entityId:string;kind:string}>("SELECT entity_id AS \"entityId\",kind FROM relations WHERE account_id=$1 AND kind IN ('like','save')",[actor.id]),
    repo.all('alumniState'),
  ]);
  const alumniState=alumni[0]?.data.value as AlumniData|undefined;
  return projectCommunity({account:actor,entities,people,relations:relations.rows,alumni:{profiles:alumniState?.profiles??[]}},map(likeRows.rows),{allViews:map(viewRows.rows),recentViews:new Map(),recentLikes:new Map()});
}
export async function postgresCommunityFeed(db:PostgresDatabase,token:string,params:URLSearchParams) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);community(actor);
    const query=(params.get('q')??'').trim(),board=params.get('board')??'全部',sort=params.get('sort')==='newest'?'newest':'recommended';
    demand(query.length<=100,'搜索词过长。');
    const page=Math.max(1,Math.min(100000,Number(params.get('page'))||1)),pageSize=Math.max(1,Math.min(50,Number(params.get('limit'))||20));
    const cutoff7=new Date(Date.now()-7*86_400_000).toISOString(),cutoff30=new Date(Date.now()-30*86_400_000).toISOString();
    const [all,engagement,personal]=await Promise.all([candidates(client,actor,Boolean(query)),metrics(client,cutoff7),signals(client,actor.id,cutoff30)]);
    const ordered=rankCommunity(all,{board,query,sort},personal,engagement),selected=ordered.slice((page-1)*pageSize,page*pageSize);
    const hot=rankHotSummaries(all,engagement),hotIds=[...new Set([...hot.overall,...Object.values(hot.byBoard).flat()])];
    const hotPosts=hotIds.flatMap(id=>{const item=all.find(post=>post.id===id);return item?[{id:item.id,title:item.title,board:item.board,author:item.author,status:item.status}]:[]});
    const rows=selected.length?(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>('SELECT * FROM entities WHERE id=ANY($1::text[])',[selected.map(item=>item.id)])).rows:[];
    const entityMap=new Map((await Promise.all(rows.map(decodePostgresEntity))).map(item=>[item.id,item]));
    const entities=selected.flatMap(item=>{const entity=entityMap.get(item.id);return entity?[entity]:[]});
    const result=await projection(client,actor,entities);
    return {...result,hotLists:hot,hotPosts,page,total:ordered.length,hasMore:page*pageSize<ordered.length,sort,query,board};
  });
}
export async function postgresCommunityPostDetail(db:PostgresDatabase,token:string,id:string,page=1) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);community(actor);
    const repo=new PostgresRepository(client),post=await repo.get(id,'post');
    demand(post.data.status==='visible'||post.ownerId===actor.id&&post.data.status==='pending','帖子当前不可查看。',403);
    const rows=(await client.query<{id:string;kind:string;owner_id:string|null;data:string;version:number;created_at:string;updated_at:string}>("SELECT * FROM entities WHERE kind='comment' AND data::jsonb->>'postId'=$1 AND (data::jsonb->>'status'='visible' OR (owner_id=$2 AND data::jsonb->>'status'='pending')) ORDER BY created_at,id LIMIT 51 OFFSET $3",[id,actor.id,(Math.max(1,page)-1)*50])).rows;
    const entities=[post,...await Promise.all(rows.slice(0,50).map(decodePostgresEntity))];
    const view=await projection(client,actor,entities);
    return {post:view.posts[0],commentsHasMore:rows.length>50,commentPage:page,liked:view.likedPosts.includes(id),saved:view.savedPosts.includes(id),alumniProfiles:view.alumniProfiles};
  });
}
