import {afterEach,describe,it,expect,vi} from 'vitest';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareBrowserAcceptance,prepareSportsAcceptance} from '../backend/src/tooling';
import {openDatabase} from '../backend/src/database';
import {Repository} from '../backend/src/repository';

afterEach(()=>vi.unstubAllEnvs());

describe('独立体育预览夹具',()=>{
 it('拒绝在其他数据库或对外监听环境启动本地桥',async()=>{
  const {startLocalSportsPreview}=await import('../scripts/local-sports-preview.mjs');
  vi.stubEnv('BNBU_LOCAL_OUTBOX','1');vi.stubEnv('BNBU_DATABASE','data/bnbu.sqlite');
  await expect(startLocalSportsPreview()).rejects.toThrow('仅支持loopback');
  vi.stubEnv('BNBU_DATABASE','data/browser-acceptance.sqlite');vi.stubEnv('BNBU_API_HOST','0.0.0.0');
  await expect(startLocalSportsPreview()).rejects.toThrow('仅支持loopback');
 });
 it('只初始化两个合成学生、可重复执行，不为老师或管理员添加验证',()=>{
  const directory=mkdtempSync(join(tmpdir(),'companion-sports-'));
  try {
   prepareBrowserAcceptance(directory);
   expect(prepareSportsAcceptance(directory)).toEqual({added:2});
   expect(prepareSportsAcceptance(directory)).toEqual({added:0});
   const db=openDatabase(join(directory,'browser-acceptance.sqlite'));
   try {const records=new Repository(db).all('verifiedEmail');expect(records).toHaveLength(2);expect(records.map(item=>item.data.email).sort()).toEqual(['student-a@example.test','student-b@example.test']);expect(records.every(item=>item.data.source==='local-acceptance-fixture')).toBe(true);} finally {db.close();}
  } finally {rmSync(directory,{recursive:true,force:true});}
 });
 it('资料被替换为其他身份时拒绝，并回滚已经处理的第一位学生',()=>{
  const directory=mkdtempSync(join(tmpdir(),'companion-sports-'));
  try {
   prepareBrowserAcceptance(directory);
   const manifest=JSON.parse(readFileSync(join(directory,'browser-acceptance-accounts.json'),'utf8'));
   const db=openDatabase(join(directory,'browser-acceptance.sqlite'));
   try {
    db.prepare('UPDATE accounts SET organization=? WHERE id=?').run('真实机构',manifest.accounts.find((item:{email:string})=>item.email==='student-b@example.test').id);
    expect(()=>prepareSportsAcceptance(directory)).toThrow('仅允许初始化原始合成学生');
    expect(new Repository(db).all('verifiedEmail')).toHaveLength(0);
   } finally {db.close();}
  } finally {rmSync(directory,{recursive:true,force:true});}
 });
});
