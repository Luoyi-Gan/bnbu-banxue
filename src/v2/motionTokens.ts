/** Milliseconds; gesture springs are shared separately from timed transitions. */
export const campusMotion={
 press:120,selection:180,cardEnter:300,cardExit:220,sharedEnter:420,sharedExit:340,modal:280,list:240,stagger:36,
 confirm:280,unconfirm:220,replace:180,
 ease:'cubic-bezier(.2,.8,.2,1)',exitEase:'cubic-bezier(.4,0,.8,.2)',
 sheetSpring:{stiffness:440,damping:34,mass:.8},
} as const
