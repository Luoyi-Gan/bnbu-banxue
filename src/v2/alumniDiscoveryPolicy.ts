import { alumniData, currentAlumniActor } from '../../shared/v2/alumniPolicy'
import type { V2State } from '../../shared/v2/model'
import { canReadPost } from './postInteractions'

export type AlumniCategory = '全部' | '升学' | '就业' | '已关注' | '已收藏'

export function alumniDiscoveryPosts(state: V2State, category: AlumniCategory, query: string, personId?: string) {
  const data = alumniData(state), actor = currentAlumniActor(state)
  const keyword = query.trim().toLowerCase()
  const seen = new Set<string>()
  return state.posts.filter(post => {
    if (!post.alumniId || seen.has(post.id) || !canReadPost(state, post)) return false
    seen.add(post.id)
    if (personId && post.alumniId !== personId) return false
    if (category === '升学' || category === '就业') { if (post.board !== `校友${category}`) return false }
    if (category === '已关注' && !data.follows.some(follow => follow.student === actor.id && follow.alumniId === post.alumniId)) return false
    if (category === '已收藏' && !state.savedPosts.includes(post.id)) return false
    return `${post.title} ${post.body} ${post.author} ${post.board}`.toLowerCase().includes(keyword)
  })
}
