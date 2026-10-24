import type {SQLInputValue} from 'node:sqlite';
import {ServiceError} from '../auth';
import {transaction,type Database} from '../database';
import type {PostgresDatabase} from '../storage/postgres';
import {runSync,runAsync} from '../storage/effects';
import {deliverMessage} from '../mail-delivery';
import {confirmDeletion,requestDeletion,type DeletionSQL,type Row} from './deletion';
const sqliteSQL=(db:Database):DeletionSQL=>({
 tables:new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>String(r.name))),
 rows(text,values=[]){const stmt=db.prepare(text);if(/^SELECT\b/i.test(text))return stmt.all(...values as SQLInputValue[]) as Row[];stmt.run(...values as SQLInputValue[]);return [];},
});
export class AccountDeletion {
 constructor(private readonly db:Database|PostgresDatabase){}
 private async execute<T>(operation:(sql:DeletionSQL)=>Generator<unknown,T,unknown>):Promise<T>{
   if('prepare'in this.db)return transaction(this.db,()=>runSync(operation(sqliteSQL(this.db as Database))));
   return this.db.transaction(async client=>{
     // Same lock as business commands; image uploads and GC use the second lock.
     await client.query('SELECT pg_advisory_xact_lock(18422,2)');
     await client.query('SELECT pg_advisory_xact_lock(18422,42)');
     const tables=new Set((await client.query("SELECT tablename FROM pg_tables WHERE schemaname=current_schema()" )).rows.map(r=>r.tablename as string));
     return runAsync(operation({tables,async rows(text,values=[]){let n=0;return (await client.query(text.replace(/\?/g,()=>`$${++n}`),values)).rows;}}));
   },true);
 }
 async request(token:string,origin:string,localOutbox:boolean){
   const endpoint=process.env.BNBU_EMAIL_DELIVERY_URL;
   if(!localOutbox&&!endpoint)throw new ServiceError(503,'EMAIL_NOT_CONFIGURED','暂未配置注销验证码邮件，请使用密码确认或稍后重试。');
   const message=await this.execute(sql=>requestDeletion(sql,token,origin));
   if(endpoint){await deliverMessage(message,endpoint);await this.execute(function*(sql){yield sql.rows('UPDATE mail_outbox SET delivered_at=? WHERE id=?',[new Date().toISOString(),message.id]);});}
   return {sent:true,delivery:endpoint?'email':'local-outbox',message:endpoint?'注销验证码已发送至本人绑定邮箱，10 分钟内有效。':'注销验证码已写入本地开发收件箱，未发送真实邮件。'};
 }
 async confirm(token:string,input:Row,origin:string){
   const result=await this.execute(sql=>confirmDeletion(sql,token,input,origin));
   if(result instanceof ServiceError)throw result;
   return result;
 }
}
