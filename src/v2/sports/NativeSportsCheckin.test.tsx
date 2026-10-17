import { describe, expect, it } from 'vitest'
// @ts-expect-error The upstream Sports module is plain JavaScript.
import { startSession, pauseSession, resumeSession, sessionDurationMs } from '../../../public/student/js/session.js'
import { renderToStaticMarkup } from 'react-dom/server'
import { NativeSportsCheckin } from './NativeSportsCheckin'

describe('原版 Sports 接入', () => {
  it('暂停期间不累计运动，恢复后继续计时', () => {
    const active = startSession({ sportType: 'running', creditType: 'general' }, 1000)
    const paused = pauseSession(active, 31000)
    expect(sessionDurationMs(paused, 91000)).toBe(30000)
    expect(sessionDurationMs(resumeSession(paused, 91000), 101000)).toBe(40000)
  })
  it('上限约束原版会话时长', () => {
    const active = { ...startSession({}, 1000), maximumDurationSeconds: 120 }
    expect(sessionDurationMs(active, 180000)).toBe(120000)
  })
  it('在应用内部加载本地适配页且不给予外部窗口导航权限', () => {
    const html = renderToStaticMarkup(<NativeSportsCheckin />)
    expect(html).toContain('src="/student/huitongli-checkin.html"')
    expect(html).toContain('sandbox="allow-scripts allow-same-origin"')
    expect(html).not.toContain('allow-popups')
    expect(html).not.toContain('allow-top-navigation')
  })
})
