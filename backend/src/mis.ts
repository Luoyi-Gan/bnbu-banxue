import {randomBytes} from 'node:crypto';
import {CookieJar} from 'tough-cookie';
import {sm2} from 'sm-crypto';
import {load} from 'cheerio';
import {demand,digest,ServiceError} from './auth';
import type {TimetableLesson} from '../../shared/v2/timetableModel';

export interface MisTimetable {semester:string;lessons:TimetableLesson[];courseCount:number}
export function parseMisTimetable(html:string):MisTimetable {
  const $=load(html),semester=$('#semesterList option:selected').text().trim();
  demand(semester,'MIS未返回当前学期，原课表已保留。',502);
  const table=$('table').filter((_,e)=>$(e).find('th').toArray().some(c=>$(c).text().trim()==='Course Code')).last();
  const heading=table.find('tr').filter((_,e)=>$(e).children('th').toArray().some(c=>$(c).text().trim()==='Course Code')).last();
  const headers=heading.children('th,td').map((_,e)=>$(e).text().trim()).get();
  const names=['Course Code','Name','Teachers','Time','Room'];
  demand(names.every(name=>headers.includes(name)),'MIS课表结构无法识别，原课表已保留。',502);
  const lines=(html:string)=>load('<div>'+html.replace(/<br\s*\/?\s*>/gi,'\n')+'</div>')('div').text().split('\n').map(v=>v.trim()).filter(Boolean);
  const lessons:TimetableLesson[]=[],courses=new Set<string>();
  for(const row of table.find('tr').toArray()){
    const cells=$(row).children('th,td');if(!cells.filter('td').length)continue;
    const field=(name:string)=>cells.eq(headers.indexOf(name));
    const code=field('Course Code').text().trim(),name=field('Name').text().trim();if(!code||!name)continue;
    courses.add(code);const times=lines(field('Time').html()??''),rooms=lines(field('Room').html()??'');
    const remark=headers.includes('Remark')?field('Remark').text().trim():'';
    for(const [index,value]of times.entries()){
      const match=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/i.exec(value);
      demand(match,'MIS课程时间无法解析，原课表已保留。',502);
      const weekday=['mon','tue','wed','thu','fri','sat','sun'].indexOf(match[1].toLowerCase())+1,startTime=match[2].padStart(5,'0'),endTime=match[3].padStart(5,'0');
      demand(/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)&&startTime<endTime,'MIS课程时间无效。',502);
      const knownSemester=semester==='Semester 1 of 2026-2027',needsReview=!knownSemester||/week|周|odd|even|cancel|suspend/i.test(remark);
      const location=rooms.length===times.length?rooms[index]:rooms.length===1?rooms[0]:'';
      lessons.push({id:'mis-'+digest(JSON.stringify([code,name,weekday,startTime,endTime,location])).slice(0,20),name,weekday,startTime,endTime,location,teacher:field('Teachers').text().trim(),period:'',weeks:needsReview?'':'1–14周',note:`MIS · ${semester} · ${code}${remark?' · '+remark:''}${knownSemester?' · 按已确认同学期校历展开':''}`,needsReview});
    }
  }
  demand(lessons.length>0&&lessons.length<=100,'MIS没有返回可用课程时间，原课表已保留。',502);
  return {semester,lessons,courseCount:courses.size};
}

const sso='https://sso.bnbu.edu.cn',mis='https://mis.bnbu.edu.cn';
const service='3bvkl8pks1ki04nirus0g';
export class MisClient {
  private jar=new CookieJar();
  private deadline=Date.now()+35000;
  constructor(private transport:typeof fetch=fetch){}
  private allowed(url:URL){demand([sso,mis].includes(url.origin)&&!url.username&&!url.password,'学校重定向地址不受支持。',502);}
  private async request(target:string,method='GET',data?:unknown,depth=0):Promise<{url:URL;html:string}>{
    demand(depth<10,'学校登录重定向过多。',502);
    const url=new URL(target);this.allowed(url);
    const cookie=await this.jar.getCookieString(url.href);
    const send=()=>{demand(this.deadline>Date.now(),'MIS连接超时，原课表已保留。',502);return this.transport(url,{method,redirect:'manual',headers:{Accept:'text/html,application/json',...(cookie?{Cookie:cookie}:{}),...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(Math.min(20000,this.deadline-Date.now()))});};
    const response=await send().catch(()=>method==='GET'?send():Promise.reject()).catch(()=>{throw new ServiceError(502,'MIS_UNREACHABLE','MIS暂时无法连接，请检查校园网络后重试。');});
    for(const value of response.headers.getSetCookie())await this.jar.setCookie(value,url.href);
    const location=response.headers.get('location');
    if(response.status>=300&&response.status<400&&location){
      const next=new URL(location,url);this.allowed(next);
      demand(method==='GET'||![307,308].includes(response.status),'学校登录要求不受支持的请求转发。',502);
      return this.request(next.href,'GET',undefined,depth+1);
    }
    demand(response.ok,'MIS未能返回有效响应。',502);
    const html=await response.text();demand(html.length<5*1024*1024,'学校响应过大。',502);
    return {url,html};
  }
  private async settle(result:{url:URL;html:string},depth=0):Promise<{url:URL;html:string}>{
    demand(depth<6,'学校页面跳转过多。',502);
    // Once MIS is reached, navigation functions in its menu are not login redirects.
    if(result.url.origin===mis)return result;
    const $=load(result.html),refresh=$('meta[http-equiv]').filter((_,e)=>String($(e).attr('http-equiv')).toLowerCase()==='refresh').attr('content');
    const target=refresh?.match(/url\s*=\s*['"]?([^'"\s>]+)/i)?.[1]??result.html.match(/(?:window\.)?location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/)?.[1]??result.html.match(/location\.replace\(\s*['"]([^'"]+)['"]/)?.[1]??$('body').attr('onload')?.match(/redirect\(\s*['"]([^'"]+)['"]/)?.[1];
    if(target){const next=new URL(target,result.url);this.allowed(next);return this.settle(await this.request(next.href),depth+1);}
    return result;
  }
  async timetableHtml(username:string,password:string){
    await this.request(sso+'/');
    const key=JSON.parse((await this.request(sso+'/auth/flow/login/getSm2PubK')).html).data;
    demand(typeof key==='string'&&/^[0-9a-f]{128}$/i.test(key),'学校认证公钥无效。',502);
    const encrypted='04'+sm2.doEncrypt(password,'04'+key,1);
    const response=JSON.parse((await this.request(sso+'/auth/pwd/tencent/login','POST',{userName:username,password:encrypted,randomP:randomBytes(16).toString('hex')})).html);
    if(response.data?.needVerifyCode)throw new ServiceError(409,'MIS_VERIFICATION_REQUIRED','学校SSO要求额外验证，MIS时间表暂未同步。');
    demand(response.data?.success===true,'学校SSO未确认登录，MIS时间表暂未同步。',502);
    const launch=await this.settle(await this.request(`${sso}/auth/sso/login/${service}?service=${service}&accountName=${encodeURIComponent(username)}`));
    demand(launch.url.origin===mis,'学校未进入MIS，时间表暂未同步。',502);
    const timetable=await this.request(mis+'/mis/student/tts/timetable_min.do');
    demand(timetable.url.origin===mis&&!/\/login\.jsp|auth\/pwd\/tencent\/login/i.test(timetable.html),'MIS登录已失效。',502);
    return timetable.html;
  }
  async timetable(username:string,password:string){return parseMisTimetable(await this.timetableHtml(username,password));}
}
