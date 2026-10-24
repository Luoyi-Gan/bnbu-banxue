import {afterEach,expect,it} from 'vitest';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {configureEmailDelivery,aoksendEndpoint} from '../scripts/configure-email.mjs';
const paths=[];
afterEach(async()=>{for(const path of paths.splice(0))await rm(path,{recursive:true,force:true})});
const config={BNBU_EMAIL_PROVIDER:'aoksend',BNBU_EMAIL_DELIVERY_URL:aoksendEndpoint,BNBU_AOKSEND_APP_KEY:'test-key',BNBU_AOKSEND_TEMPLATE_ID:'test-template',BNBU_AOKSEND_CODE_VARIABLE:'code',BNBU_AOKSEND_LOGIN_TEMPLATE_ID:'test-login-template',BNBU_AOKSEND_DELETION_TEMPLATE_ID:'test-deletion-template'};
it('未配置时不伪装为真实发信',async()=>{const env={BNBU_LOCAL_OUTBOX:'1'};expect(await configureEmailDelivery(env)).toBe(false);expect(env.BNBU_LOCAL_OUTBOX).toBe('1')});
it('从指定私有文件载入配置并关闭本地收件箱',async()=>{const path=await mkdtemp(join(tmpdir(),'bnbu-email-'));paths.push(path);const file=join(path,'connection.json');await writeFile(file,JSON.stringify(config));const env={BNBU_EMAIL_CONNECTION_FILE:file,BNBU_LOCAL_OUTBOX:'1'};expect(await configureEmailDelivery(env)).toBe(true);expect(env.BNBU_LOCAL_OUTBOX).toBe('0');expect(env.BNBU_AOKSEND_LOGIN_TEMPLATE_ID).toBe('test-login-template');expect(env.BNBU_AOKSEND_DELETION_TEMPLATE_ID).toBe('test-deletion-template')});
it('无效地址或不完整配置失败关闭，错误不暴露密钥',async()=>{await expect(configureEmailDelivery({...config,BNBU_EMAIL_DELIVERY_URL:'https://other.example/send'})).rejects.toThrow('地址无效');await expect(configureEmailDelivery({...config,BNBU_AOKSEND_APP_KEY:''})).rejects.toThrow('不完整')});

it('注销模板可由环境覆盖，显式空值不会偷偷恢复文件中的模板',async()=>{
 const path=await mkdtemp(join(tmpdir(),'bnbu-email-'));paths.push(path);const file=join(path,'connection.json');await writeFile(file,JSON.stringify(config));
 const env={BNBU_EMAIL_CONNECTION_FILE:file,BNBU_AOKSEND_DELETION_TEMPLATE_ID:'deployment-deletion'};
 expect(await configureEmailDelivery(env)).toBe(true);expect(env.BNBU_AOKSEND_DELETION_TEMPLATE_ID).toBe('deployment-deletion');
 const disabled={BNBU_EMAIL_CONNECTION_FILE:file,BNBU_AOKSEND_DELETION_TEMPLATE_ID:''};
 expect(await configureEmailDelivery(disabled)).toBe(true);expect(disabled.BNBU_AOKSEND_DELETION_TEMPLATE_ID).toBe('');
 await expect(configureEmailDelivery({BNBU_EMAIL_CONNECTION_FILE:file,BNBU_AOKSEND_APP_KEY:''})).rejects.toThrow('不完整');
});
it('旧配置仍可用于登录，但不会替注销用途补造模板；错误类型拒绝载入',async()=>{
 const legacy={...config};delete legacy.BNBU_AOKSEND_DELETION_TEMPLATE_ID;
 expect(await configureEmailDelivery(legacy)).toBe(true);expect(legacy.BNBU_AOKSEND_DELETION_TEMPLATE_ID).toBeUndefined();
 await expect(configureEmailDelivery({...config,BNBU_AOKSEND_DELETION_TEMPLATE_ID:42})).rejects.toThrow('格式无效');
});
