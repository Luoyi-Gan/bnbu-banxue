type QrDecode=(bytes:Uint8ClampedArray,width:number,height:number,options:{inversionAttempts:string})=>{data:string}|null
let decoderPromise:Promise<QrDecode>|null=null
async function loadDecoder(){
 const qrWindow=window as unknown as {jsQR?:QrDecode}
 if(qrWindow.jsQR)return qrWindow.jsQR
 decoderPromise??=new Promise<QrDecode>((resolve,reject)=>{const script=document.createElement('script');script.src='/student/js/vendor/jsQR.js';script.onload=()=>{if(qrWindow.jsQR)resolve(qrWindow.jsQR);else{decoderPromise=null;reject(new Error('扫码组件加载失败，请输入邀请码。'))}};script.onerror=()=>{decoderPromise=null;script.remove();reject(new Error('扫码组件加载失败，请输入邀请码。'))};document.head.append(script)})
 return decoderPromise
}
export async function qrDetector(){
 const Constructor=(window as unknown as {BarcodeDetector?:new(options:{formats:string[]})=>{detect:(video:HTMLVideoElement)=>Promise<{rawValue:string}[]>}}).BarcodeDetector
 if(Constructor){try{return new Constructor({formats:['qr_code']})}catch{/* Use the bundled decoder on unsupported browsers. */}}
 const decode=await loadDecoder(),canvas=document.createElement('canvas'),context=canvas.getContext('2d',{willReadFrequently:true})
 if(!context)throw new Error('当前浏览器无法扫码，请输入邀请码。')
 return{detect:async(video:HTMLVideoElement)=>{if(video.readyState<2||!video.videoWidth)return[];const scale=Math.min(1,800/video.videoWidth);canvas.width=Math.max(1,Math.floor(video.videoWidth*scale));canvas.height=Math.max(1,Math.floor(video.videoHeight*scale));context.drawImage(video,0,0,canvas.width,canvas.height);const result=decode(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height,{inversionAttempts:'attemptBoth'});return result?[{rawValue:result.data}]:[]}}
}
