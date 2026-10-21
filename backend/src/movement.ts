import {createHmac,randomUUID} from 'node:crypto';
import {demand,ServiceError,type Account} from './auth';
export async function movementRequest(actor:Account,verified:boolean,operation:string,input:Record<string,unknown>={}){
 demand(actor.roles.includes('student')&&actor.status!=='banned','需要有效学生账号。',403);
 demand(verified,'请先验证本人邮箱，再连接体育平台。',403);
 const origin=process.env.BNBU_SPORTS_BRIDGE_ORIGIN,secret=process.env.BNBU_SPORTS_BRIDGE_SECRET;
 if(!origin||!secret||secret.length<32)throw new ServiceError(503,'SPORTS_UNAVAILABLE','体育平台连接尚未配置，请稍后重试。');
 const url=new URL('/internal/companion-sports',origin);
 demand(url.protocol==='https:'||url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname),'体育连接配置无效。',503);
 const time=String(Date.now()),nonce=randomUUID(),body=JSON.stringify({subject:actor.id,email:actor.email,operation,input});
 const signature=createHmac('sha256',secret).update(`companion-sports-v1\n${time}\n${nonce}\n${body}`).digest('hex');
 let response:Response;
 try{response=await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json','X-Bridge-Time':time,'X-Bridge-Nonce':nonce,'X-Bridge-Signature':signature},body})}catch{throw new ServiceError(503,'SPORTS_UNAVAILABLE','暂时无法连接体育平台，请重试。')}
 const result=await response.json().catch(()=>null) as Record<string,unknown>|null;
 if(!response.ok)throw new ServiceError(response.status===401?503:response.status,'SPORTS_CONNECTION',typeof result?.message==='string'?result.message:'体育平台暂不可用，请重试。');
 demand(result&&typeof result==='object'&&!Array.isArray(result),'体育平台返回无效数据。',503);
 if(operation==='resolve'){demand(result.state==='existing'||result.state==='new','未能确认体育账号，请重试。',503);const web=process.env.BNBU_SPORTS_WEB_ORIGIN;demand(web,'体育入口尚未配置。',503);result.sportsOrigin=new URL(web).origin;}
 if(operation==='launch'){
  const allowed=process.env.BNBU_SPORTS_WEB_ORIGIN;demand(allowed&&typeof result.url==='string','体育入口尚未配置。',503);
  const target=new URL(result.url);demand(target.origin===new URL(allowed).origin&&target.pathname==='/student/companion.html'&&/^[A-Za-z0-9_-]{43}$/.test(target.hash.slice(1)),'体育入口地址无效。',503);
 }
 return result;
}
