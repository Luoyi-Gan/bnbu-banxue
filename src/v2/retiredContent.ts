import type { V2State } from './model'

export function hideRetiredContent(state: V2State): V2State {
  return {
    ...state,
    notifications: state.notifications.filter((item) => !item.path.startsWith('/v2/announcements') && !/^(活动报名成功|报名申请已提交|已加入候补|新校园公告)$/.test(item.title)),
    aiPinnedSources: state.aiPinnedSources.filter((path) => !path.startsWith('/v2/announcements')),
    aiMessages: state.aiMessages.filter((item) => !item.sourcePath?.startsWith('/v2/announcements') && !(item.from === 'assistant' && /公告|报名|电子凭证/.test(item.body))),
  }
}
