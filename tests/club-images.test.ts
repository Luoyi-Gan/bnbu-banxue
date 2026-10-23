import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {openDatabase} from '../backend/src/database';
import {createAccount,login} from '../backend/src/auth';
import {execute} from '../backend/src/commands';
import {Repository} from '../backend/src/repository';
import catalogue from '../data/campus-clubs.json';
import imageCatalogue from '../data/campus-club-images.json';
describe('社团公开配图',()=>{
 it('36张已核对图片绑定独立社团，来源为学校公开报道，文件与摘要一致',()=>{
  expect(imageCatalogue.images).toHaveLength(36);expect(new Set(imageCatalogue.images.map(i=>i.name)).size).toBe(36);
  for(const image of imageCatalogue.images){
   expect(catalogue.clubs.find(c=>c.name===image.name)?.image).toBe(image.image);
   expect(new URL(image.imageSource.pageUrl).hostname).toMatch(/(^|\.)bnbu\.edu\.cn$/);
   expect(image.imageSource.kind).toMatch(/activity|poster/);expect(image.imageSource.caption.length).toBeGreaterThan(5);
   expect(createHash('sha256').update(readFileSync(new URL('../public'+image.image,import.meta.url))).digest('hex')).toBe(image.imageSource.sha256);
  }
 });
 it('运营更新配图核对版本，保留社团ID、关注、文案和公开状态，重复更新不升版本',()=>{
  const db=openDatabase(':memory:');try{
   createAccount(db,{email:'club-operator@example.test',password:'Test-password-123',name:'合成运营',roles:['operator']});
   createAccount(db,{email:'club-student@mail.bnbu.edu.cn',password:'Test-password-123',name:'合成学生',roles:['student']});
   const operator=login(db,'club-operator@example.test','Test-password-123'),student=login(db,'club-student@mail.bnbu.edu.cn','Test-password-123'),repo=new Repository(db),entry=catalogue.clubs.find(c=>c.image)!;
   const club=repo.create('organization',null,{name:entry.name,description:'已维护介绍',contact:'已维护联系',status:'approved',visibility:'visible',directoryOnly:true,image:''});
   execute(db,student.token,'relation.set',{id:club.id,kind:'follow',enabled:true},'club-follow-test');
   expect(()=>execute(db,student.token,'organization.images',{id:club.id,version:club.version},'club-images-denied')).toThrow('运营');
   execute(db,operator.token,'organization.images',{id:club.id,version:club.version},'club-images-update');
   const updated=repo.get(club.id);expect(updated.data).toMatchObject({image:entry.image,description:'已维护介绍',contact:'已维护联系',visibility:'visible'});expect(repo.related(student.account.id,club.id,'follow')).toBe(true);
   expect(()=>execute(db,operator.token,'organization.images',{id:club.id,version:club.version},'club-images-conflict')).toThrow('已变化');
   execute(db,operator.token,'organization.images',{id:club.id,version:updated.version},'club-images-repeat');expect(repo.get(club.id).version).toBe(updated.version);
   const manual=repo.create('organization',null,{...entry,image:'/manually-maintained.jpg',imageSource:null});execute(db,operator.token,'organization.images',{id:manual.id,version:manual.version},'club-images-manual');expect(repo.get(manual.id).data.image).toBe('/manually-maintained.jpg');
  }finally{db.close();}
 });
});
