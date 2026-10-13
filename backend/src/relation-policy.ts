import type { Account } from './auth';
import { demand } from './auth';
import { student, publicEntity } from './community';
import { textField, type Fields } from './repository';
import { effect, type BusinessRepository } from './storage/effects';

export function* relationPolicy(repo: BusinessRepository, actor: Account, input: Fields): Generator<unknown,{id:string},unknown> {
  student(actor);
  demand(typeof input.enabled==='boolean','enabled 必须明确为 true 或 false。');
  const entity = yield* effect(repo.get(input.id));
  const kind = textField(input,'kind',40);
  const allowed:Record<string,string[]> = {post:['like','save'],activity:['like','save','participate'],room:['save'],organization:['follow']};
  demand(allowed[entity.kind]?.includes(kind),'此对象不支持该操作。');
  if(input.enabled) {
    demand(entity.kind==='organization' ? entity.data.status==='approved' && entity.data.visibility==='visible' : publicEntity(entity),'对象当前未公开。');
    if(kind==='participate') demand(Date.parse(String(entity.data.endAt || entity.data.startAt))>Date.now(),'已结束活动不能标记参与。');
  }
  yield* effect(repo.relation(actor.id,entity.id,kind,input.enabled));
  return {id:entity.id};
}
