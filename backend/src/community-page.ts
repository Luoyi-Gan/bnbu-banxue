import {filterCommunityCandidates,requireSocialAccess,communitySocialRead,communityCounts,communityHotForViewer} from './community-social';
import {runSync} from './storage/effects';
import {authenticate,demand,type Account} from './auth';
import type {Database} from './database';
import {Repository,type Entity} from './repository';
import {projectCommunity} from './community-view';
import {projectDisplayPeople} from './display-people';
import {rankCommunity,type CommunityCandidate,type CommunityMetrics,type CommunitySignals} from './community-ranking';
import {readAlumni} from './alumni';

type CountRow={id:string;count:number};
const map=(rows:CountRow[])=>new Map(rows.map(row=>[String(row.id),Number(row.count)]));
function requireCommunity(actor:Account) {demand(actor.roles.length>0 && actor.status!=='banned','请先完成校园身份核验。',403)}
function metrics(db:Database,cutoff:string):CommunityMetrics {
  return {
    views:map(db.prepare('SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=? GROUP BY post_id').all(cutoff) as CountRow[]),
    likes:map(db.prepare("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=? GROUP BY entity_id").all(cutoff) as CountRow[]),
    comments:map(db.prepare("SELECT json_extract(data,'$.postId') AS id,count(*) AS count FROM entities WHERE kind='comment' AND json_extract(data,'$.status')='visible' AND created_at>=? GROUP BY json_extract(data,'$.postId')").all(cutoff) as CountRow[]),
  };
}
function signals(db:Database,actorId:string,cutoff:string):CommunitySignals {
  const board=new Map<string,number>();
  const add=(rows:{board:string;count:number}[],weight:number)=>{for(const row of rows) if(row.board) board.set(row.board,(board.get(row.board)??0)+Number(row.count)*weight)};
  add(db.prepare("SELECT json_extract(p.data,'$.board') AS board,count(*) AS count FROM post_views v JOIN entities p ON p.id=v.post_id WHERE v.viewer_id=? AND v.viewed_at>=? GROUP BY board").all(actorId,cutoff) as {board:string;count:number}[],1);
  add(db.prepare("SELECT json_extract(p.data,'$.board') AS board,count(*) AS count FROM relations r JOIN entities p ON p.id=r.entity_id WHERE r.account_id=? AND r.kind='like' AND r.created_at>=? GROUP BY board").all(actorId,cutoff) as {board:string;count:number}[],4);
  add(db.prepare("SELECT json_extract(p.data,'$.board') AS board,count(*) AS count FROM entities c JOIN entities p ON p.id=json_extract(c.data,'$.postId') WHERE c.kind='comment' AND c.owner_id=? AND c.created_at>=? GROUP BY board").all(actorId,cutoff) as {board:string;count:number}[],3);
  const viewed=new Set((db.prepare('SELECT DISTINCT post_id AS id FROM post_views WHERE viewer_id=? AND viewed_at>=?').all(actorId,cutoff) as {id:string}[]).map(row=>row.id));
  return {board,viewed};
}
function candidates(db:Database,actor:Account,withBody:boolean):CommunityCandidate[] {
  const body=withBody?"COALESCE(json_extract(p.data,'$.body'),'')":"''";
  const rows=db.prepare(`SELECT p.id,json_extract(p.data,'$.alumniId') AS alumniId,p.owner_id AS ownerId,p.created_at AS createdAt,COALESCE(json_extract(p.data,'$.title'),'') AS title,${body} AS body,COALESCE(json_extract(p.data,'$.board'),'') AS board,json_extract(p.data,'$.status') AS status,CASE WHEN (SELECT json_extract(data,'$.profilePreview') FROM entities WHERE kind='preferences' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1)=0 THEN COALESCE(a.name,'已注销用户') ELSE COALESCE((SELECT json_extract(data,'$.nickname') FROM entities WHERE kind='profile' AND owner_id=p.owner_id ORDER BY created_at DESC LIMIT 1),a.name,'已注销用户') END AS author FROM entities p LEFT JOIN accounts a ON a.id=p.owner_id WHERE p.kind='post' AND (json_extract(p.data,'$.status')='visible' OR (p.owner_id=? AND json_extract(p.data,'$.status')='pending'))`).all(actor.id) as unknown as CommunityCandidate[];
  return rows;
}
function relatedPeople(db:Database,actor:Account,entities:Entity[]) {
  const ids=[...new Set([actor.id,...entities.map(item=>item.ownerId).filter((id):id is string=>!!id)])];
  const repo=new Repository(db);
  const people=ids.flatMap(id=>{const row=db.prepare("SELECT id,name,organization,status,roles FROM accounts WHERE id=? AND login_kind<>'HISTORY'").get(id) as {id:string;name:string;organization:string;status:Account['status'];roles:string}|undefined;return row?[{...row,roles:JSON.parse(row.roles) as string[]}]:[]});
  return projectDisplayPeople(actor,people,new Set(ids),repo.all('preferences').filter(item=>ids.includes(item.ownerId??'')),repo.all('profile').filter(item=>ids.includes(item.ownerId??'')));
}
function projection(db:Database,actor:Account,entities:Entity[]) {
  const repo=new Repository(db),ids=entities.filter(item=>item.kind==='post').map(item=>item.id);
  const likes=new Map(ids.map(id=>[id,Number((db.prepare("SELECT count(*) AS count FROM relations WHERE kind='like' AND entity_id=?").get(id) as {count:number}).count)]));
  const viewCounts=new Map(ids.filter(id=>entities.find(item=>item.id===id)?.ownerId===actor.id).map(id=>[id,Number((db.prepare('SELECT count(*) AS count FROM post_views WHERE post_id=?').get(id) as {count:number}).count)]));
  const relations=db.prepare("SELECT entity_id AS entityId,kind FROM relations WHERE account_id=? AND kind IN ('like','save','commentlike')").all(actor.id) as {entityId:string;kind:string}[];
  const alumni=readAlumni(repo);
  const facts=runSync(communityCounts(repo,ids));
  const result=projectCommunity({account:actor,entities,people:relatedPeople(db,actor,entities),relations,alumni:{profiles:alumni.profiles}},likes,{allViews:viewCounts,recentViews:new Map(),recentLikes:new Map()},facts);
  return result;
}
export function communityFeed(db:Database,token:string,params:URLSearchParams) {
  const actor=authenticate(db,token);requireCommunity(actor);
  const query=(params.get('q')??'').trim(),board=params.get('board')??'全部',sort=params.get('sort')==='newest'?'newest':'recommended';
  demand(query.length<=100,'搜索词过长。');
  const page=Math.max(1,Math.min(100000,Number(params.get('page'))||1)),pageSize=Math.max(1,Math.min(50,Number(params.get('limit'))||20));
  const candidatesList=candidates(db,actor,Boolean(query)),all=runSync(filterCommunityCandidates(new Repository(db),actor,candidatesList,params)),cutoff7=new Date(Date.now()-7*86_400_000).toISOString(),cutoff30=new Date(Date.now()-30*86_400_000).toISOString();
  const engagement=metrics(db,cutoff7),personal=signals(db,actor.id,cutoff30);
  const ordered=rankCommunity(all,{board,query,sort},personal,engagement),selected=ordered.slice((page-1)*pageSize,page*pageSize);
  const hot=runSync(communityHotForViewer(new Repository(db),actor,candidatesList,engagement));
  const hotIds=[...new Set([...hot.overall,...Object.values(hot.byBoard).flat()])];
  const hotPosts=hotIds.flatMap(id=>{const item=candidatesList.find(post=>post.id===id);return item?[{id:item.id,title:item.title,board:item.board,author:item.author,status:item.status}]:[]});
  const repo=new Repository(db),entities=selected.map(item=>repo.get(item.id,'post'));
  const result=projection(db,actor,entities);
  return {...result,hotLists:hot,hotPosts,page,total:ordered.length,hasMore:page*pageSize<ordered.length,sort,query,board};
}
export function communityPostDetail(db:Database,token:string,id:string,page=1) {
  const actor=authenticate(db,token);requireCommunity(actor);
  const repo=new Repository(db),post=repo.get(id,'post');
  runSync(requireSocialAccess(repo,actor,post.ownerId));
  demand(post.data.status==='visible' || post.ownerId===actor.id && post.data.status==='pending','帖子当前不可查看。',403);
  const visible=db.prepare("SELECT id FROM entities WHERE kind='comment' AND json_extract(data,'$.postId')=? AND (json_extract(data,'$.status')='visible' OR (owner_id=? AND json_extract(data,'$.status')='pending')) ORDER BY created_at,id LIMIT 51 OFFSET ?").all(id,actor.id,(Math.max(1,page)-1)*50) as {id:string}[];
  const entities=[post,...visible.slice(0,50).map(row=>repo.get(row.id,'comment'))];
  const view=projection(db,actor,entities);
  return {post:view.posts[0],features:{postViews:true},commentsHasMore:visible.length>50,commentPage:page,liked:view.likedPosts.includes(id),saved:view.savedPosts.includes(id),alumniProfiles:view.alumniProfiles};
}

export function communitySocial(db:Database,token:string,params:URLSearchParams){const actor=authenticate(db,token);return runSync(communitySocialRead(new Repository(db),actor,params));}
