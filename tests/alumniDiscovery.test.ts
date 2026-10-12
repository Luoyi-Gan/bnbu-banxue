import { describe, expect, it } from 'vitest'
import { initialV2State, studentName, type Post } from '../shared/v2/model'
import { alumniDiscoveryPosts } from '../src/v2/alumniDiscoveryPolicy'
import { addPostComment, canReadPost, setPostReaction } from '../src/v2/postInteractions'
import { coverRatio, discoveryColumns } from '../src/v2/discoveryLayout'
import { photosForPost, usesCampusIllustration } from '../src/v2/postPresentation'

const application = initialV2State.posts.find(post => post.id === 'alumni-post-application')!
const career = initialV2State.posts.find(post => post.id === 'alumni-post-career')!

describe('校友信息流的共享数据与筛选', () => {
  it('只使用已有校友经验，过滤普通帖子、他人待审及下架内容并去重', () => {
    const state = { ...initialV2State, posts: [...initialV2State.posts, application, { ...career, id: 'pending', status: 'pending' as const }, { ...career, id: 'hidden', status: 'hidden' as const }] }
    expect(alumniDiscoveryPosts(state, '全部', '').map(post => post.id)).toEqual([application.id, career.id])
    expect(state.posts).toHaveLength(initialV2State.posts.length + 3)
  })
  it('升学、就业、搜索、个人分享分别筛选同一份帖子', () => {
    expect(alumniDiscoveryPosts(initialV2State, '升学', '')).toEqual([application])
    expect(alumniDiscoveryPosts(initialV2State, '就业', '')).toEqual([career])
    expect(alumniDiscoveryPosts(initialV2State, '全部', '  周远  ')).toEqual([career])
    expect(alumniDiscoveryPosts(initialV2State, '全部', '', application.alumniId)).toEqual([application])
    expect(alumniDiscoveryPosts(initialV2State, '就业', '申请季')).toEqual([])
  })
  it('关注与收藏相互独立，取消或下架后筛选立即更新', () => {
    const state = { ...initialV2State, alumni: { ...initialV2State.alumni!, follows: [{ student: studentName, alumniId: application.alumniId! }] } }
    expect(alumniDiscoveryPosts(state, '已关注', '')).toEqual([application])
    expect(alumniDiscoveryPosts(state, '已收藏', '')).toEqual([])
    const saved = setPostReaction(state, career.id, 'savedPosts', true)
    expect(alumniDiscoveryPosts(saved, '已收藏', '')).toEqual([career])
    expect(alumniDiscoveryPosts(saved, '已关注', '')).toEqual([application])
    const hidden = { ...saved, posts: saved.posts.map(post => ({ ...post, status: 'hidden' as const })) }
    expect(alumniDiscoveryPosts(hidden, '已收藏', '')).toEqual([])
    expect(hidden.savedPosts).toContain(career.id)
  })
  it('本人待审经验仅本人可核对，不产生公开互动', () => {
    const post: Post = { ...application, status: 'pending', author: '本人校友展示名' }
    const state = { ...initialV2State, posts: [post], alumni: { ...initialV2State.alumni!, profiles: initialV2State.alumni!.profiles.map(profile => ({ ...profile, owner: studentName })) } }
    expect(alumniDiscoveryPosts(state, '全部', '')).toEqual([post])
    expect(canReadPost(initialV2State, post)).toBe(false)
    expect(setPostReaction(state, post.id, 'likedPosts', true)).toBe(state)
    expect(addPostComment(state, post.id, '不能提前评论')).toBe(state)
  })
})

describe('社区和校友使用同一份互动关系', () => {
  it('点赞收藏幂等，取消点赞不影响收藏、关注或预约', () => {
    const liked = setPostReaction(initialV2State, application.id, 'likedPosts', true)
    const saved = setPostReaction(liked, application.id, 'savedPosts', true)
    expect(setPostReaction(saved, application.id, 'likedPosts', true)).toBe(saved)
    expect(setPostReaction(saved, application.id, 'savedPosts', true)).toBe(saved)
    expect(saved.posts.find(post => post.id === application.id)?.likes).toBe(application.likes + 1)
    const unliked = setPostReaction(saved, application.id, 'likedPosts', false)
    expect(unliked.posts.find(post => post.id === application.id)?.likes).toBe(application.likes)
    expect(unliked.savedPosts).toContain(application.id)
    expect(unliked.alumni).toBe(initialV2State.alumni)
    expect(unliked.posts.find(post => post.id === career.id)).toBe(career)
  })
  it('阻止未知内容、下架内容和其他角色新增互动，允许取消旧收藏', () => {
    const saved = setPostReaction(initialV2State, application.id, 'savedPosts', true)
    const state = { ...saved, posts: saved.posts.map(post => ({ ...post, status: 'hidden' as const })) }
    expect(setPostReaction(state, application.id, 'likedPosts', true)).toBe(state)
    expect(setPostReaction(state, 'missing', 'savedPosts', true)).toBe(state)
    const teacher = { ...initialV2State, role: 'teacher' as const }
    expect(setPostReaction(teacher, application.id, 'likedPosts', true)).toBe(teacher)
    expect(setPostReaction(state, application.id, 'savedPosts', false).savedPosts).toEqual([])
  })
  it('详情评论写入原帖子且必须审核，校友页不会创建独立评论副本', () => {
    const next = addPostComment(initialV2State, application.id, '  谢谢分享  ')
    expect(alumniDiscoveryPosts(next, '全部', '')[0].comments.at(-1)).toMatchObject({ author: studentName, body: '谢谢分享', status: 'pending' })
    expect(next.posts.find(post => post.id === career.id)).toBe(career)
    expect(addPostComment(initialV2State, application.id, ' ')).toBe(initialV2State)
    expect(addPostComment(initialV2State, application.id, '字'.repeat(301))).toBe(initialV2State)
  })
})

describe('校友封面与追加稳定性', () => {
  it('图片优先使用帖子自带内容，示例配图明确区分，未知内容不伪造图片', () => {
    expect(photosForPost(application)).toHaveLength(1)
    expect(usesCampusIllustration(application)).toBe(true)
    const own = { ...application, images: ['provided-photo'] }
    expect(photosForPost(own)).toEqual(['provided-photo'])
    expect(usesCampusIllustration(own)).toBe(false)
    expect(photosForPost({ ...application, id: 'new-post' })).toEqual([])
    expect(coverRatio(application.id)).not.toBe(coverRatio(career.id))
  })
  it('300 条不同长短内容按批次追加不移动原卡片，互动数量变化不重新分列', () => {
    const posts = Array.from({ length: 300 }, (_, i) => ({ ...application, id: `alumni-${i}`, title: '分享'.repeat(i % 12 + 1) }))
    for (const count of [2, 3, 4]) {
      const first = discoveryColumns(posts.slice(0, 6), count, 200)
      const full = discoveryColumns(posts, count, 200)
      first.forEach((column, index) => expect(full[index].slice(0, column.length)).toEqual(column))
      expect(new Set(full.flat().map(post => post.id)).size).toBe(300)
      expect(discoveryColumns(posts.map(post => ({ ...post, likes: 10 })), count, 200).map(column => column.map(post => post.id))).toEqual(full.map(column => column.map(post => post.id)))
    }
  })
})
