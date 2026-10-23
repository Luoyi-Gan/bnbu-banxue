import type {ReactNode} from 'react'
import {ChevronDown} from 'lucide-react'
import {uiText} from './uiLanguage'

/** Keep optional controls mounted so folding never discards entered values. */
export function PartnerCreateOptions({hint,children}:{hint:string;children:ReactNode}) {
  return <details className="partner-create-options">
    <summary><span><strong>{uiText('更多设置（可选）')}</strong><small>{hint}</small></span><ChevronDown size={17}/></summary>
    <div className="partner-create-options-body">{children}</div>
  </details>
}
