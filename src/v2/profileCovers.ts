import {campusPhotographs} from './campusPhotographs'
import walkway from '../assets/campus/night-walkway.jpg'
import type {ProfileCoverChoice} from '../../shared/v2/profileCover'

export const profileCovers:{key:ProfileCoverChoice;label:string;image:string}[]=[
  {key:'campus',label:'绿荫校园',image:campusPhotographs[0].source},
  {key:'evening',label:'黄昏水岸',image:campusPhotographs[1].source},
  {key:'walkway',label:'夜间步道',image:walkway},
  {key:'services',label:'校园空间',image:campusPhotographs[2].source},
  {key:'lakeside',label:'湖畔远山',image:campusPhotographs[3].source},
  {key:'flowers',label:'花木与光',image:campusPhotographs[4].source},
]
export function profileCoverSource(cover:unknown,fallback='lakeside'){
  return typeof cover==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(cover)?cover:profileCovers.find(item=>item.key===(cover||fallback))?.image||profileCovers[4].image
}
