import {campusPhotographs} from './campusPhotographs'
import courtyard from '../assets/campus/campus-services.jpg'
import bicycles from '../assets/campus/gallery/bicycle-gallery.webp'

/** Existing real campus photographs, 1600–2048px wide. Exclude the 720px courtyard. */
export const campusHeroPhotographs=campusPhotographs
 .filter(photo=>photo.source!==courtyard)
 .sort((a,b)=>Number(b.source===bicycles)-Number(a.source===bicycles))
