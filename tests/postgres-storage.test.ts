import { postgresCourseReport } from '../backend/src/storage/postgres-course-report';
import { checkPostgresDeadlineReminders } from '../backend/src/storage/postgres-deadline-reminders';
import { postgresRuleTemplates } from '../backend/src/storage/postgres-rule-templates';
import { postgresInvitationPreview } from '../backend/src/storage/postgres-invitation-preview';
import { requestStudentJoinEmail, verifyStudentJoinEmail, readStudentJoinEmailProof } from '../backend/src/storage/postgres-student-email';
import { postgresStudentApplications, postgresStudentRecognitionHistory } from '../backend/src/storage/postgres-student-applications';
import { postgresStudentProgress } from '../backend/src/storage/postgres-student-progress';
import { postgresStudentRoster } from '../backend/src/storage/postgres-student-roster';
import { postgresStudentPhysical } from '../backend/src/storage/postgres-student-physical';
import { postgresTeacherHistory, postgresTeacherStudent } from '../backend/src/storage/postgres-teacher-history';
import { gradeWorkspace } from '../backend/src/sports/grades';
import { seedPostgresConversions } from '../backend/src/storage/postgres-conversion-seed';
import { postgresReviewMaterial } from '../backend/src/storage/postgres-review-material';
import { postgresSportsWorkspace } from '../backend/src/storage/postgres-sports-workspace';
import { processPostgresSportsReview } from '../backend/src/storage/postgres-review-worker';
import { createServer } from 'node:http';
import sharp from 'sharp';
import { postgresMediaPut, postgresMediaRead, postgresMediaOriginal } from '../backend/src/storage/postgres-student-media';
import { postgresStudentRecords, postgresStudentWorkflow, postgresProofTodos } from '../backend/src/storage/postgres-student-records';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID, createHash } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresDatabase } from '../backend/src/storage/postgres';
import { postgresMigrations } from '../backend/src/storage/postgres-schema';
import { PostgresRepository } from '../backend/src/storage/postgres-repository';
import { importSqlite } from '../backend/src/storage/import-sqlite';
import { openDatabase } from '../backend/src/database';
import { createAccount, hashPassword, digest } from '../backend/src/auth';
import { PostgresAuth } from '../backend/src/storage/postgres-auth';
import { PostgresEmail } from '../backend/src/storage/postgres-email';
import { createPostgresApiServer } from '../backend/src/postgres-api';
import type { AddressInfo } from 'node:net';
import { executePostgres } from '../backend/src/storage/postgres-commands';
import { occupiedPolicy } from '../backend/src/coffee';
import { runAsync } from '../backend/src/storage/effects';
import { postgresWorkspace } from '../backend/src/storage/postgres-workspace';
import { postgresStudentSearch } from '../backend/src/storage/postgres-student-search';
import { postgresAdministratorDirectory } from '../backend/src/storage/postgres-administrators';
import { postgresAdminEmailStatus, postgresAdminEmailRequest, postgresAdminEmailConfirm } from '../backend/src/storage/postgres-admin-email';
import { postgresAdministratorSelf } from '../backend/src/storage/postgres-admin-deletion';
import { postgresCommunityView } from '../backend/src/storage/postgres-community-view';
import { postgresAccountDirectory } from '../backend/src/storage/postgres-account-directory';
import { postgresSportsCourses } from '../backend/src/storage/postgres-sports-courses';
import { postgresSportsHelp } from '../backend/src/storage/postgres-sports-help';
import { postgresSportsMe } from '../backend/src/storage/postgres-sports-me';
import { issueMemberJoin, consumeMemberJoin } from '../backend/src/storage/postgres-member-join';
import {requestStudentLogin,verifyStudentLogin} from '../backend/src/storage/postgres-student-login';
import {issueNewStudentJoin,consumeNewStudentJoin} from '../backend/src/storage/postgres-new-student-join';
import { postgresStudentCourses } from '../backend/src/storage/postgres-student-courses';
import { postgresSportsNotifications } from '../backend/src/storage/postgres-sports-notifications';
import { startClock } from '../backend/src/sports/session-clock';
import { postgresSportsPreferences } from '../backend/src/storage/postgres-sports-preferences';
import { postgresSportsSession } from '../backend/src/storage/postgres-sports-session';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe.skipIf(!process.env.BNBU_TEST_POSTGRES_URL)('PostgreSQL persistence on a real server', () => {
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  let admin: Pool;
  let db: PostgresDatabase;
  beforeAll(async () => {
    vi.stubEnv('BNBU_EMAIL_DELIVERY_URL', '');
    admin = new Pool({ connectionString: process.env.BNBU_TEST_POSTGRES_URL });
    await admin.query(`CREATE SCHEMA ${schema}`);
    db = new PostgresDatabase({ connectionString: process.env.BNBU_TEST_POSTGRES_URL, options: `-c search_path=${schema}` });
    await db.migrate(postgresMigrations);
  });
  afterAll(async () => {
    vi.unstubAllEnvs();
    await db?.close();
    if (admin) {
      try { await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`); }
      finally { await admin.end(); }
    }
  });
  it('serves the public sports maintenance announcement without exposing internal fields', async () => {
    const server=createPostgresApiServer(db);
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const url=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1/system-mode/announcement`;
    let id:string|undefined;
    try {
      expect(await (await fetch(url)).json()).toEqual({data:{mode:'NORMAL',policyVersion:0,updatedAt:null,announcement:null}});
      const system=await db.transaction(client=>new PostgresRepository(client).create('sportsSystem',null,{mode:'MAINTENANCE',privateNote:'private',announcement:{titleZh:'维护',titleEn:'Maintenance',bodyZh:'稍后恢复',bodyEn:'Back soon',estimatedRecoveryAt:1800000000000,internalReason:'private'}}));
      id=system.id;
      const response=await fetch(url),body=await response.json();
      expect(response.status).toBe(200);
      expect(body.data.mode).toBe('MAINTENANCE');
      expect(body.data.announcement.estimatedRecoveryAt).toBe(new Date(1800000000000).toISOString());
      expect(JSON.stringify(body)).not.toContain('private');
    } finally {
      if(id) await db.pool.query('DELETE FROM entities WHERE id=$1',[id]);
      await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
    }
  });
  it('scopes sports courses to the teacher or enrolled student and preserves first-password gating', async () => {
    for (const [id,role] of [['sports-reader-teacher','teacher'],['sports-reader-student','student'],['sports-reader-other','teacher']]) {
      await db.pool.query('INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES($1,$2,$3,$1,$4,$5)',[id,`${id}@example.test`,hashPassword('Sports-read-123'),'now',JSON.stringify([role])]);
      await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity',id,{role,status:'verified'}));
    }
    const [course,hidden]=await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      const course=await repo.create('sportsCourse','sports-reader-teacher',{name:'本人课程',status:'PUBLISHED',semesterId:'sports-read-semester'});
      const hidden=await repo.create('sportsCourse','sports-reader-other',{name:'其他课程',status:'PUBLISHED',semesterId:'sports-read-semester'});
      await repo.create('sportsEnrollment','sports-reader-student',{courseId:course.id,semesterId:'sports-read-semester',status:'ACTIVE'});
      await repo.create('sportsInvitation','sports-reader-teacher',{courseId:course.id,status:'ACTIVE'});
      return [course,hidden];
    });
    const auth=new PostgresAuth(db);
    const teacher=await auth.login('sports-reader-teacher@example.test','Sports-read-123');
    const student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const view=await postgresSportsCourses(db,teacher.token);
    expect(view.courses.map(c=>c.id)).toEqual([course.id]);
    expect(view.enrollments[0].data.studentName).toBe('sports-reader-student');
    const own=await postgresSportsCourses(db,student.token);
    expect(own.courses.map(c=>c.id)).toEqual([course.id]);
    expect(own.courses.some(c=>c.id===hidden.id)).toBe(false);
    expect(own.invitations).toEqual([]);
    const listing=await postgresStudentCourses(db,student.token,'/api/v1/courses',{});
    expect(listing.data).toEqual([expect.objectContaining({id:course.id,courseName:'本人课程'})]);
    await expect(postgresStudentCourses(db,student.token,`/api/v1/courses/${hidden.id}`,{})).rejects.toMatchObject({status:404});
    await expect(postgresStudentCourses(db,student.token,'/api/v1/courses',{cursor:'not-visible'})).rejects.toMatchObject({status:409});
    const teacherListing=await postgresStudentCourses(db,teacher.token,'/api/v1/courses',{});
    expect(teacherListing.data).toEqual([expect.objectContaining({id:course.id})]);
    expect(teacherListing).toMatchObject({meta:{pagination:{hasMore:false,nextCursor:null}}});
    await expect(postgresStudentCourses(db,teacher.token,`/api/v1/courses/${hidden.id}`,{})).rejects.toMatchObject({status:404});
    await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-other',{courseId:hidden.id,semesterId:'sports-read-semester',status:'ACTIVE'}));
    const ownMembers=await postgresStudentCourses(db,student.token,'/api/v1/enrollments',{});
    expect(ownMembers.data).toEqual([expect.objectContaining({studentId:'sports-reader-student',classSectionId:course.id,source:'UNKNOWN'})]);
    const teachingMembers=await postgresStudentCourses(db,teacher.token,'/api/v1/enrollments',{classSectionId:course.id});
    expect(teachingMembers.data).toEqual(ownMembers.data);
    await expect(postgresStudentCourses(db,student.token,'/api/v1/enrollments',{classSectionId:hidden.id})).rejects.toMatchObject({status:404});
    await expect(postgresStudentCourses(db,teacher.token,'/api/v1/enrollments',{classSectionId:hidden.id})).rejects.toMatchObject({status:404});
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      const identity=(await repo.all('sportsIdentity')).find(i=>i.ownerId==='sports-reader-teacher')!;
      await repo.save(identity,{...identity.data,mustChangePassword:true});
    });
    await expect(postgresSportsCourses(db,teacher.token)).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
  });
  it('publishes sports help atomically with permission checks, localized reading and archival', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('help-manager','help-manager@example.test',$1,'帮助管理员','now')",[hashPassword('Help-test-123')]);
    const identity=await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','help-manager',{role:'admin',status:'verified',permissions:['HELP']}));
    const auth=new PostgresAuth(db),manager=await auth.login('help-manager@example.test','Help-test-123');
    const student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const input={titleZh:'运动帮助',titleEn:'Exercise help',bodyZh:'中文说明',bodyEn:'English instructions',category:'EXERCISE',weight:1,keywords:'运动,exercise',publish:true};
    await expect(executePostgres(db,student.token,'sports.help.save',input,randomUUID())).rejects.toMatchObject({status:403});
    await expect(executePostgres(db,manager.token,'sports.help.save',{...input,bodyEn:''},randomUUID())).rejects.toMatchObject({status:400});
    const key=randomUUID(),saved=await executePostgres(db,manager.token,'sports.help.save',input,key);
    expect(await executePostgres(db,manager.token,'sports.help.save',input,key)).toEqual(saved);
    const visible=await postgresSportsHelp(db,student.token,'en');
    const article=visible.articles.find(a=>a.id===saved.id)!;
    expect(article.data).toEqual({title:'Exercise help',body:'English instructions',category:'EXERCISE'});
    expect(article.ownerId).toBeNull();
    const original=await db.transaction(client=>new PostgresRepository(client).get(saved.id));
    await expect(executePostgres(db,manager.token,'sports.help.state',{id:saved.id,version:0,updatedAt:original.updatedAt,status:'archived'},randomUUID())).rejects.toMatchObject({status:409});
    await executePostgres(db,manager.token,'sports.help.state',{id:saved.id,version:original.version,updatedAt:original.updatedAt,status:'archived'},randomUUID());
    expect((await postgresSportsHelp(db,student.token,'zh')).articles.some(a=>a.id===saved.id)).toBe(false);
    expect((await postgresSportsHelp(db,manager.token,'zh')).articles.some(a=>a.id===saved.id)).toBe(true);
    await db.transaction(client=>new PostgresRepository(client).save(identity,{...identity.data,permissions:[]}));
    await expect(executePostgres(db,manager.token,'sports.help.save',input,key)).rejects.toMatchObject({status:403});
  });
  it('projects the student sports identity and rejects duplicate verified identities', async () => {
    // The student protocol uses its own verified identity, never another account's data.
    const studentAuth=new PostgresAuth(db);
    const studentLogin=await studentAuth.login('sports-reader-student@example.test','Sports-read-123');
    const studentMe=await postgresSportsMe(db,studentLogin.token);
    expect(studentMe.user.role).toBe('STUDENT');
    expect(studentMe.studentProfile).toMatchObject({userId:'sports-reader-student',studentNumber:null,gradeYear:null});
    expect(studentMe.user).toMatchObject({emailVerified:false,primaryEmailMasked:null});
    expect(studentMe.user.status).toBe('PENDING');
    const semester=await db.transaction(client=>new PostgresRepository(client).create('sportsSemester',null,{status:'CURRENT'}));
    const member=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-student',{semesterId:semester.id,status:'ACTIVE'}));
    expect((await postgresSportsMe(db,studentLogin.token)).user.status).toBe('ACTIVE');
    await db.transaction(client=>new PostgresRepository(client).save(member,{...member.data,status:'REMOVED'}));
    expect((await postgresSportsMe(db,studentLogin.token)).user.status).toBe('PENDING');
    await db.pool.query('DELETE FROM entities WHERE id=ANY($1::text[])',[[member.id,semester.id]]);
    const duplicate=await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','sports-reader-student',{role:'student',status:'verified'}));
    await expect(postgresSportsMe(db,studentLogin.token)).rejects.toMatchObject({status:403});
    await db.pool.query('DELETE FROM entities WHERE id=$1',[duplicate.id]);
  });
  it('consumes member invitation capability once and rejects mismatched sessions and profiles', async()=>{
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const profile={fullName:'sports-reader-student',studentNumber:'2030123456',gender:'MALE',gradeYear:2030,collegeName:'FST',majorName:'CST',dateOfBirth:'2010-01-01',regionCode:'GD'};
    const fixtures=await db.transaction(async client=>{
      const repo=new PostgresRepository(client),identity=(await repo.all('sportsIdentity')).find(i=>i.ownerId==='sports-reader-student')!;
      await repo.save(identity,{studentNumber:profile.studentNumber,sex:profile.gender,year:profile.gradeYear,collegeName:profile.collegeName,majorName:profile.majorName,dateOfBirth:profile.dateOfBirth,regionCode:profile.regionCode,schoolEmailVerified:true,schoolEmail:'sports-reader-student@example.test'});
      const semester=await repo.create('sportsSemester',null,{status:'CURRENT'}),course=await repo.create('sportsCourse','sports-reader-teacher',{semesterId:semester.id,status:'PUBLISHED',enrollmentOpen:true});
      const invite=await repo.create('sportsInvitation','sports-reader-teacher',{code:'v1.member-test',courseId:course.id,status:'ACTIVE',expiresAt:Date.now()+600000});
      return {identity,semester,course,invite};
    });
    try {
      const key=randomUUID(),issued=await issueMemberJoin(db,login.token,'v1.member-test',profile,key);
      expect(await issueMemberJoin(db,login.token,'v1.member-test',profile,key)).toEqual(issued);
      await expect(issueMemberJoin(db,login.token,'v1.member-test',{...profile,studentNumber:'other'},key)).rejects.toMatchObject({status:409});
      const otherSession=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
      await expect(consumeMemberJoin(db,otherSession.token,'v1.member-test',issued.joinCapability,randomUUID())).rejects.toMatchObject({status:403});
      await expect(consumeMemberJoin(db,login.token,'v1.wrong',issued.joinCapability,randomUUID())).rejects.toMatchObject({status:403});
      await db.pool.query('UPDATE member_join_capabilities SET expires_at=0 WHERE token_hash=$1',[digest(issued.joinCapability)]);
      await expect(consumeMemberJoin(db,login.token,'v1.member-test',issued.joinCapability,randomUUID())).rejects.toMatchObject({status:410});
      await db.pool.query('UPDATE member_join_capabilities SET expires_at=$1 WHERE token_hash=$2',[Date.parse(issued.expiresAt),digest(issued.joinCapability)]);
      await db.pool.query("UPDATE entities SET data=(data::jsonb || '{\"status\":\"REVOKED\"}')::text WHERE id=$1",[fixtures.invite.id]);
      await expect(consumeMemberJoin(db,login.token,'v1.member-test',issued.joinCapability,randomUUID())).rejects.toMatchObject({status:400});
      await db.pool.query("UPDATE entities SET data=(data::jsonb || '{\"status\":\"ACTIVE\"}')::text WHERE id=$1",[fixtures.invite.id]);
      await db.pool.query('UPDATE entities SET version=version+1 WHERE id=$1',[fixtures.identity.id]);
      await expect(consumeMemberJoin(db,login.token,'v1.member-test',issued.joinCapability,randomUUID())).rejects.toMatchObject({status:409});
      await db.pool.query('UPDATE entities SET version=version-1 WHERE id=$1',[fixtures.identity.id]);
      const consumeKey=randomUUID(),result=await consumeMemberJoin(db,login.token,'v1.member-test',issued.joinCapability,consumeKey);
      expect(await consumeMemberJoin(db,login.token,'v1.member-test',issued.joinCapability,consumeKey)).toEqual(result);
      await expect(consumeMemberJoin(db,login.token,'v1.member-test',issued.joinCapability,randomUUID())).rejects.toMatchObject({status:409});
      expect(result).toMatchObject({authSession:{kind:'COMPANION',user:{id:'sports-reader-student'}}});
      expect((await db.pool.query('SELECT * FROM member_join_capabilities WHERE token_hash=$1',[digest(issued.joinCapability)])).rows).toHaveLength(1);
    } finally {
      await db.pool.query('DELETE FROM member_join_capabilities WHERE invitation_id=$1',[fixtures.invite.id]);
      await db.pool.query("DELETE FROM notifications WHERE entity_id IN (SELECT id FROM entities WHERE data::jsonb->>'invitationId'=$1)",[fixtures.invite.id]);
      await db.pool.query("DELETE FROM entities WHERE data::jsonb->>'invitationId'=$1 OR id=ANY($2::text[])",[fixtures.invite.id,[fixtures.invite.id,fixtures.course.id,fixtures.semester.id]]);
      await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(fixtures.identity.id),{...fixtures.identity.data,schoolEmailVerified:false});});
    }
  });
  it('logs in an existing verified student by purpose-bound code without reviving a logged-out session',async()=>{
    const id=randomUUID(),email='y123456789@bnbu.edu.cn';
    await db.pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES($1,$2,$3,$4,$5,$6)',[id,email,hashPassword('Unused-test-123'),'验证码学生','["student"]','now']);
    const input={organizationCode:'BNBU',account:email,channel:'EMAIL',locale:'zh-CN'},key=randomUUID();
    await expect(requestStudentLogin(db,input,key,true)).rejects.toMatchObject({status:403});
    await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity',id,{role:'student',status:'verified',schoolEmail:email,schoolEmailVerified:true}));
    const issued=await requestStudentLogin(db,input,key,true);
    expect(await requestStudentLogin(db,input,key,true)).toEqual(issued);
    await expect(requestStudentLogin(db,input,randomUUID(),true)).rejects.toMatchObject({status:429});
    const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
    for(let n=0;n<4;n++)await expect(verifyStudentLogin(db,{challengeId:issued.challengeId,code:'000000'},randomUUID())).rejects.toMatchObject({status:400});
    const verifyKey=randomUUID(),verification={challengeId:issued.challengeId,code,deviceId:'test'};
    const result=await verifyStudentLogin(db,verification,verifyKey);
    expect((await new PostgresAuth(db).authenticate(result.token)).id).toBe(id);
    expect(await verifyStudentLogin(db,verification,verifyKey)).toEqual(result);
    await expect(verifyStudentLogin(db,verification,randomUUID())).rejects.toMatchObject({status:409});
    expect((await db.pool.query('SELECT code_hash FROM student_login_challenges WHERE id=$1',[issued.challengeId])).rows[0].code_hash).toBeNull();
    expect((await db.pool.query('SELECT 1 FROM mail_outbox WHERE recipient=$1',[email])).rows).toHaveLength(0);
    await new PostgresAuth(db).logout(result.token);
    await expect(verifyStudentLogin(db,verification,verifyKey)).rejects.toMatchObject({status:401});
    await db.pool.query('UPDATE student_login_challenges SET sent_at=0 WHERE id=$1',[issued.challengeId]);
    const locked=await requestStudentLogin(db,input,randomUUID(),true);
    for(let n=0;n<6;n++)await expect(verifyStudentLogin(db,{challengeId:locked.challengeId,code:'000000'},randomUUID())).rejects.toMatchObject({status:400});
    expect((await db.pool.query('SELECT attempts FROM student_login_challenges WHERE id=$1',[locked.challengeId])).rows[0].attempts).toBe(5);
    await db.pool.query('DELETE FROM mail_outbox WHERE recipient=$1',[email]);
    await db.pool.query("UPDATE accounts SET email='login-done@example.test' WHERE id=$1",[id]);
  });
  it('stores sports language without enabling delivery or overwriting companion privacy settings', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    expect(await postgresSportsPreferences(db,login.token)).toEqual({locale:'zh-CN',pushEnabled:false,emailEnabled:false,version:0});
    await executePostgres(db,login.token,'preferences.preview',{enabled:false},randomUUID());
    const current=await postgresSportsPreferences(db,login.token),key=randomUUID();
    const input={locale:'en',pushEnabled:false,emailEnabled:false,expectedVersion:current.version};
    const saved=await executePostgres(db,login.token,'sports.preferences.save',input,key);
    expect(saved).toMatchObject({locale:'en',pushEnabled:false,emailEnabled:false});
    expect(await executePostgres(db,login.token,'sports.preferences.save',input,key)).toEqual(saved);
    await expect(executePostgres(db,login.token,'sports.preferences.save',input,randomUUID())).rejects.toMatchObject({code:'CONFLICT_VERSION_MISMATCH'});
    await expect(executePostgres(db,login.token,'sports.preferences.save',{...input,expectedVersion:saved.version,pushEnabled:true},randomUUID())).rejects.toMatchObject({status:503});
    const prefs=await db.transaction(client=>new PostgresRepository(client).all('preferences'));
    expect(prefs.find(p=>p.ownerId==='sports-reader-student')?.data.profilePreview).toBe(false);
  });
  it('persists sports pause resume and end with ownership, versions and idempotency', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const session=await db.transaction(client=>new PostgresRepository(client).create('sportsSession','sports-reader-student',{clock:startClock(Date.now()-2000),ruleSnapshot:{threshold:30}}));
    const key=randomUUID(),input={id:session.id,version:session.version};
    const paused=await executePostgres(db,login.token,'sports.session.pause',input,key);
    expect(await executePostgres(db,login.token,'sports.session.pause',input,key)).toEqual(paused);
    await expect(executePostgres(db,login.token,'sports.session.resume',input,randomUUID())).rejects.toMatchObject({status:409});
    let saved=await db.transaction(client=>new PostgresRepository(client).get(session.id));
    await executePostgres(db,login.token,'sports.session.resume',{id:saved.id,version:saved.version},randomUUID());
    saved=await db.transaction(client=>new PostgresRepository(client).get(session.id));
    await executePostgres(db,login.token,'sports.session.end',{id:saved.id,version:saved.version},randomUUID());
    saved=await db.transaction(client=>new PostgresRepository(client).get(session.id));
    expect(saved.data.clock).toMatchObject({state:'ENDED'});
    expect(await postgresSportsSession(db,login.token,session.id)).toMatchObject({id:session.id,status:'COMPLETED',completedAt:expect.any(String),actualDurationSeconds:expect.any(Number)});
    await expect(postgresSportsSession(db,login.token,'active')).rejects.toMatchObject({status:404});
    const events=await db.transaction(client=>new PostgresRepository(client).all('sportsSessionEvent'));
    expect(events.filter(e=>e.data.sessionId===session.id)).toHaveLength(3);
  });
  it('atomically accepts a material manifest in PostgreSQL with retry and duplicate protection', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const session=await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      const semester=await repo.create('sportsSemester',null,{status:'DRAFT'});
      const course=await repo.create('sportsCourse',null,{semesterId:semester.id});
      return repo.create('sportsSession','sports-reader-student',{courseId:course.id,semesterId:semester.id,activityType:'EXERCISE',ruleSnapshot:{threshold:30},clock:{...startClock(Date.now()-1800000),state:'ENDED',endedAt:Date.now(),activeMilliseconds:1800000}});
    });
    const draftInput={sessionId:session.id,creditType:'GENERAL',sportType:'RUNNING',sportName:null,description:'草稿说明',clientRequestId:randomUUID()},draftKey=randomUUID();
    const draft=await executePostgres(db,login.token,'sports.recorddraft.create',draftInput,draftKey);
    expect((await postgresStudentRecords(db,login.token,{},String(draft.id))).data).toMatchObject({id:draft.id,status:'DRAFT'});
    const page=await postgresStudentRecords(db,login.token,{limit:'1',sort:'-businessDate'});
    expect(Array.isArray(page.data)).toBe(true);
    await expect(postgresStudentRecords(db,login.token,{cursor:'foreign-record'})).rejects.toMatchObject({status:409});
    expect(draft).toMatchObject({status:'DRAFT',sessionId:session.id,description:'草稿说明'});
    expect(await executePostgres(db,login.token,'sports.recorddraft.create',draftInput,draftKey)).toEqual(draft);
    await expect(executePostgres(db,login.token,'sports.recorddraft.create',draftInput,randomUUID())).rejects.toMatchObject({status:409});
    const edited=await executePostgres(db,login.token,'sports.recorddraft.edit',{id:draft.id,expectedVersion:draft.version,description:'核对后的说明'},randomUUID());
    expect(edited.description).toBe('核对后的说明');
    await expect(executePostgres(db,login.token,'sports.recorddraft.edit',{id:draft.id,expectedVersion:draft.version,description:'旧版本'},randomUUID())).rejects.toMatchObject({status:409});
    const bytes=await sharp({create:{width:2,height:2,channels:3,background:'#00ff00'}}).png().toBuffer();
    const mediaInput={sessionId:session.id,businessPurpose:'EXERCISE_RECORD',mediaType:'IMAGE',mimeType:'image/png',fileSizeBytes:bytes.length,captureSource:'IN_APP_CAMERA',declaredContentSha256:createHash('sha256').update(bytes).digest('hex'),durationSeconds:null};
    await expect(executePostgres(db,login.token,'sports.media.initiate',{...mediaInput,captureSource:'FILE_PICKER'},randomUUID())).rejects.toMatchObject({status:400});
    const mediaKey=randomUUID(),lease=await executePostgres(db,login.token,'sports.media.initiate',mediaInput,mediaKey);
    expect(await executePostgres(db,login.token,'sports.media.initiate',mediaInput,mediaKey)).toEqual(lease);
    await expect(postgresMediaPut(db,login.token,String(lease.mediaId),Buffer.from('invalid'),'image/png')).rejects.toMatchObject({status:409});
    expect(await postgresMediaPut(db,login.token,String(lease.mediaId),bytes,'image/png')).toBe(createHash('sha256').update(bytes).digest('hex'));
    expect(await postgresMediaPut(db,login.token,String(lease.mediaId),bytes,'image/png')).toBe(createHash('sha256').update(bytes).digest('hex'));
    const verified=await executePostgres(db,login.token,'sports.media.confirm',{id:lease.mediaId,etag:createHash('sha256').update(bytes).digest('hex')},randomUUID());
    const bound=await executePostgres(db,login.token,'sports.media.bind',{id:lease.mediaId,sessionId:session.id,expectedVersion:verified.version},randomUUID());
    expect(bound.uploadStatus).toBe('AVAILABLE');
    const access=await executePostgres(db,login.token,'sports.media.access',{id:lease.mediaId,purpose:'VIEW_ORIGINAL'},randomUUID());
    const accessId=String(access.accessUrl).split('/').at(-1)!;
    expect((await postgresMediaOriginal(db,login.token,accessId)).bytes).toEqual(bytes);
    await expect(postgresMediaOriginal(db,'invalid-token',accessId)).rejects.toMatchObject({status:401});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(accessId),{expiresAt:Date.now()-1});});
    await expect(postgresMediaOriginal(db,login.token,accessId)).rejects.toMatchObject({status:410});

    expect(await postgresMediaRead(db,login.token,String(lease.mediaId))).toMatchObject({verifiedFileSizeBytes:bytes.length,verificationStatus:'VERIFIED'});
    await expect(executePostgres(db,login.token,'sports.record.submit',{id:draft.id,expectedVersion:edited.version,mediaIds:[lease.mediaId,lease.mediaId]},randomUUID())).rejects.toMatchObject({status:400});
    await expect(executePostgres(db,login.token,'sports.record.submit',{id:draft.id,expectedVersion:draft.version,mediaIds:[lease.mediaId]},randomUUID())).rejects.toMatchObject({status:409});
    expect((await postgresStudentRecords(db,login.token,{},String(draft.id))).data).toMatchObject({status:'DRAFT'});
    const discarded=await executePostgres(db,login.token,'sports.recorddraft.discard',{id:draft.id,expectedVersion:edited.version,reason:'测试放弃'},randomUUID());
    expect(discarded.status).toBe('DISCARDED');
    await expect(executePostgres(db,login.token,'sports.recorddraft.edit',{id:draft.id,expectedVersion:discarded.version,description:'不能修改'},randomUUID())).rejects.toMatchObject({status:409});
    const input={sessionId:session.id,version:session.version,category:'RELATED',description:'材料受理测试',activityType:'EXERCISE',files:[{clientId:'photo',mime:'image/jpeg',size:123,sha256:'a'.repeat(64)}]},key=randomUUID();
    const result=await executePostgres(db,login.token,'sports.record.accept',input,key);
    expect(await executePostgres(db,login.token,'sports.record.accept',input,key)).toEqual(result);
    expect((await postgresStudentRecords(db,login.token,{},String(result.id))).data).toMatchObject({id:result.id,status:'SUBMITTED',creditedDurationSeconds:null});
    await expect(postgresStudentRecords(db,login.token,{},String(draft.id))).rejects.toMatchObject({status:404});
    await expect(executePostgres(db,login.token,'sports.record.accept',input,randomUUID())).rejects.toMatchObject({status:409});
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client),record=await repo.get(result.id);
      expect(record.data.status).toBe('UPLOADING');
      const batch=await repo.get(record.data.batchId);
      expect(Number(batch.data.uploadDeadline)-Number(batch.data.acceptedAt)).toBe(1800000);
      expect((await repo.all('sportsMaterial')).filter(m=>m.data.recordId===record.id)).toHaveLength(1);
      expect((await client.query('SELECT id FROM notifications WHERE entity_id=$1',[record.id])).rows).toHaveLength(1);
      await client.query('DELETE FROM notifications WHERE entity_id=$1',[record.id]);
    });
    await db.transaction(async client=>{const repo=new PostgresRepository(client),r=await repo.get(result.id);await repo.save(r,{status:'PENDING_AI'});await repo.save(await repo.get(r.data.batchId),{status:'COMPLETE'});for(const m of (await repo.all('sportsMaterial')).filter(m=>m.data.recordId===r.id)) await repo.save(m,{status:'COMPLETE'});});
    await Promise.all([processPostgresSportsReview(db,{}),processPostgresSportsReview(db,{})]);
    await db.transaction(async client=>{const repo=new PostgresRepository(client),r=await repo.get(result.id);expect(r.data).toMatchObject({status:'TECHNICAL',technicalCode:'AI_NOT_CONFIGURED'});await repo.save(r,{status:'PENDING_AI'});const c=await repo.get(r.data.courseId);await repo.save(c,{threshold:30,weeklyLimit:3,relatedTarget:600,otherTarget:600});});
    const ai=createServer(async(req,res)=>{const chunks=[];for await(const chunk of req) chunks.push(chunk);const input=JSON.parse(Buffer.concat(chunks).toString());res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({...input,checksCompleted:true,outcome:'NORMAL',modelVersion:'local-fixture'}));});
    await new Promise<void>(resolve=>ai.listen(0,'127.0.0.1',resolve));
    try {
      await db.transaction(async client=>{const repo=new PostgresRepository(client);for(const m of (await repo.all('sportsMaterial')).filter(m=>m.data.recordId===result.id)) await repo.save(m,{objectKey:mediaInput.declaredContentSha256});});
      await processPostgresSportsReview(db,{url:'http://127.0.0.1:'+(ai.address() as AddressInfo).port,validationRef:'local-test-only'});
      await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.get(result.id)).data.status).toBe('VALID');expect((await repo.all('sportsProgress')).some(p=>p.ownerId==='sports-reader-student' && p.data.courseId===session.data.courseId)).toBe(true);await client.query('DELETE FROM notifications WHERE entity_id=$1',[result.id]);});
    } finally {await new Promise<void>(resolve=>ai.close(()=>resolve()));}

  });
  it('uses the shared teacher decision policy with PostgreSQL ownership and atomic progress', async()=>{
    const auth=new PostgresAuth(db),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123'),other=await auth.login('sports-reader-teacher@example.test','Sports-read-123');
    const proof=await sharp({create:{width:4,height:4,channels:3,background:'#102030'}}).png().toBuffer(),proofHash=createHash('sha256').update(proof).digest('hex');
    const record=await db.transaction(async client=>{const repo=new PostgresRepository(client);const semester=await repo.create('sportsSemester',null,{status:'DRAFT'});const course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id,threshold:30,weeklyLimit:3,relatedTarget:600,otherTarget:600});const session=await repo.create('sportsSession','sports-reader-student',{clock:{...startClock(Date.now()-1800000),state:'ENDED',endedAt:Date.now(),activeMilliseconds:1800000}});const r=await repo.create('sportsRecord','sports-reader-student',{courseId:course.id,semesterId:semester.id,sessionId:session.id,status:'TEACHER_PENDING',category:'RELATED',activeMilliseconds:1800000});const batch=await repo.create('sportsMaterialBatch',r.ownerId,{recordId:r.id,status:'COMPLETE'});await client.query('INSERT INTO sports_media_blobs(sha256,bytes,created_at) VALUES($1,$2,$3)',[proofHash,proof,new Date().toISOString()]);await repo.create('sportsMaterial',r.ownerId,{recordId:r.id,batchId:batch.id,status:'COMPLETE',mime:'image/png',sha256:proofHash});return repo.save(r,{batchId:batch.id});});
    const member=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-student',{courseId:record.data.courseId,status:'ACTIVE'}));
    const student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const rulesPath='/api/v1/class-sections/'+record.data.courseId+'/v81-rules';
    await expect(postgresStudentCourses(db,student.token,rulesPath,{})).rejects.toMatchObject({status:409});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(record.data.courseId),{status:'PUBLISHED',publishedAt:'2026-09-01T00:00:00Z',deadlineDate:'2026-12-01',closingDate:'2026-12-08',settlementDate:'2026-12-09'});});
    expect((await postgresStudentCourses(db,student.token,rulesPath,{})).data).toMatchObject({minimum_minutes:30,maximum_minutes:60,weekly_limit:3,daily_limit:1,published_at:'2026-09-01T00:00:00Z',closing_deadline:'2026-12-08T15:59:59.000Z'});
    await expect(postgresStudentCourses(db,student.token,'/api/v1/class-sections/unknown/v81-rules',{})).rejects.toMatchObject({status:404});
    expect((await postgresStudentProgress(db,student.token,{},String(record.data.courseId))).data).toMatchObject({courseTargetSeconds:36000,generalTargetSeconds:36000});
    await expect(postgresStudentProgress(db,student.token,{},'foreign-course')).rejects.toMatchObject({status:404});
    const input={id:record.id,version:record.version,batchId:record.data.batchId,checksCompleted:true,decision:'PASS'},key=randomUUID();
    await expect(executePostgres(db,other.token,'sports.review.decide',input,randomUUID())).rejects.toMatchObject({status:403});
    const material=await db.transaction(async client=>(await new PostgresRepository(client).all('sportsMaterial')).find(m=>m.data.recordId===record.id)!);
    expect((await postgresReviewMaterial(db,teacher.token,material.id)).bytes).toEqual(proof);
    await expect(postgresReviewMaterial(db,other.token,material.id)).rejects.toMatchObject({status:403});
    const before=await postgresSportsWorkspace(db,teacher.token);
    expect('records' in before && before.records.some(r=>r.id===record.id)).toBe(true);
    const locked=await postgresSportsWorkspace(db,other.token);expect(locked).toMatchObject({firstLoginOnly:true});expect('records' in locked).toBe(false);
    const result=await executePostgres(db,teacher.token,'sports.review.decide',input,key);expect(result.id).toBe(record.id);
    expect(await executePostgres(db,teacher.token,'sports.review.decide',input,key)).toEqual(result);
    const progressPage=await postgresStudentProgress(db,student.token,{enrollmentId:member.id});
    expect(progressPage.data).toEqual([expect.objectContaining({enrollmentId:member.id,courseRelated:{effectiveSeconds:1800,targetSeconds:36000},general:{effectiveSeconds:0,targetSeconds:36000},status:'IN_PROGRESS'})]);
    await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.get(record.id)).data.status).toBe('VALID');const progress=(await repo.all('sportsProgress')).find(p=>p.data.courseId===record.data.courseId)!;expect((progress.data.details as {recordId:string;actual:number}[]).find(d=>d.recordId===record.id)?.actual).toBe(30);await client.query('DELETE FROM notifications WHERE entity_id=$1',[record.id]);});
  });
  it('governs technical AI retries and limited manual review without changing teaching decisions', async()=>{
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('ai-governor','ai-governor@example.test',$1,'AI测试总管','now','[\"superadmin\"]')",[hashPassword('Ai-govern-123')]);
    const record=await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.create('sportsIdentity','ai-governor',{role:'admin',status:'verified'});const course=await repo.create('sportsCourse','sports-reader-other',{});const r=await repo.create('sportsRecord','sports-reader-student',{courseId:course.id,status:'TECHNICAL'});const batch=await repo.create('sportsMaterialBatch',r.ownerId,{recordId:r.id,status:'COMPLETE'});await repo.create('sportsMaterial',r.ownerId,{batchId:batch.id,status:'COMPLETE'});return repo.save(r,{batchId:batch.id});});
    const auth=new PostgresAuth(db),admin=await auth.login('ai-governor@example.test','Ai-govern-123'),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123');
    await expect(executePostgres(db,teacher.token,'sports.ai.retry',{id:record.id,version:record.version},randomUUID())).rejects.toMatchObject({status:403});
    await executePostgres(db,admin.token,'sports.ai.retry',{id:record.id,version:record.version},randomUUID());
    const retried=await db.transaction(client=>new PostgresRepository(client).get(record.id));expect(retried.data.status).toBe('PENDING_AI');
    await expect(executePostgres(db,admin.token,'sports.ai.retry',{id:record.id,version:retried.version},randomUUID())).rejects.toMatchObject({status:409});
    const key=randomUUID(),input={courseId:record.data.courseId,endAt:new Date(Date.now()+3600000).toISOString(),reason:'本地验证限时人工处理'};
    const mode=await executePostgres(db,admin.token,'sports.ai.manual',input,key);expect(await executePostgres(db,admin.token,'sports.ai.manual',input,key)).toEqual(mode);
    const saved=await db.transaction(client=>new PostgresRepository(client).get(mode.id));
    await executePostgres(db,admin.token,'sports.ai.stop',{id:saved.id,version:saved.version,reason:'验证结束'},randomUUID());
    await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.get(record.id)).data.status).toBe('TEACHER_PENDING');expect((await repo.get(mode.id)).data.status).toBe('STOPPED');expect((await repo.all('sportsReviewRound')).filter(r=>r.data.recordId===record.id)).toHaveLength(1);await client.query('DELETE FROM notifications WHERE entity_id=ANY($1::text[])',[[record.id,String(record.data.courseId)]]);await client.query("UPDATE accounts SET roles='[]' WHERE id='ai-governor'");});
  });
  it('reads only owned structured applications and keeps teacher decision dates', async()=>{
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const owned=await db.transaction(async client=>{const repo=new PostgresRepository(client);const a=await repo.create('sportsApplication','sports-reader-student',{applicationType:'CERTIFICATION',enrollmentId:'app-read-fixture',status:'APPROVED',reason:'student reason',certification:{certificationKind:'SCHOOL_TEAM',organizationOrTeamName:'Test team'},privateInternal:'do not expose'});await repo.create('sportsApplication','sports-reader-other',{applicationType:'EXEMPTION',status:'SUBMITTED',reason:'foreign secret'});await repo.create('sportsApplicationHistory','sports-reader-other',{applicationId:a.id,version:a.version,action:'APPROVE',at:Date.now()});return a;});
    const result=await postgresStudentApplications(db,login.token,{enrollmentId:'app-read-fixture'},true);
    expect(result.data).toEqual([expect.objectContaining({id:owned.id,certificationType:'SCHOOL_TEAM',organizationName:'Test team',decidedAt:expect.any(String)})]);
    expect(JSON.stringify(result)).not.toContain('privateInternal');expect(JSON.stringify(result)).not.toContain('foreign secret');
    await db.transaction(async client=>{const repo=new PostgresRepository(client);for(const [category,minutes] of [['RELATED',60],['OTHER',120]]) await repo.create('sportsCertificationHistory','sports-reader-other',{applicationId:owned.id,creditVersion:1,category,minutes,status:'VALID',reason:'原认可'});});
    expect((await postgresStudentRecognitionHistory(db,login.token,owned.id,{})).data).toEqual([expect.objectContaining({courseSeconds:3600,generalSeconds:7200,revisionNumber:1,active:true})]);
    const foreign=await db.transaction(client=>new PostgresRepository(client).create('sportsApplication','sports-reader-other',{applicationType:'CERTIFICATION'}));
    await expect(postgresStudentRecognitionHistory(db,login.token,foreign.id,{})).rejects.toMatchObject({status:404});
    await db.transaction(client=>new PostgresRepository(client).create('sportsCertificationHistory','sports-reader-other',{applicationId:owned.id,creditVersion:2,category:'RELATED',minutes:20,status:'VALID',reason:'缺失另一类'}));
    await expect(postgresStudentRecognitionHistory(db,login.token,owned.id,{})).rejects.toMatchObject({status:409});

  });
  it('reads only own roster reconciliation without exposing classmates', async()=>{
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const member=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-student',{courseId:'roster-read-fixture',status:'ACTIVE'}));
    expect((await postgresStudentRoster(db,login.token,member.id)).data).toMatchObject({available:false,status:null,registrationComplete:false});
    const foreign=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-other',{courseId:'roster-read-fixture',status:'ACTIVE'}));
    await expect(postgresStudentRoster(db,login.token,foreign.id)).rejects.toMatchObject({status:404});
    const snapshot=await db.transaction(async client=>{
      const repo=new PostgresRepository(client),identity=(await repo.all('sportsIdentity')).find(i=>i.ownerId==='sports-reader-student')!;
      const s=await repo.create('sportsRosterSnapshot',null,{courseId:'roster-read-fixture',rows:[{studentNumber:identity.data.studentNumber ?? 'unmatched',name:'private classmate',excluded:false,columnError:false}]});
      await repo.create('sportsRosterBasis',null,{courseId:'roster-read-fixture',snapshotId:s.id});return s;
    });
    const result=await postgresStudentRoster(db,login.token,member.id);
    expect(result.data).toMatchObject({available:true,rosterVersion:1,registrationComplete:false});
    expect(Object.keys(result.data)).toHaveLength(7);expect(JSON.stringify(result)).not.toContain('private classmate');
    const identity=await db.transaction(async client=>{const repo=new PostgresRepository(client),i=(await repo.all('sportsIdentity')).find(i=>i.ownerId==='sports-reader-student')!;await repo.save(i,{studentNumber:'roster-number',schoolEmailVerified:true,schoolEmail:'sports-reader-student@example.test'});await repo.save(await repo.get(snapshot.id),{rows:[{studentNumber:'roster-number',name:'sports-reader-student',excluded:false,columnError:false}]});return i;});
    expect((await postgresStudentRoster(db,login.token,member.id)).data).toMatchObject({status:'MATCHED',registrationComplete:true});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(identity.id),{schoolEmailVerified:false});});
    expect((await postgresStudentRoster(db,login.token,member.id)).data.status).toBe('PENDING_REGISTRATION');
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(snapshot.id),{rows:[{studentNumber:'roster-number',name:'incorrect name',excluded:false,columnError:false}]});});
    expect((await postgresStudentRoster(db,login.token,member.id)).data.status).toBe('IDENTITY_CONFLICT');
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(identity.id),{studentNumber:identity.data.studentNumber ?? null,schoolEmailVerified:identity.data.schoolEmailVerified ?? false,schoolEmail:identity.data.schoolEmail ?? null});await repo.save(await repo.get(snapshot.id),{courseId:'wrong-course'});});
    await expect(postgresStudentRoster(db,login.token,member.id)).rejects.toMatchObject({status:409});
  });
  it('shows owned raw physical facts and exemption revocation without exposing scores', async()=>{
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const member=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-student',{courseId:'physical-read-fixture',status:'ACTIVE'}));
    expect((await postgresStudentPhysical(db,login.token,member.id)).data).toEqual({status:'NOT_RECORDED',result:null});
    const exemption=await db.transaction(client=>new PostgresRepository(client).create('sportsExemption',member.ownerId,{courseId:member.data.courseId,status:'APPROVED'}));
    expect((await postgresStudentPhysical(db,login.token,member.id)).data).toEqual({status:'EXEMPT',result:null});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(exemption,{status:'REVOKED'});});
    expect((await postgresStudentPhysical(db,login.token,member.id)).data.status).toBe('NOT_RECORDED');
    await db.transaction(client=>new PostgresRepository(client).create('sportsEndurance',member.ownerId,{enrollmentId:member.id,courseId:member.data.courseId,event:1000,seconds:245,testDate:'2026-10-01',conversion:{score:100},internalNote:'secret'}));
    expect((await postgresStudentPhysical(db,login.token,member.id)).data).toEqual({status:'RECORDED',result:{runType:'1000m',elapsedSeconds:245,testedOn:'2026-10-01'}});
    const other=await new PostgresAuth(db).login('sports-reader-other@example.test','Sports-read-123');
    await expect(postgresStudentPhysical(db,other.token,member.id)).rejects.toMatchObject({status:403});
  });
  it('persists responsible teacher physical confirmations and versioned history', async()=>{
    const auth=new PostgresAuth(db),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123'),student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const member=await db.transaction(async client=>{const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',null,{status:'DRAFT'}),course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id,status:'PUBLISHED'});return repo.create('sportsEnrollment','sports-reader-student',{courseId:course.id,status:'ACTIVE'});});
    const input={enrollmentId:member.id,version:0,event:1000,seconds:250,testDate:'2026-10-01',confirmed:true},key=randomUUID();
    await expect(executePostgres(db,student.token,'sports.endurance.confirm',input,randomUUID())).rejects.toMatchObject({status:403});
    const saved=await executePostgres(db,teacher.token,'sports.endurance.confirm',input,key);
    expect(await executePostgres(db,teacher.token,'sports.endurance.confirm',input,key)).toEqual(saved);
    expect((await postgresStudentPhysical(db,student.token,member.id)).data).toEqual({status:'RECORDED',result:{runType:'1000m',elapsedSeconds:250,testedOn:'2026-10-01'}});
    await expect(executePostgres(db,teacher.token,'sports.endurance.confirm',{...input,seconds:251},randomUUID())).rejects.toMatchObject({status:409});
    await executePostgres(db,teacher.token,'sports.endurance.confirm',{...input,version:1,seconds:251},randomUUID());
    const history=(await postgresTeacherHistory(db,teacher.token,member.id,'physical-results',{limit:1})).data;
    expect(history).toMatchObject({items:[{version:2,elapsedSeconds:251}],nextBeforeVersion:2});
    expect((await postgresTeacherHistory(db,teacher.token,member.id,'physical-results',{beforeVersion:2})).data).toMatchObject({items:[{version:1,elapsedSeconds:250}],nextBeforeVersion:null});
    await expect(postgresTeacherHistory(db,student.token,member.id,'physical-results',{})).rejects.toMatchObject({status:403});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.all('sportsEnduranceRevision')).filter(r=>r.data.recordId===saved.id)).toHaveLength(2);const course=await repo.get(member.data.courseId);await repo.save(course,{settlementStatus:'SETTLED'});await client.query('DELETE FROM notifications WHERE entity_id=$1',[saved.id]);});
    await expect(executePostgres(db,teacher.token,'sports.endurance.confirm',{...input,version:2,seconds:252},randomUUID())).rejects.toMatchObject({status:409});
  });
  it('keeps grade drafts separate from publications and hidden from students', async()=>{
    const auth=new PostgresAuth(db),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123'),student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const member=await db.transaction(async client=>{const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',null,{status:'DRAFT'}),course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id,status:'PUBLISHED'});return repo.create('sportsEnrollment','sports-reader-student',{courseId:course.id,status:'ACTIVE'});});
    const input={enrollmentId:member.id,version:0,score:82};
    await expect(executePostgres(db,student.token,'sports.grade.save',input,randomUUID())).rejects.toMatchObject({status:403});
    const draft=await executePostgres(db,teacher.token,'sports.grade.save',input,randomUUID());
    const key=randomUUID(),publish={id:draft.id,version:1};
    const publication=await executePostgres(db,teacher.token,'sports.grade.publish',publish,key);
    expect(await executePostgres(db,teacher.token,'sports.grade.publish',publish,key)).toEqual(publication);
    await executePostgres(db,teacher.token,'sports.grade.save',{...input,version:2,score:91},randomUUID());
    await db.transaction(async client=>{const repo=new PostgresRepository(client),actor=await auth.authenticate(student.token,client),entities=[...await repo.all('sportsIdentity'),...await repo.all('sportsCourse'),...await repo.all('sportsGradeDraft'),...await repo.all('sportsGradePublication')];expect(gradeWorkspace({all:kind=>entities.filter(e=>e.kind===kind)},actor)).toEqual({gradeDrafts:[],gradePublications:[]});});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.get(publication.id)).data.score).toBe(82);expect((await repo.get(draft.id)).data.score).toBe(91);});
    const history=(await postgresTeacherHistory(db,teacher.token,member.id,'final-grades',{})).data;
    expect(history.items).toMatchObject([{version:3,published:false,finalGrade:91},{version:2,published:true,finalGrade:82},{version:1,published:false,finalGrade:82}]);
  });
  it('edits conversion rules transactionally with permission and interval checks', async()=>{
    await seedPostgresConversions(db);
    const seeded=await db.transaction(client=>new PostgresRepository(client).all('sportsConversionTable'));
    expect(seeded).toHaveLength(4);expect(seeded.reduce((n,t)=>n+(t.data.rows as unknown[]).length,0)).toBe(404);
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(seeded[0],{seedVerificationNote:'retain edit'});});
    await seedPostgresConversions(db);
    expect((await db.transaction(client=>new PostgresRepository(client).get(seeded[0].id))).data.seedVerificationNote).toBe('retain edit');
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='ai-governor'");
    try {
      const auth=new PostgresAuth(db),admin=await auth.login('ai-governor@example.test','Ai-govern-123'),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123');
      const table=await db.transaction(client=>new PostgresRepository(client).create('sportsConversionTable',null,{sex:'MALE',group:'JUNIOR',event:1000,rows:[{id:'row-one',min:0,max:100,score:80,grade:'PASS',note:''}]}));
      const input={id:table.id,version:table.version,rowId:'row-one',min:0,max:200,score:80,grade:'PASS',note:'checked'},key=randomUUID();
      await expect(executePostgres(db,teacher.token,'sports.conversion.edit',input,randomUUID())).rejects.toMatchObject({status:403});
      await expect(executePostgres(db,admin.token,'sports.conversion.edit',{...input,min:1},randomUUID())).rejects.toMatchObject({status:400});
      const saved=await executePostgres(db,admin.token,'sports.conversion.edit',input,key);expect(await executePostgres(db,admin.token,'sports.conversion.edit',input,key)).toEqual(saved);
      await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.get(table.id)).version).toBe(2);expect((await repo.all('sportsConversionHistory')).filter(h=>h.data.tableId===table.id)).toHaveLength(1);});
    } finally {await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='ai-governor'");}
  });
  it('creates and edits upcoming semesters through administrator rules', async()=>{
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='ai-governor'");
    try {
      const auth=new PostgresAuth(db),admin=await auth.login('ai-governor@example.test','Ai-govern-123'),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123');
      const input={name:'未来测试学期',academicYear:'2098-2099',type:'FIRST',startDate:'2098-09-01',endDate:'2099-01-31'},key=randomUUID();
      await expect(executePostgres(db,teacher.token,'sports.semester.create',input,randomUUID())).rejects.toMatchObject({status:403});
      const saved=await executePostgres(db,admin.token,'sports.semester.create',input,key);expect(await executePostgres(db,admin.token,'sports.semester.create',input,key)).toEqual(saved);
      await expect(executePostgres(db,admin.token,'sports.semester.create',input,randomUUID())).rejects.toMatchObject({status:409});
      await executePostgres(db,admin.token,'sports.semester.update',{...input,id:saved.id,version:1,name:'已核对未来学期'},randomUUID());
      await expect(executePostgres(db,admin.token,'sports.semester.activate',{id:saved.id,version:2},randomUUID())).rejects.toMatchObject({status:400});
      expect((await db.transaction(client=>new PostgresRepository(client).get(saved.id))).data.status).toBe('UPCOMING');
    } finally {await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='ai-governor'");}
  });
  it('publishes fixed templates and preserves one ordered publication per retry', async()=>{
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='ai-governor'");
    try {
      const auth=new PostgresAuth(db),admin=await auth.login('ai-governor@example.test','Ai-govern-123'),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123');
      const input={name:'V8.1 test template'},key=randomUUID();
      await expect(executePostgres(db,teacher.token,'sports.template.publish',input,randomUUID())).rejects.toMatchObject({status:403});
      const first=await executePostgres(db,admin.token,'sports.template.publish',input,key);
      expect(await executePostgres(db,admin.token,'sports.template.publish',input,key)).toEqual(first);
      const second=await executePostgres(db,admin.token,'sports.template.publish',input,randomUUID());
      const rows=(await db.pool.query('SELECT template_id,sequence FROM sports_template_publications WHERE template_id=ANY($1::text[]) ORDER BY sequence',[[first.id,second.id]])).rows;
      expect(rows.map(r=>r.template_id)).toEqual([first.id,second.id]);
      expect((await db.transaction(client=>new PostgresRepository(client).get(first.id))).data).toMatchObject({status:'published',thresholds:[30,45,60],weeklyLimits:[2,3,4],totalTarget:1200,singleCap:60,dailyLimit:1});
    } finally {await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='ai-governor'");}
  });
  it('reads course reports from PostgreSQL with shared credit facts and owner-only CSV export', async()=>{
    const auth=new PostgresAuth(db),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123'),student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const course=await db.transaction(async client=>{
      const repo=new PostgresRepository(client),course=await repo.create('sportsCourse','sports-reader-other',{name:'报表核对',status:'PUBLISHED',relatedTarget:600,otherTarget:600,threshold:30,weeklyLimit:3});
      await repo.create('sportsEnrollment','sports-reader-student',{courseId:course.id,status:'ACTIVE'});
      const clock={...startClock(Date.parse('2026-10-01T08:00:00+08:00')),state:'ENDED',endedAt:Date.parse('2026-10-01T09:00:00+08:00'),activeMilliseconds:3600000};
      const session=await repo.create('sportsSession','sports-reader-student',{courseId:course.id,clock});
      await repo.create('sportsRecord','sports-reader-student',{courseId:course.id,sessionId:session.id,status:'VALID',category:'RELATED',activeMilliseconds:3600000});
      await repo.create('sportsGradePublication','sports-reader-student',{courseId:course.id,score:97,privateNote:'REPORT_MUST_NOT_LEAK'});
      return course;
    });
    const report=await postgresCourseReport(db,teacher.token,course.id);
    expect((await postgresStudentProgress(db,teacher.token,{},course.id)).data).toMatchObject({totalTargetSeconds:72000});
    const teacherProgress=await postgresStudentProgress(db,teacher.token,{classSectionId:course.id});
    expect(teacherProgress.data).toEqual([{enrollmentId:report.rows[0].enrollmentId,courseRelated:{effectiveSeconds:3600},general:{effectiveSeconds:0},totalEffectiveSeconds:3600,status:'IN_PROGRESS'}]);
    expect((await postgresTeacherStudent(db,teacher.token,'sports-reader-student')).data.fullName).toBe('sports-reader-student');
    await expect(postgresTeacherStudent(db,student.token,'sports-reader-student')).rejects.toMatchObject({status:403});
    await expect(postgresTeacherStudent(db,teacher.token,'sports-reader-teacher')).rejects.toMatchObject({status:403});
    expect(report.denominator).toBeNull();
    expect(report.rows).toHaveLength(1);
    expect(report.rows[0]).toMatchObject({studentId:'sports-reader-student',registration:'NO_ROSTER',facts:{total:60,remaining:[540,600],enduranceStatus:'NOT_RECORDED'}});
    expect(report.unresolved).toEqual(expect.arrayContaining([{code:'NO_CONFIRMED_ROSTER',count:1},{code:'ENDURANCE_NOT_RECORDED',count:1}]));
    expect(JSON.stringify(report)).not.toContain('REPORT_MUST_NOT_LEAK');
    await expect(postgresCourseReport(db,student.token,course.id)).rejects.toMatchObject({status:403});
    const foreign=await db.transaction(client=>new PostgresRepository(client).create('sportsCourse','sports-reader-teacher',{}));
    await expect(postgresCourseReport(db,teacher.token,foreign.id)).rejects.toMatchObject({status:403});
    await expect(postgresStudentProgress(db,teacher.token,{},foreign.id)).rejects.toMatchObject({status:404});
    await expect(postgresStudentProgress(db,teacher.token,{classSectionId:foreign.id})).rejects.toMatchObject({status:403});
    const server=createPostgresApiServer(db);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    try {
      const url=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/sports/course-reports/${course.id}.csv`;
      const base=url.split('/api/')[0],teacherHeaders={Cookie:`bnbu_session=${teacher.token}`};
      const reportsUrl=base+'/api/v1/class-sections/'+course.id+'/settlement-reports';
      const draftCourse=await db.transaction(async client=>{
        const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',teacher.account.id,{status:'UPCOMING'});
        return repo.create('sportsCourse',teacher.account.id,{name:'预检草稿',semesterId:semester.id,status:'DRAFT'});
      });
      const previewUrl=base+'/api/v1/class-sections/'+draftCourse.id+'/settlement-check';
      const previewResponse=await fetch(previewUrl,{headers:teacherHeaders});expect(previewResponse.status).toBe(200);
      const preview=(await previewResponse.json()).data;
      expect(preview.canConfirm).toBe(false);expect(preview.checks).toEqual(expect.arrayContaining([expect.objectContaining({code:'PUBLISHED_COURSE_RULE',status:'BLOCKED'}),expect.objectContaining({code:'CONFIRMED_OFFICIAL_ROSTER'})]));
      expect(preview.previewFingerprint).toMatch(/^[a-f0-9]{64}$/);
      await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(draftCourse.id),{name:'预检资料已变化'});});
      expect((await (await fetch(previewUrl,{headers:teacherHeaders})).json()).data.previewFingerprint).not.toBe(preview.previewFingerprint);
      expect((await fetch(previewUrl,{headers:{Cookie:`bnbu_session=${student.token}`}})).status).toBe(403);
      const finalizeUrl=base+'/api/v1/class-sections/'+draftCourse.id+'/settlement-reports';
      const finalize=(fingerprint:string,key=randomUUID())=>fetch(finalizeUrl,{method:'POST',headers:{...teacherHeaders,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({expectedVersion:0,previewFingerprint:fingerprint})});
      expect((await finalize(preview.previewFingerprint)).status).toBe(409);
      const settlementIdentity=await db.transaction(async client=>{
        const repo=new PostgresRepository(client),identity=(await repo.all('sportsIdentity')).find(i=>i.ownerId==='sports-reader-student')!;
        await repo.save(identity,{studentNumber:'finalize-test',schoolEmailVerified:true,schoolEmail:'sports-reader-student@example.test'});
        await repo.save(await repo.get(draftCourse.id),{status:'CLOSED',relatedTarget:600,otherTarget:600,threshold:30,weeklyLimit:2});
        const member=await repo.create('sportsEnrollment','sports-reader-student',{courseId:draftCourse.id,status:'ACTIVE'});
        const snapshot=await repo.create('sportsRosterSnapshot',teacher.account.id,{courseId:draftCourse.id,rows:[{row:2,studentNumber:'finalize-test',name:'sports-reader-student',columnError:false,excluded:false}]});
        await repo.create('sportsRosterBasis',teacher.account.id,{courseId:draftCourse.id,snapshotId:snapshot.id});
        await repo.create('sportsExemption','sports-reader-student',{courseId:draftCourse.id,enrollmentId:member.id,status:'APPROVED'});
        await repo.create('sportsGradePublication','sports-reader-student',{courseId:draftCourse.id,enrollmentId:member.id,score:88,sequence:1});
        return identity;
      });
      const ready=(await (await fetch(previewUrl,{headers:teacherHeaders})).json()).data;expect(ready.checks).toEqual([]);expect(ready.canConfirm).toBe(true);
      const finalKey=randomUUID(),finalResponse=await finalize(ready.previewFingerprint,finalKey);expect(finalResponse.status).toBe(200);
      const finalized=await finalResponse.json();expect(finalized.data).toMatchObject({kind:'INITIAL',version:1});
      expect(await (await finalize(ready.previewFingerprint,finalKey)).json()).toEqual(finalized);
      expect((await finalize(ready.previewFingerprint)).status).toBe(409);
      expect((await db.transaction(client=>new PostgresRepository(client).get(draftCourse.id))).data).toMatchObject({settlementStatus:'SETTLED',settlementReportId:finalized.data.id,enrollmentOpen:false});
      expect((await db.pool.query('SELECT id FROM notifications WHERE entity_id=$1',[finalized.data.id])).rows).toHaveLength(1);
      await db.pool.query('DELETE FROM notifications WHERE entity_id=$1',[finalized.data.id]);
      await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(settlementIdentity.id),settlementIdentity.data);});
      expect((await (await fetch(reportsUrl,{headers:teacherHeaders})).json()).data).toEqual({items:[],nextBeforeVersion:null});
      const reports=await db.transaction(async client=>{
        const repo=new PostgresRepository(client);
        const first=await repo.create('sportsSettlementReport',teacher.account.id,{courseId:course.id,sequence:1,report:{private:'DO_NOT_EXPOSE'}});
        const second=await repo.create('sportsSettlementReport',teacher.account.id,{courseId:course.id,sequence:2,previousId:first.id,correctionReason:'本地更正测试'});
        return [first,second];
      });
      const reportList=await fetch(reportsUrl+'?limit=1',{headers:teacherHeaders});expect(reportList.status).toBe(200);
      const reportListBody=await reportList.json();expect(reportListBody.data).toMatchObject({items:[{id:reports[1].id,version:2,kind:'CORRECTION'}],nextBeforeVersion:2});
      expect(JSON.stringify(reportListBody)).not.toContain('DO_NOT_EXPOSE');
      expect((await (await fetch(reportsUrl+'?beforeVersion=2',{headers:teacherHeaders})).json()).data.items).toEqual([expect.objectContaining({id:reports[0].id,kind:'INITIAL'})]);
      expect((await fetch(reportsUrl,{headers:{Cookie:`bnbu_session=${student.token}`}})).status).toBe(403);
      expect((await fetch(base+'/api/v1/class-sections/'+foreign.id+'/settlement-reports',{headers:teacherHeaders})).status).toBe(403);
      const progressResponse=await fetch(base+'/api/v1/teacher-progress?classSectionId='+course.id,{headers:teacherHeaders});
      expect(progressResponse.status).toBe(200);expect((await progressResponse.json()).data).toEqual(teacherProgress.data);
      expect((await fetch(base+'/api/v1/teacher-progress',{headers:{Cookie:`bnbu_session=${student.token}`}})).status).toBe(403);
      const application=await db.transaction(client=>new PostgresRepository(client).create('sportsApplication','sports-reader-student',{courseId:course.id,applicationType:'EXEMPTION',status:'SUBMITTED',reason:'本地免测读取验收'}));
      const applicationResponse=await fetch(base+'/api/v1/exemption-application-details?classSectionId='+course.id,{headers:teacherHeaders});
      expect(applicationResponse.status).toBe(200);expect((await applicationResponse.json()).data).toEqual([expect.objectContaining({id:application.id,studentId:'sports-reader-student',reason:'本地免测读取验收'})]);
      expect((await fetch(base+'/api/v1/exemption-application-details?classSectionId='+foreign.id,{headers:teacherHeaders})).status).toBe(403);
      const foreignRecord=await db.transaction(client=>new PostgresRepository(client).create('sportsRecord','sports-reader-student',{courseId:foreign.id,status:'VALID'}));
      const recordResponse=await fetch(base+'/api/v1/exercise-records?classSectionId='+course.id,{headers:teacherHeaders});
      expect(recordResponse.status).toBe(200);
      const recordPage=await recordResponse.json();expect(recordPage.data).toHaveLength(1);
      expect(recordPage.data[0]).toMatchObject({studentId:'sports-reader-student',classSectionId:course.id,status:'REVIEWED',actualDurationSeconds:3600});
      expect((await fetch(base+'/api/v1/exercise-records/'+foreignRecord.id,{headers:teacherHeaders})).status).toBe(404);
      expect((await fetch(base+'/api/v1/exercise-records?classSectionId='+foreign.id,{headers:teacherHeaders})).status).toBe(403);
      const response=await fetch(url,{headers:{Cookie:`bnbu_session=${teacher.token}`}});
      expect(response.status).toBe(200);expect(response.headers.get('content-type')).toContain('text/csv');
      expect(await response.text()).toContain('报表核对');
      expect((await fetch(url,{headers:{Cookie:`bnbu_session=${student.token}`}})).status).toBe(403);
    } finally {await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
  });
  it('binds school email challenges to invitations, limits attempts and retries proofs without granting roles', async()=>{
    const invite=await db.transaction(async client=>{const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',null,{status:'CURRENT'}),course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id,status:'PUBLISHED',enrollmentOpen:true});return repo.create('sportsInvitation',course.ownerId,{courseId:course.id,code:'v1.'+randomUUID(),status:'ACTIVE',expiresAt:Date.now()+600000});});
    const input={organizationCode:'BNBU',account:'y123456789@bnbu.edu.cn',channel:'EMAIL',locale:'zh-CN',joinInviteToken:invite.data.code},key=randomUUID();
    const sent=await requestStudentJoinEmail(db,input,key,true);expect(await requestStudentJoinEmail(db,input,key,true)).toEqual(sent);
    await expect(requestStudentJoinEmail(db,input,randomUUID(),true)).rejects.toMatchObject({status:429});
    const mail=(await db.pool.query('SELECT * FROM mail_outbox WHERE recipient=$1',[input.account])).rows;expect(mail).toHaveLength(1);
    const otp=/\d{6}/.exec(mail[0].body)![0],verify={challengeId:sent.challengeId,code:otp,joinEmail:input.account,joinInviteToken:input.joinInviteToken,deviceId:'test-device'},verifyKey=randomUUID();
    await expect(verifyStudentJoinEmail(db,{...verify,code:'wrong'},randomUUID())).rejects.toMatchObject({status:400});
    const proved=await verifyStudentJoinEmail(db,verify,verifyKey);expect(await verifyStudentJoinEmail(db,verify,verifyKey)).toEqual(proved);
    expect(await db.transaction(client=>readStudentJoinEmailProof(client,proved.joinEmailProof,invite.id))).toMatchObject({email:input.account});
    await expect(db.transaction(client=>readStudentJoinEmailProof(client,proved.joinEmailProof+'x',invite.id))).rejects.toMatchObject({status:403});
    await expect(db.transaction(client=>readStudentJoinEmailProof(client,proved.joinEmailProof,randomUUID()))).rejects.toMatchObject({status:403});
    expect((await db.pool.query('SELECT * FROM accounts WHERE email=$1',[input.account])).rows).toHaveLength(0);
    expect((await db.pool.query('SELECT * FROM mail_outbox WHERE recipient=$1',[input.account])).rows).toHaveLength(0);
    expect((await db.pool.query('SELECT code_hash FROM student_email_challenges WHERE id=$1',[sent.challengeId])).rows[0].code_hash).toBeNull();
    const profile={joinEmailProof:proved.joinEmailProof,fullName:'新学生',studentNumber:'2030123456',gender:'MALE',gradeYear:new Date().getFullYear(),collegeName:'FST',majorName:'CST',dateOfBirth:'2005-01-01',regionCode:'CN-44'},issueKey=randomUUID();
    const capability=await issueNewStudentJoin(db,String(invite.data.code),profile,issueKey);
    expect(await issueNewStudentJoin(db,String(invite.data.code),profile,issueKey)).toEqual(capability);
    await expect(issueNewStudentJoin(db,String(invite.data.code),{...profile,studentNumber:'2030123457'},issueKey)).rejects.toMatchObject({status:409});
    await db.pool.query("UPDATE entities SET data=(data::jsonb || '{\"enrollmentOpen\":false}')::text WHERE id=$1",[invite.data.courseId]);
    await expect(consumeNewStudentJoin(db,String(invite.data.code),capability.joinCapability,randomUUID())).rejects.toMatchObject({status:400});
    expect((await db.pool.query('SELECT 1 FROM accounts WHERE email=$1',[input.account])).rows).toHaveLength(0);
    await db.pool.query("UPDATE entities SET data=(data::jsonb || '{\"enrollmentOpen\":true}')::text WHERE id=$1",[invite.data.courseId]);
    const consumeKey=randomUUID(),joined=await consumeNewStudentJoin(db,String(invite.data.code),capability.joinCapability,consumeKey);
    expect(await consumeNewStudentJoin(db,String(invite.data.code),capability.joinCapability,consumeKey)).toEqual(joined);
    expect((await postgresSportsMe(db,joined!.token)).studentProfile).toMatchObject({studentNumber:'2030123456',fullName:'新学生'});
    await expect(consumeNewStudentJoin(db,String(invite.data.code),capability.joinCapability,randomUUID())).rejects.toMatchObject({status:409});
    await new PostgresAuth(db).logout(joined!.token);
    await expect(consumeNewStudentJoin(db,String(invite.data.code),capability.joinCapability,consumeKey)).rejects.toMatchObject({status:401});
    await db.pool.query("UPDATE accounts SET email='joined-fixture@example.test' WHERE email=$1",[input.account]);
    await db.pool.query('UPDATE student_email_challenges SET expires_at=0 WHERE id=$1',[sent.challengeId]);
    await expect(db.transaction(client=>readStudentJoinEmailProof(client,proved.joinEmailProof,invite.id))).rejects.toMatchObject({status:403});
    const locked=await requestStudentJoinEmail(db,{...input,account:'y123456788@bnbu.edu.cn'},randomUUID(),true);
    for(let i=0;i<5;i++)await expect(verifyStudentJoinEmail(db,{...verify,challengeId:locked.challengeId,joinEmail:'y123456788@bnbu.edu.cn',code:'wrong'},randomUUID())).rejects.toMatchObject({status:400});
    expect(Number((await db.pool.query('SELECT attempts FROM student_email_challenges WHERE id=$1',[locked.challengeId])).rows[0].attempts)).toBe(5);
    const course=await db.transaction(client=>new PostgresRepository(client).get(invite.data.courseId));await db.pool.query('DELETE FROM entities WHERE id=$1',[course.data.semesterId]);
  });
  it('reads published template revisions with teacher access and denies students', async()=>{
    const auth=new PostgresAuth(db),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123'),student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const first=await postgresRuleTemplates(db,teacher.token,{limit:1});
    expect('items' in first.data && first.data.items).toHaveLength(1);
    expect(await postgresRuleTemplates(db,teacher.token,{},true)).toEqual({data:{totalTargetMinutes:1200,version:1}});
    await expect(postgresRuleTemplates(db,student.token,{})).rejects.toMatchObject({status:403});
    await expect(postgresRuleTemplates(db,teacher.token,{beforeVersion:'invalid'})).rejects.toMatchObject({status:400});
  });
  it('joins through an owned invitation flow once and blocks a second active enrollment', async()=>{
    const auth=new PostgresAuth(db),student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const invite=await db.transaction(async client=>{const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',null,{status:'CURRENT',name:'入班学期'}),course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id,name:'入班课程',status:'PUBLISHED',enrollmentOpen:true});return repo.create('sportsInvitation',course.ownerId,{courseId:course.id,code:randomUUID(),status:'ACTIVE',expiresAt:Date.now()+300000});});
    const preview=await postgresInvitationPreview(db,String(invite.data.code));expect(preview.data).toMatchObject({courseName:'入班课程',teacherDisplayName:'sports-reader-other',enrollmentOpen:true,inGrace:false});
    expect(JSON.stringify(preview)).not.toContain('sports-reader-student');
    expect((await db.transaction(client=>new PostgresRepository(client).all('sportsEnrollmentFlow'))).filter(f=>f.data.invitationId===invite.id)).toHaveLength(0);
    const flow=await executePostgres(db,student.token,'sports.enrollment.begin',{code:invite.data.code},randomUUID());
    const storedFlow=await db.transaction(client=>new PostgresRepository(client).get(flow.id));expect(storedFlow.data).toMatchObject({courseName:'入班课程',semesterName:'入班学期',status:'OPEN',teacherName:'sports-reader-other'});
    const key=randomUUID(),joined=await executePostgres(db,student.token,'sports.enrollment.join',{flowId:flow.id},key);
    expect(await executePostgres(db,student.token,'sports.enrollment.join',{flowId:flow.id},key)).toEqual(joined);
    expect((await db.transaction(client=>new PostgresRepository(client).get(joined.id))).data).toMatchObject({status:'ACTIVE',source:'INVITE',invitationId:invite.id});
    expect((await db.transaction(client=>new PostgresRepository(client).get(flow.id))).data.status).toBe('COMPLETED');
    await expect(executePostgres(db,student.token,'sports.enrollment.join',{code:invite.data.code},randomUUID())).rejects.toMatchObject({status:409});
    expect((await db.pool.query('SELECT * FROM notifications WHERE entity_id=$1',[joined.id])).rows).toHaveLength(2);
    const expired=await db.transaction(client=>new PostgresRepository(client).save(invite,{expiresAt:Date.now()-1}));
    await expect(postgresInvitationPreview(db,String(invite.data.code))).rejects.toMatchObject({status:410,code:'COURSE_INVITE_EXPIRED'});
    await db.transaction(client=>new PostgresRepository(client).save(expired,{status:'REVOKED'}));
    await expect(postgresInvitationPreview(db,String(invite.data.code))).rejects.toMatchObject({status:410,code:'COURSE_INVITE_REVOKED'});
    await expect(postgresInvitationPreview(db,randomUUID())).rejects.toMatchObject({status:404});
    await db.pool.query('DELETE FROM notifications WHERE entity_id=$1',[joined.id]);
    const course=await db.transaction(client=>new PostgresRepository(client).get(invite.data.courseId));
    await db.pool.query('DELETE FROM entities WHERE id=$1',[course.data.semesterId]);
  });
  it('creates teacher course drafts without inventing rules or opening enrollment', async()=>{
    const auth=new PostgresAuth(db),teacher=await auth.login('sports-reader-other@example.test','Sports-read-123'),student=await auth.login('sports-reader-student@example.test','Sports-read-123');
    const semester=await db.transaction(client=>new PostgresRepository(client).create('sportsSemester',null,{status:'CURRENT',startDate:'2035-01-01',endDate:'2035-07-31'}));
    try {
      const input={name:'Draft course'},key=randomUUID();
      await expect(executePostgres(db,student.token,'sports.course.create',input,randomUUID())).rejects.toMatchObject({status:403});
      const saved=await executePostgres(db,teacher.token,'sports.course.create',input,key);expect(await executePostgres(db,teacher.token,'sports.course.create',input,key)).toEqual(saved);
      const course=await db.transaction(client=>new PostgresRepository(client).get(saved.id));
      expect(course.data).toEqual({name:'Draft course',semesterId:semester.id,status:'DRAFT',settlementStatus:'PENDING',enrollmentOpen:false});
      await expect(executePostgres(db,teacher.token,'sports.invitation.create',{courseId:course.id},randomUUID())).rejects.toMatchObject({status:400});
      const template=await db.transaction(client=>new PostgresRepository(client).create('sportsTemplate',null,{status:'published'}));
      await executePostgres(db,teacher.token,'sports.course.window',{id:course.id,version:course.version,startDate:'2035-01-01',deadlineDate:'2035-05-31',startTime:'08:00',endTime:'22:00',excludedDates:[],checkInAvailable:true},randomUUID());
      const draft=await db.transaction(client=>new PostgresRepository(client).get(course.id));
      const publishInput={id:course.id,expectedCourseVersion:draft.version,expectedVersion:0,publish:true,maximumMinutes:60,dailyLimit:1,globalTargetVersion:1,templateId:template.id,minimumMinutes:30,weeklyLimit:3,courseTarget:600,generalTarget:600,description:'完整课程',regularDeadline:'2035-05-31T23:59:59+08:00',closingDeadline:'2035-06-07T23:59:59+08:00',settlementPlannedAt:'2035-06-08T00:00:00+08:00'};
      await expect(executePostgres(db,teacher.token,'sports.course.configurepublish',{...publishInput,courseTarget:601},randomUUID())).rejects.toMatchObject({status:400});
      expect(await db.transaction(client=>new PostgresRepository(client).get(course.id))).toEqual(draft);
      const impossible=await db.transaction(client=>new PostgresRepository(client).create('sportsCourse',draft.ownerId,{...draft.data,startDate:'2035-05-31'}));
      await expect(executePostgres(db,teacher.token,'sports.course.configurepublish',{...publishInput,id:impossible.id,expectedCourseVersion:impossible.version},randomUUID())).rejects.toMatchObject({status:400});
      expect(await db.transaction(client=>new PostgresRepository(client).get(impossible.id))).toEqual(impossible);
      const publishKey=randomUUID(),publication=await executePostgres(db,teacher.token,'sports.course.configurepublish',publishInput,publishKey);
      expect(await executePostgres(db,teacher.token,'sports.course.configurepublish',publishInput,publishKey)).toEqual(publication);
      const published=await db.transaction(client=>new PostgresRepository(client).get(course.id));
      expect(published.data).toMatchObject({status:'PUBLISHED',enrollmentOpen:true,rulesVersion:1,relatedTarget:600,otherTarget:600});
      const invite=await executePostgres(db,teacher.token,'sports.invitation.create',{courseId:course.id,minutes:5},randomUUID());
      const row=await db.transaction(client=>new PostgresRepository(client).get(invite.id));expect(row.data.status).toBe('ACTIVE');expect(typeof row.data.code).toBe('string');
      await executePostgres(db,teacher.token,'sports.invitation.revoke',{courseId:course.id,code:row.data.code},randomUUID());
      expect((await db.transaction(client=>new PostgresRepository(client).get(invite.id))).data.status).toBe('REVOKED');
      await executePostgres(db,teacher.token,'sports.course.close',{id:course.id,version:published.version,reason:'测试关闭'},randomUUID());
      expect((await db.transaction(client=>new PostgresRepository(client).get(course.id))).data.enrollmentOpen).toBe(false);
      await expect(executePostgres(db,teacher.token,'sports.course.create',{...input,threshold:30},randomUUID())).rejects.toMatchObject({status:400});
    } finally {await db.pool.query('DELETE FROM entities WHERE id=$1',[semester.id]);}
  });
  it('commits deadline markers and notices together, deduplicates concurrent checks and pauses during maintenance', async()=>{
    const course=await db.transaction(async client=>{const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',null,{status:'CURRENT'}),course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id,name:'提醒测试',status:'PUBLISHED',deadlineDate:'2035-01-31',threshold:30,weeklyLimit:3,relatedTarget:600,otherTarget:600});await repo.create('sportsEnrollment','sports-reader-student',{courseId:course.id,status:'ACTIVE'});return course;});
    const due=Date.parse('2035-01-17T00:00:00+08:00');
    const check=(now:number,fail=false)=>db.transaction(async client=>{await client.query('SELECT pg_advisory_xact_lock(18422, 2)');const repo=new PostgresRepository(client);if(fail)repo.notify=async()=>{throw new Error('notification unavailable');};await checkPostgresDeadlineReminders(repo,now,await repo.get(course.id));});
    const notices=async()=>(await db.pool.query('SELECT * FROM notifications WHERE entity_id=$1',[course.id])).rows;
    await check(due-1);expect(await notices()).toHaveLength(0);
    await expect(check(due,true)).rejects.toThrow('notification unavailable');
    expect((await db.transaction(client=>new PostgresRepository(client).all('sportsDeadlineReminder'))).filter(m=>m.data.courseId===course.id)).toHaveLength(0);
    const mode=await db.transaction(client=>new PostgresRepository(client).create('sportsSystem',null,{mode:'MAINTENANCE'}));
    try {await check(due);expect(await notices()).toHaveLength(0);} finally {await db.pool.query('DELETE FROM entities WHERE id=$1',[mode.id]);}
    await Promise.all([check(due+1000),check(due+1000)]);
    expect(await notices()).toHaveLength(2);
    const studentNotice=(await notices()).find(n=>n.recipient_id==='sports-reader-student');expect(studentNotice.body).toContain('课程相关还差600分钟');expect(studentNotice.body).not.toContain('成绩');
    const markers=(await db.transaction(client=>new PostgresRepository(client).all('sportsDeadlineReminder'))).filter(m=>m.data.courseId===course.id);
    expect(markers).toHaveLength(2);expect(markers.every(m=>m.data.sentAt===due+1000)).toBe(true);
    await db.pool.query('DELETE FROM notifications WHERE entity_id=$1',[course.id]);
    await db.pool.query('DELETE FROM entities WHERE id=$1',[course.data.semesterId]);
  });
  it('projects owned workflow aliases and supplement deadlines without exposing internal fields', async()=>{
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const record=await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      const r=await repo.create('sportsRecord','sports-reader-student',{sourceDraftId:'workflow-public',status:'SUPPLEMENT_REQUIRED',supplementStartedAt:Date.now(),supplementWindowMilliseconds:86400000,publicReason:'UNCLEAR_EVIDENCE',privateNote:'secret-review'});
      const batch=await repo.create('sportsMaterialBatch',r.ownerId,{recordId:r.id,sequence:1});
      await repo.create('sportsMaterial',r.ownerId,{recordId:r.id,batchId:batch.id,status:'COMPLETE',mediaId:'workflow-media',objectKey:'private-key'});
      return r;
    });
    const result=await postgresStudentWorkflow(db,login.token,'workflow-public');
    expect(result.data).toMatchObject({recordId:'workflow-public',stage:'AWAITING_SUPPLEMENT',version:record.version,supplement:{paused:false,expired:false},materials:[{mediaId:'workflow-media',materialVersion:1}]});
    expect(JSON.stringify(result)).not.toMatch(/secret-review|private-key/);
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(record.id),{publicReason:{code:'UNCLEAR',zh:'材料不清晰'},publicExplanation:'请提供清晰原图'});});
    const todos=(await postgresProofTodos(db,login.token,{limit:100})).data;
    expect(todos.items.find(t=>t.recordId==='workflow-public')).toMatchObject({reasonCode:'UNCLEAR_EVIDENCE',publicComment:'请提供清晰原图',expired:false});
    expect(todos.nextCursor).toBe(null);
    expect((await postgresStudentRecords(db,login.token,{},'workflow-public')).data).toMatchObject({currentReview:{reasonCode:'UNCLEAR_EVIDENCE',publicComment:'请提供清晰原图'}});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(record.id),{supplementStartedAt:Date.now()-172800000});});
    expect((await postgresStudentWorkflow(db,login.token,record.id)).data.supplement?.expired).toBe(true);
    const foreign=await db.transaction(client=>new PostgresRepository(client).create('sportsRecord','sports-reader-other',{status:'VALID'}));
    await expect(postgresStudentWorkflow(db,login.token,foreign.id)).rejects.toMatchObject({status:404});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);await repo.save(await repo.get(record.id),{status:'TEACHER_PENDING'});});
    expect((await postgresStudentRecords(db,login.token,{},'workflow-public')).data).toMatchObject({workflowStage:'PENDING_TEACHER'});
    expect((await postgresProofTodos(db,login.token,{})).data.items.some(t=>t.recordId==='workflow-public')).toBe(false);
  });
  it('allows supplementary uploads after the original window but rechecks paused and closed review', async()=>{
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const record=await db.transaction(async client=>{
      const repo=new PostgresRepository(client),semester=await repo.create('sportsSemester',null,{status:'DRAFT'});
      const course=await repo.create('sportsCourse','sports-reader-other',{semesterId:semester.id});
      const session=await repo.create('sportsSession','sports-reader-student',{clock:{...startClock(Date.now()-172800000),state:'ENDED',endedAt:Date.now()-90000000,activeMilliseconds:1800000}});
      return repo.create('sportsRecord',session.ownerId,{sessionId:session.id,courseId:course.id,semesterId:semester.id,status:'SUPPLEMENT_REQUIRED',supplementStartedAt:Date.now(),supplementWindowMilliseconds:86400000});
    });
    const bytes=await sharp({create:{width:2,height:2,channels:3,background:'blue'}}).png().toBuffer();
    const input={sessionId:record.data.sessionId,businessPurpose:'EXERCISE_RECORD',mediaType:'IMAGE',mimeType:'image/png',fileSizeBytes:bytes.length,captureSource:'IN_APP_CAMERA',declaredContentSha256:createHash('sha256').update(bytes).digest('hex')};
    const lease=await executePostgres(db,login.token,'sports.media.initiate',input,randomUUID());
    const pause=await db.transaction(client=>new PostgresRepository(client).create('sportsPause',null,{recordId:record.id,status:'CONFIRMED',startAt:Date.now()-1000,endAt:null}));
    await expect(postgresMediaPut(db,login.token,String(lease.mediaId),bytes,'image/png')).rejects.toMatchObject({status:409});
    await db.pool.query('DELETE FROM entities WHERE id=$1',[pause.id]);
    await expect(postgresMediaPut(db,login.token,String(lease.mediaId),bytes,'image/png')).resolves.toBe(input.declaredContentSha256);
    const verified=await postgresMediaRead(db,login.token,String(lease.mediaId));
    await executePostgres(db,login.token,'sports.media.bind',{id:lease.mediaId,sessionId:record.data.sessionId,expectedVersion:verified.version},randomUUID());
    const submit={id:record.id,expectedVersion:record.version,mediaIds:[lease.mediaId]},key=randomUUID();
    await expect(executePostgres(db,login.token,'sports.record.supplement',{...submit,expectedVersion:0},randomUUID())).rejects.toMatchObject({status:409});
    const result=await executePostgres(db,login.token,'sports.record.supplement',submit,key);
    expect(result).toMatchObject({workflowStage:'PENDING_TEACHER',materialVersion:2});
    expect(await executePostgres(db,login.token,'sports.record.supplement',submit,key)).toEqual(result);
    await expect(executePostgres(db,login.token,'sports.record.supplement',{...submit,expectedVersion:result.version},randomUUID())).rejects.toMatchObject({status:409});
    await db.transaction(async client=>{const repo=new PostgresRepository(client);expect((await repo.all('sportsMaterialBatch')).filter(b=>b.data.recordId===record.id)).toHaveLength(1);expect((await repo.all('sportsReviewRound')).filter(r=>r.data.recordId===record.id && r.data.status==='OPEN')).toHaveLength(1);await client.query('DELETE FROM notifications WHERE entity_id=$1',[record.id]);});
    await expect(executePostgres(db,login.token,'sports.media.initiate',input,randomUUID())).rejects.toMatchObject({status:409});
  });
  it('cancels an unfinished sports session while retaining facts and preventing resume', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const session=await db.transaction(client=>new PostgresRepository(client).create('sportsSession','sports-reader-student',{enrollmentId:'cancel-fixture',clock:startClock(Date.now()-2000)}));
    const key=randomUUID(),input={id:session.id,expectedVersion:session.version,reason:'student discarded'};
    const result=await executePostgres(db,login.token,'sports.exercise.cancel',input,key);
    expect(result.status).toBe('CANCELLED');
    expect(await executePostgres(db,login.token,'sports.exercise.cancel',input,key)).toEqual(result);
    const saved=await db.transaction(client=>new PostgresRepository(client).get(session.id));
    expect(saved.data.cancelReason).toBe('student discarded');
    expect(saved.data.clock).toMatchObject({state:'ENDED'});
    await expect(executePostgres(db,login.token,'sports.session.resume',{id:saved.id,version:saved.version},randomUUID())).rejects.toMatchObject({status:409});
    await expect(postgresSportsSession(db,login.token,'active')).rejects.toMatchObject({status:404});
  });
  it('starts a sports session only with active membership and prevents a second live session', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Shanghai'}),ids:string[]=[];
    try {
      const semester=await db.transaction(client=>new PostgresRepository(client).create('sportsSemester',null,{status:'CURRENT'}));ids.push(semester.id);
      const course=await db.transaction(client=>new PostgresRepository(client).create('sportsCourse','sports-reader-other',{semesterId:semester.id,status:'PUBLISHED',startDate:day,deadlineDate:day,startTime:'00:00',endTime:'23:59',threshold:30}));ids.push(course.id);
      await expect(executePostgres(db,login.token,'sports.session.start',{courseId:course.id},randomUUID())).rejects.toMatchObject({status:403});
      const member=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-student',{courseId:course.id,status:'ACTIVE'}));ids.push(member.id);
      const started=await executePostgres(db,login.token,'sports.exercise.start',{enrollmentId:member.id,clientObservedAt:'2000-01-01T00:00:00Z'},randomUUID());ids.push(String(started.id));
      expect(started.status).toBe('IN_PROGRESS');
      expect(started.startedAt).not.toBe('2000-01-01T00:00:00.000Z');
      const session=await db.transaction(client=>new PostgresRepository(client).get(started.id));
      expect(session.data).toMatchObject({enrollmentId:member.id,courseId:course.id,semesterId:semester.id});
      await expect(executePostgres(db,login.token,'sports.session.start',{courseId:course.id},randomUUID())).rejects.toMatchObject({status:409});
      const server=createPostgresApiServer(db);
      await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
      const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      try {
        let version=started.version;
        for(const [action,status] of [['pause','PAUSED'],['resume','IN_PROGRESS'],['finish','COMPLETED']]) {
          const response=await fetch(`${base}/api/v1/exercise-sessions/${started.id}/${action}`,{method:'POST',headers:{Cookie:`bnbu_session=${login.token}`,'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:JSON.stringify({expectedVersion:version,clientObservedAt:'2099-01-01T00:00:00Z'})});
          expect(response.status).toBe(200);
          const body=await response.json();expect(body.data.status).toBe(status);
          expect(body.data.actualDurationSeconds).toBeLessThan(30);
          version=body.data.version;
        }
      } finally {await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
    } finally {await db.pool.query('DELETE FROM entities WHERE id=ANY($1::text[])',[ids]);}
  });
  it('paginates only the current recipients sports notifications', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    const ids=[randomUUID(),randomUUID(),randomUUID(),randomUUID()];
    for(const [index,id] of ids.entries()) await db.pool.query('INSERT INTO notifications(id,recipient_id,entity_id,event,body,created_at) VALUES($1,$2,NULL,$3,$4,$5)',[id,index===2?'sports-reader-other':'sports-reader-student',index===3?'community.published':'sports.record.review','通知',`2026-10-12T00:00:0${index}Z`]);
    const first=await postgresSportsNotifications(db,login.token,{limit:'1'});
    expect(first.data.map(n=>n.id)).toEqual([ids[1]]);
    expect(first.meta.pagination).toMatchObject({hasMore:true,nextCursor:ids[1]});
    const second=await postgresSportsNotifications(db,login.token,{limit:'1',cursor:ids[1]});
    expect(second.data.map(n=>n.id)).toEqual([ids[0]]);
    await expect(postgresSportsNotifications(db,login.token,{cursor:ids[2]})).rejects.toMatchObject({status:409});
    const server=createPostgresApiServer(db);
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const headers={Cookie:`bnbu_session=${login.token}`,'Idempotency-Key':randomUUID()};
      const firstRead=await fetch(`${base}/api/v1/notifications/${ids[1]}/read`,{method:'POST',headers});
      expect(firstRead.status).toBe(200);
      const result=await firstRead.json();
      expect(result.data.readAt).toEqual(expect.any(String));
      expect(await (await fetch(`${base}/api/v1/notifications/${ids[1]}/read`,{method:'POST',headers})).json()).toEqual(result);
      expect((await fetch(`${base}/api/v1/notifications/${ids[2]}/read`,{method:'POST',headers:{...headers,'Idempotency-Key':randomUUID()}})).status).toBe(404);
    } finally {await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
    expect((await postgresSportsNotifications(db,login.token,{unreadOnly:'true'})).data.map(n=>n.id)).toEqual([ids[0]]);
  });
  it('returns the current semester without inventing one and rejects conflicting current semesters', async () => {
    const login=await new PostgresAuth(db).login('sports-reader-student@example.test','Sports-read-123');
    await expect(postgresStudentCourses(db,login.token,'/api/v1/semesters/current',{})).rejects.toMatchObject({status:404});
    const ids:string[]=[];
    try {
      const semester=await db.transaction(client=>new PostgresRepository(client).create('sportsSemester',null,{name:'当前学期',academicYear:'2026-2027',type:'AUTUMN',status:'CURRENT',startDate:'2026-09-01',endDate:'2027-01-31'}));
      ids.push(semester.id);
      expect(await postgresStudentCourses(db,login.token,'/api/v1/semesters/current',{})).toMatchObject({data:{id:semester.id,displayName:'当前学期',academicYear:'2026-2027',termCode:'AUTUMN'}});
      const course=await db.transaction(client=>new PostgresRepository(client).create('sportsCourse','sports-reader-other',{name:'老师资料课程',semesterId:semester.id,status:'PUBLISHED'}));
      ids.push(course.id);
      const enrollment=await db.transaction(client=>new PostgresRepository(client).create('sportsEnrollment','sports-reader-student',{courseId:course.id,status:'ACTIVE'}));
      ids.push(enrollment.id);
      const teacher=await postgresStudentCourses(db,login.token,'/api/v1/teachers/sports-reader-other',{});
      expect(teacher).toEqual({data:{id:'sports-reader-other',fullName:'sports-reader-other',departmentName:''}});
      await expect(postgresStudentCourses(db,login.token,'/api/v1/teachers/sports-reader-teacher',{})).rejects.toMatchObject({status:404});
      await db.transaction(client=>new PostgresRepository(client).save(enrollment,{...enrollment.data,status:'LEFT'}));
      await expect(postgresStudentCourses(db,login.token,'/api/v1/teachers/sports-reader-other',{})).rejects.toMatchObject({status:404});
      const duplicate=await db.transaction(client=>new PostgresRepository(client).create('sportsSemester',null,{status:'CURRENT'}));
      ids.push(duplicate.id);
      await expect(postgresStudentCourses(db,login.token,'/api/v1/semesters/current',{})).rejects.toMatchObject({status:409});
    } finally {await db.pool.query('DELETE FROM entities WHERE id=ANY($1::text[])',[ids]);}
  });
  it('changes an initial administrator password atomically and revokes other sessions', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,login_kind,login_name) VALUES('password-admin','password@example.test',$1,'管理员','now','ADMIN','password-manager')",[hashPassword('Initial-test-123')]);
    const identity=await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','password-admin',{role:'admin',status:'verified',mustChangePassword:true}));
    const auth=new PostgresAuth(db);
    const first=await auth.login('password-manager','Initial-test-123');
    const other=await auth.login('password-manager','Initial-test-123');
    await expect(executePostgres(db,first.token,'preferences.preview',{enabled:false},randomUUID())).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
    const input={version:identity.version,currentPassword:'wrong',newPassword:'Changed-test-123',confirmPassword:'Changed-test-123'};
    await expect(executePostgres(db,first.token,'sports.password.change',input,randomUUID())).rejects.toMatchObject({status:403});
    expect((await auth.authenticate(other.token)).id).toBe('password-admin');
    input.currentPassword='Initial-test-123';
    const key=randomUUID();
    expect(await executePostgres(db,first.token,'sports.password.change',input,key)).toEqual({id:identity.id});
    expect(await executePostgres(db,first.token,'sports.password.change',input,key)).toEqual({id:identity.id});
    await expect(auth.authenticate(other.token)).rejects.toMatchObject({status:401});
    expect((await auth.authenticate(first.token)).id).toBe('password-admin');
    await expect(auth.login('password-manager','Initial-test-123')).rejects.toMatchObject({status:401});
    expect((await auth.login('password-manager','Changed-test-123')).account.id).toBe('password-admin');
    const saved=await db.transaction(client=>new PostgresRepository(client).get(identity.id));
    expect(saved.data.mustChangePassword).toBe(false);
    expect(saved.version).toBe(identity.version+1);
  });
  it('restricts administrator directory to verified superadmins and excludes credentials', async () => {
    const auth=new PostgresAuth(db);
    const login=await auth.login('password-manager','Changed-test-123');
    await expect(postgresAdministratorDirectory(db,login.token)).rejects.toMatchObject({status:403});
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const directory=await postgresAdministratorDirectory(db,login.token);
    expect(directory.items.find(i=>i.id==='password-admin')?.loginName).toBe('password-manager');
    expect(JSON.stringify(directory)).not.toContain('password_hash');
    expect(JSON.stringify(directory)).not.toContain('Changed-test-123');
    expect(directory.permissions).toHaveLength(8);
    const system=await db.transaction(client=>new PostgresRepository(client).create('sportsSystem','password-admin',{mode:'MAINTENANCE'}));
    await expect(postgresAdministratorDirectory(db,login.token)).rejects.toMatchObject({status:503});
    await db.transaction(client=>new PostgresRepository(client).save(system,{mode:'NORMAL'}));
    await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'");
  });
  it('disables only the independent admin account and never revives old sessions', async () => {
    const auth=new PostgresAuth(db);
    const root=(await auth.login('password-manager','Changed-test-123')).token;
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    try {
      await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,login_kind,login_name) VALUES('state-admin','state@example.test',$1,'分管理员','now','ADMIN','state-manager')",[hashPassword('State-test-123')]);
      await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('state-person','state@example.test',$1,'个人','now')",[hashPassword('State-test-123')]);
      const identity=await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','state-admin',{role:'admin',status:'verified',permissions:['ACCOUNTS']}));
      const management=(await auth.login('state-manager','State-test-123')).token;
      const personal=(await auth.login('state@example.test','State-test-123')).token;
      const input={id:identity.id,version:identity.version,status:'DISABLED',confirmed:true,handoverConfirmed:false};
      await expect(executePostgres(db,management,'sports.admins.state',input,randomUUID())).rejects.toMatchObject({status:403});
      await expect(executePostgres(db,root,'sports.admins.state',input,randomUUID())).rejects.toThrow('职责移交');
      expect((await auth.authenticate(management)).id).toBe('state-admin');
      input.handoverConfirmed=true;
      const key=randomUUID();
      await executePostgres(db,root,'sports.admins.state',input,key);
      await executePostgres(db,root,'sports.admins.state',input,key);
      await expect(auth.authenticate(management)).rejects.toMatchObject({status:401});
      await expect(auth.login('state-manager','State-test-123')).rejects.toMatchObject({code:'ACCOUNT_DISABLED'});
      expect((await auth.authenticate(personal)).id).toBe('state-person');
      await expect(executePostgres(db,root,'sports.admins.state',{...input,status:'ACTIVE'},randomUUID())).rejects.toMatchObject({status:409});
      await executePostgres(db,root,'sports.admins.state',{...input,version:identity.version+1,status:'ACTIVE'},randomUUID());
      await expect(auth.authenticate(management)).rejects.toMatchObject({status:401});
      expect((await auth.login('state-manager','State-test-123')).account.id).toBe('state-admin');
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('creates an isolated management login only for a verified person with fixed permissions', async () => {
    const auth=new PostgresAuth(db);
    const root=(await auth.login('password-manager','Changed-test-123')).token;
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const input={personId:'state-person',loginName:' NEW-MANAGER ',name:'新管理员',email:'new-manager@bnbu.edu.cn',department:'测试',permissions:['ACCOUNTS'],initialPassword:'New-manager-123',confirmPassword:'New-manager-123',confirmed:true};
    try {
      await expect(executePostgres(db,root,'sports.admins.create',input,randomUUID())).rejects.toThrow('身份核验');
      await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','state-person',{role:'student',status:'verified'}));
      await expect(executePostgres(db,root,'sports.admins.create',{...input,permissions:['SUPERADMIN']},randomUUID())).rejects.toThrow('固定业务权限');
      await expect(executePostgres(db,root,'sports.admins.create',{...input,email:'bad@example.test'},randomUUID())).rejects.toThrow('学校域名');
      const key=randomUUID();
      const result=await executePostgres(db,root,'sports.admins.create',input,key);
      expect(await executePostgres(db,root,'sports.admins.create',input,key)).toEqual(result);
      const identity=await db.transaction(client=>new PostgresRepository(client).get(result.id));
      expect(identity.ownerId).not.toBe('state-person');
      expect(identity.data.mustChangePassword).toBe(true);
      expect(identity.data.schoolEmailVerified).not.toBe(true);
      const login=await auth.login('new-manager','New-manager-123');
      expect(login.account.roles).toEqual(['admin']);
      await expect(executePostgres(db,login.token,'preferences.preview',{enabled:false},randomUUID())).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
      await expect(executePostgres(db,root,'sports.admins.create',{...input,loginName:'another-manager'},randomUUID())).rejects.toMatchObject({status:409});
      expect((await auth.login('state@example.test','State-test-123')).account.id).toBe('state-person');
      const history=(await db.pool.query("SELECT data FROM entities WHERE kind='sportsAdminHistory' AND data::jsonb->>'administratorId'=$1",[identity.ownerId])).rows;
      expect(history).toHaveLength(1);
      expect(JSON.stringify(history)).not.toContain('New-manager-123');
      await db.pool.query("INSERT INTO mail_outbox VALUES('admin-edit-mail',$1,'test','code','now',NULL)",[input.email]);
      await db.pool.query("INSERT INTO admin_security_challenges(id,account_id,purpose,email,code_hash,expires_at,sent_at,identity_version,mail_id) VALUES('admin-edit-challenge',$1,'EMAIL_VERIFY',$2,'hash',9999999999999,1,1,'admin-edit-mail')",[identity.ownerId,input.email]);
      await db.pool.query("INSERT INTO email_challenges VALUES($1,'personal-proof',9999999999999,0,1)",[input.email]);
      const edit={id:identity.id,version:identity.version,name:'修改后',email:'changed-manager@bnbu.edu.cn',department:'新部门',permissions:['HELP'],confirmed:true};
      await expect(executePostgres(db,root,'sports.admins.edit',{...edit,loginName:'forbidden'},randomUUID())).rejects.toThrow('不允许的字段');
      await expect(executePostgres(db,root,'sports.admins.edit',{...edit,version:0},randomUUID())).rejects.toMatchObject({status:409});
      expect((await db.pool.query("SELECT id FROM admin_security_challenges WHERE id='admin-edit-challenge'")).rows).toHaveLength(1);
      await executePostgres(db,root,'sports.admins.edit',edit,randomUUID());
      const changed=await db.transaction(client=>new PostgresRepository(client).get(identity.id));
      expect(changed.data.permissions).toEqual(['HELP']);
      expect(changed.data.schoolEmailVerified).toBe(false);
      expect((await db.pool.query("SELECT id FROM admin_security_challenges WHERE id='admin-edit-challenge'")).rows).toHaveLength(0);
      expect((await db.pool.query("SELECT id FROM mail_outbox WHERE id='admin-edit-mail'")).rows).toHaveLength(0);
      expect((await db.pool.query('SELECT email FROM email_challenges WHERE email=$1',[input.email])).rows).toHaveLength(1);
      expect((await auth.login('new-manager','New-manager-123')).account.email).toBe(edit.email);
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('verifies only the current management email and consumes its private challenge', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('new-manager','New-manager-123')).token;
    await expect(postgresAdminEmailRequest(db,token,true)).rejects.toMatchObject({code:'PASSWORD_CHANGE_REQUIRED'});
    const account=await auth.authenticate(token);
    const identity=await db.transaction(async client=>(await new PostgresRepository(client).all('sportsIdentity')).find(i=>i.ownerId===account.id)!);
    await executePostgres(db,token,'sports.password.change',{version:identity.version,currentPassword:'New-manager-123',newPassword:'Changed-manager-123',confirmPassword:'Changed-manager-123'},randomUUID());
    expect((await postgresAdminEmailStatus(db,token)).verified).toBe(false);
    const challenge=await postgresAdminEmailRequest(db,token,true);
    await expect(postgresAdminEmailRequest(db,token,true)).rejects.toMatchObject({status:429});
    const row=(await db.pool.query('SELECT * FROM admin_security_challenges WHERE id=$1',[challenge.challengeId])).rows[0];
    const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE id=$1',[row.mail_id])).rows[0].body)![0];
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:challenge.challengeId,code:'wrong'})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
    expect(Number((await db.pool.query('SELECT attempts FROM admin_security_challenges WHERE id=$1',[challenge.challengeId])).rows[0].attempts)).toBe(1);
    expect(await postgresAdminEmailConfirm(db,token,{challengeId:challenge.challengeId,code})).toEqual({verified:true});
    expect((await postgresAdminEmailStatus(db,token)).verified).toBe(true);
    expect((await db.pool.query('SELECT code_hash FROM admin_security_challenges WHERE id=$1',[challenge.challengeId])).rows[0].code_hash).toBeNull();
    expect((await db.pool.query('SELECT id FROM mail_outbox WHERE id=$1',[row.mail_id])).rows).toHaveLength(0);
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:challenge.challengeId,code})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
  });
  it('rejects stale admin challenges and rolls verification back when audit insertion fails', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('new-manager','Changed-manager-123')).token;
    const actor=await auth.authenticate(token);
    const issue=async()=>{
      await db.pool.query('UPDATE admin_security_challenges SET sent_at=0 WHERE account_id=$1',[actor.id]);
      const challenge=await postgresAdminEmailRequest(db,token,true);
      const row=(await db.pool.query('SELECT c.*,m.body FROM admin_security_challenges c JOIN mail_outbox m ON m.id=c.mail_id WHERE c.id=$1',[challenge.challengeId])).rows[0];
      return {id:challenge.challengeId,code:/\d{6}/.exec(row.body)![0],mailId:row.mail_id};
    };
    const stale=await issue();
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client),identity=(await repo.all('sportsIdentity')).find(i=>i.ownerId===actor.id)!;
      await repo.save(identity,{schoolEmailVerified:false});
    });
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:stale.id,code:stale.code})).rejects.toMatchObject({code:'VERSION_CONFLICT'});
    expect((await postgresAdminEmailStatus(db,token)).verified).toBe(false);
    const challenge=await issue();
    await db.pool.query("CREATE FUNCTION reject_email_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='sports.account.email.verify' THEN RAISE EXCEPTION 'injected audit failure'; END IF; RETURN NEW; END; $$");
    await db.pool.query('CREATE TRIGGER reject_email_audit BEFORE INSERT ON audit FOR EACH ROW EXECUTE FUNCTION reject_email_audit()');
    try {
      await expect(postgresAdminEmailConfirm(db,token,{challengeId:challenge.id,code:challenge.code})).rejects.toThrow('injected audit failure');
      expect((await postgresAdminEmailStatus(db,token)).verified).toBe(false);
      const row=(await db.pool.query('SELECT * FROM admin_security_challenges WHERE id=$1',[challenge.id])).rows[0];
      expect(row.consumed_at).toBeNull();
      expect(row.code_hash).toBeTruthy();
      expect(row.attempts).toBe(0);
      expect((await db.pool.query('SELECT id FROM mail_outbox WHERE id=$1',[challenge.mailId])).rows).toHaveLength(1);
    } finally {
      await db.pool.query('DROP TRIGGER reject_email_audit ON audit');
      await db.pool.query('DROP FUNCTION reject_email_audit()');
    }
    expect(await postgresAdminEmailConfirm(db,token,{challengeId:challenge.id,code:challenge.code})).toEqual({verified:true});
    const exhausted=await issue();
    for(let i=0;i<5;i++) await expect(postgresAdminEmailConfirm(db,token,{challengeId:exhausted.id,code:'wrong'})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
    await expect(postgresAdminEmailConfirm(db,token,{challengeId:exhausted.id,code:exhausted.code})).rejects.toMatchObject({code:'INVALID_CHALLENGE'});
  });
  it('closes an independent admin login while retaining history and the personal account', async () => {
    const auth=new PostgresAuth(db),login=await auth.login('new-manager','Changed-manager-123');
    const snapshot=await postgresAdministratorSelf(db,login.token);
    await expect(executePostgres(db,login.token,'sports.account.close',{...snapshot,confirmed:true,handoverConfirmed:false},randomUUID())).rejects.toThrow('职责移交');
    await expect(executePostgres(db,login.token,'sports.account.close',{...snapshot,email:'stale@bnbu.edu.cn',confirmed:true,handoverConfirmed:true},randomUUID())).rejects.toMatchObject({status:409});
    const id=login.account.id;
    await executePostgres(db,login.token,'sports.account.close',{...snapshot,confirmed:true,handoverConfirmed:true},randomUUID());
    await expect(auth.authenticate(login.token)).rejects.toMatchObject({status:401});
    await expect(auth.login('new-manager','Changed-manager-123')).rejects.toMatchObject({status:401});
    const row=(await db.pool.query('SELECT * FROM accounts WHERE id=$1',[id])).rows[0];
    expect(row.login_kind).toBe('HISTORY');
    expect([row.name,row.email,row.login_name,row.password_hash,row.organization]).toEqual([null,null,null,null,null]);
    expect((await db.pool.query('SELECT id FROM admin_security_challenges WHERE account_id=$1',[id])).rows).toHaveLength(0);
    const history=(await db.pool.query("SELECT data FROM entities WHERE kind='sportsAdminHistory' AND data::jsonb->>'administratorId'=$1",[id])).rows;
    expect(history.length).toBeGreaterThan(1);
    expect(JSON.stringify(history)).not.toContain('changed-manager@bnbu.edu.cn');
    expect((await auth.login('state@example.test','State-test-123')).account.id).toBe('state-person');
    expect((await db.pool.query("SELECT email FROM email_challenges WHERE email='new-manager@bnbu.edu.cn'")).rows).toHaveLength(1);
  });
  it('rolls administrator deletion back on audit failure and supports authorized retries', async () => {
    const auth=new PostgresAuth(db),root=(await auth.login('password-manager','Changed-test-123')).token;
    const target=await auth.login('state-manager','State-test-123');
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const identity=await db.transaction(async client=>(await new PostgresRepository(client).all('sportsIdentity')).find(i=>i.ownerId===target.account.id)!);
    const input={accountId:target.account.id,version:identity.version,confirmed:true,handoverConfirmed:true};
    await db.pool.query("CREATE FUNCTION reject_delete_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='sports.admins.delete' THEN RAISE EXCEPTION 'injected deletion audit failure'; END IF; RETURN NEW; END; $$");
    await db.pool.query('CREATE TRIGGER reject_delete_audit BEFORE INSERT ON audit FOR EACH ROW EXECUTE FUNCTION reject_delete_audit()');
    try {
      await expect(executePostgres(db,root,'sports.admins.delete',input,randomUUID())).rejects.toThrow('injected deletion audit failure');
      expect((await auth.authenticate(target.token)).id).toBe(target.account.id);
      expect((await db.pool.query('SELECT login_kind FROM accounts WHERE id=$1',[target.account.id])).rows[0].login_kind).toBe('ADMIN');
    } finally {
      await db.pool.query('DROP TRIGGER reject_delete_audit ON audit');
      await db.pool.query('DROP FUNCTION reject_delete_audit()');
    }
    try {
      const key=randomUUID();
      const result=await executePostgres(db,root,'sports.admins.delete',input,key);
      expect(await executePostgres(db,root,'sports.admins.delete',input,key)).toEqual(result);
      await expect(auth.authenticate(target.token)).rejects.toMatchObject({status:401});
      expect((await auth.login('state@example.test','State-test-123')).account.id).toBe('state-person');
      await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'");
      await expect(executePostgres(db,root,'sports.admins.delete',input,key)).rejects.toMatchObject({status:403});
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('stores image bytes outside PostgreSQL and rolls the entity back on object write failure', async () => {
    const root=mkdtempSync(join(tmpdir(),'bnbu-pg-objects-'));
    const previous=process.env.BNBU_OBJECT_DIRECTORY;
    process.env.BNBU_OBJECT_DIRECTORY=root;
    try {
      const image='data:image/png;base64,'+Buffer.from([137,80,78,71,1,2,3]).toString('base64');
      const post=await db.transaction(client=>new PostgresRepository(client).create('post','state-person',{title:'私有待审图片',body:'test',board:'test',images:[image],status:'pending'}));
      const raw=(await db.pool.query('SELECT data FROM entities WHERE id=$1',[post.id])).rows[0].data;
      expect(raw).not.toContain('data:image');
      expect(raw).toContain('$bnbuStoredImage');
      expect((await db.transaction(client=>new PostgresRepository(client).get(post.id))).data.images).toEqual([image]);
      const auth=new PostgresAuth(db),own=(await auth.login('state@example.test','State-test-123')).token;
      const other=(await auth.login('password-manager','Changed-test-123')).token;
      expect(JSON.stringify(await postgresCommunityView(db,other))).not.toContain(image);
      expect(JSON.stringify(await postgresCommunityView(db,own))).toContain(image);
      await expect(db.transaction(client=>new PostgresRepository(client).create('post','state-person',{images:[{$bnbuStoredImage:'f'.repeat(64),contentType:'image/png'}]}))).rejects.toThrow('内部存储标识');
      const before=Number((await db.pool.query('SELECT count(*) FROM entities')).rows[0].count);
      process.env.BNBU_OBJECT_DIRECTORY=join(root,JSON.parse(raw).images[0].$bnbuStoredImage);
      await expect(db.transaction(client=>new PostgresRepository(client).create('post','state-person',{images:[image]}))).rejects.toThrow();
      expect(Number((await db.pool.query('SELECT count(*) FROM entities')).rows[0].count)).toBe(before);
      await db.pool.query('DELETE FROM entities WHERE id=$1',[post.id]);
    } finally {
      if(previous===undefined) delete process.env.BNBU_OBJECT_DIRECTORY; else process.env.BNBU_OBJECT_DIRECTORY=previous;
      rmSync(root,{recursive:true,force:true});
    }
  });
  it('projects the student account directory without leaking login credentials', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('password-manager','Changed-test-123')).token;
    await expect(postgresAccountDirectory(db,token,'student',{})).rejects.toMatchObject({status:403});
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    try {
      const data=await postgresAccountDirectory(db,token,'student',{id:'state-person'});
      expect(data.items).toHaveLength(1);
      expect(data.items[0].status).toBe('PENDING');
      expect(data.items[0].verifiedEmail).toBeNull();
      expect(JSON.stringify(data)).not.toContain('password_hash');
      expect(JSON.stringify(data)).not.toContain('state@example.test');
      await expect(postgresAccountDirectory(db,token,'student',{status:'DISABLED'})).rejects.toThrow('筛选状态');
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('keeps a multi-activity split atomic when a later activity is invalid', async () => {
    const auth=new PostgresAuth(db),token=(await auth.login('password-manager','Changed-test-123')).token;
    await db.pool.query("UPDATE accounts SET roles='[\"superadmin\"]' WHERE id='password-admin'");
    const command=(action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    try {
      const mail=await command('mail.import',{messageId:'pg-split-atomic',subject:'两场活动',sender:'school@example.test',body:'活动名称：上午讲座\n活动名称：下午比赛'});
      const fields={title:'上午讲座',description:'介绍',startAt:'2027-01-01T10:00:00+08:00',endAt:'2027-01-01T11:00:00+08:00',location:'图书馆',host:'学院',conditions:''};
      const input={id:mail.id,expectedVersion:1,confirmed:true,reason:'核对两场',activities:[fields,{...fields,title:'下午比赛',location:''}]};
      const before=Number((await db.pool.query("SELECT count(*) FROM entities WHERE kind IN ('activity','mail')")).rows[0].count);
      await expect(command('mail.split',input)).rejects.toThrow();
      expect(Number((await db.pool.query("SELECT count(*) FROM entities WHERE kind IN ('activity','mail')")).rows[0].count)).toBe(before);
      input.activities[1].location='体育馆';
      await command('mail.split',input);
      const parent=await db.transaction(client=>new PostgresRepository(client).get(mail.id));
      expect(parent.data.childMailIds).toHaveLength(2);
      expect(Number((await db.pool.query("SELECT count(*) FROM entities WHERE kind='activity' AND data::jsonb->>'mailId'=ANY($1)",[parent.data.childMailIds])).rows[0].count)).toBe(2);
    } finally { await db.pool.query("UPDATE accounts SET roles='[]' WHERE id='password-admin'"); }
  });
  it('persists timetable corrections only for the owner and deduplicates retries', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('table-owner','table@example.test',$1,'课表学生','now','[\"student\"]')",[hashPassword('Table-test-123')]);
    const auth=new PostgresAuth(db),token=(await auth.login('table@example.test','Table-test-123')).token;
    const other=(await auth.login('state@example.test','State-test-123')).token;
    const input={fileName:'table.png',lessons:[{name:'数据库',weekday:1}]};
    const key=randomUUID();
    const result=await executePostgres(db,token,'timetable.save',input,key);
    expect(await executePostgres(db,token,'timetable.save',input,key)).toEqual(result);
    const original=await db.transaction(client=>new PostgresRepository(client).get(result.id));
    expect(original.version).toBe(1);
    expect((await postgresWorkspace(db,other)).entities.some(e=>e.id===result.id)).toBe(false);
    const lesson=(original.data.lessons as {id:string;name:string}[])[0];
    await executePostgres(db,token,'timetable.correct',{lessonId:lesson.id,name:'数据库实践',weekday:2},randomUUID());
    const corrected=await db.transaction(client=>new PostgresRepository(client).get(result.id));
    expect((corrected.data.lessons as {name:string}[])[0].name).toBe('数据库实践');
    expect(corrected.version).toBe(2);
    await expect(executePostgres(db,token,'timetable.save',{fileName:'bad.png',lessons:[{name:'错误',weekday:9}]},randomUUID())).rejects.toThrow();
    expect((await db.transaction(client=>new PostgresRepository(client).get(result.id))).version).toBe(2);
  });
  it('serializes concurrent migrations and rejects changed migration contents', async () => {
    await Promise.all([db.migrate(postgresMigrations), db.migrate(postgresMigrations)]);
    expect((await db.pool.query('SELECT * FROM backend_migrations')).rows).toHaveLength(postgresMigrations.length);
    await expect(db.migrate([{version:1,sql:'SELECT 1'}])).rejects.toThrow('checksum mismatch');
  });
  it('rolls back all changes on the same connection and releases it afterwards', async () => {
    await expect(db.transaction(async client => {
      await client.query("INSERT INTO mail_outbox VALUES('rollback','test','subject','body','now',NULL)");
      throw new Error('business failure');
    })).rejects.toThrow('business failure');
    expect((await db.pool.query("SELECT * FROM mail_outbox WHERE id='rollback'")).rows).toHaveLength(0);
    await db.transaction(async client => { await client.query("INSERT INTO mail_outbox VALUES('commit','test','subject','body','now',NULL)"); });
    expect((await db.pool.query("SELECT * FROM mail_outbox WHERE id='commit'")).rows).toHaveLength(1);
  });
  it('preserves separate namespaces, foreign keys and millisecond expiry values', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('student','same@example.test','hash','student','now')");
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,login_kind,login_name) VALUES('admin','same@example.test','hash','admin','now','ADMIN','manager')");
    await expect(db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at) VALUES('duplicate','same@example.test','hash','student','now')")).rejects.toMatchObject({code:'23505'});
    await expect(db.pool.query("INSERT INTO sessions VALUES('bad','missing',1791800000000,'now')")).rejects.toMatchObject({code:'23503'});
    await db.pool.query("INSERT INTO sessions VALUES('ok','student',1791800000000,'now')");
    expect((await db.pool.query("SELECT expires_at FROM sessions WHERE token_hash='ok'")).rows[0].expires_at).toBe('1791800000000');
  });
  it('prevents historical identities regaining login even with otherwise valid fields', async () => {
    await db.pool.query("INSERT INTO accounts(id,organization,status,roles,created_at,login_kind) VALUES('history',NULL,'banned','[]','now','HISTORY')");
    await expect(db.pool.query("UPDATE accounts SET login_kind='PERSONAL',email='revive@example.test',password_hash='hash',name='revive' WHERE id='history'")).rejects.toMatchObject({code:'23514'});
  });
  it('persists business entities, deduplicates relations and keeps notifications in the transaction', async () => {
    const entity = await db.transaction(async client => {
      const repo = new PostgresRepository(client);
      const created = await repo.create('post', null, {title:'真实 PostgreSQL 数据'});
      return repo.save(created, {status:'visible'});
    });
    await db.transaction(async client => {
      const repo = new PostgresRepository(client);
      expect((await repo.get(entity.id,'post')).data.status).toBe('visible');
      await repo.relation('student',entity.id,'saved',true);
      await repo.relation('student',entity.id,'saved',true);
      expect(await repo.related('student',entity.id,'saved')).toBe(true);
      await repo.notify(['student','student'],entity.id,'post.visible','已公开');
    });
    expect((await db.pool.query('SELECT * FROM notifications WHERE entity_id=$1',[entity.id])).rows).toHaveLength(1);
    await expect(db.transaction(async client => {
      const repo = new PostgresRepository(client);
      await repo.save(entity,{status:'hidden'});
      await repo.notify(['missing'],entity.id,'post.hidden','不应保存');
    })).rejects.toMatchObject({code:'23503'});
    await db.transaction(async client => {
      const repo = new PostgresRepository(client);
      expect((await repo.get(entity.id)).data.status).toBe('visible');
      await repo.relation('student',entity.id,'saved',false);
      expect(await repo.related('student',entity.id,'saved')).toBe(false);
      expect((await repo.people()).some(p=>p.id==='history')).toBe(false);
      expect((await repo.person('history')).name).toBe('已注销用户');
    });
  });
  it('rejects stale concurrent edits instead of overwriting committed business data', async () => {
    const original = await db.transaction(client=>new PostgresRepository(client).create('post',null,{title:'original'}));
    const results = await Promise.allSettled(['first','second'].map(title => db.transaction(client => new PostgresRepository(client).save(original,{title}))));
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const failure = results.find(r=>r.status==='rejected');
    expect(failure?.status==='rejected' && failure.reason.status).toBe(409);
    const saved = await db.transaction(client=>new PostgresRepository(client).get(original.id));
    expect(saved.version).toBe(2);
  });
  it('imports a read-only SQLite snapshot atomically and refuses to overwrite a populated target', async () => {
    const importSchema = `${schema}_import`;
    await admin.query(`CREATE SCHEMA ${importSchema}`);
    const target = new PostgresDatabase({connectionString:process.env.BNBU_TEST_POSTGRES_URL,options:`-c search_path=${importSchema}`});
    const directory = mkdtempSync(join(tmpdir(),'bnbu-import-'));
    const filename = join(directory,'source.sqlite');
    try {
      await target.migrate(postgresMigrations);
      const source = openDatabase(filename);
      let accountId: string;
      try {
        accountId = createAccount(source,{email:'import@example.test',name:'导入账号',password:'Test-import-123',roles:['student']});
        source.prepare('INSERT INTO sports_media_blobs VALUES(?,?,?)').run('blob-test',Buffer.from([0,1,255]),'now');
        // Force a failure after accounts have been inserted; the whole import must roll back.
        source.exec('ALTER TABLE entities ADD COLUMN unexpected_column TEXT');
      } finally { source.close(); }
      await expect(importSqlite(filename,target)).rejects.toThrow('schema does not match');
      expect((await target.pool.query('SELECT * FROM accounts')).rows).toHaveLength(0);
      const fix = openDatabase(filename);
      try { fix.exec('ALTER TABLE entities DROP COLUMN unexpected_column'); } finally { fix.close(); }
      const counts = await importSqlite(filename,target);
      expect(counts.accounts).toBe(1);
      expect(counts.entities).toBeGreaterThan(0);
      expect((await target.pool.query('SELECT id FROM accounts')).rows[0].id).toBe(accountId!);
      expect((await target.pool.query("SELECT bytes FROM sports_media_blobs WHERE sha256='blob-test'")).rows[0].bytes).toEqual(Buffer.from([0,1,255]));
      await expect(importSqlite(filename,target)).rejects.toThrow('not empty');
      expect((await target.pool.query('SELECT * FROM accounts')).rows).toHaveLength(1);
    } finally {
      await target.close();
      await admin.query(`DROP SCHEMA ${importSchema} CASCADE`);
      rmSync(directory,{recursive:true,force:true});
    }
  });
  it('authenticates both account namespaces, hashes sessions and rejects disabled administrators', async () => {
    const auth = new PostgresAuth(db);
    const password = 'Postgres-test-123';
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('login-student','login@example.test',$1,'学生','now','[\"student\"]')",[hashPassword(password)]);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles,login_kind,login_name) VALUES('login-admin','login@example.test',$1,'管理员','now','[\"reviewer\"]','ADMIN','login-manager')",[hashPassword(password)]);
    await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','login-admin',{role:'admin',status:'verified'}));
    const student = await auth.login(' LOGIN@example.test ',password);
    expect(student.account.id).toBe('login-student');
    expect(student.account).not.toHaveProperty('password_hash');
    expect((await auth.authenticate(student.token)).roles).toEqual(['student']);
    const session = (await db.pool.query('SELECT token_hash FROM sessions WHERE account_id=$1',['login-student'])).rows[0];
    expect(session.token_hash).toBe(digest(student.token));
    await auth.logout(student.token);
    await expect(auth.authenticate(student.token)).rejects.toMatchObject({status:401});
    const manager = await auth.login('login-manager',password);
    expect(manager.account.id).toBe('login-admin');
    await db.pool.query("UPDATE accounts SET status='banned' WHERE id='login-admin'");
    await expect(auth.authenticate(manager.token)).rejects.toMatchObject({status:403});
    await expect(auth.login('login-manager',password)).rejects.toMatchObject({status:403});
    const expired = await auth.login('login@example.test',password);
    await db.pool.query('UPDATE sessions SET expires_at=0 WHERE token_hash=$1',[digest(expired.token)]);
    await expect(auth.authenticate(expired.token)).rejects.toMatchObject({status:401});
  });
  it('persists failed attempts across auth instances and never creates a session on failure', async () => {
    const auth = new PostgresAuth(db);
    for (let i=0;i<10;i++) await expect(auth.login('missing@example.test','wrong-password')).rejects.toMatchObject({status:401});
    await expect(new PostgresAuth(db).login('missing@example.test','wrong-password')).rejects.toMatchObject({status:429});
    expect((await db.pool.query('SELECT failures FROM login_attempts WHERE identifier=$1',['missing@example.test'])).rows[0].failures).toBe(10);
  });
  it('serializes email sending and registration, consumes a code once and never grants school roles', async () => {
    const mail = new PostgresEmail(db);
    const email = 'registration@bnbu.edu.cn';
    const sends = await Promise.allSettled([mail.sendVerification(email,true),mail.sendVerification(email,true)]);
    expect(sends.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const messages = (await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows;
    expect(messages).toHaveLength(1);
    const code = /\d{6}/.exec(messages[0].body)![0];
    const attempts = await Promise.allSettled([mail.register({email,code,password:'Register-test-123'}),mail.register({email,code,password:'Register-test-123'})]);
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const accounts = (await db.pool.query('SELECT id,roles FROM accounts WHERE email=$1',[email])).rows;
    expect(accounts).toHaveLength(1);
    expect(accounts[0].roles).toBe('[]');
    expect((await db.pool.query("SELECT * FROM entities WHERE kind='verifiedEmail' AND owner_id=$1",[accounts[0].id])).rows).toHaveLength(1);
    await expect(mail.register({email,code,password:'Register-test-123'})).rejects.toThrow('验证码已失效');
  });
  it('commits wrong-code attempts, enforces the limit and verifies only the current account email', async () => {
    const mail = new PostgresEmail(db);
    const email = 'wrong-code@example.test';
    await mail.sendVerification(email,true);
    const code = /\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
    for(let i=0;i<5;i++) await expect(mail.register({email,code:'invalid',password:'Register-test-123'})).rejects.toThrow('验证码错误');
    await expect(mail.register({email,code,password:'Register-test-123'})).rejects.toThrow('验证码已失效');
    expect((await db.pool.query('SELECT attempts FROM email_challenges WHERE email=$1',[email])).rows[0].attempts).toBe(5);
    const actor = await db.transaction(client=>new PostgresRepository(client).person('login-student'));
    await mail.sendVerification(actor.email,true);
    const ownCode = /\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1 ORDER BY created_at DESC',[actor.email])).rows[0].body)![0];
    await expect(mail.verifyOwnEmail({...actor,status:'banned'},ownCode)).rejects.toMatchObject({status:403});
    expect(await mail.verifyOwnEmail(actor,ownCode)).toEqual({verified:true});
    await expect(mail.verifyOwnEmail(actor,ownCode)).rejects.toThrow('验证码已失效');
  });
  it('serves real HTTP registration, cookies, session restoration and logout using PostgreSQL', async () => {
    const server = createPostgresApiServer(db,{localOutbox:true});
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const post = (path:string,data:unknown,cookie?:string,origin?:string)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},body:JSON.stringify(data)});
    try {
      expect((await (await fetch(base+'/api/health')).json()).storage).toBe('postgresql');
      expect((await fetch(base+'/api/auth/me')).status).toBe(401);
      const email='http-postgres@example.test',password='Http-postgres-123';
      expect((await post('/api/auth/verification-codes',{email},undefined,'https://untrusted.example')).status).toBe(403);
      expect((await post('/api/auth/verification-codes',{email})).status).toBe(200);
      const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
      expect((await post('/api/auth/register',{email,password,code})).status).toBe(201);
      const login=await post('/api/auth/sign-in',{identifier:email,password});
      expect(login.status).toBe(200);
      expect(login.headers.get('set-cookie')).toContain('HttpOnly; SameSite=Strict');
      const cookie=login.headers.get('set-cookie')!.split(';')[0];
      const me=await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}});
      expect((await me.json()).account.email).toBe(email);
      expect((await post('/api/auth/logout',{},cookie)).status).toBe(200);
      expect((await fetch(base+'/api/auth/me',{headers:{Cookie:cookie}})).status).toBe(401);
    } finally {
      await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
    }
  });
  it('executes shared community policy over HTTP with atomic audit, notification and retry receipts', async () => {
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('pg-reviewer','review-pg@example.test',$1,'审核员','now','[\"reviewer\"]')",[hashPassword('Review-postgres-123')]);
    const auth = new PostgresAuth(db);
    const student = await auth.login('login@example.test','Postgres-test-123');
    const reviewer = await auth.login('review-pg@example.test','Review-postgres-123');
    const viewer = await auth.login('http-postgres@example.test','Http-postgres-123');
    const server=createPostgresApiServer(db);
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const command=(token:string,action:string,input:unknown,requestId=randomUUID())=>fetch(base+'/api/commands',{method:'POST',headers:{'Content-Type':'application/json',Cookie:`bnbu_session=${token}`},body:JSON.stringify({action,input,requestId})});
    const community=(token:string)=>fetch(base+'/api/community',{headers:{Cookie:`bnbu_session=${token}`}}).then(r=>r.json());
    try {
      const requestId=randomUUID();
      const attempts=await Promise.all([command(student.token,'post.create',{title:'PG 帖子',body:'正文',board:'校园'},requestId),command(student.token,'post.create',{title:'PG 帖子',body:'正文',board:'校园'},requestId)]);
      expect(attempts.map(r=>r.status)).toEqual([200,200]);
      const responses=await Promise.all(attempts.map(r=>r.json()));
      expect(responses[0]).toEqual(responses[1]);
      const id=responses[0].data.id;
      expect((await community(student.token)).posts.some((p:{id:string})=>p.id===id)).toBe(true);
      expect((await community(viewer.token)).posts.some((p:{id:string})=>p.id===id)).toBe(false);
      expect((await db.pool.query('SELECT * FROM audit WHERE entity_id=$1',[id])).rows).toHaveLength(1);
      expect((await command(student.token,'content.review',{id,status:'visible'})).status).toBe(403);
      expect((await command(reviewer.token,'content.review',{id,status:'visible'})).status).toBe(200);
      const studentWorkspace=await postgresWorkspace(db,student.token);
      expect(studentWorkspace.notifications.some(n=>n.entityId===id)).toBe(true);
      expect((await postgresWorkspace(db,viewer.token)).notifications.some(n=>n.entityId===id)).toBe(false);
      expect((await community(viewer.token)).posts.some((p:{id:string})=>p.id===id)).toBe(true);
      expect((await command(student.token,'relation.set',{id,kind:'like',enabled:true})).status).toBe(200);
      expect((await command(student.token,'relation.set',{id,kind:'save',enabled:true})).status).toBe(200);
      const ownView=await community(student.token);
      expect(ownView.likedPosts).toContain(id);
      expect(ownView.savedPosts).toContain(id);
      expect(ownView.posts.find((p:{id:string})=>p.id===id).likes).toBe(1);
      const otherView=await community(viewer.token);
      expect(otherView.likedPosts).not.toContain(id);
      expect(otherView.savedPosts).not.toContain(id);
      expect((await db.pool.query('SELECT * FROM notifications WHERE entity_id=$1',[id])).rows).toHaveLength(1);
      expect((await command(reviewer.token,'content.review',{id,status:'hidden'})).status).toBe(400);
      expect((await db.transaction(client=>new PostgresRepository(client).get(id))).data.status).toBe('visible');
      expect((await db.pool.query('SELECT * FROM audit WHERE entity_id=$1',[id])).rows).toHaveLength(4);
      expect((await command(student.token,'post.create',{title:'不同操作',body:'正文',board:'校园'},requestId)).status).toBe(409);
    } finally { await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve())); }
  });
  it('preserves coffee capacity under concurrent booking, reserves both times until acceptance and releases cancellation', async () => {
    const auth = new PostgresAuth(db);
    const tokens: Record<string,string> = {};
    for(const [id,role] of [['coffee-teacher','teacher'],['coffee-a','student'],['coffee-b','student']]) {
      await db.pool.query('INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES($1,$2,$3,$1,$4,$5)',[id,`${id}@example.test`,hashPassword('Coffee-test-123'),new Date().toISOString(),JSON.stringify([role])]);
      tokens[id]=(await auth.login(`${id}@example.test`,'Coffee-test-123')).token;
    }
    const command=(who:string,action:string,input:Record<string,unknown>)=>executePostgres(db,tokens[who],action,input,randomUUID());
    const start=Date.now()+86400_000;
    const first=await command('coffee-teacher','coffee.slot.create',{startAt:new Date(start).toISOString(),endAt:new Date(start+3600_000).toISOString(),capacity:1,location:'图书馆'});
    const second=await command('coffee-teacher','coffee.slot.create',{startAt:new Date(start+7200_000).toISOString(),endAt:new Date(start+10800_000).toISOString(),capacity:1,location:'图书馆'});
    const races=await Promise.allSettled(['coffee-a','coffee-b'].map(who=>command(who,'coffee.book',{slotId:first.id,topic:'学习交流'})));
    expect(races.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const winnerIndex=races.findIndex(r=>r.status==='fulfilled');
    const winner=['coffee-a','coffee-b'][winnerIndex],loser=['coffee-a','coffee-b'][1-winnerIndex];
    const result=races[winnerIndex];
    if(result.status!=='fulfilled') throw new Error('Expected confirmed booking');
    const bookingId=result.value.id;
    await command('coffee-teacher','coffee.move',{id:bookingId,slotId:second.id,reason:'老师改期'});
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      expect((await repo.get(bookingId)).data.slotId).toBe(first.id);
      expect(await runAsync(occupiedPolicy(repo,first.id))).toBe(1);
      expect(await runAsync(occupiedPolicy(repo,second.id))).toBe(1);
    });
    await expect(command(loser,'coffee.book',{slotId:second.id,topic:'不能占用预留'})).rejects.toMatchObject({status:409});
    await command(winner,'coffee.answer',{id:bookingId,accept:true});
    await db.transaction(async client=>{
      const repo=new PostgresRepository(client);
      expect((await repo.get(bookingId)).data.slotId).toBe(second.id);
      expect(await runAsync(occupiedPolicy(repo,first.id))).toBe(0);
    });
    await command(winner,'coffee.cancel',{id:bookingId,reason:'取消测试'});
    expect(await command(loser,'coffee.book',{slotId:second.id,topic:'名额已释放'})).toHaveProperty('id');
    const teacherView=await postgresWorkspace(db,tokens['coffee-teacher']);
    const studentView=await postgresWorkspace(db,tokens[winner]);
    const unrelatedView=await postgresWorkspace(db,(await auth.login('review-pg@example.test','Review-postgres-123')).token);
    expect(teacherView.entities.find(e=>e.id===bookingId)?.data.status).toBe('cancelled');
    expect(studentView.entities.find(e=>e.id===bookingId)?.data.history).toHaveLength(4);
    expect(unrelatedView.entities.some(e=>e.id===bookingId)).toBe(false);
    expect(unrelatedView.notifications.some(n=>n.entityId===bookingId)).toBe(false);
  });
  it('deduplicates broadcasts and atomically enforces notification ownership for batch reads', async () => {
    const auth=new PostgresAuth(db);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('notify-operator','notify@example.test',$1,'运营','now','[\"operator\"]')",[hashPassword('Notify-test-123')]);
    const operator=(await auth.login('notify@example.test','Notify-test-123')).token;
    const a=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const b=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const request=randomUUID(),input={recipients:['coffee-a','coffee-b','coffee-a'],body:'群发通知'};
    const first=await executePostgres(db,operator,'notification.send',input,request);
    expect(first.recipients).toBe(2);
    expect(await executePostgres(db,operator,'notification.send',input,request)).toEqual(first);
    const notices=(await db.pool.query('SELECT id,recipient_id FROM notifications WHERE entity_id=$1',[first.id])).rows;
    expect(notices).toHaveLength(2);
    const own=notices.find(n=>n.recipient_id==='coffee-a').id,other=notices.find(n=>n.recipient_id==='coffee-b').id;
    await expect(executePostgres(db,a,'notification.readmany',{ids:[own,other]},randomUUID())).rejects.toMatchObject({status:404});
    expect((await db.pool.query('SELECT read_at FROM notifications WHERE id=$1',[own])).rows[0].read_at).toBeNull();
    await executePostgres(db,a,'notification.readmany',{ids:[own,own]},randomUUID());
    const batch=(await postgresWorkspace(db,operator)).notificationBatches.find(row=>row.id===first.id);
    expect(batch).toMatchObject({total:2,read:1,readRate:0.5});
    expect((await postgresWorkspace(db,b)).notifications.find(row=>row.id===other)?.readAt).toBeNull();
    expect((await postgresWorkspace(db,a)).notifications.some(row=>row.id===other)).toBe(false);
    await expect(executePostgres(db,a,'notification.send',input,randomUUID())).rejects.toMatchObject({status:403});
  });
  it('shares certification review and persists independent preference fields without deleting notifications', async () => {
    const auth=new PostgresAuth(db);
    const student=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const reviewer=(await auth.login('review-pg@example.test','Review-postgres-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    const certification=await command(student,'certification.apply',{kind:'club',organization:'测试社团',note:'测试材料'});
    await expect(command(student,'certification.review',{id:certification.id,approve:true})).rejects.toMatchObject({status:403});
    await command(reviewer,'certification.review',{id:certification.id,approve:true});
    await command(student,'preferences.searchable',{enabled:false});
    await command(student,'preferences.preview',{enabled:false});
    await command(student,'preferences.reminders',{key:'messages',enabled:false});
    const view=await postgresWorkspace(db,student);
    expect(view.entities.find(e=>e.id===certification.id)?.data.status).toBe('approved');
    expect(view.entities.find(e=>e.kind==='preferences')?.data).toMatchObject({searchable:false,profilePreview:false,messages:false});
    expect(view.notifications.some(n=>n.entityId===certification.id)).toBe(true);
    await expect(command(reviewer,'certification.review',{id:certification.id,approve:false})).rejects.toMatchObject({status:400});
    await command(reviewer,'certification.review',{id:certification.id,approve:false,reason:'撤销测试'});
    expect((await postgresWorkspace(db,student)).entities.find(e=>e.id===certification.id)?.data.status).toBe('rejected');
  });
  it('keeps published knowledge answers as private snapshots when administrators edit the source', async () => {
    const auth=new PostgresAuth(db);
    const operator=(await auth.login('notify@example.test','Notify-test-123')).token;
    const student=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const other=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    const fields={title:'图书馆',body:'九点开放',keywords:'图书馆',source:'学校说明',status:'published'};
    const entry=await command(operator,'knowledge.save',fields);
    await command(operator,'knowledge.save',{title:'内部草稿',body:'不可公开',keywords:'图书馆',source:'内部',status:'draft'});
    const answer=await command(student,'knowledge.ask',{question:'图书馆何时开放？'});
    const before=(await postgresWorkspace(db,student)).entities.find(e=>e.id===answer.id)!;
    expect(before.data.body).toContain('九点开放');
    expect(before.data.body).not.toContain('不可公开');
    await command(operator,'knowledge.save',{...fields,id:entry.id,body:'十点开放'});
    expect((await postgresWorkspace(db,student)).entities.find(e=>e.id===answer.id)?.data.body).toBe(before.data.body);
    expect((await postgresWorkspace(db,other)).entities.some(e=>e.id===answer.id)).toBe(false);
    await expect(command(student,'knowledge.save',fields)).rejects.toMatchObject({status:403});
    const next=await command(student,'knowledge.ask',{question:'图书馆开放时间'});
    expect((await postgresWorkspace(db,student)).entities.find(e=>e.id===next.id)?.data.body).toContain('十点开放');
  });
  it('protects the last active superadmin and blocks writes through a previously valid banned session', async () => {
    const auth=new PostgresAuth(db);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('govern-super','govern-super@example.test',$1,'超管','now','[\"superadmin\"]')",[hashPassword('Govern-test-123')]);
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,created_at,roles) VALUES('govern-student','govern-student@example.test',$1,'测试学生','now','[\"student\"]')",[hashPassword('Govern-test-123')]);
    const superToken=(await auth.login('govern-super@example.test','Govern-test-123')).token;
    const student=(await auth.login('govern-student@example.test','Govern-test-123')).token;
    await expect(executePostgres(db,superToken,'account.update',{id:'govern-super',status:'banned',roles:[],reason:'停用测试'},randomUUID())).rejects.toThrow('唯一有效超级管理员');
    await expect(executePostgres(db,student,'account.update',{id:'govern-super',status:'banned',roles:[],reason:'越权测试'},randomUUID())).rejects.toMatchObject({status:403});
    await executePostgres(db,superToken,'account.update',{id:'govern-student',status:'banned',roles:['student'],reason:'封禁测试'},randomUUID());
    await expect(executePostgres(db,student,'post.create',{title:'不应发布',body:'测试',board:'校园'},randomUUID())).rejects.toMatchObject({status:403});
    expect((await db.pool.query("SELECT status FROM accounts WHERE id='govern-super'")).rows[0].status).toBe('active');
  });
  it('publishes mail with a default cover and notifies only current saved or participating students on correction', async () => {
    const auth=new PostgresAuth(db);
    const operator=(await auth.login('notify@example.test','Notify-test-123')).token;
    const a=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const b=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    const source={messageId:'pg-school-mail',subject:'校园讲座',sender:'school@example.test',body:'活动名称：公开讲座\n活动介绍：介绍\n活动开始时间：2027-01-01 10:00\n活动结束时间：2027-01-01 11:00\n活动地点：图书馆\n主办方：学院'};
    const mail=await command(operator,'mail.import',source);
    const original=(await postgresWorkspace(db,a)).entities.find(e=>e.kind==='activity' && e.data.mailId===mail.id)!;
    expect(original.data.image).toBe('/activity-default-cover.svg');
    await command(a,'relation.set',{id:original.id,kind:'save',enabled:true});
    await command(a,'relation.set',{id:original.id,kind:'participate',enabled:true});
    await command(b,'relation.set',{id:original.id,kind:'like',enabled:true});
    await command(operator,'mail.correct',{id:mail.id,title:'公开讲座',description:'介绍',startAt:'2027-01-01T10:00:00+08:00',endAt:'2027-01-01T11:00:00+08:00',location:'T2',host:'学院',conditions:'',reason:'学校更正地点'});
    const notices=(await db.pool.query("SELECT recipient_id FROM notifications WHERE entity_id=$1 AND event='activity.changed'",[original.id])).rows;
    expect(notices).toEqual([{recipient_id:'coffee-a'}]);
    expect(JSON.stringify(await postgresWorkspace(db,a))).not.toContain('school@example.test');
    await command(operator,'mail.import',source);
    const activities=(await postgresWorkspace(db,a)).entities.filter(e=>e.kind==='activity' && e.data.mailId===mail.id);
    expect(activities).toHaveLength(1);
    expect(activities[0].data.location).toBe('T2');
  });
  it('runs alumni verification and booking while keeping student numbers private and cancelling revoked bookings', async () => {
    const auth=new PostgresAuth(db);
    const alumni=(await auth.login('coffee-a@example.test','Coffee-test-123')).token;
    const student=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    const reviewer=(await auth.login('review-pg@example.test','Review-postgres-123')).token;
    const command=(token:string,action:string,input:Record<string,unknown>)=>executePostgres(db,token,action,input,randomUUID());
    await command(alumni,'alumni.apply',{studentNumber:'TEST-2024-PRIVATE',major:'计算机',graduationYear:2024,city:'珠海',direction:'就业',experience:'工作',topics:'实习',bio:'',evidence:'内部核对说明'});
    const profile=(await postgresWorkspace(db,reviewer)).alumni.profiles.find(p=>p.owner==='coffee-a')!;
    expect(profile.studentNumber).toBe('TEST-2024-PRIVATE');
    await command(reviewer,'alumni.review',{id:profile.id,approve:true});
    const publicView=await postgresWorkspace(db,student);
    expect(publicView.alumni.profiles.find(p=>p.id===profile.id)?.studentNumber).toBeUndefined();
    expect(JSON.stringify(publicView)).not.toContain('内部核对说明');
    const start=Date.now()+3*86400_000;
    await command(alumni,'alumni.slot.create',{startAt:new Date(start).toISOString(),endAt:new Date(start+3600_000).toISOString(),location:'图书馆'});
    const slot=(await postgresWorkspace(db,alumni)).alumni.slots.find(s=>s.alumniId===profile.id)!;
    await command(student,'alumni.request',{slotId:slot.id,question:'实习交流'});
    const booking=(await postgresWorkspace(db,student)).alumni.bookings.find(b=>b.slotId===slot.id)!;
    await command(alumni,'alumni.decide',{id:booking.id,accept:true});
    expect((await postgresWorkspace(db,student)).alumni.bookings.find(b=>b.id===booking.id)?.status).toBe('confirmed');
    await command(reviewer,'alumni.review',{id:profile.id,approve:false,reason:'撤销认证测试'});
    expect((await postgresWorkspace(db,student)).alumni.bookings.find(b=>b.id===booking.id)?.status).toBe('cancelled');
    await expect(command(alumni,'alumni.slot.create',{startAt:new Date(start+7200_000).toISOString(),endAt:new Date(start+10800_000).toISOString(),location:'图书馆'})).rejects.toThrow();
  });
  it('uses independent enrolled numbers for search and respects search and profile privacy switches', async () => {
    const auth=new PostgresAuth(db),mail=new PostgresEmail(db);
    const email='y123456789@bnbu.edu.cn';
    await db.pool.query("INSERT INTO accounts(id,email,password_hash,name,organization,created_at,roles) VALUES('search-person',$1,$2,'搜索学生','学院','now','[\"student\"]')",[email,hashPassword('Search-test-123')]);
    const target=await auth.login(email,'Search-test-123');
    const requester=(await auth.login('coffee-b@example.test','Coffee-test-123')).token;
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[]});
    await mail.sendVerification(email,true);
    const code=/\d{6}/.exec((await db.pool.query('SELECT body FROM mail_outbox WHERE recipient=$1',[email])).rows[0].body)![0];
    await mail.verifyOwnEmail(target.account,code);
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[]});
    await db.transaction(client=>new PostgresRepository(client).create('sportsIdentity','search-person',{role:'student',status:'verified',studentNumber:'20260001'}));
    expect(await postgresStudentSearch(db,requester,'y123456789')).toEqual({students:[]});
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[{id:'search-person',name:'搜索学生',organization:'学院'}]});
    await executePostgres(db,target.token,'preferences.preview',{enabled:false},randomUUID());
    expect((await postgresStudentSearch(db,requester,'20260001')).students[0].organization).toBe('');
    await executePostgres(db,target.token,'preferences.searchable',{enabled:false},randomUUID());
    expect(await postgresStudentSearch(db,requester,'20260001')).toEqual({students:[]});
    expect(await postgresStudentSearch(db,requester,'2026')).toEqual({students:[]});
    await executePostgres(db,target.token,'alumni.apply',{studentNumber:'ignored-client-value',major:'计算机',graduationYear:2024,city:'珠海',direction:'就业',experience:'工作',topics:'实习',bio:'',evidence:'核对说明'},randomUUID());
    const alumniState=await db.transaction(client=>new PostgresRepository(client).all('alumniState'));
    const application=(alumniState[0].data.value as {profiles:Array<{owner:string;studentNumber:string;studentNumberSource:string}>}).profiles.find(p=>p.owner==='search-person');
    expect(application).toMatchObject({studentNumber:'20260001',studentNumberSource:'enrollment'});
  });
});
