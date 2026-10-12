import { alumniData } from '../../shared/v2/alumniPolicy'
import { makeId, studentName, todayLabel, type Post, type V2State } from '../../shared/v2/model'

export function canReadPost(state: V2State, post: Post) {
  return post.status === 'visible' || post.status === 'pending' && (post.author === studentName || alumniData(state).profiles.some(profile => profile.owner === studentName && profile.id === post.alumniId))
}

export function setPostReaction(state: V2State, id: string, kind: 'likedPosts' | 'savedPosts', active: boolean): V2State {
  const post = state.posts.find(item => item.id === id)
  if (state.role !== 'student' || !post || active && post.status !== 'visible') return state
  const exists = state[kind].includes(id)
  if (exists === active) return state
  return {
    ...state,
    [kind]: active ? [...state[kind], id] : state[kind].filter(item => item !== id),
    posts: kind === 'likedPosts' ? state.posts.map(item => item.id === id ? { ...item, likes: Math.max(0, item.likes + (active ? 1 : -1)) } : item) : state.posts,
  }
}

export function addPostComment(state: V2State, id: string, text: string): V2State {
  const body = text.trim()
  if (state.role !== 'student' || !body || body.length > 300 || !state.posts.some(post => post.id === id && post.status === 'visible')) return state
  return { ...state, posts: state.posts.map(post => post.id === id ? { ...post, comments: [...post.comments, { id: makeId(), author: studentName, body, date: todayLabel(), status: 'pending' }] } : post) }
}
