import {currentUiLanguage,useDevicePreferences} from './devicePreferences'
import english from './uiEnglish.json'
const catalog:Record<string,string>=english
export function useUiLanguage(){return useDevicePreferences().language}
export function uiLocale(){return currentUiLanguage()==='en'?'en-GB':'zh-CN'}
/** Translate only interface output. Stored values, comparisons and user content retain their original values. */
export function uiText<T>(text:T):T {
  if(typeof text!=='string'||currentUiLanguage()!=='en')return text
  const trimmed=text.trim()
  const translated=catalog[trimmed]
  return (translated===undefined?text:text.replace(trimmed,translated)) as T
}
export function uiTemplate(parts:string[],...values:unknown[]){
  const key=parts.map((part,i)=>part+(i<parts.length-1?`{${i}}`:'')).join('')
  return uiText(key).replace(/\{(\d+)\}/g,(_,i:string)=>String(values[Number(i)]??''))
}
