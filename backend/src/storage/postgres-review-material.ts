import { demand } from '../auth';
import type { Entity } from '../repository';
import { authorizedMaterial } from '../sports/materials';
import { PostgresAuth } from './postgres-auth';
import { PostgresDatabase } from './postgres';
import { PostgresRepository } from './postgres-repository';
import { configuredObjectStore } from './cos-object-store';
import { objectKey } from './object-store';

export async function postgresReviewMaterial(db:PostgresDatabase,token:string,id:string) {
  return db.transaction(async client=>{
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client),repo=new PostgresRepository(client);
    const entities:Entity[]=[];
    for(const kind of ['sportsIdentity','sportsSystem','sportsRecord','sportsCourse']) entities.push(...await repo.all(kind));
    entities.push(await repo.get(id,'sportsMaterial'));
    const reader={all:(kind:string)=>entities.filter(e=>e.kind===kind),get:(key:unknown,kind?:string)=>{const entity=entities.find(e=>e.id===key && (!kind || e.kind===kind));demand(entity,'对象不存在。',404);return entity;}};
    const material=authorizedMaterial(reader,actor,id),mime=String(material.data.mime);
    demand(['image/png','image/jpeg','video/mp4'].includes(mime),'材料类型无效。',500);
    let bytes:Buffer;
    if(material.data.objectKey) bytes=await configuredObjectStore().get(String(material.data.objectKey));
    else {const row=(await client.query<{bytes:Buffer}>('SELECT bytes FROM sports_media_blobs WHERE sha256=$1',[material.data.sha256])).rows[0];demand(row,'材料存储暂不可用。',503);bytes=row.bytes;}
    demand(objectKey(bytes)===material.data.sha256,'材料完整性校验失败。',503);
    return {bytes,mime};
  });
}
