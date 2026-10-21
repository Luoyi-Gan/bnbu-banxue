/** Increasing resistance keeps a long pull close to its resting position. */
export function resistedSheetOffset(distance:number){
 const positive=Math.max(0,distance)
 return positive/(1+positive/600)
}
export function shouldDismissSheet(distance:number,velocity:number,height:number){
 return distance>=Math.min(160,Math.max(96,height*.22))||(distance>=32&&velocity>=.65)
}
