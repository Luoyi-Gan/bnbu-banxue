import type { Account } from './auth';
import { has } from './community';
import type { Entity, Repository } from './repository';

type Person = ReturnType<Repository['people']>[number];

/** Current display fields, filtered to identities visible through the caller's business records. */
export function projectDisplayPeople(actor:Account,people:Person[],visibleIds:Set<string>,preferences:Entity[],profiles:Entity[]) {
  const hidden=new Set(preferences.filter(item=>item.data.profilePreview===false).map(item=>item.ownerId));
  const current=new Map(profiles.map(item=>[item.ownerId,item.data]));
  return people.filter(person=>has(actor,'operator','superadmin') || visibleIds.has(person.id)).map(person=>{
    const preview=person.id===actor.id || !hidden.has(person.id) || has(actor,'teacher','reviewer','operator','superadmin');
    const profile=preview ? current.get(person.id) : undefined;
    const display={
      nickname:typeof profile?.nickname==='string' ? profile.nickname : undefined,
      avatar:typeof profile?.avatar==='string' ? profile.avatar : undefined,
    };
    return has(actor,'superadmin') ? {...person,...display} : {id:person.id,name:person.name,organization:preview ? person.organization : '',...display};
  });
}
