import { helpRead,portalHelpCategories } from '../sports/help';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';
import {demand} from '../auth';
import type {Entity} from '../repository';

export function portalHelpArticle(article:Entity) {
  return {id:article.id,version:article.version,status:article.data.status,titleZh:article.data.titleZh,titleEn:article.data.titleEn,bodyZh:article.data.bodyZh,bodyEn:article.data.bodyEn,keywords:article.data.keywords,category:Object.keys(portalHelpCategories).find(k=>portalHelpCategories[k]===article.data.category),sortWeight:article.data.weight,updatedAt:article.updatedAt};
}
export async function postgresAdminHelp(db:PostgresDatabase,token:string,query:Record<string,string>,id?:string) {
  demand(Object.keys(query).every(k=>!id && ['page','status'].includes(k)),'帮助查询参数无效。');
  const page=Number(query.page ?? 1);
  demand(Number.isSafeInteger(page) && page>=1 && page<=100000,'帮助页码无效。');
  demand(query.status===undefined || ['draft','published','archived'].includes(query.status),'帮助状态无效。');
  const source=await postgresSportsHelp(db,token,'zh');
  demand(source.manage,'没有帮助管理权限。',403);
  const articles=source.articles as Entity[];
  if(id){const article=articles.find(a=>a.id===id);demand(article,'帮助文章不存在。',404);return portalHelpArticle(article);}
  const filtered=articles.filter(a=>query.status===undefined || a.data.status===query.status);
  return {items:filtered.slice((page-1)*5,page*5).map(portalHelpArticle),page,pageSize:5,total:filtered.length};
}

export async function postgresSportsHelp(db: PostgresDatabase, token: string, lang: unknown) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor = await new PostgresAuth(db).authenticate(token, client);
    const repo = new PostgresRepository(client);
    const entities = [...await repo.all('sportsIdentity'), ...await repo.all('sportsSystem'), ...await repo.all('sportsHelp')];
    return helpRead({all: kind => entities.filter(item => item.kind === kind)}, actor, lang);
  });
}
