import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLanguage } from './LanguageContext'
import { localizeLegacyText } from './legacyCopy'

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION'])

export function LocalizationBoundary({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement
        if (!parent || SKIP.has(parent.tagName) || parent.closest('[data-no-translate="true"]')) return
        const raw = node.textContent ?? ''
        const trimmed = raw.trim()
        if (!trimmed) return
        const next = localizeLegacyText(trimmed, language)
        if (next !== trimmed) node.textContent = raw.replace(trimmed, next)
        return
      }
      if (!(node instanceof HTMLElement) || SKIP.has(node.tagName) || node.dataset.noTranslate === 'true') return
      if (node.childElementCount === 0) {
        const rawText = node.textContent ?? ''
        const trimmedText = rawText.trim()
        if (trimmedText) {
          const translatedText = localizeLegacyText(trimmedText, language)
          if (translatedText !== trimmedText) node.textContent = rawText.replace(trimmedText, translatedText)
        }
      }
      for (const attribute of ['placeholder', 'aria-label', 'title'] as const) {
        const value = node.getAttribute(attribute)
        if (value) node.setAttribute(attribute, localizeLegacyText(value, language))
      }
      node.childNodes.forEach(translateNode)
    }
    translateNode(root)
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') translateNode(mutation.target)
      mutation.addedNodes.forEach(translateNode)
    }))
    observer.observe(root, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [language, children])

  return <div ref={ref} className="localization-boundary">{children}</div>
}
