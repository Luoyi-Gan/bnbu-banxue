import { initialJourney, initialNotifications } from '../data/mockData'
import type { JourneyEntry, MessageRef, Notification } from '../types'
import type { Language } from './LanguageContext'
import { localizeLegacyText } from './legacyCopy'

const english = Object.fromEntries([
  ...initialNotifications.flatMap((item) => [
    [`seed.notification.${item.id}.title`, item.title ?? ''],
    [`seed.notification.${item.id}.body`, item.body ?? ''],
    [`seed.notification.${item.id}.time`, item.time ?? ''],
  ]),
  ...initialJourney.flatMap((item) => [
    [`seed.journey.${item.id}.title`, item.title ?? ''],
    [`seed.journey.${item.id}.detail`, item.detail ?? ''],
  ]),
]) as Record<string, string>

const resources: Record<Language, Record<string, string>> = {
  en: english,
  zh: Object.fromEntries(Object.entries(english).map(([key, value]) => [key, localizeLegacyText(value, 'zh')])),
}

export function resolveSeedMessage(key: string, language: Language) {
  return resources[language][key]
}

export function seedNotificationMessages(item: Notification): Notification {
  if (!english[`seed.notification.${item.id}.title`]) return item
  const titleMessage: MessageRef = { key: `seed.notification.${item.id}.title` }
  const bodyMessage: MessageRef = { key: `seed.notification.${item.id}.body` }
  const timeMessage: MessageRef = { key: `seed.notification.${item.id}.time` }
  const rest = { ...item }
  delete rest.title
  delete rest.body
  delete rest.time
  return { ...rest, titleMessage, bodyMessage, timeMessage }
}

export function seedJourneyMessages(item: JourneyEntry): JourneyEntry {
  if (!english[`seed.journey.${item.id}.title`]) return item
  const titleMessage: MessageRef = { key: `seed.journey.${item.id}.title` }
  const detailMessage: MessageRef = { key: `seed.journey.${item.id}.detail` }
  const rest = { ...item }
  delete rest.title
  delete rest.detail
  return { ...rest, titleMessage, detailMessage }
}
