import {build} from 'vite';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const pg=process.argv.includes('--postgres');
if(pg&&!process.env.DATABASE_URL)throw Error('Use an isolated local PostgreSQL DATABASE_URL; each test owns and drops its random schema.');
await build({configFile:false,publicDir:false,build:{target:'node24',outDir:'.runtime/privacy-test',emptyOutDir:true,minify:false,lib:{entry:'backend/tests/privacy-integration.ts',formats:['es'],fileName:()=> 'integration.mjs'},rollupOptions:{external:id=>!id.startsWith('.')&&!id.startsWith('/')&&!id.startsWith('\0')}}});
const result=spawnSync(process.execPath,[resolve('.runtime/privacy-test/integration.mjs'),...(pg?['--postgres']:[])],{stdio:'inherit',env:process.env});process.exitCode=result.status??1;
