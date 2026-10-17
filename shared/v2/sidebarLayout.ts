export const sidebarCoreIds = ['home', 'discover', 'campus', 'conversations', 'me'] as const
export const sidebarCampusIds = ['community', 'partners', 'alumni', 'explore', 'ai', 'organizations', 'coffee', 'sports', 'teaching', 'academic'] as const
export const sidebarAllIds = [...sidebarCoreIds, ...sidebarCampusIds] as const
export type SidebarItemId = typeof sidebarAllIds[number]

export const defaultSidebarItems: SidebarItemId[] = [
  ...sidebarCoreIds,
  'community', 'partners', 'alumni', 'explore', 'ai',
]

const allowed = new Set<string>(sidebarAllIds)

export function parseSidebarItems(value: unknown): SidebarItemId[] | null {
  if (!Array.isArray(value) || value.length < sidebarCoreIds.length || value.length > sidebarAllIds.length) return null
  if (!value.every(item => typeof item === 'string' && allowed.has(item))) return null
  if (new Set(value).size !== value.length) return null
  if (!sidebarCoreIds.every(item => value.includes(item))) return null
  return value as SidebarItemId[]
}
