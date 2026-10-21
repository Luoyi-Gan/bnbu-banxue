import { useSyncExternalStore } from 'react'

export interface DevicePreferences {
  language:'system'|'zh'|'en'
  theme:'system'|'light'|'dark'
  textSize:'standard'|'large'
  reduceMotion:boolean
  photoAutoplay:boolean
  timetableShortcut:boolean
}
export const defaultDevicePreferences:DevicePreferences={language:'system',theme:'system',textSize:'standard',reduceMotion:false,photoAutoplay:true,timetableShortcut:true}
export const devicePreferencesKey='huitongli.device-preferences.v1'
export function parseDevicePreferences(raw:string|null):DevicePreferences {
  try {
    const data:unknown=JSON.parse(raw||'{}')
    if(!data||typeof data!=='object')return {...defaultDevicePreferences}
    const p=data as Record<string,unknown>
    return {language:p.language==='zh'||p.language==='en'?p.language:'system',theme:p.theme==='light'||p.theme==='dark'?p.theme:'system',textSize:p.textSize==='large'?'large':'standard',reduceMotion:p.reduceMotion===true,photoAutoplay:p.photoAutoplay!==false,timetableShortcut:p.timetableShortcut!==false}
  } catch {return {...defaultDevicePreferences}}
}
function read(){try{return parseDevicePreferences(localStorage.getItem(devicePreferencesKey))}catch{return {...defaultDevicePreferences}}}
function environment(){const media=(query:string)=>typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia(query).matches;return {systemDark:media('(prefers-color-scheme:dark)'),systemReduced:media('(prefers-reduced-motion:reduce)'),systemEnglish:typeof navigator!=='undefined'&&navigator.language.toLowerCase().startsWith('en')}}
let snapshot={preferences:read(),...environment(),error:false}
export function currentUiLanguage():'zh'|'en'{return snapshot.preferences.language==='system'?(snapshot.systemEnglish?'en':'zh'):snapshot.preferences.language}
export function deviceAppearance(){return {language:currentUiLanguage(),theme:snapshot.preferences.theme==='system'?(snapshot.systemDark?'dark':'light'):snapshot.preferences.theme,textSize:snapshot.preferences.textSize,reducedMotion:snapshot.preferences.reduceMotion||snapshot.systemReduced}}
const listeners=new Set<()=>void>()
let cleanupEnvironment:(()=>void)|undefined
function emit(){listeners.forEach(listener=>listener())}
function subscribe(listener:()=>void){
  listeners.add(listener)
  if(listeners.size>1||typeof window==='undefined')return()=>{listeners.delete(listener);if(!listeners.size){cleanupEnvironment?.();cleanupEnvironment=undefined}}
  const dark=window.matchMedia('(prefers-color-scheme:dark)'),motion=window.matchMedia('(prefers-reduced-motion:reduce)')
  const updateEnvironment=()=>{snapshot={...snapshot,...environment()};emit()}
  const storage=(event:StorageEvent)=>{if(event.key===devicePreferencesKey||event.key===null){snapshot={...snapshot,preferences:read(),error:false};emit()}}
  dark.addEventListener('change',updateEnvironment);motion.addEventListener('change',updateEnvironment)
  window.addEventListener('languagechange',updateEnvironment);window.addEventListener('storage',storage)
  cleanupEnvironment=()=>{dark.removeEventListener('change',updateEnvironment);motion.removeEventListener('change',updateEnvironment);window.removeEventListener('languagechange',updateEnvironment);window.removeEventListener('storage',storage)}
  return()=>{listeners.delete(listener);if(!listeners.size){cleanupEnvironment?.();cleanupEnvironment=undefined}}
}
export const subscribeDevicePreferences=subscribe
export function saveDevicePreferences(patch:Partial<DevicePreferences>){
  const next=parseDevicePreferences(JSON.stringify({...snapshot.preferences,...patch}))
  try{localStorage.setItem(devicePreferencesKey,JSON.stringify(next));snapshot={...snapshot,preferences:next,error:false};emit();return true}
  catch{snapshot={...snapshot,error:true};emit();return false}
}
export function useDevicePreferences(){
  const state=useSyncExternalStore(subscribe,()=>snapshot,()=>snapshot)
  const language=state.preferences.language==='system'?(state.systemEnglish?'en':'zh'):state.preferences.language
  const theme=state.preferences.theme==='system'?(state.systemDark?'dark':'light'):state.preferences.theme
  return {...state,language,theme,reducedMotion:state.preferences.reduceMotion||state.systemReduced}
}
