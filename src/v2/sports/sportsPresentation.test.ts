import { describe, expect, it } from 'vitest'
// @ts-expect-error Upstream-compatible presentation modules are plain JavaScript.
import { safePreviewHtml, sampleEvidence } from '../../../public/student/js/huitongli-presentation.js'
import { sportsSummary } from './sportsSummary'
import type { Workspace } from '../../live/api'

describe('会同里体育展示边界', () => {
  it('本地模拟凭证可预览，外部媒体地址不发起请求', () => {
    expect(safePreviewHtml(sampleEvidence().source, 'image')).toContain('<img')
    expect(safePreviewHtml('https://example.com/private.jpg', 'image')).not.toContain('<img')
    expect(safePreviewHtml('javascript:alert(1)', 'image')).not.toContain('<img')
    expect(safePreviewHtml('blob:local-preview', 'video')).toContain('playsinline')
  })
  it('未知和不可用学时不伪装为零进度', () => {
    expect(sportsSummary(null).percent).toBeNull()
    expect(sportsSummary({ sportsStatus: 'unavailable', sports: {role:'student',progress:{percent:80}} } as Workspace).progress).toBeNull()
  })
})
