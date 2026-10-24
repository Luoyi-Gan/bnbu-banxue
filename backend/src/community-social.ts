import {demand,type Account} from './auth';
import {textField,strings,type Entity,type Fields} from './repository';
import {effect,type BusinessRepository} from './storage/effects';
import {checkCommunityKeywords} from './community-keywords';
import {projectDisplayPeople} from './display-people';
import type {AlumniData} from '../../shared/v2/alumniModel';
import {rankHotSummaries,type CommunityCandidate,type CommunityMetrics} from './community-ranking';

export {socialBlocked} from './chat-visibility';
import {socialBlocked} from './chat-visibility';
export function* requireSocialAccess(repo:BusinessRepository,actor:Account,ownerId:string|null):Generator<unknown,void,unknown>{
  demand(!socialBlocked(yield* effect(repo.all('socialEdge')),actor.id,ownerId),'当前无法与该用户互动。',403);
}
export function validPostImages(value:unknown,original:unknown=[]){
  demand(Array.isArray(value),'图片列表无效。');
  const allowed=strings(original).map(src=>src.split('?')[0]);
  const images=strings(value);
  demand(images.length===value.length&&images.length<=9&&images.every(src=>/^data:image\/(jpeg|png|webp);base64,/.test(src)&&src.length<=7_000_000||allowed.includes(src.split('?')[0])),'最多九张有效 JPG、PNG、WebP 图片。');
  return images;
}

export function* communitySocialPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields):Generator<unknown,Entity|undefined,unknown>{
  if(action==='direct.send'){
    demand(actor.roles.includes('student')&&actor.status==='active','账号当前不能发送私信。',403);
    const targetId=textField(input,'targetId',100);
    demand(targetId!==actor.id,'不能给自己发送私信。');
    const target=yield* effect(repo.person(targetId));
    demand(target.roles.includes('student')&&target.status==='active','用户当前不可私信。',403);
    yield* requireSocialAccess(repo,actor,targetId);
    yield* communitySocialRead(repo,actor,new URLSearchParams({person:targetId}));
    const messages=yield* effect(repo.all('directMessage'));
    demand(messages.filter(m=>m.ownerId===actor.id&&Date.parse(m.createdAt)>Date.now()-60000).length<20,'发送过于频繁，请稍后再试。',429);
    const body = textField(input, 'body', 500);
    yield* checkCommunityKeywords(repo, body);
    const message=yield* effect(repo.create('directMessage',actor.id,{targetId,body}));
    yield* effect(repo.notify([targetId],message.id,'community.direct','你收到了一条校园私信。'));
    return message;
  }
  if(!['social.follow','social.block','social.dismiss','draft.save','draft.delete','post.update','comment.delete','comment.like'].includes(action))return;
  demand(actor.roles.includes('student'),'需要已授权学生身份。',403);
  if(['post.update','comment.like','social.follow'].includes(action))demand(actor.status==='active','账号当前不能发帖、评论或互动。',403);
  if(action==='social.follow'||action==='social.block'){
    const targetId=textField(input,'targetId',100),kind=action==='social.follow'?'follow':'block';
    demand(targetId!==actor.id,'不能对自己执行此操作。');
    const target=yield* effect(repo.person(targetId));
    demand(target.roles.includes('student')&&target.status!=='banned','用户当前不可访问。',404);
    demand(typeof input.enabled==='boolean','请明确操作状态。');
    const edges=yield* effect(repo.all('socialEdge'));
    if(kind==='follow'&&input.enabled){
      demand(!socialBlocked(edges,actor.id,targetId),'请先解除屏蔽。',403);
      const publicPosts=(yield* effect(repo.communityPostIndex())).filter(p=>p.data.status==='visible');
      const publicAuthor=publicPosts.some(p=>p.ownerId===targetId)||(yield* effect(repo.communityCommentIndex())).some(c=>c.ownerId===targetId&&c.data.status==='visible'&&publicPosts.some(p=>p.id===c.data.postId));
      demand(publicAuthor||edges.some(e=>e.ownerId===actor.id&&e.data.targetId===targetId),'请从公开内容访问作者。',403);
    }
    const old=edges.find(e=>e.ownerId===actor.id&&e.data.targetId===targetId&&e.data.kind===kind);
    if(kind==='block'&&input.enabled)for(const edge of edges.filter(e=>e.data.kind==='follow'&&((e.ownerId===actor.id&&e.data.targetId===targetId)||(e.ownerId===targetId&&e.data.targetId===actor.id))))yield* effect(repo.save(edge,{enabled:false}));
    if(kind==='follow'&&input.enabled&&old?.data.enabled!==true)yield* effect(repo.notify([targetId],null,'community.follow','有同学关注了你。'));
    return old?yield* effect(repo.save(old,{enabled:input.enabled})):yield* effect(repo.create('socialEdge',actor.id,{targetId,kind,enabled:input.enabled}));
  }
  if(action==='social.dismiss'){
    const post=yield* effect(repo.get(input.id,'post'));
    demand(post.data.status==='visible','帖子当前不可查看。',403);
    const old=(yield* effect(repo.all('socialEdge'))).find(e=>e.ownerId===actor.id&&e.data.targetId===post.id&&e.data.kind==='dismiss');
    return old?yield* effect(repo.save(old,{enabled:input.enabled!==false})):yield* effect(repo.create('socialEdge',actor.id,{targetId:post.id,kind:'dismiss',enabled:true}));
  }
  if(action==='draft.save'||action==='draft.delete'){
    const draft=input.id?yield* effect(repo.get(input.id,'postDraft')):null;
    if(draft)demand(draft.ownerId===actor.id&&draft.data.status==='draft','只能处理本人的有效草稿。',403);
    if(action==='draft.delete'){demand(draft,'草稿不存在。',404);return yield* effect(repo.save(draft,{status:'deleted',images:[],body:'',title:''}));}
    if(draft)demand(input.version===draft.version,'草稿已更新，请重新打开。',409);
    else demand((yield* effect(repo.all('postDraft'))).filter(d=>d.ownerId===actor.id&&d.data.status==='draft').length<50,'草稿箱已满，请先处理已有草稿。',409);
    const source=input.sourcePostId?yield* effect(repo.get(input.sourcePostId,'post')):null;
    if(source)demand(source.ownerId===actor.id,'只能编辑本人帖子。',403);
    const patch={title:textField(input,'title',80,true),body:textField(input,'body',1000,true),board:textField(input,'board',40),images:validPostImages(input.images??[],draft?.data.images??source?.data.images),status:'draft',...(source?{sourcePostId:source.id,sourceVersion:input.sourceVersion}:{})};
    return draft?yield* effect(repo.save(draft,patch)):yield* effect(repo.create('postDraft',actor.id,patch));
  }
  if(action==='post.update'){
    const post=yield* effect(repo.get(input.id,'post'));
    demand(post.ownerId===actor.id,'只能编辑本人帖子。',403);
    demand(post.data.status==='visible'||post.data.status==='pending','此帖子当前不能编辑。',409);
    demand(input.version===post.version,'内容已更新，请刷新后重试。',409);
    const title=textField(input,'title',80),body=textField(input,'body',1000);
    yield* checkCommunityKeywords(repo,title,body);
    const draft=input.draftId?yield* effect(repo.get(input.draftId,'postDraft')):null;
    if(draft)demand(draft.ownerId===actor.id&&draft.data.status==='draft'&&draft.data.sourcePostId===post.id,'草稿已失效。',409);
    const result=yield* effect(repo.save(post,{title,body,board:textField(input,'board',40),images:validPostImages(input.images,[...strings(post.data.images),...strings(draft?.data.images)]),editedAt:new Date().toISOString()}));
    if(draft)yield* effect(repo.save(draft,{status:'published',postId:post.id,images:[],body:''}));
    return result;
  }
  const comment=yield* effect(repo.get(input.id,'comment')),post=yield* effect(repo.get(comment.data.postId,'post'));
  demand(post.data.status==='visible','帖子当前不可查看。',403);
  if(action==='comment.delete'){
    demand(comment.ownerId===actor.id,'只能删除本人评论。',403);
    demand(comment.data.status!=='deleted','评论已删除。',409);
    return yield* effect(repo.save(comment,{status:'deleted'}));
  }
  demand(comment.data.status==='visible','评论当前不可查看。',403);
  yield* requireSocialAccess(repo,actor,comment.ownerId);
  demand(typeof input.enabled==='boolean','请明确点赞状态。');
  const before=yield* effect(repo.related(actor.id,comment.id,'commentlike'));
  yield* effect(repo.relation(actor.id,comment.id,'commentlike',input.enabled));
  if(input.enabled&&!before&&comment.ownerId!==actor.id)yield* effect(repo.notify([comment.ownerId!],post.id,'community.commentlike','你的评论收到一个赞。'));
  return comment;
}

export function* filterCommunityCandidates(repo:BusinessRepository,actor:Account,all:CommunityCandidate[],params:URLSearchParams):Generator<unknown,CommunityCandidate[],unknown>{
  const edges=yield* effect(repo.all('socialEdge')),own=edges.filter(e=>e.ownerId===actor.id&&e.data.enabled===true);
  const author=params.get('author'),view=params.get('view'),alumni=params.get('alumni');
  const alumniState=params.get('alumniFollowing')==='1'?(yield* effect(repo.all('alumniState')))[0]?.data.value as AlumniData|undefined:undefined;
  demand(!['saved','liked'].includes(view??'')||!author||author===actor.id,'赞过和收藏只对本人展示。',403);
  const relations=['saved','liked'].includes(view??'')?yield* effect(repo.communityRelations()):[];
  return all.filter(p=>(!alumni||Boolean(p.alumniId)&&(alumni==='all'||p.alumniId===alumni))&&(params.get('alumniFollowing')!=='1'||alumniState?.follows.some(f=>f.student===actor.id&&f.alumniId===p.alumniId))&&!socialBlocked(edges,actor.id,p.ownerId)&&(!author||['saved','liked'].includes(view??'')||p.ownerId===author)&&
    (view!=='following'||own.some(e=>e.data.kind==='follow'&&e.data.targetId===p.ownerId))&&
    (view!=='mine'||p.ownerId===actor.id)&&
    (!['saved','liked'].includes(view??'')||relations.some(r=>r.accountId===actor.id&&r.entityId===p.id&&r.kind===(view==='saved'?'save':'like')))&&
    (view==='mine'||author===actor.id||!own.some(e=>e.data.kind==='dismiss'&&e.data.targetId===p.id)));
}

export function* communitySocialRead(repo:BusinessRepository,actor:Account,params:URLSearchParams):Generator<unknown,Fields,unknown>{
  demand(actor.roles.length>0&&actor.status!=='banned','请先完成校园身份核验。',403);
  const edges=yield* effect(repo.all('socialEdge')),posts=yield* effect(repo.communityPostIndex()),relations=yield* effect(repo.communityRelations());
  const privateMessages=(yield* effect(repo.all('directMessage'))).filter(m=>m.ownerId===actor.id||m.data.targetId===actor.id);
  const id=params.get('person')||actor.id,self=id===actor.id;
  const publicPosts=posts.filter(p=>p.data.status==='visible');
  const publicComments=(yield* effect(repo.communityCommentIndex())).filter(c=>c.data.status==='visible'&&publicPosts.some(p=>p.id===c.data.postId));
  const canVisit=(personId:string)=>personId===actor.id||privateMessages.some(m=>m.ownerId===personId||m.data.targetId===personId)||publicPosts.some(p=>p.ownerId===personId)||publicComments.some(c=>c.ownerId===personId)||edges.some(e=>['follow','block'].includes(String(e.data.kind))&&e.data.enabled===true&&((e.ownerId===actor.id&&e.data.targetId===personId)||(e.ownerId===personId&&e.data.targetId===actor.id)));
  demand(canVisit(id),'用户当前不可访问。',404);
  const account=yield* effect(repo.person(id));
  demand(account.roles.includes('student')&&account.status!=='banned','用户当前不可访问。',404);
  const profiles=yield* effect(repo.all('profile')),preferences=yield* effect(repo.all('preferences'));
  const projection=(person:Omit<Account,'email'>)=>projectDisplayPeople(actor,[person],new Set([person.id]),preferences,profiles)[0];
  const person=projection(account),blocked=socialBlocked(edges,actor.id,id);
  const active=edges.filter(e=>e.data.kind==='follow'&&e.data.enabled===true);
  const followers=active.filter(e=>e.data.targetId===id),following=active.filter(e=>e.ownerId===id);
  const mine=publicPosts.filter(p=>p.ownerId===id),postIds=new Set(mine.map(p=>p.id));
  const profile={id,name:person?.nickname||person?.name||account.name,avatar:person?.avatar??'',cover:self||person?.nickname!==undefined?String(profiles.find(p=>p.ownerId===id)?.data.cover??preferences.find(p=>p.ownerId===id)?.data.profileBackground??'lakeside'):'lakeside',bio:self||person?.nickname!==undefined?String(profiles.find(p=>p.ownerId===id)?.data.bio??''):'',following:following.length,followers:followers.length,appreciations:relations.filter(r=>postIds.has(r.entityId)&&(r.kind==='like'||r.kind==='save')).length,posts:mine.length,isFollowing:active.some(e=>e.ownerId===actor.id&&e.data.targetId===id),blocked,blockedByMe:edges.some(e=>e.ownerId===actor.id&&e.data.kind==='block'&&e.data.enabled===true&&e.data.targetId===id),self};
  const tab=params.get('list'),page=Math.max(1,Math.floor(Number(params.get('page'))||1));
  let list:Entity[]=[];
  if(self&&tab==='blocked')list=edges.filter(e=>e.ownerId===id&&e.data.kind==='block'&&e.data.enabled===true);
  if(tab==='followers')list=followers;
  if(tab==='following')list=following;
  const people=[];
  if(!blocked||self)for(const edge of list.slice((page-1)*20,page*20)){
    const personId=tab==='followers'?edge.ownerId!:String(edge.data.targetId);
    if(!canVisit(personId)||socialBlocked(edges,actor.id,personId)&&tab!=='blocked')continue;
    const target=yield* effect(repo.person(personId));
    if(target.status==='banned')continue;
    const display=projection(target);
    people.push({id:personId,name:display?.nickname||display?.name||target.name,avatar:display?.avatar??'',self:personId===actor.id,isFollowing:active.some(e=>e.ownerId===actor.id&&e.data.targetId===personId)});
  }
  const messages=tab==='chat'&&!self&&!blocked?privateMessages.filter(m=>m.data.status!=='hidden'&&(m.ownerId===id||m.data.targetId===id)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id)):[];
  const conversations=[];
  if(self&&tab==='inbox')for(const targetId of [...new Set(privateMessages.map(m=>m.ownerId===actor.id?String(m.data.targetId):m.ownerId!))]){
    const target=yield* effect(repo.person(targetId));
    if(target.status==='banned'||socialBlocked(edges,actor.id,targetId))continue;
    const display=projection(target),last=privateMessages.filter(m=>m.data.status!=='hidden'&&(m.ownerId===targetId||m.data.targetId===targetId)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id))[0];
    if (!last) continue;
    conversations.push({id:targetId,name:display?.nickname||display?.name||target.name,avatar:display?.avatar??'',body:String(last.data.body),createdAt:last.createdAt});
  }
  const drafts=self?(yield* effect(repo.all('postDraft'))).filter(d=>d.ownerId===actor.id&&d.data.status==='draft').map(d=>({id:d.id,title:d.data.title,updatedAt:d.updatedAt})):[];
  const dismissed=self?edges.filter(e=>e.ownerId===actor.id&&e.data.kind==='dismiss'&&e.data.enabled===true).flatMap(edge=>{const post=publicPosts.find(p=>p.id===edge.data.targetId&&!socialBlocked(edges,actor.id,p.ownerId));return post?[{id:post.id,title:String(post.data.title)}]:[]}):[];
  const reports=self&&tab==='reports'?(yield* effect(repo.all('report'))).filter(r=>r.ownerId===actor.id):[];
  return {profile,people,messages:messages.slice(-page*50).map(m=>({id:m.id,body:m.data.body,mine:m.ownerId===actor.id,createdAt:m.createdAt})),messagesHasMore:messages.length>page*50,conversations:conversations.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),dismissed,reports:reports.slice((page-1)*20,page*20).map(r=>({id:r.id,title:String((r.data.snapshot as Fields|undefined)?.title??'评论'),reason:r.data.reason,status:r.data.status,resolution:r.data.resolution,createdAt:r.createdAt})),hasMore:page*20<(tab==='reports'?reports.length:list.length),drafts:drafts.slice(0,50),draftCount:drafts.length,followingIds:edges.filter(e=>e.ownerId===actor.id&&e.data.kind==='follow'&&e.data.enabled===true).map(e=>e.data.targetId),...(self&&params.get('draft')?{draft:(yield* effect(repo.all('postDraft'))).find(d=>d.id===params.get('draft')&&d.ownerId===id&&d.data.status==='draft')??null}:{})};
}

export function* communityCounts(repo:BusinessRepository,ids:string[]):Generator<unknown,{saves:Map<string,number>;comments:Map<string,number>;commentLikes:Map<string,number>;likedComments:Set<string>},unknown>{
  const relations=yield* effect(repo.communityRelations()),comments=yield* effect(repo.communityCommentIndex());
  const count=(values:string[])=>{const result=new Map<string,number>();for(const id of values)result.set(id,(result.get(id)??0)+1);return result;};
  return {saves:count(relations.filter(r=>r.kind==='save'&&ids.includes(r.entityId)).map(r=>r.entityId)),comments:count(comments.filter(c=>c.data.status==='visible'&&ids.includes(String(c.data.postId))).map(c=>String(c.data.postId))),commentLikes:count(relations.filter(r=>r.kind==='commentlike').map(r=>r.entityId)),likedComments:new Set()};
}

export function* communityHotForViewer(repo:BusinessRepository,actor:Account,all:CommunityCandidate[],metrics:CommunityMetrics):Generator<unknown,ReturnType<typeof rankHotSummaries>,unknown>{
  const edges=yield* effect(repo.all('socialEdge'));
  const allowed=new Set(all.filter(p=>!socialBlocked(edges,actor.id,p.ownerId)&&!edges.some(e=>e.ownerId===actor.id&&e.data.kind==='dismiss'&&e.data.enabled===true&&e.data.targetId===p.id)).map(p=>p.id));
  const hot=rankHotSummaries(all,metrics);
  return {...hot,overall:hot.overall.filter(id=>allowed.has(id)),byBoard:Object.fromEntries(Object.entries(hot.byBoard).map(([board,ids])=>[board,ids.filter(id=>allowed.has(id))]))};
}
