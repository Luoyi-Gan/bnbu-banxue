// Moving a card between masonry columns remounts its image component.
// Keep successful cover measurements so it does not replay a skeleton or change crop.
const covers=new Map<string,number>()
export function knownCoverRatio(src:string|undefined){return src?covers.get(src):undefined}
export function rememberCover(src:string,ratio:number){
 if(!Number.isFinite(ratio)||ratio<=0)return
 covers.set(src,Math.max(.7,Math.min(1.5,ratio)))
 if(covers.size>128)covers.delete(covers.keys().next().value!)
}
