import fs from 'node:fs';import ts from 'typescript';
const files=fs.readdirSync('src',{recursive:true}).filter(f=>f.endsWith('.tsx')).map(f=>'src/'+f);
const visible=new Set(['title','description','placeholder','aria-label','alt','label','copy','hint','emptyLabel','eyebrow']);
for(const file of files){let source=fs.readFileSync(file,'utf8');if(!source.includes('uiTemplate')&&!source.includes('uiText'))continue;const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];
function restore(n){if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)){
 if(n.expression.text==='uiText'&&n.arguments[0]){edits.push({a:n.getStart(ast),b:n.end,text:n.arguments[0].getText(ast)});return}
 if(n.expression.text==='uiTemplate'&&ts.isArrayLiteralExpression(n.arguments[0])){const parts=n.arguments[0].elements.map(x=>x.text);const text='`'+parts.map((p,i)=>p.replaceAll('`','\\`')+(i<parts.length-1?'${'+n.arguments[i+1].getText(ast)+'}':'')).join('')+'`';edits.push({a:n.getStart(ast),b:n.end,text});return}
}ts.forEachChild(n,restore)}
function visit(n){if(ts.isJsxAttribute(n)&&!visible.has(n.name.getText(ast))){restore(n);return}ts.forEachChild(n,visit)}visit(ast);edits.sort((a,b)=>b.a-a.a);for(const e of edits)source=source.slice(0,e.a)+e.text+source.slice(e.b);if(edits.length)fs.writeFileSync(file,source);
}
