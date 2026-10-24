import type {IncomingMessage,ServerResponse} from 'node:http';
import sections from '../../../shared/privacy-policy.json';
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function servePrivacy(request:IncomingMessage,response:ServerResponse,url:URL):boolean {
 if(request.method!=='GET'||!['/privacy','/api/privacy-policy'].includes(url.pathname))return false;
 response.setHeader('Cache-Control','public, max-age=300');
 response.setHeader('X-Content-Type-Options','nosniff');
 if(url.pathname==='/api/privacy-policy'){
  response.setHeader('Content-Type','application/json; charset=utf-8');
  response.end(JSON.stringify({version:'2026-10-24',sections}));return true;
 }
 const en=url.searchParams.get('lang')==='en';
 response.setHeader('Content-Type','text/html; charset=utf-8');
 response.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
 response.end(`<!doctype html><html lang="${en?'en':'zh-CN'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${en?'Huitongli privacy policy':'会同里隐私政策'}</title><style>body{font:17px/1.8 system-ui,sans-serif;max-width:760px;margin:auto;padding:24px;color:#173d37;background:#fbfaf5}h1{font-size:30px}h2{font-size:22px;margin-top:32px}a{color:inherit}p{white-space:pre-line}</style><main><a href="?lang=${en?'zh':'en'}">${en?'中文':'English'}</a><h1>${en?'Huitongli privacy policy':'会同里隐私政策'}</h1>${sections.map(row=>`<section><h2>${escape(row[en?1:0])}</h2><p>${escape(row[en?3:2])}</p></section>`).join('')}<p><a href="mailto:siltotchen@gmail.com">siltotchen@gmail.com</a></p><a href="https://lbs.amap.com/pages/privacy/">${en?'AMap privacy policy':'高德隐私政策'}</a></main></html>`);
 return true;
}
