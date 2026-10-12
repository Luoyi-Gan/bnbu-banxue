import {demand} from '../auth';
import type {Fields} from '../repository';
import {permissionNames} from '../sports/portal';
import type {SportsPermission} from '../sports/permissions';
import type {PostgresDatabase} from './postgres';
import {postgresAdministratorDirectory} from './postgres-administrators';
import {executePostgres} from './postgres-commands';

type Directory=Awaited<ReturnType<typeof postgresAdministratorDirectory>>;
function project(row:Directory['items'][number]) {
  return {id:row.id,account:row.loginName,name:row.name,email:row.email,department:row.department,status:row.status,version:row.version,updatedAt:row.updatedAt,
    permissions:(row.permissions as SportsPermission[]).filter(p=>p in permissionNames).map(p=>permissionNames[p])};
}
export async function postgresPortalSubadmins(db:PostgresDatabase,token:string,after='') {
  const source=await postgresAdministratorDirectory(db,token);
  const index=after?source.items.findIndex(item=>item.id===after):-1;
  demand(!after || index>=0,'分页基准已变化，请刷新。',409);
  const items=source.items.slice(index+1,index+101).map(project);
  return {items,nextCursor:index+101<source.items.length?items.at(-1)!.id:null};
}
export async function postgresPortalSubadminWrite(db:PostgresDatabase,token:string,id:string|undefined,operation:'create'|'profile'|'status',input:Fields,key:string) {
  const allowed=operation==='create'?['identityVerifiedByAdmin','email','account','name','department','permissions','initialPassword','confirmPassword']:operation==='profile'?['expectedVersion','name','email','department','permissions']:['expectedVersion','status','handoverCompleted'];
  demand(Object.keys(input).every(k=>allowed.includes(k)),'管理账号参数无效。');
  const directory=await postgresAdministratorDirectory(db,token);
  const target=id?directory.items.find(item=>item.id===id):undefined;
  if(id)demand(target,'管理账号不存在。',404);
  const permissions=()=>{
    demand(Array.isArray(input.permissions),'请选择权限。');
    return input.permissions.map(value=>{
      const match=Object.entries(permissionNames).find(([,wire])=>wire===value);
      demand(match,'管理权限无效。');return match[0];
    });
  };
  let command:Fields;
  if(operation==='create') {
    demand(input.identityVerifiedByAdmin===true,'须由管理员确认已核验人员身份。');
    demand(typeof input.email==='string','请填写已核验人员邮箱。');
    const person=directory.candidates.find(person=>person.email===String(input.email).trim().toLowerCase());
    demand(person,'该邮箱没有对应的已核验个人账号，请先完成人员身份核验。',409);
    command={personId:person.id,loginName:input.account,name:input.name,email:input.email,department:input.department,permissions:permissions(),initialPassword:input.initialPassword,confirmPassword:input.confirmPassword,confirmed:true};
  } else if(operation==='profile') {
    command={id:target!.identityId,version:input.expectedVersion,name:input.name,email:input.email,department:input.department,permissions:permissions(),confirmed:true};
  } else command={id:target!.identityId,version:input.expectedVersion,status:input.status,confirmed:true,handoverConfirmed:input.handoverCompleted===true};
  const result=await executePostgres(db,token,operation==='create'?'sports.admins.create':operation==='profile'?'sports.admins.edit':'sports.admins.state',command,key);
  const row=(await postgresAdministratorDirectory(db,token)).items.find(item=>item.identityId===result.id);
  demand(row,'管理账号不存在。',404);return project(row);
}
