import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError, command, workspaceChangedEvent } from '../live/api'
import type { Post } from '../../shared/v2/model'

type CommunityData = { account: { id: string; name: string }; posts: Post[]; likedPosts: string[]; savedPosts: string[]; alumniProfiles?: {id:string;name:string}[] }
export function useCommunityBackend() {
  const [data, setData] = useState<CommunityData>({ account: { id: '', name: '' }, posts: [], likedPosts: [], savedPosts: [] })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const active = useRef(false), generation = useRef(0), locked = useRef(false)
  const navigate = useNavigate()
  const invalidate = useCallback(() => { generation.current++ }, [])
  const refresh = useCallback(async () => {
    const epoch = ++generation.current
    try {
      const next = await api<CommunityData>('/api/community')
      if (active.current && epoch === generation.current) { setData(next); setError('') }
    } catch (cause) {
      if (!active.current || epoch !== generation.current) return
      setData({ account: { id: '', name: '' }, posts: [], likedPosts: [], savedPosts: [] })
      setError(cause instanceof Error ? cause.message : '社区读取失败，请重试。')
      if (cause instanceof ApiError && cause.status === 401) navigate('/v2/login', { replace: true, state: { returnTo: '/v2/community' } })
    }
  }, [navigate])
  useEffect(() => {
    active.current = true
    void refresh()
    const focus = () => { void refresh() }
    window.addEventListener('focus', focus)
    window.addEventListener(workspaceChangedEvent, focus)
    return () => { active.current = false; invalidate(); window.removeEventListener('focus', focus); window.removeEventListener(workspaceChangedEvent, focus) }
  }, [refresh, invalidate])
  const mutate = async (action: string, input: Record<string, unknown>) => {
    if (locked.current) return null
    locked.current = true; setBusy(true); setError('')
    try {
      const result = await command(action, input)
      await refresh()
      return active.current ? result.data.id : null
    } catch (cause) {
      if (active.current) setError(cause instanceof Error ? cause.message : '保存失败，请重试。')
      return null
    } finally { locked.current = false; if (active.current) setBusy(false) }
  }
  return { ...data, error, busy, mutate }
}
export type CommunityBackend = ReturnType<typeof useCommunityBackend>
