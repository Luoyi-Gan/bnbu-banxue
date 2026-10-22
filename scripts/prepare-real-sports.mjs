import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

// Produce an inspectable candidate only. This script never connects to a database or deploys.
const sports=resolve(process.env.BNBU_LOCAL_SPORTS_ROOT??'../new_version');
const out=resolve('.runtime/sports-real-candidate');
const {default:ts}=await import(pathToFileURL(join(sports,'backend/node_modules/typescript/lib/typescript.js')).href);
const digest=data=>createHash('sha256').update(data).digest('hex');
const entries=[];
async function save(path,data){await mkdir(resolve(out,path,'..'),{recursive:true});await writeFile(join(out,path),data);entries.push({path,sha256:digest(data)});}
const compile=(text,fileName)=>ts.transpileModule(text,{fileName,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2023,experimentalDecorators:true,emitDecoratorMetadata:true}}).outputText;
for(const file of ['main','protocol','runtime.module','server','service']){
  let source=await readFile(join(sports,`backend/src/companion-bridge/${file}.ts`),'utf8');
  if(file==='main')source="import './session-extension.js';\n"+source;
  await save(`dist/companion-bridge/${file}.js`,compile(source,`${file}.ts`));
}
// Add the exact reviewed session method to the isolated bridge process only.
// The existing backend image's AuthService and course processing stay in place.
const auth=await readFile(join(sports,'backend/src/modules/auth/auth.service.ts'),'utf8');
const ast=ts.createSourceFile('auth.ts',auth,ts.ScriptTarget.Latest,true);
const cls=ast.statements.find(node=>ts.isClassDeclaration(node)&&node.name?.text==='AuthService');
const method=cls?.members.find(node=>node.name?.getText(ast)==='establishCompanionSession');
if(!method)throw Error('Reviewed companion session method missing');
const adapter=`import {AuthService} from '../modules/auth/auth.service.js';\nimport {ApplicationError} from '../common/errors/application-error.js';\nclass Extension {${method.getText(ast)}}\nif(typeof AuthService.prototype.establishStudentSession!=='function')throw new Error('Incompatible deployed Sports authentication');\nif(typeof AuthService.prototype.establishCompanionSession!=='undefined')throw new Error('Existing companion authentication requires review');\nAuthService.prototype.establishCompanionSession=Extension.prototype.establishCompanionSession;\n`;
await save('dist/companion-bridge/session-extension.js',compile(adapter,'session-extension.ts'));
await save('schema.sql',await readFile(join(sports,'tools/companion-bridge/schema.sql'),'utf8'));
for(const file of ['companion.html','personal.html','js/companion-entry.js','js/companion-entry-paths.js','js/personal-motion.js','js/personal-motion-api.js']){
  await save('web/student/'+file,await readFile(join(sports,'BNBU-Sports-Web-new/frontend/student',file),'utf8'));
}
await save('Dockerfile',`ARG SPORTS_BASE_IMAGE=bnbu-companion-bridge-base:20261022\nFROM \${SPORTS_BASE_IMAGE}\nCOPY --chown=10001:10001 dist/companion-bridge /app/dist/companion-bridge\nCMD ["node","dist/companion-bridge/main.js"]\n`);
await save('verify-production.py',await readFile('scripts/real-sports/verify-production.py','utf8'));
await save('nginx-bridge.conf',`# Include in the existing student HTTPS server after reviewing allowed parent origins.\nlocation = /api/companion-bridge/handoff {\n proxy_pass http://127.0.0.1:4180;\n proxy_set_header Host $host;\n client_max_body_size 16k;\n add_header Cache-Control no-store always;\n}\nlocation = /api/companion-bridge/personal {\n proxy_pass http://127.0.0.1:4180;\n proxy_set_header Host $host;\n client_max_body_size 16k;\n add_header Cache-Control no-store always;\n}\n# /internal/companion-sports must remain unreachable from the public network.\n# For this local preview use SSH -L 4180:127.0.0.1:4180 to the production loopback bridge.\n`);
await writeFile(join(out,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),baselineRelease:'resource-guard-20261020',files:entries,authMethodSha256:digest(method.getText(ast)),activation:false},null,2));
console.log(`Prepared ${entries.length} hashed files in ${out}; production activation not performed.`);
