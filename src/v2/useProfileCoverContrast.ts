import {useEffect,type RefObject} from 'react'
import {coverForeground} from './profileCoverContrast'

/** Sample the visible object-fit crop locally; no images leave the browser. */
export function useProfileCoverContrast(ref:RefObject<HTMLElement|null>,source:string|null){
  useEffect(()=>{
    const root=ref.current,image=root?.querySelector<HTMLImageElement>('.community-profile-cover>img')
    if(!root||!image)return
    const targets=Array.from(root.querySelectorAll<HTMLElement>('.community-profile-top>span,.student-utilities>a,.profile-cover-customize,.community-profile-cover>span'))
    let pixels:ImageData|null=null,frame=0,active=true
    const setTone=(element:HTMLElement,ink:string,strong=false)=>{
      const white=ink==='#ffffff'
      element.style.setProperty('--profile-cover-ink',ink)
      element.style.setProperty('--profile-cover-glass',white?`rgba(0,0,0,${strong ? .8 : .18})`:`rgba(255,255,255,${strong ? .85 : .18})`)
      element.style.setProperty('--profile-cover-edge',white?'#ffffff55':'#0000001c')
      element.dataset.coverTone=white?'light':'dark'
    }
    const paint=()=>{
      frame=0
      if(!active)return
      const box=image.getBoundingClientRect(),header=root.querySelector<HTMLElement>('.community-profile-top')
      const bg=(header?getComputedStyle(header).backgroundColor:'').match(/[\d.]+/g)?.map(Number)??[255,255,255,0]
      const alpha=bg[3]??1
      const scale=Math.max(box.width/image.naturalWidth,box.height/image.naturalHeight)
      const offsetX=(box.width-image.naturalWidth*scale)*.5,offsetY=(box.height-image.naturalHeight*scale)*.48
      for(const element of targets){
        const rect=element.getBoundingClientRect(),cx=rect.x+rect.width/2,cy=rect.y+rect.height/2
        if(cx<box.left||cx>box.right||cy<box.top||cy>box.bottom){setTone(element,document.documentElement.dataset.uiTheme==='dark'?'#ffffff':'#000000');continue}
        if(!pixels){setTone(element,'#000000',true);continue}
        const samples:number[][]=[]
        for(let y=0;y<4;y++)for(let x=0;x<6;x++){
          const px=rect.x+rect.width*(.15+.7*(x+.5)/6),py=rect.y+rect.height*(.2+.6*(y+.5)/4)
          const ix=Math.min(127,Math.max(0,Math.floor((px-box.x-offsetX)/(image.naturalWidth*scale)*128)))
          const iy=Math.min(127,Math.max(0,Math.floor((py-box.y-offsetY)/(image.naturalHeight*scale)*128)))
          const index=(iy*128+ix)*4
          const pixelAlpha=pixels.data[index+3]/255,base=document.documentElement.dataset.uiTheme==='dark'?[24,41,32]:[250,251,247]
          let rgb=[pixels.data[index],pixels.data[index+1],pixels.data[index+2]].map((value,i)=>value*pixelAlpha+base[i]*(1-pixelAlpha))
          if(element.closest('.community-profile-top'))rgb=rgb.map((value,i)=>value*(1-alpha)+bg[i]*alpha)
          samples.push(rgb)
        }
        setTone(element,coverForeground(samples))
      }
    }
    const update=()=>{if(!frame)frame=requestAnimationFrame(paint)}
    const read=()=>{
      pixels=null
      if(image.complete&&image.naturalWidth)try{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(ctx){ctx.drawImage(image,0,0,128,128);pixels=ctx.getImageData(0,0,128,128)}}catch{/* Opaque glass keeps controls readable if canvas cannot read a source. */}
      update()
    }
    image.addEventListener('load',read);image.addEventListener('error',read)
    window.addEventListener('scroll',update,{passive:true})
    const observer=new ResizeObserver(update);observer.observe(root);observer.observe(image)
    const themeObserver=new MutationObserver(update);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-ui-theme']})
    read()
    return()=>{active=false;cancelAnimationFrame(frame);observer.disconnect();themeObserver.disconnect();image.removeEventListener('load',read);image.removeEventListener('error',read);window.removeEventListener('scroll',update);for(const element of targets){element.style.removeProperty('--profile-cover-ink');element.style.removeProperty('--profile-cover-glass');element.style.removeProperty('--profile-cover-edge');delete element.dataset.coverTone}}
  },[ref,source])
}
