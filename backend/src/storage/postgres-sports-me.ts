import { demand } from '../auth';
import { sportsAccountGate } from '../sports/account-gate';
import { portalMe } from '../sports/portal';
import type { PostgresDatabase } from './postgres';
import { PostgresAuth } from './postgres-auth';
import { PostgresRepository } from './postgres-repository';

export async function postgresSportsMe(db: PostgresDatabase, token: string) {
  return db.transaction(async client => {
    await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const actor=await new PostgresAuth(db).authenticate(token,client);
    demand(actor.status!=='banned','账号已停用。',403);
    const identities=await new PostgresRepository(client).all('sportsIdentity');
    const repo={all:()=>identities};
    sportsAccountGate(repo,actor);
    const own=identities.filter(i=>i.ownerId===actor.id && i.data.status==='verified');
    demand(own.length===1,'需要唯一有效的体育身份。',403);
    const identity=own[0],data=identity.data;
    if(data.role!=='student') return portalMe(repo,actor);
    const personal=await client.query("SELECT 1 FROM accounts WHERE id=$1 AND login_kind='PERSONAL'",[actor.id]);
    demand(personal.rows.length===1 && actor.roles.includes('student'),'需要有效学生个人账号。',403);
    const emailVerified=data.schoolEmailVerified===true && data.schoolEmail===actor.email;
    const [prefix,domain]=actor.email.split('@');
    const nullable=(key:string)=>typeof data[key]==='string' ? data[key] : null;
    return {
      user:{id:actor.id,role:'STUDENT',status:'ACTIVE',version:identity.version,emailVerified,primaryEmailMasked:emailVerified ? `${prefix.slice(0,1)}***@${domain}` : null},
      studentProfile:{
        id:actor.id,userId:actor.id,organizationId:'BNBU',version:identity.version,
        fullName:actor.name,studentNumber:nullable('studentNumber'),
        gender:['MALE','FEMALE'].includes(String(data.sex)) ? data.sex : null,
        gradeYear:typeof data.year==='number' && Number.isInteger(data.year) ? data.year : null,
        collegeName:nullable('collegeName'),majorName:nullable('majorName'),
        dateOfBirth:nullable('dateOfBirth'),regionCode:nullable('regionCode'),otherRegionName:nullable('otherRegionName'),
        administrativeClassName:nullable('administrativeClassName'),
      },
      teacherProfile:null,adminProfile:null,
    };
  });
}
