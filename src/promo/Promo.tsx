import { ScreenPreview, type ScreenName } from './ProductScreen'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, Plus, Minus } from 'lucide-react'
import { ModuleGallery } from './ModuleGallery'
import { createPhone, type PhonePose } from './phone'

gsap.registerPlugin(ScrollTrigger)

const chapters = [
  { tag: '01 / 新的一天', nav: '初见', title: <>新的一天，<br /><em>从会同里开始。</em></>, description: '先看看今天的安排，再决定下课后去哪儿。', detail: '课程、活动与想见的人，慢慢排进今天的生活。', screen: 'home', link: '/v2', action: '进入会同里', side: 'left' },
  { tag: '02 / 下课以后', nav: '发现', title: <>下课之后，<br /><em>还有好戏。</em></>, description: '下课了。不急着回去，看看校园里正在发生什么。', detail: '浏览校园活动与社区内容，找到你想参与的下一件事。', screen: 'discover', link: '/v2/activities', action: '去发现', side: 'right' },
  { tag: '03 / 想分享的时刻', nav: '论坛', title: <>刚刚的发现，<br /><em>想和大家聊聊。</em></>, description: '把日常写成一篇帖子，也看看同学们怎么说。', detail: '发布图文、浏览话题，点赞收藏与评论回复，让校园经验持续流动。', screen: 'forum', link: '/v2/community', action: '走进论坛', side: 'left' },
  { tag: '04 / 有些问题，想当面聊', nav: 'Coffee Chat', title: <>关于下一步，<br /><em>约位老师聊聊。</em></>, description: '从一条经验想到自己的方向，带着问题预约一次交流。', detail: '了解交流主题、查看开放时段，带着你的问题发起预约。', screen: 'coffee', link: '/v2/coffee', action: '看看 Coffee Chat', side: 'right' },
  { tag: '05 / 有了计划，找人同行', nav: '同行', title: <>你的「一起吗」，<br /><em>有人回应。</em></>, description: '聊完有了新想法。找个搭子，把计划变成一次出发。', detail: '按类型、地点与时间寻找队伍，或发起自己的组队。', screen: 'partners', link: '/v2/partners', action: '找个搭子', side: 'left' },
  { tag: '06 / 给自己一点运动时间', nav: '运动', title: <>走出教室，<br /><em>把状态找回来。</em></>, description: '忙碌了一天，也留一点时间给球场和自己。', detail: '查看体育课程、运动入口与记录。当前展示为本地模拟，不计入真实学时。', screen: 'sports', link: '/v2/sports', action: '打开运动', side: 'right' },
  { tag: '07 / 熟悉的校园，还有新发现', nav: '探索', title: <>换个视角，<br /><em>认识校园。</em></>, description: '下一次想去的地方，先在地图里看一看。', detail: '在 3D 地图里搜索楼栋、切换校区，查看地点与相关计划。', screen: 'map', link: '/v2/campus/explore', action: '探索校园', side: 'right' },
]
const handChapters = [chapters[0], chapters[1], chapters[4], chapters[6]]
const storyRange = chapters.length - .4
const desktop: PhonePose[] = [
  { x: 2.65, y: -.1, rx: .07, ry: -.38, rz: -.1, scale: 1.03 },
  { x: -2.75, y: -.12, rx: -.04, ry: .3, rz: .07, scale: 1.07 },
  { x: 2.8, y: -.1, rx: .1, ry: -.28, rz: -.055, scale: 1.03 },
  { x: -2.7, y: -.18, rx: .17, ry: .32, rz: .07, scale: 1.05 },
]
desktop.splice(2, 0, { x: 2.8, y: -.1, rx: .04, ry: -.2, rz: -.04, scale: 1.1 }, { x: -2.7, y: -.1, rx: -.06, ry: .25, rz: .05, scale: 1.08 })
desktop.splice(5, 0, { x: -2.7, y: -.1, rx: .06, ry: .25, rz: .03, scale: 1.1 })
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function Promo() {
  const root = useRef<HTMLDivElement>(null), story = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0), [reduced, setReduced] = useState(false), [failed, setFailed] = useState(false)
  const [presentation, setPresentation] = useState<'held' | 'handoff' | 'free'>('held')
  const [shortViewport, setShortViewport] = useState(false), [handScreen, setHandScreen] = useState(0)
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const short = matchMedia('(max-height: 540px)')
    const update = () => { setReduced(query.matches); setShortViewport(short.matches) }
    update(); query.addEventListener('change', update); short.addEventListener('change', update)
    return () => { query.removeEventListener('change', update); short.removeEventListener('change', update) }
  }, [])
  useEffect(() => {
    if (!root.current || !story.current || !canvas.current || !stage.current || reduced || failed || shortViewport) return
    const stageElement = stage.current
    let device: ReturnType<typeof createPhone>
    try { device = createPhone(canvas.current, () => setFailed(true)) } catch { setFailed(true); return }
    let visible = true, current = -1, disposed = false
    const motion = { progress: 0 }, float = { y: 0 }
    const heldPhoto = root.current.querySelector<HTMLElement>('.promo-held .promo-held-photo')!
    const measureHeldPose = (): PhonePose => {
      const pxPerUnit = stageElement.clientHeight / (2 * Math.tan(16 * Math.PI / 180) * 15)
      return { x: (heldPhoto.offsetLeft + heldPhoto.offsetWidth * .465 - stageElement.clientWidth / 2) / pxPerUnit, y: (stageElement.clientHeight / 2 - heldPhoto.offsetTop - heldPhoto.offsetHeight * .406) / pxPerUnit, scale: heldPhoto.offsetWidth * .5254 / (2.88 * pxPerUnit), rx: 0, ry: 0, rz: 0 }
    }
    let heldPose = measureHeldPose()
    let phase = ''
    const paint = () => {
      if (disposed || !stage.current) return
      const progress = motion.progress * storyRange
      const index = Math.min(chapters.length - 1, Math.floor(progress))
      const local = progress - index
      const mix = index < chapters.length - 1 ? gsap.parseEase('power2.inOut')(Math.max(0, Math.min(1, (local - .6) / .4))) : 0
      const selected = mix > .5 ? index + 1 : index
      if (current !== selected) { current = selected; setActive(selected) }
      const mobile = window.innerWidth < 760
      const tablet = window.innerWidth < 1100
      // Pull back, sweep through the next screen, then settle at the same
      // centered pose. Returning to identity keeps the 3D handoff aligned.
      const heldTransition = index < 3 ? Math.max(0, Math.min(1, (local - .45) / .55)) : 0
      const envelope = Math.sin(heldTransition * Math.PI) ** 2
      const sweep = Math.sin(heldTransition * Math.PI * 2) * envelope
      stageElement.style.setProperty('--held-x', `${sweep * (mobile ? 22 : tablet ? 34 : 48)}px`)
      stageElement.style.setProperty('--held-y', `${envelope * (mobile ? 14 : 24)}px`)
      stageElement.style.setProperty('--held-roll', `${sweep * (mobile ? 3 : 5)}deg`)
      stageElement.style.setProperty('--held-turn', `${sweep * 7}deg`)
      stageElement.style.setProperty('--held-scale', String(1 - envelope * .075))
      const poses = desktop.map((p, i) => mobile
        ? { x: i % 2 ? -.08 : .08, y: window.innerHeight >= 800 ? -1.35 : -1.45, rx: p.rx * .5, ry: p.ry * .65, rz: p.rz * .6, scale: window.innerHeight >= 800 ? .7 : .6 }
        : tablet ? { ...p, x: p.x * Math.min(.72, window.innerWidth / window.innerHeight * .7), scale: .68 } : p)
      poses[3] = heldPose
      const travel = index === 3 ? Math.max(0, (mix - .3) / .7) : mix
      const a = poses[index], b = poses[Math.min(chapters.length - 1, index + 1)]
      const pose = Object.fromEntries(Object.keys(a).map(key => [key, lerp(a[key as keyof PhonePose], b[key as keyof PhonePose], travel)])) as unknown as PhonePose
      pose.scale += Math.sin(travel * Math.PI) * (mobile ? .02 : .08)
      pose.ry += Math.sin(travel * Math.PI) * (mobile ? .08 : .42) * (index % 2 ? -1 : 1)
      const handExit = index < 3 ? 0 : index === 3 ? mix : 1
      const nextPhase = handExit <= .001 ? 'held' : handExit >= .999 ? 'free' : 'handoff'
      if (phase !== nextPhase) { phase = nextPhase; setPresentation(nextPhase) }
      // Sequential exit/reveal: the photographic and 3D phones never overlap.
      const heldAlpha = Math.max(0, 1 - handExit / .3)
      const deviceAlpha = Math.max(0, Math.min(1, (handExit - .3) / .2))
      stageElement.style.setProperty('--held-alpha', String(heldAlpha))
      stageElement.style.setProperty('--device-alpha', String(deviceAlpha))
      if (index === 3) {
        const retreat = Math.min(1, handExit / .3)
        stageElement.style.setProperty('--held-y', `${retreat * 95}px`)
        stageElement.style.setProperty('--held-roll', `${retreat * -4}deg`)
        stageElement.style.setProperty('--held-scale', String(1 - retreat * .06))
      }
      device.setVisible(deviceAlpha > 0 && visible)
      device.update(pose, index, Math.min(chapters.length - 1, index + 1), mix, float.y * (mobile ? .45 : 1))
      stage.current!.style.setProperty('--chapter-progress', String(motion.progress))
    }
    const ctx = gsap.context(() => {
      gsap.to(motion, { progress: 1, ease: 'none', scrollTrigger: { trigger: story.current, start: 'top top', end: 'bottom bottom', scrub: .35, invalidateOnRefresh: true }, onUpdate: paint })
      gsap.fromTo('.promo-nav', { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out' })
      gsap.utils.toArray<HTMLElement>('.promo-reveal').forEach(el => gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }))
      gsap.fromTo('.promo-hand-visual', { y: 85, rotate: 5, scale: .96 }, { y: 0, rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.promo-hands', start: 'top 85%', end: 'top 10%', scrub: .8 } })
    }, root)
    const bob = gsap.to(float, { y: .055, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut', onUpdate: () => { if (visible && !document.hidden) paint() } })
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; device.setVisible(visible)
      if (visible && !document.hidden) bob.resume(); else bob.pause()
    })
    intersection.observe(stage.current)
    const visibility = () => { if (document.hidden) bob.pause(); else if (visible) bob.resume() }
    const resize = () => { heldPose = measureHeldPose(); paint(); ScrollTrigger.refresh() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('resize', resize)
    paint()
    return () => {
      disposed = true; bob.kill(); ctx.revert(); intersection.disconnect(); device.dispose()
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('resize', resize)
    }
  }, [reduced, failed, shortViewport])

  const staticMode = reduced || failed || shortViewport
  const jump = (index: number) => {
    if (staticMode) document.getElementById(`scene-${index}`)?.scrollIntoView({ behavior: 'auto' })
    else if (story.current) window.scrollTo({ top: story.current.offsetTop + (story.current.offsetHeight - innerHeight) * index / storyRange, behavior: 'smooth' })
  }
  return <div ref={root} className={`promo${staticMode ? ' promo-static' : ''}`} id="top">
    <a className="promo-skip" href="#start">跳过动画，开始使用</a>
    <header className="promo-nav">
      <a href="#top" className="promo-brand" aria-label="会同里首页"><img src="/huitongli-app-icon.png" alt="" /><span>会同里</span></a>
      <nav aria-label="产品介绍">{[1, 4, 6].map(i => <button key={chapters[i].nav} onClick={() => jump(i)}>{chapters[i].nav}</button>)}<a href="#modules">全部功能</a></nav>
      <a className="promo-nav-cta" href="/v2">打开会同里 <ArrowUpRight size={14} /></a>
    </header>
    <main>
      <section ref={story} className="promo-story" aria-label="会同里产品故事">
        <div ref={stage} className="promo-stage" data-scene={active} data-held={active < 4} data-presentation={presentation}>
          <div className="promo-watermark" aria-hidden="true">HUITONGLI</div>
          <div className="promo-orbit" aria-hidden="true" />
          <div ref={canvas} className="promo-canvas" />
          {!staticMode && <div className="promo-held" aria-hidden="true"><div className="promo-held-photo"><img src="/promo/hand-phone.png" width={1024} height={1536} alt=""/><div className="promo-held-display">{chapters.slice(0,4).map((chapter,i)=><ScreenPreview key={chapter.screen} name={chapter.screen as ScreenName} active={active===i}/>)}</div><span className="promo-held-clock">9:41</span></div></div>}
          <div className="promo-scenes">
            {chapters.map((chapter, index) => <section id={`scene-${index}`} key={chapter.nav} className={`promo-scene promo-scene-${chapter.side}${index < 4 ? ' promo-scene-held' : ''}`} aria-label={chapter.nav} aria-hidden={staticMode ? undefined : active !== index} inert={!staticMode && active !== index} style={staticMode ? undefined : { opacity: active === index ? 1 : 0, visibility: active === index ? 'visible' : 'hidden' }}>
              <div className="promo-copy">
                <p className="promo-eyebrow"><span />{chapter.tag}</p>
                {index === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}
                <p className="promo-description">{chapter.description}</p>
                <p className="promo-detail">{chapter.detail}</p>
                <a className={index === 0 ? 'promo-button' : 'promo-text-link'} href={chapter.link}>{chapter.action}<ArrowRight size={18} /></a>
                {index === 0 && <span className="promo-web-note">为 BNBU 校园生活而来 · Web 即刻打开</span>}
              </div>
              {index < 4 && <aside className="promo-held-caption"><span>0{index + 1} / 校园生活</span><p>{chapter.detail}</p></aside>}
              {staticMode && <div className="promo-static-phone"><img src={`/promo/${chapter.screen}.png`} alt={`会同里${chapter.nav}页面，真实产品界面`} /></div>}
            </section>)}
          </div>
        </div>
      </section>
      <section className="promo-hands" aria-labelledby="hands-title">
        <div className="promo-hand-copy">
          <p className="promo-eyebrow">07 / IN YOUR HANDS</p>
          <h2 id="hands-title">校园的每一面，<br /><em>都在你手里。</em></h2>
          <p>从清晨的一眼，到下课后的出发。<br />打开会同里，接上你的校园日常。</p>
          <div className="promo-hand-tabs" role="group" aria-label="切换手持手机屏幕">
            {handChapters.map((chapter, i) => <button key={chapter.nav} onClick={() => setHandScreen(i)} aria-pressed={handScreen === i}>{['首页', '发现', '搭子', '地图'][i]}</button>)}
          </div>
          <a className="promo-text-link" href={handChapters[handScreen].link}>打开{['首页', '发现', '找搭子', '校园地图'][handScreen]}<ArrowUpRight size={17}/></a>
        </div>
        <div className="promo-hand-visual">
          <img className="promo-hand-photo" src="/promo/hand-phone.png" width={1024} height={1536} alt="手持会同里手机界面" loading="lazy" />
          <div className="promo-hand-display" aria-live="polite">
            {handChapters.map((chapter, i) => <ScreenPreview key={chapter.nav} name={chapter.screen as ScreenName} active={handScreen === i}/>)}
          </div>
          <span className="promo-hand-clock" aria-hidden="true">9:41</span>
        </div>
      </section>
      <ModuleGallery />
      <section className="promo-value" id="closer">
        <div className="promo-value-intro promo-reveal"><p className="promo-eyebrow">LESS SEARCHING. MORE LIVING.</p><h2>少一点来回寻找。<br /><em>多一点校园生活。</em></h2><p>日程、活动、人与地点，在熟悉的地方连起来。</p></div>
        <div className="promo-benefits">
          {[['01', '把今天理清楚', '从首页查看下一项安排，再进入日程与课表。'], ['02', '让兴趣有去处', '活动、社团与校园社区，按自己的节奏发现。'], ['03', '让相遇有开始', '找搭子、交流经验，把想做的事变成一次连接。']].map(([n, title, text]) => <article className="promo-reveal" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>
      <section className="promo-start" id="start">
        <div className="promo-reveal"><img className="promo-app-icon" src="/huitongli-app-icon.png" alt="" /><p className="promo-eyebrow">YOUR CAMPUS. A LITTLE CLOSER.</p><h2>下一次相遇，<br /><em>从会同里开始。</em></h2><a className="promo-button" href="/v2">打开会同里<ArrowUpRight size={19}/></a><p className="promo-start-note">在浏览器中使用，登录后开始探索。</p></div>
        <div className="promo-faq">
          {[
            ['如何开始使用？', '点击「打开会同里」进入 Web 版，使用现有账号登录，或按照注册页面的指引创建账号。'],
            ['手机和电脑都能用吗？', '可以通过手机、平板和电脑浏览器访问。手机上的校园日常，也可以在更大的屏幕上继续查看。'],
            ['在哪里查看自己的安排？', '首页提供下一项安排入口。进入日程或课表，可以查看对应内容；活动参与状态以产品内提示为准。'],
          ].map(([question, answer], i) => <div className="promo-faq-item" key={question}><h3><button aria-expanded={openQuestion === i} aria-controls={`answer-${i}`} onClick={() => setOpenQuestion(openQuestion === i ? null : i)}>{question}{openQuestion === i ? <Minus size={18}/> : <Plus size={18}/>}</button></h3><div id={`answer-${i}`} hidden={openQuestion !== i}><p>{answer}</p></div></div>)}
        </div>
      </section>
    </main>
    <footer className="promo-footer"><a className="promo-brand" href="#top">会同里<span className="promo-footer-en">HUITONGLI</span></a><p>校园生活，自然相连。</p><div><a href="/v2/privacy">隐私政策</a><a href="/fonts/NOTICE.html">字体许可</a><a href="#top">回到顶部 ↑</a></div><small>界面依据会同里现有前端以 HTML 复刻，动画与数据仅作功能演示。iPhone 为展示载体，当前使用入口为 Web 版。</small></footer>
  </div>
}
