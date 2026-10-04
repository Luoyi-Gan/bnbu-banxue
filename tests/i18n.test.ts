import { describe, expect, it } from 'vitest'
import { messages } from '../src/i18n/LanguageContext'
import { localizeLegacyText } from '../src/i18n/legacyCopy'

describe('bilingual resources', () => {
  it('keeps Chinese and English message keys in exact parity', () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.zh).sort())
  })

  it('localizes representative Mock content in both directions', () => {
    expect(localizeLegacyText('市场营销', 'en')).toBe('Marketing')
    expect(localizeLegacyText('Campus Night Run starts soon', 'zh')).toBe('Campus Night Run 即将开始')
    expect(localizeLegacyText('有人今晚一起跑步吗？我准备参加 Campus Night Run，想找一个差不多配速的搭子。', 'en')).not.toMatch(/[\u3400-\u9fff]/)
  })
})
