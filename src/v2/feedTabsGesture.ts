/** Vertical scrolling wins; a short flick needs both distance and horizontal velocity. */
export function feedTabFromSwipe(x:number,y:number,velocityX:number):'following'|''|null{
 if(Math.abs(x)<Math.abs(y)*1.4||Math.abs(x)<18)return null
 if(Math.abs(x)<40&&Math.abs(velocityX)<400)return null
 return x>0?'following':''
}
