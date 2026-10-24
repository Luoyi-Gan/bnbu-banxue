import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Parse Compose with synthetic values only. Never start a container or load the
// operator's .env/connection.json, and never print the rendered environment.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const directory=await mkdtemp(join(tmpdir(),'bnbu-compose-test-'));
const keys=[
 'BNBU_EMAIL_PROVIDER','BNBU_EMAIL_DELIVERY_URL','BNBU_EMAIL_DELIVERY_TOKEN',
 'BNBU_AOKSEND_APP_KEY','BNBU_AOKSEND_TEMPLATE_ID','BNBU_AOKSEND_CODE_VARIABLE',
 'BNBU_AOKSEND_LOGIN_TEMPLATE_ID','BNBU_AOKSEND_DELETION_TEMPLATE_ID',
 'BNBU_STUDY_DEEPSEEK_KEY','DEEPSEEK_API_KEY','BNBU_STUDY_AI_PROVIDER',
 'BNBU_STUDY_AI_URL','BNBU_STUDY_AI_TOKEN','BNBU_SPORTS_BRIDGE_ORIGIN',
 'BNBU_SPORTS_BRIDGE_SECRET','BNBU_SPORTS_WEB_ORIGIN','BNBU_SPORTS_MODE',
 'BNBU_TIMETABLE_PROVIDER','BNBU_TIMETABLE_OCR_SECRET_ID','BNBU_TIMETABLE_OCR_SECRET_KEY','BNBU_TIMETABLE_OCR_REGION',
 'BNBU_TIMETABLE_UPSTREAM','BNBU_TIMETABLE_TOKEN',
 'BNBU_IDENTITY_VERIFICATION_URL','BNBU_IDENTITY_VERIFICATION_TOKEN',
];
let checks=0;
try {
 const empty=join(directory,'empty.env');await writeFile(empty,'');
 const base={PATH:process.env.PATH,HOME:process.env.HOME,BNBU_POSTGRES_PASSWORD:'compose-test-only'};
 for(const [file,service] of [['compose.postgres.yaml','api'],['compose.yaml','bnbu']]) {
  const parse=env=>JSON.parse(execFileSync('docker',['compose','--env-file',empty,'-f',file,'config','--format','json'],{cwd:root,env,stdio:['ignore','pipe','pipe'],encoding:'utf8'}));
  const configured=Object.fromEntries(keys.map((key,index)=>[key,'synthetic-'+index]));
  const result=parse({...base,...configured,BNBU_LOCAL_OUTBOX:'0'});
  for(const key of keys){assert.equal(result.services[service].environment[key],configured[key],file+': '+key);checks++;}
  assert.equal(result.services[service].environment.BNBU_LOCAL_OUTBOX,'0');checks++;
  const frontend=JSON.stringify(result.services.frontend??{});
  for(const key of keys){assert.ok(!frontend.includes(configured[key]),'server configuration leaked into frontend');checks++;}
  const defaults=parse(base).services[service].environment;
  assert.equal(defaults.BNBU_SPORTS_MODE,'real');checks++;
  for(const key of keys.filter(key=>key!=='BNBU_SPORTS_MODE')){assert.equal(defaults[key],key==='BNBU_TIMETABLE_OCR_REGION'?'ap-guangzhou':'');checks++;}
 }
 console.log(`Compose configuration: ${checks} checks passed; no containers started.`);
} finally {await rm(directory,{recursive:true,force:true});}
