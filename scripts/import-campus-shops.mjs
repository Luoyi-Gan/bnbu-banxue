// Explicit local import through the existing administrator command API.
import fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
const base=process.env.BNBU_SHOP_IMPORT_ORIGIN??'http://127.0.0.1:4174';
const url=new URL(base);
if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw Error('This importer is restricted to a local server.');
const credentials=process.env.BNBU_SHOP_IMPORT_CREDENTIALS;
if(!credentials)throw Error('Set BNBU_SHOP_IMPORT_CREDENTIALS to the private local account file.');
const {accounts}=JSON.parse(await fs.readFile(credentials,'utf8'));
const account=accounts.find(a=>a.roles.includes('superadmin')||a.roles.includes('operator'));
if(!account)throw Error('An administrator account is required.');
const login=await fetch(base+'/api/auth/sign-in',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({identifier:account.email,password:account.password})});
if(!login.ok)throw Error('Administrator sign-in failed: '+login.status);
const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
const headers={Cookie:cookie,Origin:base,'Content-Type':'application/json'};
const existing=new Set();
for(let page=1;page<=10000;page++){
 const res=await fetch(base+'/api/shops?admin=1&page='+page,{headers});if(!res.ok)throw Error('Shop read failed: '+res.status);
 const data=await res.json();data.shops.forEach(shop=>existing.add(shop.data.name));if(!data.hasMore)break;
}
const catalog=JSON.parse(await fs.readFile(new URL('../shared/data/campusShops.json',import.meta.url),'utf8'));
const created=[],skipped=[];
for(const item of catalog.shops){
 if(existing.has(item.name)){skipped.push(item.name);continue;}
 const images=await Promise.all(item.images.map(async path=>'data:image/jpeg;base64,'+(await fs.readFile(resolve('public','.'+path))).toString('base64')));
 const res=await fetch(base+'/api/commands',{method:'POST',headers,body:JSON.stringify({action:'shop.save',input:{...item,images},requestId:randomUUID()})});
 if(!res.ok)throw Error('Import failed for '+item.name+': '+res.status);
 const result=await res.json();created.push({name:item.name,id:result.data.id});existing.add(item.name);
}
console.log(JSON.stringify({origin:base,created,skipped},null,2));
