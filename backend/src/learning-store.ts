import type {PoolClient} from 'pg';
import {randomUUID} from 'node:crypto';
import type {Database} from './database';
import type {PostgresDatabase} from './storage/postgres';
import {ensureStudentEmailIdentity} from './student-email-identity';
import {ensurePostgresStudentEmailIdentity} from './storage/postgres-student-email-identity';
import {timestamp,type AccountRow} from './auth';

export interface LearningSql {
  rows<T=Record<string,unknown>>(sql:string,params?:unknown[]):Promise<T[]>;
  ensure(row:AccountRow):Promise<AccountRow>;
}
export interface LearningStore {transaction<T>(key:string,fn:(sql:LearningSql)=>Promise<T>):Promise<T>}
const queues=new WeakMap<Database,Promise<unknown>>();
export function sqliteLearningStore(db:Database):LearningStore {
  return {transaction(key,fn){
    void key;
    const work=(queues.get(db)??Promise.resolve()).catch(()=>{}).then(async()=>{
      db.exec('BEGIN IMMEDIATE');
      try {
        const result=await fn({rows:async<T>(sql:string,params:unknown[]=[])=>{
          const statement=db.prepare(sql);
          if(/^\s*SELECT/i.test(sql))return statement.all(...params as never[]) as T[];
          statement.run(...params as never[]);return [];
        },ensure:async row=>ensureStudentEmailIdentity(db,row)});
        db.exec('COMMIT');return result;
      }catch(error){db.exec('ROLLBACK');throw error;}
    });
    queues.set(db,work);return work;
  }};
}
export function postgresLearningStore(db:PostgresDatabase):LearningStore {
  return {transaction:(key,fn)=>db.transaction(async(client:PoolClient)=>{
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`learning:${key}`]);
    return fn({rows:async<T>(sql:string,params:unknown[]=[])=>{
      let index=0;return (await client.query(sql.replace(/\?/g,()=>`$${++index}`),params)).rows as T[];
    },ensure:row=>ensurePostgresStudentEmailIdentity(client,row)});
  })};
}
export async function learningEntity(sql:LearningSql,kind:string,owner:string,data:unknown,id:string=randomUUID()){
  const now=timestamp();
  await sql.rows('INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES(?,?,?,?,?,?)',[id,kind,owner,JSON.stringify(data),now,now]);
  return id;
}
