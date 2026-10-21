import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';
const files=fs.readdirSync('src/v2',{recursive:true}).filter(f=>f.endsWith('.tsx')&&!f.includes('.test.')&&!['SettingsPage.tsx','PrivacyPolicy.tsx'].includes(f)).map(f=>'src/v2/'+f);
files.push(...fs.readdirSync('src/live').filter(f=>f.endsWith('.tsx')&&f.startsWith('Sports')).map(f=>'src/live/'+f));
const strings=new Set(JSON.parse(fs.readFileSync('design/settings-complete/ui-strings.json','utf8'))), editsReport=[];
const hasZh=s=>/[\u4e00-\u9fff]/.test(s);
for(const file of files){
 let source=fs.readFileSync(file,'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const edits=[];const imports=new Set();const components=new Set();
 function renderExpression(n){
  if(ts.isStringLiteral(n)&&hasZh(n.text)){strings.add(n.text);imports.add('uiText');return `uiText(${n.getText(ast)})`;}
  if(ts.isNoSubstitutionTemplateLiteral(n)&&hasZh(n.text)){strings.add(n.text);imports.add('uiText');return `uiText(${n.getText(ast)})`;}
  if(ts.isTemplateExpression(n)&&hasZh(n.getText(ast))){let parts=[n.head.text,...n.templateSpans.map(s=>s.literal.text)];let key=parts.map((p,i)=>p+(i<parts.length-1?`{${i}}`:'')).join('');strings.add(key);imports.add('uiTemplate');return `uiTemplate(${JSON.stringify(parts)},${n.templateSpans.map(s=>s.expression.getText(ast)).join(',')})`;}
  if(ts.isConditionalExpression(n)){const a=renderExpression(n.whenTrue),b=renderExpression(n.whenFalse);return a===n.whenTrue.getText(ast)&&b===n.whenFalse.getText(ast)?n.getText(ast):`${n.condition.getText(ast)}?${a}:${b}`;}
  if(ts.isBinaryExpression(n)&&[ts.SyntaxKind.BarBarToken,ts.SyntaxKind.QuestionQuestionToken].includes(n.operatorToken.kind)){return `${n.left.getText(ast)} ${n.operatorToken.getText(ast)} ${renderExpression(n.right)}`;}
  // UI labels are translated on output. Names, titles, bodies, messages and other user content are not rewritten.
  if((ts.isIdentifier(n)&&/^(label|copy|statusLabel|hint|emptyLabel|detailLabel)$/.test(n.text))||(ts.isPropertyAccessExpression(n)&&/^(label|statusLabel|copy|hint)$/.test(n.name.text))){imports.add('uiText');return `uiText(${n.getText(ast)})`;}
  return n.getText(ast);
 }
 function visit(n){
  if(ts.isJsxAttribute(n)&&!['title','description','placeholder','aria-label','alt','label','copy','hint','emptyLabel','eyebrow','detail','action','actions'].includes(n.name.getText(ast)))return;
  if(ts.isJsxText(n)&&hasZh(n.text)){const text=n.text.replace(/\s+/g,' ').trim();strings.add(text);imports.add('uiText');edits.push({a:n.getStart(ast),b:n.end,text:`{uiText(${JSON.stringify(text)})}`});return;}
  if(ts.isJsxExpression(n)&&n.expression){const before=n.expression.getText(ast),after=renderExpression(n.expression);if(before!==after){edits.push({a:n.expression.getStart(ast),b:n.expression.end,text:after});return;}}
  if(ts.isJsxAttribute(n)&&['title','description','placeholder','aria-label','alt','label','copy','hint','emptyLabel','eyebrow','detail','action','actions'].includes(n.name.getText(ast))&&n.initializer&&ts.isStringLiteral(n.initializer)&&hasZh(n.initializer.text)){strings.add(n.initializer.text);imports.add('uiText');edits.push({a:n.initializer.getStart(ast),b:n.initializer.end,text:`{uiText(${n.initializer.getText(ast)})}`});return;}
  if(ts.isFunctionDeclaration(n)&&n.name&&/^[A-Z]/.test(n.name.text)&&n.body){let hasJsx=false;function scan(c){if(ts.isJsxElement(c)||ts.isJsxSelfClosingElement(c)||ts.isJsxFragment(c))hasJsx=true;ts.forEachChild(c,scan)}scan(n.body);if(hasJsx)components.add(n.body.getStart(ast)+1);}
  if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&/^[A-Z]/.test(n.name.text)&&n.initializer&&ts.isArrowFunction(n.initializer)&&ts.isBlock(n.initializer.body))components.add(n.initializer.body.getStart(ast)+1);
  ts.forEachChild(n,visit);
 }
 visit(ast);
 if(!edits.length)continue;
 if(!source.includes('useUiLanguage();')){imports.add('useUiLanguage');for(const a of components)edits.push({a,b:a,text:' useUiLanguage(); '});}
 edits.sort((a,b)=>b.a-a.a);for(const e of edits)source=source.slice(0,e.a)+e.text+source.slice(e.b);
 const rel=path.relative(path.dirname(file),'src/v2/uiLanguage').replaceAll('\\','/');const existing=source.match(/import \{([^}]+)\} from '[^']*uiLanguage'/);if(existing){const names=new Set([...existing[1].split(',').map(x=>x.trim()),...imports]);source=source.replace(existing[0],`import { ${[...names].join(', ')} } from '${rel.startsWith('.')?rel:'./'+rel}'`)}else source=`import { ${[...imports].join(', ')} } from '${rel.startsWith('.')?rel:'./'+rel}'\n`+source;
 fs.writeFileSync(file,source);editsReport.push({file,replacements:edits.length});
 // Constant UI labels and status labels enter the catalogue without changing business values.
 function collect(n){if(ts.isStringLiteral(n)&&hasZh(n.text))strings.add(n.text);ts.forEachChild(n,collect)}collect(ast);
}
fs.writeFileSync('design/settings-complete/ui-strings.json',JSON.stringify([...strings].sort(),null,2));fs.writeFileSync('design/settings-complete/localization-report.json',JSON.stringify(editsReport,null,2));console.log({files:editsReport.length,strings:strings.size});
