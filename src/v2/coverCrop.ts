export const clampCover=(value:number)=>Math.max(0,Math.min(1,value))
export function coverCrop(width:number,height:number,aspect:number,zoom:number,x:number,y:number){
  const sw=Math.min(width,height*aspect)/Math.max(1,zoom),sh=sw/aspect
  return {sx:(width-sw)*clampCover(x),sy:(height-sh)*clampCover(y),sw,sh}
}
