import {createPrivateKey,sign} from 'node:crypto';
import {readFileSync,statSync} from 'node:fs';
import {connect} from 'node:http2';
export type APNsEnvironment='sandbox'|'production';
export type APNsMessage={token:string;environment:APNsEnvironment;type:'alert'|'liveactivity';payload:object;expires:number;collapse:string};
export type APNsResult={status:number;reason:string};
type Credentials={teamID:string;keyID:string;keyPath:string};
const environments:APNsEnvironment[]=['sandbox','production'];
const value=(name:string)=>process.env[name]?.trim()??'';

function credentials(environment:APNsEnvironment):Credentials|undefined {
 // Compose passes empty defaults: only non-empty scoped values opt into scoped mode.
 // Once enabled, never borrow legacy or opposite-environment credentials.
 const scoped=environments.some(env=>['KEY_ID','KEY_PATH'].some(field=>value(`APNS_${env.toUpperCase()}_${field}`)));
 const prefix=scoped?`APNS_${environment.toUpperCase()}`:'APNS';
 const teamID=value('APNS_TEAM_ID'),keyID=value(`${prefix}_KEY_ID`),keyPath=value(`${prefix}_KEY_PATH`);
 return teamID&&keyID&&keyPath?{teamID,keyID,keyPath}:undefined;
}
export function apnsConfigured(environment?:APNsEnvironment):boolean {
 return environment===undefined?environments.some(env=>!!credentials(env)):
  environments.includes(environment)&&!!credentials(environment);
}
const jwtCache=new Map<APNsEnvironment,{identity:string;token:string;issuedAt:number}>();
function jwt(environment:APNsEnvironment,config:Credentials):string {
 // Also invalidate when an operator replaces a key file at the same mount path.
 const file=statSync(config.keyPath,{bigint:true});
 const identity=JSON.stringify([config.teamID,config.keyID,config.keyPath,
  [file.dev,file.ino,file.size,file.mtimeNs,file.ctimeNs].join(':')]);
 const now=Date.now(),cached=jwtCache.get(environment);
 if(cached?.identity===identity&&now>=cached.issuedAt&&now-cached.issuedAt<45*60_000)return cached.token;
 const part=(data:object)=>Buffer.from(JSON.stringify(data)).toString('base64url');
 const unsigned=part({alg:'ES256',kid:config.keyID})+'.'+part({iss:config.teamID,iat:Math.floor(now/1000)});
 const key=createPrivateKey(readFileSync(config.keyPath));
 if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1')throw new Error('APNS_INVALID_KEY');
 const token=unsigned+'.'+sign('sha256',Buffer.from(unsigned),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
 jwtCache.set(environment,{identity,token,issuedAt:now});
 return token;
}
export async function sendAPNs(message:APNsMessage):Promise<APNsResult>{
 if(!environments.includes(message.environment))throw new Error('APNS_INVALID_ENVIRONMENT');
 const config=credentials(message.environment);
 if(!config)throw new Error('APNS_NOT_CONFIGURED');
 const data=JSON.stringify(message.payload);if(Buffer.byteLength(data)>4096)return {status:413,reason:'PayloadTooLarge'};
 const authorization=jwt(message.environment,config),topic=value('APNS_BUNDLE_ID')||'com.runjizhou.huitongli';
 return new Promise((resolve,reject)=>{
  const session=connect(message.environment==='production'?'https://api.push.apple.com':'https://api.sandbox.push.apple.com');
  let done=false;const finish=(error?:Error,result?:APNsResult)=>{if(done)return;done=true;clearTimeout(timeout);session.destroy();if(error)reject(error);else resolve(result!);};
  const timeout=setTimeout(()=>finish(new Error('APNS_TIMEOUT')),15_000);
  session.on('error',error=>finish(error));
  const request=session.request({':method':'POST',':path':'/3/device/'+message.token,authorization:'bearer '+authorization,'apns-topic':topic+(message.type==='liveactivity'?'.push-type.liveactivity':''),'apns-push-type':message.type,'apns-priority':'10','apns-expiration':String(Math.floor(message.expires)),'apns-collapse-id':message.collapse.slice(0,64)});
  let status=0,body='';request.on('response',headers=>status=Number(headers[':status']));request.on('data',chunk=>body+=chunk);request.on('error',error=>finish(error));
  request.on('end',()=>{let reason='';try{reason=JSON.parse(body).reason??'';}catch{/* APNs may return an empty or non-JSON response body. */}finish(undefined,{status,reason});});request.end(data);
 });
}
