import {readFile} from 'node:fs/promises';

/** A real connection is explicit. Never start or substitute a fixture here. */
export async function configureRealSportsConnection(env=process.env) {
  if(env.BNBU_SPORTS_CONNECTION_FILE){
    const config=JSON.parse(await readFile(env.BNBU_SPORTS_CONNECTION_FILE,'utf8'));
    for(const key of ['BNBU_SPORTS_BRIDGE_ORIGIN','BNBU_SPORTS_BRIDGE_SECRET','BNBU_SPORTS_WEB_ORIGIN']){
      if(typeof config[key]!=='string')throw new Error('真实体育连接配置不完整。');
      env[key]=config[key];
    }
  }
  env.BNBU_SPORTS_MODE='real';
  const origin=env.BNBU_SPORTS_BRIDGE_ORIGIN,secret=env.BNBU_SPORTS_BRIDGE_SECRET,web=env.BNBU_SPORTS_WEB_ORIGIN;
  if(!origin&&!secret&&!web){console.log('真实 BNBU Sports 连接尚未启用；不会启动模拟体育服务。');return false;}
  if(!origin||!secret||secret.length<32||!web)throw new Error('真实体育连接配置不完整。');
  const bridge=new URL(origin),target=new URL(web);
  const plainOrigin=url=>!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash;
  if(!plainOrigin(bridge)||!(bridge.protocol==='https:'||bridge.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(bridge.hostname)))throw new Error('体育内部连接须使用HTTPS或本机加密隧道入口。');
  if(!plainOrigin(target)||target.protocol!=='https:'||target.hostname!=='www.student.bnbusports.cn')throw new Error('真实体育学生端地址必须为已确认的BNBU Sports官方来源。');
  console.log('已加载真实 BNBU Sports 连接配置。');
  return true;
}
