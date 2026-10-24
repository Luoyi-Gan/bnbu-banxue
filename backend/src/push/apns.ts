import {createPrivateKey,sign} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {connect} from 'node:http2';
export type APNsMessage={token:string;environment:'sandbox'|'production';type:'alert'|'liveactivity';payload:object;expires:number;collapse:string};
export type APNsResult={status:number;reason:string};
export function apnsConfigured(){return Boolean(process.env.APNS_KEY_PATH&&process.env.APNS_KEY_ID&&process.env.APNS_TEAM_ID);}
let cachedJWT='',jwtAt=0;
function jwt(){
 if(cachedJWT&&Date.now()-jwtAt<45*60_000)return cachedJWT;
 const part=(value:object)=>Buffer.from(JSON.stringify(value)).toString('base64url');
 const value=part({alg:'ES256',kid:process.env.APNS_KEY_ID})+'.'+part({iss:process.env.APNS_TEAM_ID,iat:Math.floor(Date.now()/1000)});
 const key=createPrivateKey(readFileSync(process.env.APNS_KEY_PATH!));
 cachedJWT=value+'.'+sign('sha256',Buffer.from(value),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');jwtAt=Date.now();return cachedJWT;
}
export async function sendAPNs(message:APNsMessage):Promise<APNsResult>{
 if(!apnsConfigured())throw new Error('APNS_NOT_CONFIGURED');
 const authorization=jwt(),topic=process.env.APNS_BUNDLE_ID??'edu.bnbu.banxue.student';
 const data=JSON.stringify(message.payload);if(Buffer.byteLength(data)>4096)return {status:413,reason:'PayloadTooLarge'};
 return new Promise((resolve,reject)=>{
  const session=connect(message.environment==='production'?'https://api.push.apple.com':'https://api.sandbox.push.apple.com');
  let done=false;const finish=(error?:Error,result?:APNsResult)=>{if(done)return;done=true;clearTimeout(timeout);session.destroy();if(error)reject(error);else resolve(result!);};
  const timeout=setTimeout(()=>finish(new Error('APNS_TIMEOUT')),15_000);
  session.on('error',error=>finish(error));
  const request=session.request({':method':'POST',':path':'/3/device/'+message.token,authorization:'bearer '+authorization,'apns-topic':topic+(message.type==='liveactivity'?'.push-type.liveactivity':''),'apns-push-type':message.type,'apns-priority':'10','apns-expiration':String(Math.floor(message.expires)),'apns-collapse-id':message.collapse.slice(0,64)});
  let status=0,body='';request.on('response',headers=>status=Number(headers[':status']));request.on('data',chunk=>body+=chunk);request.on('error',error=>finish(error));
  request.on('end',()=>{let reason='';try{reason=JSON.parse(body).reason??'';}catch{}finish(undefined,{status,reason});});request.end(data);
 });
}
