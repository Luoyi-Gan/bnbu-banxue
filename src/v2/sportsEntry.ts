export function sportsStudentHref(hostname: string) {
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)
  return `/student/index.html${local ? '?preview=student' : ''}`
}
