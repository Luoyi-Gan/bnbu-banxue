import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, Compass, MapPin, Menu, MessageCircle, Search, Users, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import campus from '../assets/campus/home-background.jpg'
import evening from '../assets/campus/evening-campus.jpg'
import trees from '../assets/campus/gallery/tree-lined-path.webp'
import lake from '../assets/campus/gallery/lakeside-pavilion.webp'
import './productPage.css'

const views = ['校园日常', '发现精彩', '遇见同伴', '三维校园'] as const
const destinations = ['/v2', '/v2/activities', '/v2/partners', '/v2/campus/explore']

function Brand() {
  return <a className="ht-brand" href="/intro" aria-label="会同里产品首页"><span className="ht-mark">会</span><strong>会同里</strong><span className="ht-brand-en">HUITONGLI</span></a>
}

export function ProductPage() {
  const root = useRef<HTMLDivElement>(null)
  const [view, setView] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const oldTitle = document.title
    document.title = '会同里 · 让校园生活，自然发生'
    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.from('.ht-hero-copy > *', { y: 24, opacity: 0, duration: .8, stagger: .09, ease: 'power3.out' })
        gsap.utils.toArray<HTMLElement>('.ht-reveal').forEach(element => {
          gsap.from(element, { y: 38, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } })
        })
        gsap.fromTo('.ht-campus-image', { scale: 1.18, yPercent: -5 }, { scale: 1, yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.ht-campus-story', start: 'top bottom', end: 'bottom top', scrub: true } })
      }, root)
      return () => context.revert()
    })
    return () => { media.revert(); document.title = oldTitle }
  }, [])

  return <div className="ht-product" ref={root}>
    <a className="ht-skip" href="#ht-main">跳到正文</a>
    <header className="ht-header"><div className="ht-nav-wrap"><Brand />
      <nav aria-label="产品导航" className={menuOpen ? 'ht-nav is-open' : 'ht-nav'}>
        <a href="#experience" onClick={() => setMenuOpen(false)}>产品体验</a><a href="#discover" onClick={() => setMenuOpen(false)}>校园可能</a><a href="#campus" onClick={() => setMenuOpen(false)}>三维校园</a><a href="#questions" onClick={() => setMenuOpen(false)}>常见问题</a>
      </nav>
      <a className="ht-nav-cta" href="/v2/welcome">进入会同里 <ArrowUpRight size={15}/></a>
      <button className="ht-menu" aria-label={menuOpen ? '关闭导航' : '打开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </div></header>
    <main id="ht-main">
      <section className="ht-hero">
        <div className="ht-hero-copy"><div className="ht-eyebrow"><span/> 在北师港浸大，连接每一种可能</div>
          <h1>在这里，<br/>与校园<span>不期而遇。</span></h1>
          <p className="ht-hero-description"><span>一场想去的活动，一群同频的朋友，</span><span>一条还没走过的小路。</span><span>你的校园生活，从会同里展开。</span></p>
          <div className="ht-actions"><a href="/v2/welcome" className="ht-button ht-button-light">开启校园生活 <ArrowUpRight size={18}/></a><a href="#experience" className="ht-text-link">先逛一逛 <ArrowDown size={16}/></a></div>
          <div className="ht-hero-note"><span><Check size={14}/> 浏览器即开即用</span><span><Check size={14}/> 为校园日常而设计</span></div>
        </div>
        <div className="ht-hero-visual" aria-label="会同里校园首页功能展示">
          <div className="ht-window"><div className="ht-window-bar"><span className="ht-window-dots"><i/><i/><i/></span><span>会同里 · 校园生活的另一扇窗</span><ArrowUpRight size={13}/></div>
            <div className="ht-preview"><aside className="ht-preview-sidebar"><span className="ht-preview-wordmark">会同里</span><div><span className="selected"><Compass size={17}/> 首页</span><span><Search size={17}/> 发现</span><span><Users size={17}/> 校园</span><span><CalendarDays size={17}/> 日程</span></div><small>相聚，在会同里。</small></aside>
              <div className="ht-preview-main"><div className="ht-preview-heading"><span>让每一天，都有新发现。</span><Search size={17}/></div><div className="ht-preview-photo"><img src={campus} alt="北师港浸大校园建筑与湖面"/><span>熟悉的校园，<br/>新的打开方式。</span></div><div className="ht-preview-subtitle">校园生活，由你展开 <ArrowUpRight size={16}/></div><div className="ht-preview-links"><div><CalendarDays/><strong>发现活动</strong><small>把感兴趣的事放进日程</small></div><div><Users/><strong>寻找同伴</strong><small>让一个想法找到回应</small></div><div><MapPin/><strong>探索校园</strong><small>去熟悉的地方发现新鲜</small></div></div><div className="ht-preview-bottom"><span className="ht-status-dot"/> 今天，也有值得期待的事。<ArrowRight size={15}/></div></div>
            </div>
          </div><div className="ht-floating-note"><span>↗</span><div>从「我想去」<br/><strong>到「一起吧」。</strong></div></div>
        </div>
        <a className="ht-scroll-cue" href="#experience">向下，发现会同里 <ArrowDown size={16}/></a>
      </section>

      <div className="ht-topic-strip"><span>你的校园生活，有了新的连接方式。</span><div><span>校园活动</span><i/><span>同伴组队</span><i/><span>社区分享</span><i/><span>三维校园</span></div></div>

      <section id="experience" className="ht-section ht-experience"><div className="ht-section-heading ht-reveal"><p className="ht-kicker">ONE CAMPUS. MORE POSSIBILITIES.</p><h2>校园的精彩，<br/><span>在同一个地方相遇。</span></h2><p>从每天的安排到偶然的发现，让想做的事更近一步。</p></div>
        <div className="ht-tabs" role="tablist" aria-label="功能预览">{views.map((label, index) => <button key={label} id={`ht-tab-${index}`} role="tab" aria-selected={view === index} aria-controls="ht-feature-panel" tabIndex={view === index ? 0 : -1} onClick={() => setView(index)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (view + (event.key === 'ArrowRight' ? 1 : 3)) % 4; setView(next); document.getElementById(`ht-tab-${next}`)?.focus() } }}>{label}</button>)}</div>
        <div className="ht-feature-panel" id="ht-feature-panel" role="tabpanel" aria-labelledby={`ht-tab-${view}`} key={view}>
          <div className="ht-feature-copy"><span className="ht-feature-number">0{view + 1} / 04</span><h3>{['把日常，安排得刚刚好。', '让兴趣，带你出发。', '一个人想做的事，一起做。', '换个视角，重新认识校园。'][view]}</h3><p>{['活动、课表、收藏与通知，在熟悉的校园首页汇合。打开会同里，找到今天想做的下一件事。', '从校园活动到社区新鲜事，找到值得停下来看一眼的内容。收藏感兴趣的发现，继续探索更多可能。', '约一场球，组一次队，分享一段校园见闻。在同伴与社区里，让共同的兴趣有机会相遇。', '在三维地图里浏览校园建筑，再回到校园探索中了解地点与活动。把屏幕上的发现，变成下一次出发的方向。'][view]}</p><a href={destinations[view]} className="ht-text-link">{['看看我的校园', '去发现精彩', '寻找我的同伴', '打开三维校园'][view]} <ArrowUpRight size={17}/></a></div>
          <div className={`ht-feature-art ht-feature-art-${view}`}>
            {view === 3 ? <div className="ht-map-art"><img src={lake} alt="校园湖畔建筑与远山" loading="lazy"/><div><MapPin size={29}/><strong>校园，不止一个视角。</strong><a href="/v2/campus/explore">进入三维探索 <ArrowUpRight size={16}/></a></div></div> : <><img src={[evening, trees, lake][view]} alt={['黄昏时的校园与湖面', '阳光下的校园步道', '校园湖畔公共空间'][view]} loading="lazy"/><div className="ht-art-caption"><span>{['留一点时间，给喜欢的事。', '从一次发现，开始新的故事。', '同频的人，会在这里遇见。'][view]}</span><small>{['日程 · 收藏 · 校园日常', '活动 · 兴趣 · 社区发现', '同伴 · 组队 · 校园交流'][view]}</small></div></>}
          </div>
        </div>
      </section>

      <section id="discover" className="ht-discover ht-section"><div className="ht-reveal"><p className="ht-kicker">LESS SEARCHING. MORE LIVING.</p><h2>少一点错过。<br/><span>多一点「正好」。</span></h2></div><div className="ht-benefits"><article className="ht-reveal"><CalendarDays/><h3>想去的活动，<br/>有迹可循。</h3><p>浏览校园活动，查看时间与地点，把感兴趣的内容收藏起来。</p><a href="/v2/activities">发现校园活动 <ArrowUpRight size={16}/></a></article><article className="ht-reveal"><MessageCircle/><h3>共同的话题，<br/>让彼此靠近。</h3><p>分享校园生活，关注喜欢的作者，从一篇笔记开始认识同校的朋友。</p><a href="/v2/community">走进校园社区 <ArrowUpRight size={16}/></a></article><article className="ht-reveal"><Users/><h3>下一次出发，<br/>有人一起。</h3><p>寻找校园同伴，发现正在组建的队伍，让运动、学习和探索有伴同行。</p><a href="/v2/partners">看看校园同伴 <ArrowUpRight size={16}/></a></article></div></section>

      <section id="campus" className="ht-campus-story"><img className="ht-campus-image" src={evening} alt="暮色中的北师港浸大校园" loading="lazy"/><div className="ht-campus-shade"/><div className="ht-campus-copy ht-reveal"><p className="ht-kicker">A NEW PERSPECTIVE ON HOME.</p><h2>走过很多遍，<br/>也值得再发现一遍。</h2><p>在三维校园中找到熟悉的建筑。<br/>从一个地点出发，探索发生在这里的校园生活。</p><a href="/v2/campus/explore" className="ht-button ht-button-light">探索我们的校园 <ArrowUpRight size={18}/></a></div><span className="ht-photo-credit">北师港浸大 · 校园实景</span></section>

      <section id="questions" className="ht-section ht-faq"><div className="ht-reveal"><p className="ht-kicker">GOOD TO KNOW.</p><h2>开始之前，<br/><span>你可能想知道。</span></h2></div><div className="ht-faq-list">{[
        ['会同里是什么？', '会同里是围绕校园日常打造的平台，将活动发现、校园社区、同伴组队、个人日程与三维校园连接在一起，帮助你发现校园里的更多可能。'],
        ['需要下载 App 吗？', '可以直接在浏览器中打开会同里。进入平台后，按照页面引导登录或完成学校身份认证；具体功能的使用范围以平台内说明为准。'],
        ['可以在这里找到哪些校园内容？', '你可以查看校园活动与社区笔记，寻找同伴和队伍，浏览校园组织，也可以通过三维地图探索校园建筑。内容与可用操作以登录后的实际页面为准。'],
        ['体育记录与活动参与是一回事吗？', '校园活动与体育业务分别处理。体育记录以独立体育平台的数据和规则为准，收藏活动或标记参与不会自动产生体育学时。'],
      ].map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

      <section className="ht-final"><p className="ht-kicker">SEE YOU AROUND CAMPUS.</p><h2>下一段校园故事，<br/>在会同里开始。</h2><a href="/v2/welcome" className="ht-button ht-button-mint">进入会同里 <ArrowUpRight size={20}/></a><span>让校园生活，自然发生。</span></section>
    </main>
    <footer className="ht-footer"><Brand/><span>相聚，在会同里。</span><a href="#ht-main">回到顶部 ↑</a><small>© {new Date().getFullYear()} 会同里 Huitongli</small></footer>
  </div>
}
