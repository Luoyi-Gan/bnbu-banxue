export interface SportsWorkspace {
  selectedEnrollmentId?: string | null
  courses: { enrollmentId?: string | null; isCurrent: boolean; enrollmentStatus: string; name?: string; semester?: string }[]
  progress: { totalValidHours?: number | null; qualificationStatus?: string | null }
  hourRule: { total?: number | null }
}

export type SportsProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'not-enrolled' | 'no-target' | 'unavailable' | 'sign-in'
export interface SportsProgress {
  status: SportsProgressStatus
  source: 'preview' | 'api' | 'local'
  semester: string
  course: string
  completedHours: number | null
  targetHours: number | null
  remainingHours: number | null
  percent: number | null
}

export function mapSportsProgress(workspace: SportsWorkspace, source: SportsProgress['source']): SportsProgress {
  // Same class selection and credited projection as the original student dashboard.
  const courses = workspace.courses.filter(course => course.isCurrent && course.enrollmentStatus === 'enrolled')
  const course = courses.find(course => course.enrollmentId === workspace.selectedEnrollmentId) ?? courses[0]
  const completed = workspace.progress.totalValidHours
  const target = workspace.hourRule.total
  const completedHours = typeof completed === 'number' && Number.isFinite(completed) ? Math.max(0, completed) : null
  const targetHours = typeof target === 'number' && Number.isFinite(target) && target > 0 ? target : null
  const measured = completedHours !== null && targetHours !== null
  return {
    source, semester: course?.semester || '本学期', course: course?.name || '',
    status: !course ? 'not-enrolled' : completedHours === null ? 'unavailable' : targetHours === null ? 'no-target'
      : workspace.progress.qualificationStatus === 'QUALIFIED' ? 'completed' : completedHours === 0 ? 'not-started' : 'in-progress',
    completedHours: course ? completedHours : null,
    targetHours: course ? targetHours : null,
    remainingHours: course && measured ? Math.max(0, targetHours - completedHours) : null,
    // The original dashboard floors the label while its bar uses the full ratio.
    percent: course && measured ? Math.min(100, Math.max(0, completedHours / targetHours * 100)) : null,
  }
}

export function sportsProgressLabel(progress: SportsProgress) {
  return { 'not-started': '未开始', 'in-progress': '进行中', completed: '已达标', 'not-enrolled': '未加入班级', 'no-target': '暂无目标', unavailable: '学时暂不可用', 'sign-in': '请先登录体育平台' }[progress.status]
}

export function sportsHours(value: number) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)
}
