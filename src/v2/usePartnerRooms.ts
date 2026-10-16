import { useCallback, useEffect, useRef, useState } from 'react'
import { api, workspaceChangedEvent } from '../live/api'
import type { PartnerFilters, PartnerRoom } from '../../shared/v2/partnerFilters'

type Page = { items: PartnerRoom[]; nextCursor: string | null }

export function usePartnerRooms(filters: PartnerFilters, selectedId: string | null) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) if (value && !(key === 'type' && value === 'all')) params.set(key, value)
  const query = params.toString()
  const [rooms, setRooms] = useState<PartnerRoom[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [detail, setDetail] = useState<PartnerRoom | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const refresh = useCallback(async (append = false, nextCursor?: string | null) => {
    const epoch = ++generation.current
    setLoading(true)
    try {
      const suffix = nextCursor ? `${query ? '&' : ''}cursor=${encodeURIComponent(nextCursor)}` : ''
      const page = await api<Page>(`/api/rooms?${query}${suffix}`)
      if (epoch !== generation.current) return
      setRooms(previous => append ? [...previous, ...page.items] : page.items)
      setCursor(page.nextCursor)
      setError('')
    } catch (cause) { if (epoch === generation.current) setError(cause instanceof Error ? cause.message : '队伍读取失败。') }
    finally { if (epoch === generation.current) setLoading(false) }
  }, [query])
  useEffect(() => {
    generation.current++
    setRooms([])
    setCursor(null)
    const timer = window.setTimeout(() => { void refresh() }, 220)
    const onChanged = () => { void refresh() }
    window.addEventListener(workspaceChangedEvent, onChanged)
    return () => { window.clearTimeout(timer); window.removeEventListener(workspaceChangedEvent, onChanged) }
  }, [refresh])
  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    if (rooms.some(room => room.id === selectedId)) { setDetail(null); return }
    let cancelled = false
    void api<PartnerRoom>(`/api/rooms/${encodeURIComponent(selectedId)}`).then(room => { if (!cancelled) setDetail(room) }).catch(() => { if (!cancelled) setDetail(null) })
    return () => { cancelled = true }
  }, [selectedId, rooms])
  return { rooms, detail, loading, error, hasMore: Boolean(cursor), loadMore: () => { if (!loading && cursor) void refresh(true, cursor) } }
}
