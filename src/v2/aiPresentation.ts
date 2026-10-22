export type AISource={id?:string;title:string;source:string;reference?:number}
export type AIAnswer={id:string;question:string;body:string;sources:AISource[];createdAt:string;conversationId?:string;previousAnswerId?:string;coverage?:import('../../shared/v2/aiKnowledge').AIKnowledgeCoverage}
export type AIBlock={type:'paragraph'|'heading'|'quote'|'code'|'list'|'table';text?:string;level?:number;language?:string;ordered?:boolean;items?:string[];rows?:string[][]}

/** Accept platform navigation and explicit HTTPS sources; never interpret model HTML. */
export function safeAIHref(value:string){
 if(/^\/v2(?:\/|\?|$)/.test(value)&&!/[\\\s]/.test(value)&&![...value].some(c=>c.charCodeAt(0)<32))return value
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null}catch{return null}
}
export function aiBlocks(body:string):AIBlock[]{
 const lines=body.replace(/\r\n?/g,'\n').split('\n'),blocks:AIBlock[]=[]
 const cells=(line:string)=>line.trim().replace(/^\||\|$/g,'').split('|').map(cell=>cell.trim())
 const special=(line:string)=>/^\s*(```|#{1,4}\s|>\s?|[-*+]\s|\d+[.)]\s)/.test(line)
 for(let i=0;i<lines.length;){
  const line=lines[i];if(!line.trim()){i++;continue}
  if(/^\s*```/.test(line)){const language=line.trim().slice(3).trim().slice(0,30),code:string[]=[];i++;while(i<lines.length&&!/^\s*```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;blocks.push({type:'code',language,text:code.join('\n')});continue}
  const heading=line.match(/^\s*(#{1,4})\s+(.+)$/);if(heading){blocks.push({type:'heading',level:heading[1].length,text:heading[2]});i++;continue}
  if(line.includes('|')&&i+1<lines.length&&cells(lines[i+1]).every(c=>/^:?-{3,}:?$/.test(c))){const rows=[cells(line)];i+=2;while(i<lines.length&&lines[i].includes('|')&&lines[i].trim())rows.push(cells(lines[i++]));blocks.push({type:'table',rows});continue}
  const list=line.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);if(list){const ordered=/\d/.test(list[1]),items:string[]=[];while(i<lines.length){const match=lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);if(!match||/\d/.test(match[1])!==ordered)break;items.push(match[2]);i++}blocks.push({type:'list',ordered,items});continue}
  if(/^\s*>/.test(line)){const quote:string[]=[];while(i<lines.length&&/^\s*>/.test(lines[i]))quote.push(lines[i++].replace(/^\s*>\s?/,''));blocks.push({type:'quote',text:quote.join('\n')});continue}
  const paragraph=[line];i++;while(i<lines.length&&lines[i].trim()&&!special(lines[i])&&!(lines[i].includes('|')&&i+1<lines.length&&cells(lines[i+1]).every(c=>/^:?-{3,}:?$/.test(c))))paragraph.push(lines[i++]);blocks.push({type:'paragraph',text:paragraph.join('\n')})
 }
 return blocks
}
export const nearAILatest=(scrollTop:number,clientHeight:number,scrollHeight:number)=>scrollHeight-scrollTop-clientHeight<90
