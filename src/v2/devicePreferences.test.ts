import {beforeAll,describe,expect,it,vi} from 'vitest'
import catalog from './uiEnglish.json'
let preferences:typeof import('./devicePreferences')
let language:typeof import('./uiLanguage')
const stored=new Map<string,string>()
let failStorage=false
beforeAll(async()=>{
  vi.stubGlobal('localStorage',{getItem:(key:string)=>stored.get(key)??null,setItem:(key:string,value:string)=>{if(failStorage)throw new Error('storage full');stored.set(key,value)}})
  vi.stubGlobal('navigator',{language:'zh-CN'})
  vi.stubGlobal('window',{matchMedia:()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}),addEventListener:vi.fn(),removeEventListener:vi.fn()})
  preferences=await import('./devicePreferences')
  language=await import('./uiLanguage')
})
describe('device preferences',()=>{
  it('recovers malformed, old or invalid values without enabling unexpected settings',()=>{
    expect(preferences.parseDevicePreferences('{broken')).toEqual(preferences.defaultDevicePreferences)
    expect(preferences.parseDevicePreferences('{"language":"fr","theme":"purple","textSize":"huge","reduceMotion":"yes","photoAutoplay":false}')).toEqual({...preferences.defaultDevicePreferences,photoAutoplay:false})
  })
  it('persists language and display changes without erasing other preferences',()=>{
    expect(preferences.saveDevicePreferences({language:'en',photoAutoplay:false})).toBe(true)
    expect(preferences.saveDevicePreferences({theme:'dark',textSize:'large'})).toBe(true)
    expect(preferences.parseDevicePreferences(stored.get(preferences.devicePreferencesKey)!)).toMatchObject({language:'en',theme:'dark',textSize:'large',photoAutoplay:false})
    expect(language.uiText('学期进度')).toBe('Semester progress')
    expect(language.uiTemplate(['第 ',' 张，共 ',' 张校园照片'],3,12)).toBe('Campus photo 3 of 12')
    expect(language.uiText('王同学的自定义活动')).toBe('王同学的自定义活动')
    expect(language.uiTemplate(['','封面'],'运动')).toBe('运动 cover')
  })
  it('does not report or apply a preference that failed to save',()=>{
    failStorage=true
    expect(preferences.saveDevicePreferences({language:'zh'})).toBe(false)
    expect(preferences.currentUiLanguage()).toBe('en')
    failStorage=false
    expect(preferences.saveDevicePreferences({language:'zh'})).toBe(true)
    expect(language.uiText('学期进度')).toBe('学期进度')
  })
})
describe('UI catalogue integrity',()=>{
  it('retains every interpolation placeholder and contains no tokenizer artifacts',()=>{
    for(const [source,translation] of Object.entries(catalog)){
      expect(translation,source).not.toMatch(/▁|_Other Organiser|%s/)
      expect([...translation.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort(),source).toEqual([...source.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort())
    }
  })
})
