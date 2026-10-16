import type { Database } from './database';
import { demand, type Account } from './auth';
import { Repository, strings, type Entity, type Fields } from './repository';
import { searchStudents } from './student-search';
import {projectDisplayPeople} from './display-people';

type Person = {id:string;name:string;nickname?:string;avatar?:string};
type Mark = {id:string;createdAt:string};

/** Applies the same account settings and public object rules to either storage backend. */
export function projectPersonHover(viewer:Account,personId:string,person:Person,prefs:Fields|undefined,rooms:Entity[],activities:Entity[],marks:Mark[]) {
  const own=viewer.id===personId;
  const preview=own || prefs?.profilePreview!==false || viewer.roles.some(role=>['teacher','reviewer','operator','superadmin'].includes(role));
  const identity={id:personId,name:preview ? person.nickname || person.name : person.name,avatar:preview ? person.avatar ?? '' : ''};
  const visibleSections={recentTeams:prefs?.hoverRecentTeams!==false,activeTeams:prefs?.hoverActiveTeams!==false,activities:prefs?.hoverActivities!==false};
  if(!own && prefs?.profilePreview===false)
    return {...identity,visibleSections:{recentTeams:false,activeTeams:false,activities:false},recentTeams:[],activeTeams:[],activities:[]};
  const publicRooms=rooms.filter(room=>room.data.visibility==='visible' && (room.ownerId===personId || strings(room.data.members).includes(personId)));
  const summaries=(items:Entity[])=>items.slice(0,3).map(room=>({id:room.id,title:String(room.data.title ?? ''),path:`/v2/partners?item=${encodeURIComponent(room.id)}`}));
  const recentTeams=visibleSections.recentTeams ? summaries(publicRooms.filter(room=>room.data.status==='finished').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))) : [];
  const activeTeams=visibleSections.activeTeams ? summaries(publicRooms.filter(room=>room.data.status==='open').sort((a,b)=>b.createdAt.localeCompare(a.createdAt))) : [];
  const published=new Map(activities.filter(item=>item.data.status==='published').map(item=>[item.id,item]));
  const shownActivities=visibleSections.activities ? marks.flatMap(mark=>{
    const item=published.get(mark.id);
    return item ? [{id:item.id,title:String(item.data.title ?? ''),path:`/v2/activities/${encodeURIComponent(item.id)}`}] : [];
  }).slice(0,3) : [];
  return {...identity,visibleSections,recentTeams,activeTeams,activities:shownActivities};
}

export function personHover(db:Database,viewer:Account,personId:string,studentNumber?:string) {
  demand(viewer.roles.length>0 && viewer.status!=='banned','请先完成校园身份核验。',403);
  const business=personId===viewer.id || !!db.prepare("SELECT 1 FROM entities WHERE (kind='post' AND owner_id=? AND json_extract(data,'$.status')='visible') OR (kind='room' AND json_extract(data,'$.visibility')='visible' AND (owner_id=? OR EXISTS(SELECT 1 FROM json_each(entities.data,'$.members') WHERE value=?))) OR (kind='activity' AND owner_id=? AND json_extract(data,'$.status')='published') LIMIT 1").get(personId,personId,personId,personId);
  const repo=new Repository(db);
  const visible=business?projectDisplayPeople(viewer,repo.people(),new Set([personId]),repo.all('preferences'),repo.all('profile'))[0]:undefined;
  const searched=!visible && studentNumber ? searchStudents(db,viewer,studentNumber).students.find(person=>person.id===personId) : undefined;
  const person=visible ?? searched;
  demand(person,'用户当前不可查看。',404);
  const prefs=repo.all('preferences').find(item=>item.ownerId===personId)?.data;
  const marks=db.prepare("SELECT entity_id AS id,created_at AS createdAt FROM relations WHERE account_id=? AND kind='participate' ORDER BY created_at DESC").all(personId) as Mark[];
  return projectPersonHover(viewer,personId,person,prefs,repo.all('room'),repo.all('activity'),marks);
}
