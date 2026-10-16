import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError, command, workspaceChangedEvent } from '../live/api'
import type { Post } from '../../shared/v2/model'

type CommunityData = { account: { id: string; name: string; nickname?: string; avatar?: string }; posts: Post[]; likedPosts: string[]; savedPosts: string[]; alumniProfiles?: {id:string;name:string}[]; hotLists?: {eligiblePostCount: number; overall: string[]; byBoard: Record<string, string[]>}; hotPosts?: Pick<Post,'id'|'title'|'board'|'author'|'status'>[]; features?: {postViews?: boolean};page?:number;total?:number;hasMore?:boolean }
export function useCommunityBackend({board='全部',query='',sort='recommended'}:{board?:string;query?:string;sort?:'recommended'|'newest'}={}) {
  const [data, setData] = useState<CommunityData>({ account: { id: '', name: '' }, posts: [], likedPosts: [], savedPosts: [] })
  const [error, setError] = useState('')
  const [detailPost,setDetailPost]=useState<Post|null>(null)
  const [detailCommentsHasMore,setDetailCommentsHasMore]=useState(false)
  const [detailCommentPage,setDetailCommentPage]=useState(1)
  const [busy, setBusy] = useState(false)
  const active = useRef(false), generation = useRef(0), locked = useRef(false)
  const navigate = useNavigate()
  const invalidate = useCallback(() => { generation.current++ }, [])
  const feedPath=useCallback((page:number)=>`/api/community/feed?board=${encodeURIComponent(board)}&q=${encodeURIComponent(query)}&sort=${sort}&page=${page}&limit=20`,[board,query,sort])
  const refresh = useCallback(async () => {
    const epoch = ++generation.current
    try {
      const next = await api<CommunityData>(feedPath(1))
      if (active.current && epoch === generation.current) { setData(next); setError('') }
    } catch (cause) {
      if (!active.current || epoch !== generation.current) return
      setData({ account: { id: '', name: '' }, posts: [], likedPosts: [], savedPosts: [] })
      setError(cause instanceof Error ? cause.message : '社区读取失败，请重试。')
      if (cause instanceof ApiError && cause.status === 401) navigate('/v2/login', { replace: true, state: { returnTo: '/v2/community' } })
    }
  }, [navigate,feedPath])
  const loadMore=async()=>{
    if(!data.hasMore||busy) return
    const epoch=generation.current
    try {
      const next=await api<CommunityData>(feedPath((data.page??1)+1))
      if(active.current && epoch===generation.current) setData(current=>({...next,posts:[...current.posts,...next.posts.filter(post=>!current.posts.some(existing=>existing.id===post.id))]}))
    } catch(cause) {if(active.current) setError(cause instanceof Error?cause.message:'更多帖子读取失败。')}
  }
  const loadPost=async(id:string,page=1)=>{
    try {
      const detail=await api<{post:Post;commentsHasMore:boolean;commentPage:number}>(`/api/community/posts/${encodeURIComponent(id)}?page=${page}`)
      if(active.current) {
        setDetailPost(current=>page>1 && current?.id===id ? {...detail.post,comments:[...current.comments,...detail.post.comments.filter(comment=>!current.comments.some(existing=>existing.id===comment.id))]} : detail.post)
        setDetailCommentsHasMore(detail.commentsHasMore)
        setDetailCommentPage(detail.commentPage)
      }
    } catch(cause) {if(active.current) setError(cause instanceof Error?cause.message:'帖子详情读取失败。')}
  }
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
      if((action==='post.create'||action==='comment.create') && result.data.id) await loadPost(action==='comment.create'?String(input.postId):result.data.id)
      const currentDetailId=detailPost?.id
      if(action==='relation.set' && currentDetailId && currentDetailId===input.id) await loadPost(currentDetailId)
      return active.current ? result.data.id : null
    } catch (cause) {
      if (active.current) setError(cause instanceof Error ? cause.message : '保存失败，请重试。')
      return null
    } finally { locked.current = false; if (active.current) setBusy(false) }
  }
  const recordOpen = async (id: string) => {
    await loadPost(id)
    if (!data.features?.postViews) return
    try { await command('post.view', { id, openId: crypto.randomUUID() }); await loadPost(id) }
    catch { /* The detail remains readable if view logging is temporarily unavailable. */ }
  }
  return { ...data, detailPost,detailCommentsHasMore,detailCommentPage,error, busy, mutate, recordOpen,loadMore,loadPost }
}
export type CommunityBackend = ReturnType<typeof useCommunityBackend>
