import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

/** Run the existing isolated Sports fixture; never connect this launcher to production. */
export async function startLocalSportsPreview() {
  if (process.env.BNBU_LOCAL_OUTBOX !== '1' || !['data/browser-acceptance.sqlite','.runtime/learning-preview.sqlite'].some(path=>resolve(process.env.BNBU_DATABASE ?? '')===resolve(path)) || !['127.0.0.1','localhost','::1'].includes(process.env.BNBU_API_HOST ?? '127.0.0.1') || !['127.0.0.1','localhost','::1'].includes(process.env.BNBU_WEB_HOST ?? '127.0.0.1')) throw new Error('本地运动预览仅支持loopback上的独立验收数据库及本地邮件箱。');
  const root = resolve(process.env.BNBU_LOCAL_SPORTS_ROOT ?? '../new_version');
  const entry = resolve(root, 'tools/companion-bridge/local-preview.mts');
  const loader = resolve(root, 'backend/node_modules/tsx/dist/loader.mjs');
  const pglite = resolve(root, 'backend/node_modules/@electric-sql/pglite/dist/index.js');
  if (![entry,loader,pglite].every(existsSync)) throw new Error('缺少原体育平台本地验收依赖，请检查BNBU_LOCAL_SPORTS_ROOT及其backend依赖。');
  const secret = randomBytes(32).toString('base64url');
  const child = spawn(process.execPath, ['--import',pathToFileURL(loader).href,entry], {
    cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe'],
    env:{PATH:process.env.PATH,SYSTEMROOT:process.env.SYSTEMROOT,TEMP:process.env.TEMP,TMP:process.env.TMP,APP_ENV:'local',COMPANION_BRIDGE_TEST_ONLY:'1',COMPANION_BRIDGE_SECRET:secret,BNBU_PGLITE_TEST_MODULE:pglite},
  });
  try {
    await new Promise((done,reject) => {
      const timeout=setTimeout(()=>reject(new Error('本地体育测试桥启动超时。')),30000);
      const exited=()=>{clearTimeout(timeout);reject(new Error('本地体育测试桥已退出。'));};
      child.once('error',error=>{clearTimeout(timeout);reject(error);});child.once('exit',exited);
      child.stdout.on('data',part=>{if(String(part).includes('Local movement acceptance fixture:')){clearTimeout(timeout);child.off('exit',exited);done();}});
      child.stderr.on('data',part=>process.stderr.write(part));
    });
  } catch(error) {child.kill();throw error;}
  process.env.BNBU_SPORTS_BRIDGE_ORIGIN='http://127.0.0.1:4180';
  process.env.BNBU_SPORTS_BRIDGE_SECRET=secret;
  process.env.BNBU_SPORTS_WEB_ORIGIN='http://127.0.0.1:4178';
  console.log('本地运动预览已连接：模拟新账号目录，个人运动使用独立内存测试库。');
  return child;
}
