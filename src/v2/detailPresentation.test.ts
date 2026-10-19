import {describe,expect,it,vi} from 'vitest'
vi.mock('./uiLanguage',()=>({uiLocale:()=> 'zh-CN'}))
import {detailDate,detailTimeRange} from './detailPresentation'

describe('detail display dates',()=>{
  it('shows one date for a same-day event and preserves both times',()=>{
    const label=detailTimeRange('2026-10-20T11:00:00Z','2026-10-20T13:00:00Z')
    expect(label.match(/10月20日/g)).toHaveLength(1)
    expect(label).toContain('19:00–21:00')
  })
  it('retains both dates when an event crosses midnight in Shanghai',()=>{
    const label=detailTimeRange('2026-10-20T15:30:00Z','2026-10-20T16:30:00Z')
    expect(label).toContain('10月20日')
    expect(label).toContain('10月21日')
    expect(label).toContain('23:30')
    expect(label).toContain('00:30')
  })
  it('preserves unrecognized source dates instead of inventing a time',()=>{
    expect(detailDate('时间待补')).toBe('时间待补')
    expect(detailTimeRange('时间待补')).toBe('时间待补')
  })
})
