import { sportsStudentHref } from './sportsEntry'

export function V2Sports() {
  return <section className="v2-sports-embedded" aria-label="体育运动平台">
    <iframe
      className="v2-sports-frame"
      title="BNBU Sports 体育运动平台"
      src={sportsStudentHref(window.location.hostname)}
      allow="camera 'self'; microphone 'self'; fullscreen 'self'"
    />
  </section>
}
