import {demand,ServiceError} from './auth';

/** Fixed school origin. Never accepts a client-provided service URL. */
export const ispaceOrigin='https://ispace.bnbu.edu.cn';
export type MoodleObject=Record<string,unknown>;
export const object=(value:unknown):MoodleObject=>value&&typeof value==='object'&&!Array.isArray(value)?value as MoodleObject:{};
export const list=(value:unknown):MoodleObject[]=>Array.isArray(value)?value.map(object):[];
export const plain=(value:unknown)=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
export class ISpace {
  constructor(private readonly transport:typeof fetch=fetch){}
  private async post(path:string,params:Record<string,string>){
    const response=await this.transport(ispaceOrigin+path,{method:'POST',redirect:'error',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params),signal:AbortSignal.timeout(20000)}).catch(()=>{throw new ServiceError(502,'ISPACE_UNREACHABLE','无法连接 iSpace，请检查校园网络或 VPN 后重试。');});
    demand(response.ok,'iSpace 暂时无法响应，请稍后重试。',502);
    const data:unknown=await response.json().catch(()=>null);
    demand(data && typeof data==='object','iSpace 未返回有效数据，可能需要校园网络或网页登录。',502);
    if(object(data).exception||object(data).errorcode)throw new ServiceError(502,'ISPACE_FUNCTION_UNAVAILABLE','iSpace 未开放这项能力或登录已失效，请重新连接；也可前往学校网站查看。');
    return data;
  }
  call(token:string,fn:string,params:Record<string,string>={}){
    return this.post('/webservice/rest/server.php',{wstoken:token,wsfunction:fn,moodlewsrestformat:'json',...params});
  }
  async login(username:string,password:string){
    const auth=object(await this.post('/login/token.php',{username,password,service:'moodle_mobile_app'}));
    demand(typeof auth.token==='string'&&auth.token.length>0,'学校账号登录失败，请核对账号密码或使用学校 SSO 登录。',401);
    const token=auth.token,info=object(await this.call(token,'core_webservice_get_site_info'));
    demand(Number.isSafeInteger(info.userid)&&Number(info.userid)>0,'学校未返回有效身份。',502);
    const users=list(await this.call(token,'core_user_get_users_by_field',{field:'id','values[0]':String(info.userid)}));
    const user=users.find(item=>Number(item.id)===Number(info.userid));
    // User-approved school identity flow: use only the authenticated own profile email.
    demand(user&&typeof user.email==='string'&&/^[^\s@]+@mail\.bnbu\.edu\.cn$/i.test(user.email),'iSpace 未提供本人学校邮箱，请使用邮箱验证码登录。',403);
    return {token,userId:Number(info.userid),email:user.email.toLowerCase(),name:plain(info.fullname).slice(0,40),functions:list(info.functions).map(item=>String(item.name))};
  }
  async courses(token:string,userId:number){return list(await this.call(token,'core_enrol_get_users_courses',{userid:String(userId)}));}
  async enrolled(token:string,userId:number,courseId:number){
    demand((await this.courses(token,userId)).some(course=>Number(course.id)===courseId),'当前学校账号未加入这门课程。',403);
  }
  async file(token:string,url:string){
    const target=new URL(url);
    demand(target.origin===ispaceOrigin&&!target.username&&!target.password&&/^\/(webservice\/)?pluginfile\.php\//.test(target.pathname),'资料地址不受支持。',400);
    target.searchParams.set('token',token);
    const response=await this.transport(target,{redirect:'error',signal:AbortSignal.timeout(20000)}).catch(()=>{throw new ServiceError(502,'FILE_UNAVAILABLE','资料读取失败，请前往 iSpace 查看。');});
    demand(response.ok,'资料读取失败。',502);
    demand(Number(response.headers.get('content-length')??0)<=10*1024*1024,'资料超过 10 MB，请在 iSpace 下载。',413);
    const reader=response.body?.getReader();demand(reader,'资料内容为空。',502);
    const chunks:Uint8Array[]=[];let size=0;
    try{while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;demand(size<=10*1024*1024,'资料超过 10 MB，请在 iSpace 下载。',413);chunks.push(item.value);}}finally{await reader.cancel();}
    return Buffer.concat(chunks);
  }
}
