import { uiText, useUiLanguage } from '../uiLanguage'
import { useWorkspaceBackend } from '../useWorkspaceBackend'
import { isLocalPreview } from './localPreview'

export function LocalPreviewNotice() { useUiLanguage();
  const live=useWorkspaceBackend()
  if (!live.data || !isLocalPreview(live.data,Boolean(import.meta.hot),window.location.hostname)) return null
  return <aside className="local-preview-notice" aria-label={uiText("模拟数据说明")} style={{background:'#eee9dc',color:'#615f50',padding:'5px 16px',fontSize:11,textAlign:'center'}}>{uiText("本地模拟数据 · 课程、活动、预约与体育进度用于界面体验")}</aside>
}
