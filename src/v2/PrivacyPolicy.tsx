import {useSettingsLanguage} from './settingsTranslations'
import {Link} from 'react-router-dom'
import {saveDevicePreferences,useDevicePreferences} from './devicePreferences'
import sections from '../../shared/privacy-policy.json'
export function PrivacyPolicy(){
  const device=useDevicePreferences(),en=device.language==='en'
  return <article className="settings-policy"><p>{en?'Updated: 24 October 2026':'更新日期：2026年10月24日'}</p>{sections.map(([zhTitle,enTitle,zh,enCopy])=><section key={zhTitle}><h2>{en?enTitle:zhTitle}</h2><p>{en?enCopy:zh}</p></section>)}<p><a href="mailto:siltotchen@gmail.com">siltotchen@gmail.com</a> · <a href="https://lbs.amap.com/pages/privacy/">{en?'AMap privacy policy':'高德隐私政策'}</a></p></article>
}
export function PublicPrivacyPage(){
  const t=useSettingsLanguage(),device=useDevicePreferences()
  return <div className="v2-app v2-app-student settings-public-policy"><main className="v2-page settings-page"><header className="settings-heading"><Link to="/v2/login">{device.language==='en'?'Back':'返回'}</Link><h1>{t('隐私政策')}</h1><button className="settings-language-shortcut" type="button" onClick={()=>saveDevicePreferences({language:device.language==='en'?'zh':'en'})}>{device.language==='en'?'中文':'English'}</button></header><PrivacyPolicy/>{device.error&&<p role="alert">{t('当前浏览器无法保存偏好，请检查存储权限后重试。')}</p>}</main></div>
}
