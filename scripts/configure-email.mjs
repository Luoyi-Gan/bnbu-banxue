import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

export const aoksendEndpoint='https://apiv2.aoksend.com/index/api/send_email';
export async function configureEmailDelivery(env=process.env){
 const file=env.BNBU_EMAIL_CONNECTION_FILE||(env.LOCALAPPDATA?join(env.LOCALAPPDATA,'BNBU-Companion','Email','connection.json'):undefined);
 let config={};
 if(file){
  try{config=JSON.parse(await readFile(file,'utf8'))}catch(error){if(env.BNBU_EMAIL_CONNECTION_FILE||error.code!=='ENOENT')throw new Error('无法读取受保护的邮件配置。')}
 }
 if(!config||typeof config!=='object'||Array.isArray(config))throw new Error('邮件配置格式无效。');
 const keys=['BNBU_EMAIL_PROVIDER','BNBU_EMAIL_DELIVERY_URL','BNBU_AOKSEND_APP_KEY','BNBU_AOKSEND_TEMPLATE_ID','BNBU_AOKSEND_CODE_VARIABLE','BNBU_AOKSEND_LOGIN_TEMPLATE_ID','BNBU_AOKSEND_DELETION_TEMPLATE_ID'];
 const values=Object.fromEntries(keys.map(key=>[key,env[key]!==undefined?env[key]:config[key]]));
 if(!keys.some(key=>values[key]))return false;
 if(keys.some(key=>values[key]!==undefined&&typeof values[key]!=='string'))throw new Error('邮件配置格式无效。');
 if(values.BNBU_EMAIL_PROVIDER!=='aoksend'||values.BNBU_EMAIL_DELIVERY_URL!==aoksendEndpoint||!values.BNBU_AOKSEND_APP_KEY||!values.BNBU_AOKSEND_TEMPLATE_ID||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(values.BNBU_AOKSEND_CODE_VARIABLE||''))throw new Error('AoKSend 邮件配置不完整或地址无效。');
 for(const key of keys)if(values[key]!==undefined)env[key]=values[key];
 env.BNBU_LOCAL_OUTBOX='0';
 return true;
}
