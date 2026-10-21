const running=new WeakMap<HTMLElement,Animation>()
export function playConfirmedState(node:HTMLElement,active:boolean,reducedMotion:boolean){
 running.get(node)?.cancel()
 running.delete(node)
 delete node.dataset.stateMotion
 if(reducedMotion||!node.animate)return()=>{}
 node.dataset.stateMotion=active?'activating':'deactivating'
 const animation=node.animate(active?[{transform:'scale(1)'},{transform:'scale(.8)',offset:.25},{transform:'scale(1.13)',offset:.7},{transform:'scale(1)'}]:[{transform:'scale(1)'},{transform:'scale(.86)',offset:.45},{transform:'scale(1)'}],{duration:active?280:220,easing:'cubic-bezier(.2,.7,.3,1)'})
 running.set(node,animation)
 const clear=()=>{if(running.get(node)===animation){delete node.dataset.stateMotion;running.delete(node)}animation.cancel()}
 void animation.finished.catch(()=>{}).finally(clear)
 return clear
}
