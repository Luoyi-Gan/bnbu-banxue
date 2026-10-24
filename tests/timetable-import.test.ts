import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { type Server } from 'node:http';
import sharp from 'sharp';
import { Pool } from 'pg';
import { createApiServer } from '../backend/src/main';
import { createPostgresApiServer } from '../backend/src/postgres-api';
import { openDatabase } from '../backend/src/database';
import { PostgresDatabase } from '../backend/src/storage/postgres';
import { postgresMigrations } from '../backend/src/storage/postgres-schema';
import { createAccount, login, digest } from '../backend/src/auth';
import { execute } from '../backend/src/commands';
import { executePostgres } from '../backend/src/storage/postgres-commands';
import { type TimetableTable } from '../backend/src/timetable-parser';
import { reserveTimetableRecognition } from '../backend/src/timetable';
import { sqliteLearningStore, postgresLearningStore, type LearningStore } from '../backend/src/learning-store';
const cells = [['Course', 'Day', 'Time', 'Weeks'], ['Algorithms', 'Monday', '08:00-09:40', '1-16']].flatMap((row, r) => row.map((Text, c) => ({ RowTl: r, RowBr: r+1, ColTl: c, ColBr: c+1, Text })));
for (const storage of ['sqlite', 'postgres']) describe.skipIf(storage === 'postgres' && !process.env.BNBU_TEST_POSTGRES_URL)(`${storage} timetable photo contract`, () => {
  let server: Server, base: string, token: string, other: string, nonStudent: string, actor: string;
  let store: LearningStore;
  let closeDB: () => Promise<void>;
  let command: (token: string, action: string, input: Record<string, unknown>) => Promise<unknown>;
  let sql: (query: string, params?: unknown[]) => Promise<unknown>;
  let received: Buffer[], tables: TimetableTable[], delay = 0;
  beforeEach(async () => {
    vi.stubEnv('BNBU_TIMETABLE_PROVIDER', 'tencent'); vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_ID', 'test'); vi.stubEnv('BNBU_TIMETABLE_OCR_SECRET_KEY', 'test');
    received = []; tables = [{ Type: 1, Cells: cells }]; delay = 0;
    const recognizer = async (image: Buffer) => { received.push(image); if (delay) await new Promise(resolve => setTimeout(resolve, delay)); return tables; };
    if (storage === 'sqlite') {
      const db = openDatabase(':memory:'); closeDB = async () => db.close(); store = sqliteLearningStore(db);
      const account = (roles: string[]) => { const email = randomUUID()+'@example.test'; const a = createAccount(db, { email, password: 'Test-password-123', name: 'Student', roles }); return { id: a, token: login(db, email, 'Test-password-123').token }; };
      const student = account(['student']); token = student.token; actor = student.id; other = account(['student']).token; nonStudent = account([]).token;
      command = async (t, a, i) => execute(db, t, a, i, randomUUID());
      sql = async (query, params = []) => db.prepare(query).run(...params as never[]);
      server = createApiServer(db, { timetableRecognizer: recognizer });
    } else {
      const schema = 'photo_'+randomUUID().replaceAll('-', ''), url = process.env.BNBU_TEST_POSTGRES_URL;
      const admin = new Pool({ connectionString: url }); await admin.query(`CREATE SCHEMA ${schema}`);
      const db = new PostgresDatabase({ connectionString: url, options: `-c search_path=${schema}` }); await db.migrate(postgresMigrations); store = postgresLearningStore(db);
      closeDB = async () => { await db.close(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end(); };
      const account = async (roles: string[]) => { const id = randomUUID(), t = randomUUID();
        await db.pool.query('INSERT INTO accounts(id,email,password_hash,name,roles,created_at) VALUES($1,$2,$3,$4,$5,$6)', [id, id+'@example.test', 'unused', 'Student', JSON.stringify(roles), 'now']);
        await db.pool.query('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,$3,$4)', [digest(t), id, Date.now()+600000, 'now']); return { id, token: t }; };
      const student = await account(['student']); token = student.token; actor = student.id; other = (await account(['student'])).token; nonStudent = (await account([])).token;
      command = (t, a, i) => executePostgres(db, t, a, i, randomUUID());
      sql = (query, params = []) => { let n = 0; return db.pool.query(query.replace(/\?/g, () => '$'+(++n)), params); };
      server = createPostgresApiServer(db, { timetableRecognizer: recognizer });
    }
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${(server.address() as {port:number}).port}`;
    await command(token, 'timetable.save', { lessons: [{ name: 'Original', weekday: 3 }], fileName: 'original.png' });
  });
  afterEach(async () => { if (server) await new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }); await closeDB?.(); vi.unstubAllEnvs(); });
  const workspace = async (t = token) => (await (await fetch(base+'/api/workspace', { headers: {Cookie:`bnbu_session=${t}`} })).json());
  const table = async (t = token) => (await workspace(t)).entities.find((e: {kind:string}) => e.kind === 'timetable');
  const image = (format: 'png' | 'jpeg' | 'webp' = 'png') => sharp({create:{width:80,height:60,channels:3,background:'white'}})[format]().toBuffer();
  const upload = async (bytes?: Buffer, mime = 'image/png', t = token, extra: Record<string,string> = {}, signal?: AbortSignal) => {
    const body = new FormData(); body.append('image', new Blob([Uint8Array.from(bytes ?? await image())], {type:mime}), 'private-name.png');
    return fetch(base+'/api/timetable/recognize', {method:'POST',body,signal,headers:{Cookie:`bnbu_session=${t}`,...extra}});
  };
  it('normalizes PNG/JPEG/WebP, returns review drafts, saves only explicit confirmed results and isolates accounts', async () => {
    const original = await table();
    for (const format of ['png','jpeg','webp'] as const) {
      const response = await upload(await image(format), 'image/'+format); expect(response.status).toBe(200);
      const draft = await response.json(); expect(draft).toMatchObject({provider:'tencent',requiresConfirmation:true,lessons:[{name:'Algorithms',weekday:1,startTime:'08:00',endTime:'09:40',weeks:'1-16',needsReview:true}]});
      expect(await table()).toEqual(original); expect(await table(other)).toBeUndefined();
      const meta = await sharp(received.at(-1)).metadata(); expect(meta.format).toBe('jpeg'); expect(meta.exif).toBeUndefined();
    }
    const draft = (await (await upload()).json()).lessons;
    draft[0].name = 'Corrected course'; draft[0].needsReview = false;
    await command(token,'timetable.save',{lessons:draft,source:'photo',expectedTableId:original.id,expectedVersion:original.version,fileName:'timetable.jpg'});
    expect((await table()).data).toMatchObject({source:'photo',lessons:[{name:'Corrected course',needsReview:false}]});
    expect(await table(other)).toBeUndefined();
  });
  it('removes EXIF and normalizes an oriented high-resolution JPEG before cloud transmission', async () => {
    const bytes = await sharp({create:{width:3200,height:800,channels:3,background:'white'}}).jpeg().withMetadata({orientation:6}).withExifMerge({IFD0:{Artist:'Private Student'}}).toBuffer();
    expect((await sharp(bytes).metadata()).exif).toBeDefined();
    expect((await upload(bytes,'image/jpeg')).status).toBe(200);
    const meta = await sharp(received[0]).metadata();
    expect(meta).toMatchObject({width:700,height:2800,format:'jpeg'}); expect(meta.exif).toBeUndefined(); expect(meta.orientation).toBeUndefined();
  });
  it('rejects stale snapshots, including concurrent confirmations and first-table races', async () => {
    const original = await table(), input = {lessons:[{name:'Imported',weekday:1}],source:'photo',expectedTableId:original.id,expectedVersion:original.version};
    const outcomes = await Promise.allSettled([command(token,'timetable.save',input),command(token,'timetable.save',input)]);
    expect(outcomes.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    expect((outcomes.find(r=>r.status==='rejected') as PromiseRejectedResult).reason.status).toBe(409);
    await expect(command(token,'timetable.save',{...input,expectedVersion:undefined})).rejects.toMatchObject({status:400});
    await command(other,'timetable.save',{lessons:[{name:'Newly edited',weekday:2}]});
    await expect(command(other,'timetable.save',{...input,expectedTableId:'',expectedVersion:0})).rejects.toMatchObject({status:409});
    expect((await table(other)).data.lessons[0].name).toBe('Newly edited');
  });
  it('blocks unauthenticated, nonstudent and cross-site uploads before invoking OCR', async () => {
    expect((await upload(undefined,'image/png','invalid')).status).toBe(401);
    expect((await upload(undefined,'image/png',nonStudent)).status).toBe(403);
    expect((await upload(undefined,'image/png',token,{'sec-fetch-site':'cross-site'})).status).toBe(403);
    expect((await upload(undefined,'image/png',token,{Origin:'https://evil.example'})).status).toBe(403);
    expect(received).toHaveLength(0);
  });
  it('rejects invalid images, spoofed MIME, multipart duplicates and oversized content before OCR', async () => {
    for (const [bytes,mime,status] of [[Buffer.from('not-image'),'image/png',400],[await image(),'image/jpeg',400],[await image(),'application/pdf',400],[Buffer.alloc(10*1024*1024+1),'image/png',413]] as const) expect((await upload(bytes,mime)).status).toBe(status);
    const body = new FormData(); for(let n=0;n<2;n++) body.append('image',new Blob([Uint8Array.from(await image())],{type:'image/png'}),'x.png');
    expect((await fetch(base+'/api/timetable/recognize',{method:'POST',body,headers:{Cookie:`bnbu_session=${token}`}})).status).toBe(400);
    expect(received).toHaveLength(0); expect((await table()).data.lessons[0].name).toBe('Original');
  });
  it('keeps the original table on unrecognized images and cancellation, and permits a subsequent retry', async () => {
    tables = []; expect((await upload()).status).toBe(422);
    tables = [{Type:1,Cells:cells}]; delay = 150;
    const controller = new AbortController(), pending = upload(undefined,'image/png',token,{},controller.signal);
    while(received.length < 2) await new Promise(resolve=>setTimeout(resolve,5));
    controller.abort(); await expect(pending).rejects.toThrow();
    await new Promise(resolve=>setTimeout(resolve,180)); expect((await table()).data.lessons[0].name).toBe('Original');
    delay=0; expect((await upload()).status).toBe(200);
  });
  it('enforces shared concurrent minute and daily budgets without saving photos', async () => {
    const results = await Promise.allSettled(Array.from({length:10},()=>reserveTimetableRecognition(store,actor,'same-ip')));
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(6);
    expect(results.filter(r=>r.status==='rejected').every(r=>(r as PromiseRejectedResult).reason.status===429)).toBe(true);
    expect((await upload()).status).toBe(429); expect(received).toHaveLength(0);
    await sql('UPDATE security_rate_events SET occurred_at=? WHERE category=?',[Date.now()-120000,'timetable-ocr']);
    for(let n=0;n<24;n++) await sql('INSERT INTO security_rate_events(category,subject,origin,occurred_at) VALUES(?,?,?,?)',['timetable-ocr',digest(actor),digest('same-ip'),Date.now()-120000]);
    await expect(reserveTimetableRecognition(store,actor,'different-ip')).rejects.toMatchObject({status:429});
    expect((await table()).data.lessons[0].name).toBe('Original');
  });
});
