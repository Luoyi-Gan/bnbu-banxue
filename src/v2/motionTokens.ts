/** Milliseconds; gesture springs are shared separately from timed transitions. */
export const campusMotion={
 press:110,release:200,selection:220,cardEnter:300,cardExit:220,sharedEnter:420,sharedExit:340,modal:280,list:280,stagger:32,
 confirm:280,unconfirm:220,replace:180,
 ease:'cubic-bezier(.2,.8,.2,1)',exitEase:'cubic-bezier(.4,0,.8,.2)',
 selectionSpring:{stiffness:520,damping:38,mass:.8},
 layoutSpring:{type:'spring',stiffness:400,damping:36,mass:1},
 sheetSpring:{stiffness:440,damping:38,mass:.9},
 scrollSpring:{stiffness:200,damping:30,mass:.7},
} as const
