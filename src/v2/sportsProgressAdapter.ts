import { sportsStudentHref } from './sportsEntry'
import { mapSportsProgress, type SportsProgress, type SportsWorkspace } from './sportsProgress'

interface Identity { me: { user?: { status?: string } }; student: { emailVerified: boolean } }
export interface SportsRuntime {
  hasApiSession(): boolean
  loadApiStudentIdentity(): Promise<Identity>
  loadApiWorkspace(identity: Identity): Promise<{ workspace: SportsWorkspace }>
}

const signInProgress: SportsProgress = { source: 'api', status: 'sign-in', semester: '本学期', course: '', completedHours: null, targetHours: null, remainingHours: null, percent: null }

export async function readLiveSportsProgress(api: SportsRuntime): Promise<SportsProgress> {
  if (!api.hasApiSession()) return signInProgress
  try {
    const identity = await api.loadApiStudentIdentity()
    if (identity.me.user?.status === 'PENDING_CONTACT_BINDING' || !identity.student.emailVerified) return signInProgress
    const { workspace } = await api.loadApiWorkspace(identity)
    return mapSportsProgress(workspace, 'api')
  } catch (error) {
    if ((error as { status?: number })?.status === 401) return signInProgress
    throw error
  }
}

// Runtime imports keep the migrated Sports files byte-for-byte intact in dev and build.
const loadModule = (path: string) => import(/* @vite-ignore */ new URL(path, window.location.origin).href)

export async function loadSportsProgress(): Promise<SportsProgress> {
  const href = sportsStudentHref(window.location.hostname)
  if (href.includes('?preview=student')) {
    const preview = await loadModule('/student/js/local-preview.js') as { buildLocalPreviewWorkspace(): SportsWorkspace }
    return mapSportsProgress(preview.buildLocalPreviewWorkspace(), 'preview')
  }
  return readLiveSportsProgress(await loadModule('/student/js/api.js') as SportsRuntime)
}

export function sportsProgressScope() {
  // Never put bearer tokens or a student's record data into the Companion cache.
  try {
    const session = JSON.parse(localStorage.getItem('bnbu.student.web.session') || 'null')
    const tokens = JSON.parse(localStorage.getItem('bnbu.student.web.apiTokens') || 'null')
    const owner = tokens?.userId
    return JSON.stringify([session?.kind, session?.accountId, session?.signedInAt, owner, tokens?.sessionId,
      localStorage.getItem(`bnbu.student.web.selectedEnrollment:${owner}`)])
  } catch { return 'unavailable' }
}
