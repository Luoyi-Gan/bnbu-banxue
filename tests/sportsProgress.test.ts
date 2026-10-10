import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildLocalPreviewWorkspace } from '../public/student/js/local-preview.js'
import { mapProgressTarget, mapStudentProgressProjection } from '../public/student/js/api.js'
import { mapSportsProgress, type SportsWorkspace } from '../src/v2/sportsProgress'
import { readLiveSportsProgress, type SportsRuntime } from '../src/v2/sportsProgressAdapter'
import { createSportsProgressResource } from '../src/v2/sportsProgressResource'

const workspace = (): SportsWorkspace => buildLocalPreviewWorkspace()
const sample = () => mapSportsProgress(workspace(), 'preview')
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
afterEach(() => vi.useRealTimers())

describe('Sports homepage projection', () => {
  it('uses the existing preview workspace rather than the former hardcoded 16 hours', () => {
    expect(sample()).toMatchObject({ completedHours: 10.5, targetHours: 20, remainingHours: 9.5, percent: 52.5, status: 'in-progress', source: 'preview' })
    expect(Math.floor(sample().percent!)).toBe(52)
  })
  it('uses the original effective seconds and target mapping after review changes', () => {
    const w = workspace()
    const projection = { courseRelated: { effectiveSeconds: 5400, validExerciseSeconds: 36000 }, general: { effectiveSeconds: 1800 }, status: 'IN_PROGRESS' }
    w.progress = mapStudentProgressProjection(projection)
    w.hourRule = mapProgressTarget({ totalTargetSeconds: 18000 }, projection)
    expect(mapSportsProgress(w, 'api')).toMatchObject({ completedHours: 2, targetHours: 5, percent: 40, remainingHours: 3 })
    projection.courseRelated.effectiveSeconds = 1800
    w.progress = mapStudentProgressProjection(projection)
    expect(mapSportsProgress(w, 'api')).toMatchObject({ completedHours: 1, percent: 20 })
  })
  it('does not infer qualification from total hours alone', () => {
    const w = workspace()
    w.progress.totalValidHours = 25
    expect(mapSportsProgress(w, 'api')).toMatchObject({ status: 'in-progress', percent: 100, remainingHours: 0 })
    w.progress.qualificationStatus = 'QUALIFIED'
    expect(mapSportsProgress(w, 'api').status).toBe('completed')
  })
  it('only shows current enrolled classes, preserving the selected class', () => {
    const w = workspace()
    w.courses.push({ enrollmentId: 'second', name: '游泳', isCurrent: true, enrollmentStatus: 'enrolled' })
    w.selectedEnrollmentId = 'second'
    expect(mapSportsProgress(w, 'api').course).toBe('游泳')
    w.courses = w.courses.map(c => ({ ...c, isCurrent: false }))
    expect(mapSportsProgress(w, 'api')).toMatchObject({ status: 'not-enrolled', completedHours: null, targetHours: null, percent: null })
    w.courses[0].isCurrent = true
    w.courses[0].enrollmentStatus = 'ended'
    expect(mapSportsProgress(w, 'api').status).toBe('not-enrolled')
  })
  it.each([0, -3])('shows not started and clamps negative credited duration: %s', hours => {
    const w = workspace(); w.progress.totalValidHours = hours
    expect(mapSportsProgress(w, 'api')).toMatchObject({ status: 'not-started', percent: 0, remainingHours: 20 })
  })
  it.each([null, undefined, NaN, Infinity, 0, -1])('never invents a target for %s', target => {
    const w = workspace(); w.hourRule.total = target
    expect(mapSportsProgress(w, 'api')).toMatchObject({ status: 'no-target', targetHours: null, percent: null, remainingHours: null, completedHours: 10.5 })
  })
  it.each([null, undefined, NaN, Infinity])('does not show missing credited hours as zero: %s', completed => {
    const w = workspace(); w.progress.totalValidHours = completed
    expect(mapSportsProgress(w, 'api')).toMatchObject({ status: 'unavailable', completedHours: null, percent: null })
  })
})

describe('Existing sports API adapter', () => {
  const runtime = (): SportsRuntime => ({
    hasApiSession: vi.fn(() => true),
    loadApiStudentIdentity: vi.fn(async () => ({ me: { user: { status: 'ACTIVE' } }, student: { emailVerified: true } })),
    loadApiWorkspace: vi.fn(async () => ({ workspace: workspace() })),
  })
  it('delegates to the original workspace loader with verified identity', async () => {
    const api = runtime()
    expect(await readLiveSportsProgress(api)).toMatchObject({ source: 'api', completedHours: 10.5 })
    expect(api.loadApiWorkspace).toHaveBeenCalledExactlyOnceWith({ me: { user: { status: 'ACTIVE' } }, student: { emailVerified: true } })
  })
  it('does not request protected workspace data before sign-in or email binding', async () => {
    const api = runtime(); vi.mocked(api.hasApiSession).mockReturnValue(false)
    expect((await readLiveSportsProgress(api)).status).toBe('sign-in')
    expect(api.loadApiStudentIdentity).not.toHaveBeenCalled()
    vi.mocked(api.hasApiSession).mockReturnValue(true)
    vi.mocked(api.loadApiStudentIdentity).mockResolvedValue({ me: { user: { status: 'PENDING_CONTACT_BINDING' } }, student: { emailVerified: false } })
    expect((await readLiveSportsProgress(api)).status).toBe('sign-in')
    expect(api.loadApiWorkspace).not.toHaveBeenCalled()
  })
  it('returns sign-in for expired authentication and propagates failures without fake data', async () => {
    const api = runtime(); vi.mocked(api.loadApiWorkspace).mockRejectedValue({ status: 401 })
    expect((await readLiveSportsProgress(api)).status).toBe('sign-in')
    vi.mocked(api.loadApiWorkspace).mockRejectedValue(new Error('offline'))
    await expect(readLiveSportsProgress(api)).rejects.toThrow('offline')
  })
})

describe('Sports progress refresh lifecycle', () => {
  it('coalesces concurrent refresh requests and allows a fresh request after settlement', async () => {
    const task = deferred<ReturnType<typeof sample>>()
    const load = vi.fn(() => task.promise)
    const resource = createSportsProgressResource(load, () => 'student-a')
    const first = resource.refresh()
    expect(resource.refresh()).toBe(first)
    task.resolve(sample()); await first
    expect(load).toHaveBeenCalledTimes(1)
    expect(resource.getSnapshot()).toMatchObject({ phase: 'ready', refreshing: false })
    await resource.refresh()
    expect(load).toHaveBeenCalledTimes(2)
  })
  it('discards a previous student response and reloads after account/class scope changes', async () => {
    const old = deferred<ReturnType<typeof sample>>()
    let scope = 'student-a'
    const next = { ...sample(), completedHours: 1 }
    const load = vi.fn().mockReturnValueOnce(old.promise).mockResolvedValue(next)
    const resource = createSportsProgressResource(load, () => scope)
    const results: number[] = []
    const unsubscribe = resource.subscribe(() => { const data = resource.getSnapshot().data; if (data) results.push(data.completedHours!) })
    const request = resource.refresh()
    scope = 'student-b'; resource.refresh()
    old.resolve(sample()); await request; await resource.refresh()
    expect(results).not.toContain(10.5)
    expect(resource.getSnapshot().data?.completedHours).toBe(1)
    unsubscribe()
  })
  it('refreshes from original data after entering and returning from sports', async () => {
    const load = vi.fn().mockResolvedValueOnce(sample()).mockResolvedValue({ ...sample(), completedHours: 11.5 })
    const resource = createSportsProgressResource(load, () => 'student-a')
    await resource.refresh(); resource.invalidate(); await resource.refresh()
    expect(resource.getSnapshot().data?.completedHours).toBe(11.5)
  })
  it('shows failure, retries, and never retains outdated successful metrics after failure', async () => {
    const load = vi.fn().mockResolvedValueOnce(sample()).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(sample())
    const resource = createSportsProgressResource(load, () => 'student-a')
    await resource.refresh(); await resource.refresh()
    expect(resource.getSnapshot()).toEqual({ phase: 'error', data: null, refreshing: false })
    await resource.refresh()
    expect(resource.getSnapshot().phase).toBe('ready')
  })
  it('shows timeout without overlapping transport requests or accepting late results', async () => {
    vi.useFakeTimers()
    const task = deferred<ReturnType<typeof sample>>()
    const load = vi.fn(() => task.promise)
    const resource = createSportsProgressResource(load, () => 'student-a', 100)
    const first = resource.refresh()
    await vi.advanceTimersByTimeAsync(101)
    expect(resource.getSnapshot().phase).toBe('error')
    expect(resource.refresh()).toBe(first)
    task.resolve(sample()); await first
    expect(load).toHaveBeenCalledTimes(1)
    expect(resource.getSnapshot().phase).toBe('error')
    await resource.refresh()
    expect(resource.getSnapshot().phase).toBe('ready')
  })
})
