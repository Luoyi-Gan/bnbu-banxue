// Explicit local import using the shared operator policy and command receipts.
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const base=process.env.BNBU_CLUB_IMPORT_ORIGIN??'http://127.0.0.1:4186';
if(!['127.0.0.1','localhost','[::1]'].includes(new URL(base).hostname))throw Error('Only a local server is supported.');
if(!process.env.BNBU_CLUB_IMPORT_CREDENTIALS)throw Error('Set BNBU_CLUB_IMPORT_CREDENTIALS to a private local account file.');
const {accounts}=JSON.parse(await readFile(process.env.BNBU_CLUB_IMPORT_CREDENTIALS,'utf8'));
const account=accounts.find(a=>a.roles.includes('superadmin')||a.roles.includes('operator'));if(!account)throw Error('Operator required.');
const response=await fetch(base+'/api/auth/sign-in',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({identifier:account.email,password:account.password})});
if(!response.ok)throw Error('Operator login failed.');
const headers={Cookie:response.headers.getSetCookie().map(v=>v.split(';')[0]).join('; '),Origin:base,'Content-Type':'application/json'};
const {clubs}=JSON.parse(await readFile(new URL('../data/campus-clubs.json',import.meta.url),'utf8'));
for(const club of clubs){const result=await fetch(base+'/api/commands',{method:'POST',headers,body:JSON.stringify({action:'organization.import',input:{name:club.name},requestId:randomUUID()})});if(!result.ok)throw Error('Import failed: '+club.name+' '+result.status);}
let imageRecords=0;
if(process.argv.includes('--images')){
 const response=await fetch(base+'/api/workspace',{headers});if(!response.ok)throw Error('Workspace read failed.');const workspace=await response.json();
 for(const club of clubs.filter(item=>item.image&&item.imageSource)){
  const existing=workspace.entities.find(item=>item.kind==='organization'&&item.data.name===club.name&&item.data.directoryOnly===true);if(!existing)continue;
  const result=await fetch(base+'/api/commands',{method:'POST',headers,body:JSON.stringify({action:'organization.images',input:{id:existing.id,version:existing.version},requestId:randomUUID()})});
  if(!result.ok)throw Error('Image update failed: '+club.name+' '+result.status);imageRecords++;
 }
}
console.log(JSON.stringify({origin:base,processed:clubs.length,imageRecords}));
