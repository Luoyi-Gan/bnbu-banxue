#!/usr/bin/env node
// Read-only database access. Keep the exported ledger outside the backup being restored.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import pg from 'pg';
const [operation,file]=process.argv.slice(2);
if(!['--export','--check'].includes(operation)||!file||!process.env.PRIVACY_DATABASE_URL){
 console.error('Usage: PRIVACY_DATABASE_URL=... node scripts/check-erasure-restore.mjs --export|--check /private/path/ledger.json');process.exit(2);
}
const client=new pg.Client({connectionString:process.env.PRIVACY_DATABASE_URL});
try{
 await client.connect();await client.query('BEGIN READ ONLY');
 if(operation==='--export'){
  const entries=(await client.query('SELECT account_hash AS "accountHash",deleted_at AS "deletedAt" FROM account_erasure_log ORDER BY deleted_at,account_hash')).rows;
  await writeFile(file,JSON.stringify({version:1,exportedAt:new Date().toISOString(),entries},null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(`Exported ${entries.length} erasure records. Store this ledger separately from historical backups.`);
 }else{
  const ledger=JSON.parse(await readFile(file,'utf8'));
  if(ledger.version!==1||!Number.isFinite(Date.parse(ledger.exportedAt))||!Array.isArray(ledger.entries)||!ledger.entries.every(r=>/^[a-f0-9]{64}$/.test(r.accountHash)&&Number.isFinite(Date.parse(r.deletedAt))))throw Error('Invalid ledger');
  const erased=new Set(ledger.entries.map(r=>r.accountHash));
  const restored=(await client.query('SELECT id FROM accounts')).rows.filter(r=>erased.has(createHash('sha256').update(r.id).digest('hex'))).length;
  console.log(`Restored deleted accounts: ${restored}. Ledger exported: ${ledger.exportedAt}.`);
  if(restored){console.error('BLOCKED: keep this restore offline until the erased accounts and dependent data are removed.');process.exitCode=1;}
  else console.log('No matching erased account remains. Also verify the ledger is current and object backups were filtered before activation.');
 }
 await client.query('COMMIT');
}catch{console.error('Erasure backup check/export failed. No restore approval was granted.');process.exitCode=2;}
finally{await client.end();}
