import {it,expect} from 'vitest';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import type {AddressInfo} from 'node:net';
import {PostgresDatabase} from '../backend/src/storage/postgres';
import {postgresMigrations} from '../backend/src/storage/postgres-schema';
import {PostgresRepository} from '../backend/src/storage/postgres-repository';
import {hashPassword} from '../backend/src/auth';
import {createPostgresApiServer} from '../backend/src/postgres-api';

it.skipIf(!process.env.BNBU_TEST_POSTGRES_URL)('isolates same-email accounts, cookies, commands and logout between the two systems',async()=>{
  const admin=new Pool({connectionString:process.env.BNBU_TEST_POSTGRES_URL});
  const prefix='isolation_'+randomUUID().replaceAll('-','');
  const schemas=[prefix+'_companion',prefix+'_sports'];
  const databases:PostgresDatabase[]=[],servers:ReturnType<typeof createPostgresApiServer>[]=[];
  try {
    for(const schema of schemas){
      await admin.query(`CREATE SCHEMA ${schema}`);
      const db=new PostgresDatabase({connectionString:process.env.BNBU_TEST_POSTGRES_URL,options:`-c search_path=${schema}`});databases.push(db);await db.migrate(postgresMigrations);
    }
    const email='same@bnbu.edu.cn',password='Isolation-test-123';
    for(const [i,db] of databases.entries())await db.pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES($1,$2,$3,$4,$5,$6)',['account-'+i,email,hashPassword(password),'Person '+i,'["student"]','now']);
    await databases[1].transaction(client=>new PostgresRepository(client).create('sportsIdentity','account-1',{role:'student',status:'verified'}));
    const urls:string[]=[];
    for(const [i,db] of databases.entries()){
      const server=createPostgresApiServer(db,{surface:i===0?'companion':'sports'});servers.push(server);
      await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));urls.push('http://127.0.0.1:'+(server.address() as AddressInfo).port);
    }
    const post=(index:number,path:string,input:unknown,cookie='')=>fetch(urls[index]+path,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(input)});
    const companion=await post(0,'/api/auth/sign-in',{identifier:email,password}),sports=await post(1,'/api/sports/auth/sign-in',{identifier:email,password});
    expect(companion.status).toBe(200);expect(sports.status).toBe(200);
    const companionCookie=companion.headers.get('set-cookie')!.split(';')[0],sportsCookie=sports.headers.get('set-cookie')!.split(';')[0];
    expect(companionCookie).toMatch(/^bnbu_session=/);expect(sportsCookie).toMatch(/^bnbu_sports_session=/);
    const combined=companionCookie+'; '+sportsCookie;
    const sessionCount=async()=>Number((await databases[1].pool.query('SELECT count(*) FROM sessions')).rows[0].count);
    const before=await sessionCount();
    expect((await post(1,'/api/v1/auth/password-login',{account:email,password})).status).toBe(403);
    expect(await sessionCount()).toBe(before);
    for(const role of ['teacher','admin']){
      const id='portal-'+role,identifier=role+'@bnbu.edu.cn';
      await databases[1].pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at,login_kind,login_name) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,identifier,hashPassword(password),role,JSON.stringify([role]),'now',role==='admin'?'ADMIN':'PERSONAL',role==='admin'?identifier:null]);
      const identity=await databases[1].transaction(client=>new PostgresRepository(client).create('sportsIdentity',id,{role,status:'verified',mustChangePassword:true}));
      const login=await post(1,'/api/v1/auth/password-login',{account:identifier,password});
      expect(login.status).toBe(200);expect((await login.json()).data.user.role).toBe(role.toUpperCase());
      const portalCookie=login.headers.get('set-cookie')!.split(';')[0];
      expect(portalCookie).toMatch(/^bnbu_sports_session=/);
      const security=await fetch(urls[1]+'/api/v1/auth/account-security',{headers:{Cookie:portalCookie}});
      expect(security.status).toBe(200);expect((await security.json()).data.mustChangePassword).toBe(true);
      const other=await post(1,'/api/v1/auth/password-login',{account:identifier,password});
      const otherCookie=other.headers.get('set-cookie')!.split(';')[0];
      const changeBody={currentPassword:password,newPassword:password+'-updated',confirmPassword:password+'-updated',expectedVersion:identity.version};
      const changeKey=randomUUID();
      const change=()=>fetch(urls[1]+'/api/v1/auth/own-password',{method:'POST',headers:{'Content-Type':'application/json',Cookie:portalCookie,'Idempotency-Key':changeKey},body:JSON.stringify(changeBody)});
      const changed=await change();expect(changed.status).toBe(200);
      const changedData=await changed.json();expect(changedData.data.mustChangePassword).toBe(false);
      expect(await (await change()).json()).toEqual(changedData);
      expect((await fetch(urls[1]+'/api/v1/auth/account-security',{headers:{Cookie:otherCookie}})).status).toBe(401);
      expect((await post(1,'/api/v1/auth/password-login',{account:identifier,password})).status).toBe(401);
      await databases[1].pool.query("UPDATE entities SET data=jsonb_set(data::jsonb,'{status}','\"revoked\"')::text WHERE id=$1",[identity.id]);
      expect((await fetch(urls[1]+'/api/v1/auth/account-security',{headers:{Cookie:portalCookie}})).status).toBe(403);
      const count=await sessionCount();
      expect((await post(1,'/api/v1/auth/password-login',{account:identifier,password:password+'-updated'})).status).toBe(403);
      expect(await sessionCount()).toBe(count);
      expect((await post(1,'/api/v1/auth/logout',{},portalCookie)).status).toBe(200);
    }
    expect((await (await fetch(urls[0]+'/api/auth/me',{headers:{Cookie:combined}})).json()).account.id).toBe('account-0');
    expect((await (await fetch(urls[1]+'/api/v1/me',{headers:{Cookie:combined}})).json()).data.user.id).toBe('account-1');
    expect((await fetch(urls[1]+'/api/v1/me',{headers:{Cookie:companionCookie}})).status).toBe(401);
    expect((await fetch(urls[1]+'/api/v1/me',{headers:{Cookie:companionCookie.replace('bnbu_session','bnbu_sports_session')}})).status).toBe(401);
    expect((await fetch(urls[0]+'/api/auth/me',{headers:{Cookie:sportsCookie}})).status).toBe(401);
    expect((await fetch(urls[0]+'/api/v1/me',{headers:{Cookie:combined}})).status).toBe(404);
    expect((await fetch(urls[1]+'/api/workspace',{headers:{Cookie:combined}})).status).toBe(404);
    expect((await post(0,'/api/commands',{action:'sports.preferences.save',input:{},requestId:randomUUID()},combined)).status).toBe(403);
    expect((await post(1,'/api/sports/commands',{action:'post.create',input:{},requestId:randomUUID()},combined)).status).toBe(403);
    await databases[1].pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES($1,$2,$3,$4,$5,$6)',['governor','governor@bnbu.edu.cn',hashPassword(password),'Governor','["superadmin"]','now']);
    await databases[1].transaction(client=>new PostgresRepository(client).create('sportsIdentity','governor',{role:'admin',status:'verified'}));
    const governorLogin=await post(1,'/api/v1/auth/password-login',{account:'governor@bnbu.edu.cn',password});
    const governorCookie=governorLogin.headers.get('set-cookie')!.split(';')[0];
    const write=(path:string,input:unknown,key=randomUUID())=>fetch(urls[1]+path,{method:'POST',headers:{'Content-Type':'application/json',Cookie:governorCookie,'Idempotency-Key':key},body:JSON.stringify(input)});
    const createInput={identityVerifiedByAdmin:true,email,account:'independent-manager',name:'Manager',department:'Testing',permissions:['HELP_CENTER'],initialPassword:password,confirmPassword:password};
    const createKey=randomUUID(),created=await write('/api/v1/admin/subadmins',createInput,createKey);
    expect(created.status).toBe(200);const sub=(await created.json()).data;
    expect(sub.account).toBe('independent-manager');expect(sub.permissions).toEqual(['HELP_CENTER']);
    expect((await (await write('/api/v1/admin/subadmins',createInput,createKey)).json()).data.id).toBe(sub.id);
    expect((await fetch(urls[1]+'/api/v1/admin/subadmins',{headers:{Cookie:sportsCookie}})).status).toBe(403);
    const listing=await fetch(urls[1]+'/api/v1/admin/subadmins',{headers:{Cookie:governorCookie}});
    expect((await listing.json()).data.items.some((item:{id:string})=>item.id===sub.id)).toBe(true);
    const edited=await write('/api/v1/admin/subadmins/'+sub.id+'/profile',{expectedVersion:sub.version,name:'Updated manager',email,department:'Testing',permissions:['AUDIT_QUERY']});
    expect(edited.status).toBe(200);const updated=(await edited.json()).data;
    expect(updated.permissions).toEqual(['AUDIT_QUERY']);
    expect((await write('/api/v1/admin/subadmins/'+sub.id+'/status',{expectedVersion:updated.version,status:'DISABLED'})).status).toBe(400);
    const disableKey=randomUUID(),disableInput={expectedVersion:updated.version,status:'DISABLED',handoverCompleted:true};
    const disabled=await write('/api/v1/admin/subadmins/'+sub.id+'/status',disableInput,disableKey);
    expect(disabled.status).toBe(200);expect((await disabled.json()).data.status).toBe('DISABLED');
    expect((await write('/api/v1/admin/subadmins/'+sub.id+'/status',disableInput,disableKey)).status).toBe(200);
    expect((await post(1,'/api/v1/auth/password-login',{account:'independent-manager',password})).status).toBe(403);
    const logout=await post(1,'/api/sports/auth/logout',{},combined);expect(logout.status).toBe(200);
    expect(logout.headers.get('set-cookie')).toMatch(/^bnbu_sports_session=;/);
    expect((await fetch(urls[0]+'/api/auth/me',{headers:{Cookie:combined}})).status).toBe(200);
    expect((await fetch(urls[1]+'/api/v1/me',{headers:{Cookie:combined}})).status).toBe(401);
  } finally {
    for(const server of servers){server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
    for(const db of databases)await db.close();
    for(const schema of schemas)await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});
