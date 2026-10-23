import {test} from 'vitest';
import assert from 'node:assert/strict';
import {configureRealSportsConnection} from '../scripts/real-sports-connection.mjs';
const config=()=>({BNBU_SPORTS_BRIDGE_ORIGIN:'http://127.0.0.1:4190',BNBU_SPORTS_BRIDGE_SECRET:'s'.repeat(40),BNBU_SPORTS_WEB_ORIGIN:'https://www.student.bnbusports.cn'});
test('missing real connection never enables a fixture',async()=>{const env={};assert.equal(await configureRealSportsConnection(env),false);assert.equal(env.BNBU_SPORTS_MODE,'real');assert.equal(env.BNBU_LOCAL_SPORTS_ACCEPTANCE,undefined)});
test('real origin accepts a loopback SSH tunnel',async()=>assert.equal(await configureRealSportsConnection(config()),true));
test('refuse public plaintext bridge and fixture student origins',async()=>{for(const key of ['BNBU_SPORTS_BRIDGE_ORIGIN','BNBU_SPORTS_WEB_ORIGIN']){const env=config();env[key]=key.endsWith('WEB_ORIGIN')?'http://127.0.0.1:4178':'http://public.test';await assert.rejects(configureRealSportsConnection(env))}});
test('refuse partial secrets and credential-bearing addresses',async()=>{for(const change of [{BNBU_SPORTS_BRIDGE_SECRET:'short'},{BNBU_SPORTS_BRIDGE_ORIGIN:'https://user:password@bridge.test'},{BNBU_SPORTS_WEB_ORIGIN:'https://www.student.bnbusports.cn/extra'}])await assert.rejects(configureRealSportsConnection({...config(),...change}))});
