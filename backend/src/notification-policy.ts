import { randomUUID } from 'node:crypto';
import { demand, timestamp, type Account } from './auth';
import { operator } from './community';
import { strings, textField, type Fields } from './repository';
import { effect, type BusinessRepository } from './storage/effects';

export function* notificationPolicy(repo: BusinessRepository, actor: Account, action: string, input: Fields):Generator<unknown,Fields|undefined,unknown> {
  if(action==='notification.read' || action==='notification.readmany') {
    let ids:string[];
    if(action==='notification.read') ids=[textField(input,'id',100)];
    else {
      demand(Array.isArray(input.ids) && input.ids.length>0 && input.ids.every(id=>typeof id==='string' && id.length>0 && id.length<=100),'请选择要标为已读的通知。');
      ids=[...new Set(input.ids as string[])];
    }
    for(const id of ids) demand(yield* effect(repo.ownsNotification(id,actor.id)),'通知不存在。',404);
    const at=timestamp();
    for(const id of ids) yield* effect(repo.readNotification(id,actor.id,at));
    return action==='notification.read' ? {id:ids[0]} : {ids};
  }
  if(action==='notification.send') {
    operator(actor);
    const recipients=strings(input.recipients);
    demand(recipients.length>0 && recipients.length<=1000,'请选择 1–1000 位接收人。');
    for(const id of recipients) yield* effect(repo.person(id));
    const batch=randomUUID();
    yield* effect(repo.notify(recipients,batch,'broadcast',textField(input,'body',2000)));
    return {id:batch,recipients:[...new Set(recipients)].length};
  }
  return undefined;
}
