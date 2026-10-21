import { demand, type Account } from './auth';
import { enumField, textField, strings, type Entity, type Fields } from './repository';
import { effect, type BusinessRepository } from './storage/effects';
import { checkCommunityKeywords } from './community-keywords';
import { validPostImages } from './community-social';

export const managesShops=(actor:Account)=>actor.roles.some(role=>['operator','reviewer','superadmin'].includes(role));
const access=(actor:Account)=>demand(actor.status==='active'&&(actor.roles.includes('student')||managesShops(actor)),'需要学生身份或店铺管理职责。',403);
const version=(entity:Entity,input:Fields)=>demand(entity.version===input.version,'内容已更新，请重新读取。',409);
const visible=(entity:Entity)=>entity.data.status==='visible';

export function* shopPolicy(repo:BusinessRepository,actor:Account,action:string,input:Fields):Generator<unknown,Entity|undefined,unknown>{
  if(!action.startsWith('shop.'))return;
  access(actor);
  if(action==='shop.save'){
    demand(managesShops(actor),'仅管理员可维护店铺。',403);
    const current=input.id?yield* effect(repo.get(input.id,'shop')):undefined;
    if(current)version(current,input);
    const patch={name:textField(input,'name',80),category:textField(input,'category',30),scope:enumField(input,'scope',['campus','outside']),address:textField(input,'address',240),description:textField(input,'description',1000,true),images:validPostImages(input.images??[],current?.data.images),status:current?.data.status??'visible'};
    return current?yield* effect(repo.save(current,patch)):yield* effect(repo.create('shop',actor.id,patch));
  }
  if(action==='shop.visibility'){
    demand(managesShops(actor),'仅管理员可维护店铺。',403);
    const shop=yield* effect(repo.get(input.id,'shop'));version(shop,input);
    const status=enumField(input,'status',['visible','hidden']);
    return yield* effect(repo.save(shop,{status,reason:textField(input,'reason',300)}));
  }
  if(action==='shop.review.create'||action==='shop.review.update'){
    demand(actor.roles.includes('student'),'需要学生身份。',403);
    const current=action==='shop.review.update'?yield* effect(repo.get(input.id,'shopReview')):undefined;
    if(current){demand(current.ownerId===actor.id,'只能编辑本人点评。',403);version(current,input);demand(visible(current),'该点评当前不能编辑。',409)}
    const shop=yield* effect(repo.get(current?.data.shopId??input.shopId,'shop'));
    demand(visible(shop),'店铺已暂停公开，不能发表点评。',409);
    const body=textField(input,'body',1000),dish=textField(input,'dish',80,true);
    yield* checkCommunityKeywords(repo,body,dish);
    const patch={shopId:shop.id,body,dish,images:validPostImages(input.images??[],current?.data.images),status:'visible'};
    return current?yield* effect(repo.save(current,patch)):yield* effect(repo.create('shopReview',actor.id,patch));
  }
  if(action==='shop.review.delete'||action==='shop.review.moderate'){
    const review=yield* effect(repo.get(input.id,'shopReview'));version(review,input);
    demand(review.data.status!=='deleted','点评已删除。',409);
    const admin=managesShops(actor);
    demand(action==='shop.review.delete'?(admin||review.ownerId===actor.id):admin,'没有处理该点评的权限。',403);
    const reason=admin?textField(input,'reason',300):'作者删除';
    const status=action==='shop.review.delete'?'deleted':enumField(input,'status',['visible','hidden']);
    const saved=yield* effect(repo.save(review,{status,reason}));
    if(admin&&review.ownerId)yield* effect(repo.notify([review.ownerId],review.id,'shop.review.moderated',`你的店铺点评已由管理员处理：${reason}`));
    return saved;
  }
  if(action==='shop.report'){
    demand(actor.roles.includes('student'),'需要学生身份。',403);
    const review=yield* effect(repo.get(input.id,'shopReview'));
    const shop=yield* effect(repo.get(review.data.shopId,'shop'));
    demand(visible(review)&&visible(shop)&&review.ownerId!==actor.id,'不能举报该点评。',403);
    const reports=yield* effect(repo.all('shopReport'));
    demand(!reports.some(r=>r.ownerId===actor.id&&r.data.reviewId===review.id&&r.data.status==='pending'),'该点评已有待处理举报。',409);
    return yield* effect(repo.create('shopReport',actor.id,{reviewId:review.id,shopId:shop.id,reason:textField(input,'reason',300),snapshot:{body:review.data.body,dish:review.data.dish,images:review.data.images},status:'pending'}));
  }
  if(action==='shop.report.decide'){
    demand(managesShops(actor),'需要管理员职责。',403);
    const report=yield* effect(repo.get(input.id,'shopReport'));version(report,input);
    demand(report.data.status==='pending','举报已处理。',409);
    demand(typeof input.upheld==='boolean','请明确处理结果。');
    const reason=textField(input,'reason',300),review=yield* effect(repo.get(report.data.reviewId,'shopReview'));
    if(input.upheld&&review.data.status!=='deleted'){
      yield* effect(repo.save(review,{status:'hidden',reason}));
      if(review.ownerId)yield* effect(repo.notify([review.ownerId],review.id,'shop.review.moderated',`你的店铺点评因举报被下架：${reason}`));
    }
    const saved=yield* effect(repo.save(report,{status:input.upheld?'upheld':'rejected',resolution:reason}));
    if(report.ownerId)yield* effect(repo.notify([report.ownerId],review.id,'shop.report.decided',`你的店铺点评举报已处理：${reason}`));
    return saved;
  }
}

export function* shopRead(repo:BusinessRepository,actor:Account,params:URLSearchParams):Generator<unknown,Fields,unknown>{
  access(actor);
  const admin=params.get('admin')==='1';
  demand(!admin||managesShops(actor),'需要店铺管理职责。',403);
  const shops=yield* effect(repo.all('shop')),allReviews=yield* effect(repo.all('shopReview'));
  const allowed=shops.filter(shop=>admin||visible(shop)),id=params.get('id');
  const query=(params.get('q')??'').trim().toLocaleLowerCase(),scope=params.get('scope'),category=params.get('category');
  const filtered=allowed.filter(shop=>(!id||shop.id===id)&&(!scope||shop.data.scope===scope)&&(!category||shop.data.category===category)&&`${shop.data.name} ${shop.data.address} ${shop.data.description}`.toLocaleLowerCase().includes(query));
  if(id)demand(filtered.length,'店铺暂不可查看。',404);
  const page=Math.max(1,Math.min(10000,Number(params.get('page'))||1)),start=(page-1)*20;
  const selected=id?filtered.slice(0,1):filtered.slice(start,start+20),ids=new Set(selected.map(shop=>shop.id));
  const reviews=id?allReviews.filter(r=>ids.has(String(r.data.shopId))&&(admin||visible(r)||r.ownerId===actor.id&&r.data.status!=='deleted')):[];
  const preferences=yield* effect(repo.all('preferences')),profiles=yield* effect(repo.all('profile'));
  const projected=reviews.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(start,start+20).map(review=>{
    const preview=review.ownerId===actor.id||!preferences.some(p=>p.ownerId===review.ownerId&&p.data.profilePreview===false);
    const profile=preview?profiles.find(p=>p.ownerId===review.ownerId):undefined;
    return {...review,ownerId:undefined,mine:review.ownerId===actor.id,author:typeof profile?.data.nickname==='string'?profile.data.nickname:'校园同学',data:{shopId:review.data.shopId,body:review.data.body,dish:review.data.dish,images:strings(review.data.images),status:review.data.status,...(admin||review.ownerId===actor.id?{reason:review.data.reason}: {})}};
  });
  return {canManage:managesShops(actor),canReview:actor.roles.includes('student'),shops:selected.map(shop=>({...shop,ownerId:undefined,reviewCount:allReviews.filter(r=>r.data.shopId===shop.id&&visible(r)).length})),categories:[...new Set(allowed.map(shop=>String(shop.data.category)))],reviews:projected,hasMore:id?reviews.length>start+20:filtered.length>start+20,page,reports:admin?(yield* effect(repo.all('shopReport'))).filter(r=>r.data.status==='pending').slice(0,100):[]};
}
