import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {generateKeyPairSync,verify,type KeyObject} from 'node:crypto';
import {EventEmitter} from 'node:events';
import {mkdtempSync,rmSync,writeFileSync,renameSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {APNsEnvironment,APNsMessage} from './apns';

const {connect}=vi.hoisted(()=>({connect:vi.fn()}));
vi.mock('node:http2',()=>({connect}));
type Request={origin:string;headers:Record<string,string>;body:string};
let requests:Request[],directory:string,apns:typeof import('./apns');
let sandbox:{path:string;publicKey:KeyObject},production:{path:string;publicKey:KeyObject};
function key(name:string){
 const pair=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),path=join(directory,name+'.p8');
 writeFileSync(path,pair.privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600});
 return {path,publicKey:pair.publicKey};
}
function message(environment:APNsEnvironment,type:APNsMessage['type']='alert'):APNsMessage {
 return {environment,type,token:'a'.repeat(64),payload:{aps:{alert:'test'}},expires:Date.now()/1000+60,collapse:'test-collapse'};
}
function jwt(request:Request){return request.headers.authorization.slice('bearer '.length);}
function verifyJWT(request:Request,publicKey:KeyObject,keyID:string,teamID='TESTTEAM01'){
 const [header,payload,signature]=jwt(request).split('.');
 expect(JSON.parse(Buffer.from(header,'base64url').toString())).toEqual({alg:'ES256',kid:keyID});
 expect(JSON.parse(Buffer.from(payload,'base64url').toString())).toEqual({iss:teamID,iat:expect.any(Number)});
 const bytes=Buffer.from(signature,'base64url');
 expect(bytes).toHaveLength(64);
 expect(verify('sha256',Buffer.from(header+'.'+payload),{key:publicKey,dsaEncoding:'ieee-p1363'},bytes)).toBe(true);
}
beforeEach(async()=>{
 vi.resetModules();connect.mockReset();requests=[];
 for(const name of Object.keys(process.env).filter(name=>name.startsWith('APNS_')))vi.stubEnv(name,undefined);
 directory=mkdtempSync(join(tmpdir(),'huitongli-apns-test-'));
 sandbox=key('sandbox');production=key('production');
 vi.stubEnv('APNS_TEAM_ID','TESTTEAM01');
 vi.stubEnv('APNS_SANDBOX_KEY_ID','SANDBOX001');vi.stubEnv('APNS_SANDBOX_KEY_PATH',sandbox.path);
 vi.stubEnv('APNS_PRODUCTION_KEY_ID','PRODKEY001');vi.stubEnv('APNS_PRODUCTION_KEY_PATH',production.path);
 connect.mockImplementation((origin:string)=>{
  const session=new EventEmitter() as EventEmitter&{request:(headers:Record<string,string>)=>EventEmitter&{end:(body:string)=>void};destroy:()=>void};
  session.destroy=vi.fn();
  session.request=(headers)=>{
   const sent={origin,headers,body:''};requests.push(sent);
   const request=new EventEmitter() as EventEmitter&{end:(body:string)=>void};
   request.end=(body)=>{sent.body=body;request.emit('response',{':status':200});request.emit('end');};
   return request;
  };
  return session;
 });
 apns=await import('./apns');
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllEnvs();rmSync(directory,{recursive:true,force:true});});

describe('APNs environment credentials and transport',()=>{
 it('interleaves concurrent sandbox and production sends without sharing JWTs or keys',async()=>{
  await Promise.all(['sandbox','production','sandbox','production'].map(env=>apns.sendAPNs(message(env as APNsEnvironment))));
  for(const [index,request] of requests.entries()){
   const isSandbox=index%2===0;
   expect(request.origin).toBe(isSandbox?'https://api.sandbox.push.apple.com':'https://api.push.apple.com');
   verifyJWT(request,isSandbox?sandbox.publicKey:production.publicKey,isSandbox?'SANDBOX001':'PRODKEY001');
   expect(request.headers[':path']).toBe('/3/device/'+'a'.repeat(64));
  }
  expect(jwt(requests[0])).toBe(jwt(requests[2]));expect(jwt(requests[1])).toBe(jwt(requests[3]));
  expect(jwt(requests[0])).not.toBe(jwt(requests[1]));
 });
 it.each(['sandbox','production'] as const)('uses the main app and Live Activity topics for %s',async environment=>{
  await apns.sendAPNs(message(environment));await apns.sendAPNs(message(environment,'liveactivity'));
  expect(requests[0].headers['apns-topic']).toBe('com.runjizhou.huitongli');
  expect(requests[1].headers['apns-topic']).toBe('com.runjizhou.huitongli.push-type.liveactivity');
  expect(requests[1].headers['apns-push-type']).toBe('liveactivity');
  vi.stubEnv('APNS_BUNDLE_ID','com.example.custom');await apns.sendAPNs(message(environment,'liveactivity'));
  expect(requests[2].headers['apns-topic']).toBe('com.example.custom.push-type.liveactivity');
 });
 it.each(['APNS_PRODUCTION_KEY_ID','APNS_PRODUCTION_KEY_PATH'])('does not borrow legacy keys when %s is missing',async missing=>{
  vi.stubEnv(missing,'');vi.stubEnv('APNS_KEY_ID','LEGACY0001');vi.stubEnv('APNS_KEY_PATH',sandbox.path);
  expect(apns.apnsConfigured()).toBe(true);expect(apns.apnsConfigured('sandbox')).toBe(true);expect(apns.apnsConfigured('production')).toBe(false);
  await expect(apns.sendAPNs(message('production'))).rejects.toThrow('APNS_NOT_CONFIGURED');expect(connect).not.toHaveBeenCalled();
  await apns.sendAPNs(message('sandbox'));verifyJWT(requests[0],sandbox.publicKey,'SANDBOX001');
 });
 it('does not borrow production keys for a completely unconfigured sandbox',async()=>{
  vi.stubEnv('APNS_SANDBOX_KEY_ID','');vi.stubEnv('APNS_SANDBOX_KEY_PATH','');
  expect(apns.apnsConfigured('sandbox')).toBe(false);
  await expect(apns.sendAPNs(message('sandbox'))).rejects.toThrow('APNS_NOT_CONFIGURED');
  await apns.sendAPNs(message('production'));verifyJWT(requests[0],production.publicKey,'PRODKEY001');
 });
 it('requires the shared team even when both scoped key pairs exist',async()=>{
  vi.stubEnv('APNS_TEAM_ID',' ');expect(apns.apnsConfigured()).toBe(false);
  for(const environment of ['sandbox','production'] as const)await expect(apns.sendAPNs(message(environment))).rejects.toThrow('APNS_NOT_CONFIGURED');
  expect(connect).not.toHaveBeenCalled();
 });
 it('supports the legacy key pair only when all scoped settings are empty',async()=>{
  for(const env of ['SANDBOX','PRODUCTION'])for(const field of ['KEY_ID','KEY_PATH'])vi.stubEnv(`APNS_${env}_${field}`,' ');
  vi.stubEnv('APNS_KEY_ID','LEGACY0001');vi.stubEnv('APNS_KEY_PATH',sandbox.path);
  for(const environment of ['sandbox','production'] as const){expect(apns.apnsConfigured(environment)).toBe(true);await apns.sendAPNs(message(environment));}
  for(const request of requests)verifyJWT(request,sandbox.publicKey,'LEGACY0001');
  vi.stubEnv('APNS_KEY_PATH','');expect(apns.apnsConfigured()).toBe(false);
 });
 it('fails closed for unknown environments even with legacy credentials',async()=>{
  await expect(apns.sendAPNs({...message('sandbox'),environment:'invalid' as APNsEnvironment})).rejects.toThrow('APNS_INVALID_ENVIRONMENT');
  expect(apns.apnsConfigured('invalid' as APNsEnvironment)).toBe(false);expect(connect).not.toHaveBeenCalled();
 });
 it('expires each JWT independently after 45 minutes',async()=>{
  const start=Date.now(),clock=vi.spyOn(Date,'now').mockReturnValue(start);
  await apns.sendAPNs(message('sandbox'));clock.mockReturnValue(start+10*60_000);await apns.sendAPNs(message('production'));
  clock.mockReturnValue(start+46*60_000);await apns.sendAPNs(message('sandbox'));await apns.sendAPNs(message('production'));
  expect(jwt(requests[2])).not.toBe(jwt(requests[0]));expect(jwt(requests[3])).toBe(jwt(requests[1]));
  verifyJWT(requests[2],sandbox.publicKey,'SANDBOX001');
 });
 it.each(['id','path','file'] as const)('invalidates only the rotated sandbox cache when its %s changes',async rotation=>{
  await apns.sendAPNs(message('sandbox'));await apns.sendAPNs(message('production'));
  let publicKey=sandbox.publicKey,keyID='SANDBOX001';
  if(rotation==='id'){keyID='ROTATED001';vi.stubEnv('APNS_SANDBOX_KEY_ID',keyID);}
  else {const replacement=key('replacement');publicKey=replacement.publicKey;if(rotation==='path')vi.stubEnv('APNS_SANDBOX_KEY_PATH',replacement.path);else renameSync(replacement.path,sandbox.path);}
  await apns.sendAPNs(message('sandbox'));await apns.sendAPNs(message('production'));
  expect(jwt(requests[2])).not.toBe(jwt(requests[0]));expect(jwt(requests[3])).toBe(jwt(requests[1]));verifyJWT(requests[2],publicKey,keyID);
 });
 it('invalidates the token when the team changes',async()=>{
  await apns.sendAPNs(message('sandbox'));vi.stubEnv('APNS_TEAM_ID','NEWTEAM001');await apns.sendAPNs(message('sandbox'));
  verifyJWT(requests[1],sandbox.publicKey,'SANDBOX001','NEWTEAM001');
 });
 it.each(['missing','invalid','wrong-curve'] as const)('keeps production usable when the sandbox file is %s',async problem=>{
  if(problem==='missing')rmSync(sandbox.path);
  else if(problem==='invalid')writeFileSync(sandbox.path,'not a key');
  else writeFileSync(sandbox.path,generateKeyPairSync('ec',{namedCurve:'secp384r1'}).privateKey.export({type:'pkcs8',format:'pem'}));
  await expect(apns.sendAPNs(message('sandbox'))).rejects.toThrow();expect(connect).not.toHaveBeenCalled();
  await apns.sendAPNs(message('production'));verifyJWT(requests[0],production.publicKey,'PRODKEY001');
 });
 it('rejects oversized payloads without opening a connection',async()=>{
  expect(await apns.sendAPNs({...message('sandbox'),payload:{text:'x'.repeat(4097)}})).toEqual({status:413,reason:'PayloadTooLarge'});
  expect(connect).not.toHaveBeenCalled();
 });
});
