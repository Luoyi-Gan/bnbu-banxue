import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play, Plus, Minus } from 'lucide-react'
import { createPhone, type PhonePose } from './phone'

gsap.registerPlugin(ScrollTrigger)

const chapters = [
  { tag: 'HI, HUITONGLI', nav: '初见', title: <>校园很大。<br />生活，<em>近一点。</em></>, description: '从今天的安排，到下一次相遇。', detail: '会同里，把你的校园生活放在一起。', screen: 'home', link: '/v2', action: '进入会同里', side: 'left' },
  { tag: '01 / DISCOVER', nav: '发现', title: <>下课之后，<br /><em>还有好戏。</em></>, description: '一场活动，一个社团，一段值得分享的日常。', detail: '浏览校园活动与社区内容，找到你想参与的下一件事。', screen: 'discover', link: '/v2/activities', action: '去发现', side: 'right' },
  { tag: '02 / TOGETHER', nav: '同行', title: <>你的「一起吗」，<br /><em>有人回应。</em></>, description: '拼车、自习、运动。把一个人的计划，变成同行。', detail: '按类型、地点与时间寻找队伍，或发起自己的组队。', screen: 'partners', link: '/v2/partners', action: '找个搭子', side: 'left' },
  { tag: '03 / EXPLORE', nav: '探索', title: <>换个视角，<br /><em>认识校园。</em></>, description: '把熟悉的校园，放在手心转一转。', detail: '在 3D 地图里搜索楼栋、切换校区，查看地点与相关计划。', screen: 'map', link: '/v2/campus/explore', action: '探索校园', side: 'right' },
]
const desktop: PhonePose[] = [
  { x: 2.65, y: -.1, rx: .07, ry: -.38, rz: -.1, scale: 1.03 },
  { x: -2.75, y: -.12, rx: -.04, ry: .3, rz: .07, scale: 1.07 },
  { x: 2.8, y: -.1, rx: .1, ry: -.28, rz: -.055, scale: 1.03 },
  { x: -2.7, y: -.12, rx: .17, ry: .32, rz: .07, scale: 1.13 },
]
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function Promo() {
  const root = useRef<HTMLDivElement>(null), story = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0), [reduced, setReduced] = useState(false), [paused, setPaused] = useState(false), [failed, setFailed] = useState(false)
  const [shortViewport, setShortViewport] = useState(false), [handScreen, setHandScreen] = useState(0)
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)
  const pauseRef = useRef(false)
  pauseRef.current = paused
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const short = matchMedia('(max-height: 540px)')
    const update = () => { setReduced(query.matches); setShortViewport(short.matches) }
    update(); query.addEventListener('change', update); short.addEventListener('change', update)
    return () => { query.removeEventListener('change', update); short.removeEventListener('change', update) }
  }, [])
  useEffect(() => {
    if (!root.current || !story.current || !canvas.current || !stage.current || reduced || failed || paused || shortViewport) return
    const stageElement = stage.current
    let device: ReturnType<typeof createPhone>
    try { device = createPhone(canvas.current, () => setFailed(true)) } catch { setFailed(true); return }
    let visible = true, current = -1, disposed = false
    const motion = { progress: 0 }, float = { y: 0 }
    const panels = gsap.utils.toArray<HTMLElement>('.promo-scene', root.current)
    const paint = () => {
      if (disposed || !stage.current) return
      const progress = motion.progress * 3.6
      const index = Math.min(3, Math.floor(progress))
      const local = progress - index
      const mix = index < 3 ? gsap.parseEase('power2.inOut')(Math.max(0, Math.min(1, (local - .6) / .4))) : 0
      const selected = mix > .5 ? index + 1 : index
      if (current !== selected) { current = selected; setActive(selected) }
      const mobile = window.innerWidth < 760
      const tablet = window.innerWidth < 1100
      const poses = desktop.map((p, i) => mobile
        ? { x: i % 2 ? -.08 : .08, y: window.innerHeight >= 800 ? -1.35 : -1.45, rx: p.rx * .5, ry: p.ry * .65, rz: p.rz * .6, scale: window.innerHeight >= 800 ? .7 : .6 }
        : tablet ? { ...p, x: p.x * Math.min(.72, window.innerWidth / window.innerHeight * .7), scale: .68 } : p)
      const a = poses[index], b = poses[Math.min(3, index + 1)]
      const pose = Object.fromEntries(Object.keys(a).map(key => [key, lerp(a[key as keyof PhonePose], b[key as keyof PhonePose], mix)])) as unknown as PhonePose
      pose.scale += Math.sin(mix * Math.PI) * (mobile ? .045 : .24)
      pose.ry += Math.sin(mix * Math.PI) * (mobile ? .08 : .42) * (index % 2 ? -1 : 1)
      if (pauseRef.current) { pose.rx = 0; pose.ry = 0; pose.rz = 0 }
      device.setReduced(pauseRef.current)
      device.update(pose, index, Math.min(3, index + 1), mix, pauseRef.current ? 0 : float.y * (mobile ? .45 : 1))
      panels.forEach((el, i) => {
        const opacity = i === index ? 1 - mix : i === index + 1 ? mix : 0
        el.style.opacity = String(opacity)
        el.style.visibility = opacity > .01 ? 'visible' : 'hidden'
        el.inert = selected !== i
        el.setAttribute('aria-hidden', String(selected !== i))
        el.style.transform = `translateY(${(1 - opacity) * 18}px)`
      })
      stage.current!.dataset.scene = String(selected)
      stage.current!.style.setProperty('--chapter-progress', String(motion.progress))
    }
    const ctx = gsap.context(() => {
      gsap.to(motion, { progress: 1, ease: 'none', scrollTrigger: { trigger: story.current, start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true }, onUpdate: paint })
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
    const resize = () => { paint(); ScrollTrigger.refresh() }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('resize', resize)
    paint()
    return () => {
      disposed = true; bob.kill(); ctx.revert(); intersection.disconnect(); device.dispose()
      panels.forEach(el => { el.removeAttribute('style'); el.removeAttribute('aria-hidden'); el.inert = false })
      stageElement.dataset.scene = '0'
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('resize', resize)
    }
  }, [reduced, failed, paused, shortViewport])

  const staticMode = reduced || failed || paused || shortViewport
  const jump = (index: number) => {
    if (staticMode) document.getElementById(`scene-${index}`)?.scrollIntoView({ behavior: 'auto' })
    else if (story.current) window.scrollTo({ top: story.current.offsetTop + (story.current.offsetHeight - innerHeight) * index / 3.6, behavior: paused ? 'auto' : 'smooth' })
  }
  return <div ref={root} className={`promo${staticMode ? ' promo-static' : ''}`} id="top">
    <a className="promo-skip" href="#start">跳过动画，开始使用</a>
    <header className="promo-nav">
      <a href="#top" className="promo-brand" aria-label="会同里首页"><img src="/huitongli-app-icon.png" alt="" /><span>会同里</span></a>
      <nav aria-label="产品介绍">{chapters.slice(1).map((chapter, i) => <button key={chapter.nav} onClick={() => jump(i + 1)}>{chapter.nav}</button>)}</nav>
      <a className="promo-nav-cta" href="/v2">打开会同里 <ArrowUpRight size={14} /></a>
    </header>
    <main>
      <section ref={story} className="promo-story" aria-label="会同里产品故事">
        <div ref={stage} className="promo-stage" data-scene="0">
          <div className="promo-watermark" aria-hidden="true">HUITONGLI</div>
          <div className="promo-orbit" aria-hidden="true" />
          <div ref={canvas} className="promo-canvas" />
          <div className="promo-scenes">
            {chapters.map((chapter, index) => <section id={`scene-${index}`} key={chapter.nav} className={`promo-scene promo-scene-${chapter.side}`} aria-label={chapter.nav}>
              <div className="promo-copy">
                <p className="promo-eyebrow"><span />{chapter.tag}</p>
                {index === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}
                <p className="promo-description">{chapter.description}</p>
                <p className="promo-detail">{chapter.detail}</p>
                <a className={index === 0 ? 'promo-button' : 'promo-text-link'} href={chapter.link}>{chapter.action}<ArrowRight size={18} /></a>
                {index === 0 && <span className="promo-web-note">为 BNBU 校园生活而来 · Web 即刻打开</span>}
              </div>
              {staticMode && <div className="promo-static-phone"><img src={`/promo/${chapter.screen}.png`} alt={`会同里${chapter.nav}页面，真实产品界面`} /></div>}
            </section>)}
          </div>
          {!staticMode && <div className="promo-stage-footer">
            <div className="promo-scroll-label"><ArrowDown size={16} /><span>向下滚动，走进校园</span></div>
            <div className="promo-chapters" role="group" aria-label="选择产品场景">{chapters.map((chapter, i) => <button key={chapter.nav} onClick={() => jump(i)} aria-label={`查看${chapter.nav}`} aria-pressed={active === i}><span>0{i + 1}</span><i /></button>)}</div>
            <button className="promo-motion" onClick={() => setPaused(true)}><Pause size={13} /><span>静态阅读</span></button>
          </div>}
        </div>
      </section>
      {paused && !reduced && !failed && !shortViewport && <button className="promo-resume" onClick={() => { setPaused(false); window.scrollTo({ top: 0, behavior: 'instant' }) }}><Play size={14} />恢复动态浏览</button>}
      <section className="promo-hands" aria-labelledby="hands-title">
        <div className="promo-hand-copy">
          <p className="promo-eyebrow">04 / IN YOUR HANDS</p>
          <h2 id="hands-title">校园的每一面，<br /><em>都在你手里。</em></h2>
          <p>从清晨的一眼，到下课后的出发。<br />打开会同里，接上你的校园日常。</p>
          <div className="promo-hand-tabs" role="group" aria-label="切换手持手机屏幕">
            {chapters.map((chapter, i) => <button key={chapter.nav} onClick={() => setHandScreen(i)} aria-pressed={handScreen === i}>{['首页', '发现', '搭子', '地图'][i]}</button>)}
          </div>
          <a className="promo-text-link" href={chapters[handScreen].link}>打开{['首页', '发现', '找搭子', '校园地图'][handScreen]}<ArrowUpRight size={17}/></a>
        </div>
        <div className="promo-hand-visual">
          <img className="promo-hand-photo" src="/promo/hand-phone.png" width={1024} height={1536} alt="手持会同里手机界面" loading="lazy" />
          <div className="promo-hand-display" aria-live="polite">
            {chapters.map((chapter, i) => <img key={chapter.nav} src={`/promo/${chapter.screen}.png`} className={handScreen === i ? 'is-active' : ''} aria-hidden={handScreen !== i} alt={`会同里${['首页', '发现', '找搭子', '校园地图'][i]}界面`} loading="lazy"/>)}
          </div>
          <span className="promo-hand-clock" aria-hidden="true">9:41</span>
        </div>
      </section>
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
    <footer className="promo-footer"><a className="promo-brand" href="#top">会同里<span className="promo-footer-en">HUITONGLI</span></a><p>校园生活，自然相连。</p><div><a href="/v2/privacy">隐私政策</a><a href="/fonts/NOTICE.html">字体许可</a><a href="#top">回到顶部 ↑</a></div><small>界面为会同里实际前端展示，画面内容使用演示数据。iPhone 为展示载体，当前使用入口为 Web 版。</small></footer>
  </div>
}
