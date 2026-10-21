import { uiText, useUiLanguage, uiTemplate } from './uiLanguage'
import { useState } from 'react'
import { CampusBuildingPicker } from './V2CampusExplorer'
import { PartnerLocationField, type PartnerPlace } from './PartnerLocationField'

type Scope = 'campus' | 'outside'

/** Campus locations use the existing 3D model; AMap is used for outside locations. */
export function PartnerScopedLocationField({ label, name, value, onChange, onSelect, required, placeholder, scope: controlledScope, campusButtonLabel }: {
  label: string; name?: string; value: string; onChange: (value: string) => void;
  onSelect?: (place: PartnerPlace | null) => void; required?: boolean; placeholder?: string;
  scope?: Scope; campusButtonLabel?: string;
}) { useUiLanguage();
  const [ownScope, setOwnScope] = useState<Scope>('campus')
  const [pickerOpen, setPickerOpen] = useState(false)
  const scope = controlledScope ?? ownScope
  const changeScope = (next: Scope) => {
    setOwnScope(next)
    onChange('')
    onSelect?.(null)
  }
  return <div className="v2-partner-scoped-location">
    {controlledScope === undefined && <div className="v2-location-choice"><strong>{uiText(label)}</strong><div>
      <button type="button" className={scope === 'campus'?'is-active':''} onClick={() => changeScope('campus')}>{uiText("校内 3D")}</button>
      <button type="button" className={scope === 'outside'?'is-active':''} onClick={() => changeScope('outside')}>{uiText("校外地图")}</button>
    </div></div>}
    {scope === 'campus'?<>
      <button type="button" className="v2-button v2-button-secondary" onClick={() => setPickerOpen(true)}>{value || campusButtonLabel || uiTemplate(["在 3D 校园模型中选择",""],label)}</button>
      {name && <input type="hidden" name={name} value={value}/>}
      {pickerOpen && <CampusBuildingPicker onClose={() => setPickerOpen(false)} onPick={building => { onChange(building.name); onSelect?.(null); setPickerOpen(false) }}/ >}
      {required && !value && <small>{uiText("请先选择校内楼栋。")}</small>}
    </>:<PartnerLocationField label={uiText(label)} name={name} value={value} onChange={onChange} onSelect={onSelect} required={required} map placeholder={placeholder ?? uiText('搜索校外地点或手动填写')}/>}
  </div>
}
