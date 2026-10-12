import {it,expect} from 'vitest';
import {openDatabase} from '../backend/src/database';
import {createAccount,loginUnified} from '../backend/src/auth';
import {Repository} from '../backend/src/repository';
it('自动识别个人邮箱和独立管理账号，保留密码、停用及角色约束',()=>{
 const db=openDatabase(':memory:');try {
 const personal=createAccount(db,{email:'auto@example.test',name:'学生',password:'Acceptance-123',roles:['student']});
 const admin=createAccount(db,{email:'management@example.test',name:'管理',password:'Management-123',roles:['reviewer']});
 db.prepare("UPDATE accounts SET login_kind='ADMIN',login_name=? WHERE id=?").run('review-manager',admin);
 new Repository(db).create('companionIdentity',admin,{role:'admin',status:'verified'});
 expect(loginUnified(db,' AUTO@EXAMPLE.TEST ','Acceptance-123').account.id).toBe(personal);
 expect(loginUnified(db,'review-manager','Management-123').account.id).toBe(admin);
 expect(()=>loginUnified(db,'review-manager','wrong')).toThrow();
 expect(()=>loginUnified(db,'management@example.test','Management-123')).toThrow();
 db.prepare("UPDATE accounts SET status='banned' WHERE id=?").run(admin);
 expect(()=>loginUnified(db,'review-manager','Management-123')).toThrow('停用');
 }finally{db.close()}
});
