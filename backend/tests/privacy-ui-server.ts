// Isolated, synthetic data only. Bind a random loopback port; never use a deployment database.
import {randomBytes} from 'node:crypto';
import {writeFile,unlink} from 'node:fs/promises';
import {openDatabase} from '../src/database';
import {createAccount} from '../src/auth';
import {createApiServer} from '../src/main';
const output=process.argv[2];if(!output?.startsWith('/tmp/'))throw Error('Pass a /tmp/ fixture metadata path.');
const db=openDatabase(':memory:');
const password=randomBytes(18).toString('base64url');
const email='privacy-ui-'+randomBytes(6).toString('hex')+'@example.invalid';
const user=createAccount(db,{email,password,name:'Privacy UI Fixture',roles:[]});
const server=createApiServer(db,{localOutbox:true});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=(server.address() as {port:number}).port;
await writeFile(output,JSON.stringify({url:`http://127.0.0.1:${port}`,email,password,accountID:user}),{mode:0o600});
console.log('Isolated privacy UI fixture ready on loopback port '+port);
process.on('SIGTERM',()=>server.close(()=>{db.close();void unlink(output).finally(()=>process.exit(0));}));
