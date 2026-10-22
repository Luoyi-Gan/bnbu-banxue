/** Increasing resistance keeps a long pull close to its resting position. */
export function resistedSheetOffset(distance:number){
 const positive=Math.max(0,distance)
 return positive/(1+positive/600)
}
export function shouldDismissSheet(distance:number,velocity:number,height:number){
 return distance>=Math.min(160,Math.max(96,height*.22))||(distance>=32&&velocity>=.65)
}

/** Velocity is px/ms; project a short distance without letting one noisy sample skip every stop. */
export function sheetDetent(height:number,velocity:number,stops:number[]){
 const projected=height-Math.max(-1.5,Math.min(1.5,velocity))*180
 return stops.reduce((best,stop)=>Math.abs(stop-projected)<Math.abs(best-projected)?stop:best,stops[0])
}
export function resistedSheetHeight(height:number,min:number,max:number){
 if(height<min)return min-(min-height)*.16
 if(height>max)return max+(height-max)*.16
 return height
}
