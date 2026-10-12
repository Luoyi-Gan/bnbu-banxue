import { useCallback, useEffect, useRef, useState } from 'react'
import { command, loadWorkspace, workspaceChangedEvent, type Workspace } from '../live/api'

export function useWorkspaceBackend() {
  const [data, setData] = useState<Workspace | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const active = useRef(false), generation = useRef(0), locked = useRef(false)
  const refresh = useCallback(async () => {
    const current = ++generation.current
    try {
      const next = await loadWorkspace()
      if (active.current && current === generation.current) {setData(next); setError('')}
    } catch (failure) {
      if (active.current && current === generation.current) {setData(null); setError(failure instanceof Error ? failure.message : '读取失败，请重试。')}
    }
  }, [])
  useEffect(() => {
    active.current = true; void refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener(workspaceChangedEvent, refresh)
    return () => {active.current = false; window.removeEventListener('focus', refresh); window.removeEventListener(workspaceChangedEvent, refresh)}
  }, [refresh])
  async function mutate(action: string, input: Record<string, unknown>) {
    if (locked.current) return false
    locked.current = true; setBusy(true); setError('')
    try {await command(action, input); await refresh(); return true}
    catch (failure) {if (active.current) setError(failure instanceof Error ? failure.message : '保存失败'); return false}
    finally {locked.current = false; if (active.current) setBusy(false)}
  }
  return {data, error, busy, mutate}
}
