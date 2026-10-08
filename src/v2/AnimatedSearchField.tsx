import { Search, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type AnimatedSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function AnimatedSearchField({ value, onChange, placeholder }: AnimatedSearchFieldProps) {
  const [open, setOpen] = useState(Boolean(value))
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    onChange('')
    inputRef.current?.blur()
    setOpen(false)
    triggerRef.current?.focus()
  }, [onChange])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!value && !rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && rootRef.current?.contains(event.target as Node)) close() }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey) }
  }, [open, value, close])

  const expand = () => { setOpen(true); requestAnimationFrame(() => inputRef.current?.focus()) }

  return <div ref={rootRef} className={`v2-animated-search${open ? ' is-open' : ''}`} role="search">
    <button ref={triggerRef} type="button" className="v2-animated-search-trigger" aria-label={placeholder} aria-expanded={open} tabIndex={open ? -1 : 0} onClick={expand}><Search size={18}/><span>{placeholder}</span></button>
    <div className="v2-animated-search-field" aria-hidden={!open}>
      <Search size={18} aria-hidden="true"/>
      <input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} tabIndex={open ? 0 : -1}/>
      <button type="button" aria-label={value ? '清除搜索并关闭' : '关闭搜索'} onClick={close}><X size={16}/></button>
    </div>
  </div>
}
