import {build} from 'vite';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const bundleOnly=process.argv.includes('--bundle-only');
if(!bundleOnly&&!process.env.DATABASE_URL)throw Error('Set DATABASE_URL to a local test database. The test creates and drops its own isolated schema only.');
await build({configFile:false,publicDir:false,build:{target:'node24',outDir:'.runtime/push-test',emptyOutDir:true,minify:false,lib:{entry:'backend/tests/push-integration.ts',formats:['es'],fileName:()=> 'integration.mjs'},rollupOptions:{external:id=>!id.startsWith('.')&&!id.startsWith('/')&&!id.startsWith('\0')}}});
if(!bundleOnly){const result=spawnSync(process.execPath,[resolve('.runtime/push-test/integration.mjs')],{stdio:'inherit',env:process.env});process.exitCode=result.status??1;}
