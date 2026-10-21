export function parseSportsInvite(value:string,webOrigin:string):string{
 const raw=value.trim();if(!raw||raw.length>2048)throw new Error('请输入邀请码，或扫描老师提供的入班二维码。');
 if(/^[A-Za-z0-9][A-Za-z0-9._~-]{15,199}$/.test(raw))return raw;
 let url:URL;try{url=new URL(raw)}catch{throw new Error('无法识别邀请码，请检查后重试。')}
 if(url.origin!==new URL(webOrigin).origin||url.username||url.password)throw new Error('请使用原体育平台提供的入班二维码。');
 const token=url.searchParams.get('invite')??url.searchParams.get('invitationCode')??url.searchParams.get('token')??(/^\/(?:join|course-invitations)\/([A-Za-z0-9._~-]+)(?:\/join)?\/?$/.exec(url.pathname)?.[1]);
 if(!token||!/^[A-Za-z0-9][A-Za-z0-9._~-]{15,199}$/.test(token))throw new Error('二维码中没有有效邀请码，请向老师获取新的二维码。');
 return token;
}
