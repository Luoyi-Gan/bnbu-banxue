import { useEffect, useRef } from 'react'
import { Bell, Search, CalendarDays, Heart, MessageCircle, Home, Compass, Users, MapPin, ChevronRight, Check, Coffee, Play, Send, BookOpen, Settings, Activity } from 'lucide-react'
import campus from '../assets/campus/home-background.jpg'
import evening from '../assets/campus/evening-campus.jpg'
import services from '../assets/campus/campus-services.jpg'
import './product-screen.css'

export type ScreenName = 'home' | 'discover' | 'forum' | 'coffee' | 'partners' | 'sports' | 'map' | 'clubs' | 'alumni' | 'schedule' | 'ai' | 'messages' | 'profile'
export function ScreenPreview({ name, active = true }: { name: ScreenName; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const resize = new ResizeObserver(([entry]) => el.style.setProperty('--screen-scale', String(entry.contentRect.width / 390)))
    resize.observe(el)
    return () => resize.disconnect()
  }, [])
  return <div ref={ref} className={`screen-preview ${active ? 'is-active' : ''}`} aria-hidden={!active}><ProductScreen name={name} active={active}/></div>
}
const labels: Record<ScreenName, string> = { home: '会同里', discover: '发现', forum: '校园社区', coffee: 'Coffee Chat', partners: '找搭子', sports: '运动', map: '校园地图', clubs: '社团组织', alumni: '校友交流', schedule: '我的安排', ai: '校园问答', messages: '我的会话', profile: '我的' }

/** Read-only HTML rendition of the current product UI. No API or simulated business writes. */
export function ProductScreen({ name, active = true }: { name: ScreenName; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let inView = false
    const sync = () => { el.dataset.running = String(active && inView && !document.hidden) }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync() })
    observer.observe(el); document.addEventListener('visibilitychange', sync)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [active])
  const tile = (title: string, meta: string, image: string, i = 0) => <article className={`ps-tile ps-reveal ps-delay-${i}`} key={title}><img src={image} alt="校园景色" /><div><b>{title}</b><small>{meta}</small><span className="ps-card-meta"><span>校园同学</span><Heart size={14}/></span></div></article>
  return <div ref={ref} className={`product-screen ps-${name}`} data-running="false" aria-label={`${labels[name]} HTML 动画演示`}>
    <header className="ps-header"><strong>{labels[name]}</strong><div><CalendarDays/><Bell/><span className="ps-avatar">林</span></div></header>
    <div className="ps-content">
      {name === 'home' && <><div className="ps-home-hero"><p>10 月 20 日<br/>星期二</p><h3>下午好，<br/>林同学</h3><img src={campus} alt="校园建筑"/></div><article className="ps-surface ps-focus"><small>下一项安排</small><h3>英语口语工作坊</h3><p>19:00 校园广场 <ChevronRight size={15}/></p></article><div className="ps-stats"><span><b>0</b>今日安排</span><span><b>0</b>未读消息</span><span><b>—</b>学期进度</span></div><h4>校园新鲜事</h4>{tile('下课之后，去看看校园', '校园日常', evening)}</>}
      {(name === 'discover' || name === 'forum') && <><div className="ps-top-tabs">{(name === 'forum' ? ['关注','发现','推荐'] : ['活动','社团','社区','校友']).map((x,i)=><span key={x} className={i===1?'selected':''}>{x}</span>)}<Search size={19}/></div><div className="ps-chips"><span>推荐</span><span>校园</span><span>学习</span><span>生活</span><span>互助</span></div><div className="ps-feed">{tile(name==='forum'?'在校园里，收集一个普通的晴天':'秋日校园摄影展', '校园广场 · 10/21', campus)}{tile('课后散步，你最喜欢哪一段路？','校园生活',evening,1)}{tile('把学习节奏，慢慢找回来','学习分享',services,2)}{tile('校园夜跑计划','一起出发',campus,1)}</div><div className="ps-toast ps-like"><Heart size={17}/>已收藏，留给下次再看</div><div className="ps-note"><img src={campus} alt="校园照片"/><h3>在校园里，收集一个普通的晴天</h3><p>下课后慢慢走，记录熟悉校园里的新发现。</p><div><Heart size={18}/><span>收藏</span><MessageCircle size={18}/><span>写下你的回应…</span></div></div></>}
      {name === 'coffee' && <><h2>Coffee Chat</h2><p className="ps-subtitle">和老师聊聊，每一种可能。</p><img className="ps-banner" src={services} alt="校园公共空间"/><div className="ps-search"><Search size={19}/>搜索老师、学院或研究方向</div><div className="ps-chips"><span>全部</span><span>FST</span><span>FBM</span><span>FHSS</span></div><article className="ps-surface ps-teacher"><img src={services} alt="校园公共空间"/><h3>陈老师 <small>演示</small></h3><p>学习方法 · 专业探索</p><div className="ps-slots"><span>周三 14:00</span><span className="ps-pick">周三 15:00 <Check size={13}/></span></div><div className="ps-primary">选择交流时段 <Coffee size={16}/></div></article><div className="ps-toast"><Check size={18}/>时段已选择 · 预约流程演示</div></>}
      {name === 'partners' && <><h2>一个人的计划，<br/>找到同行的人。</h2><div className="ps-search"><Search size={19}/>找一个同频的搭子</div><div className="ps-chips"><span>全部</span><span>自习</span><span>运动</span><span>拼车</span></div>{['图书馆，一起专注两小时','下课后，去打羽毛球','周末出发，一起去市区'].map((title,i)=><article key={title} className={`ps-surface ps-team ps-reveal ps-delay-${i}`}><small>{['学习搭子','运动搭子','出行搭子'][i]}</small><h3>{title}</h3><p><MapPin size={15}/>{['学习资源中心','体育馆','校园南门'][i]}</p><div className="ps-team-bottom"><span>○ ○ 寻找同行</span><b>{i===0?'查看队伍':'一起出发'} →</b></div></article>)}<div className="ps-toast"><Users size={18}/>找到合适的队伍，聊聊计划</div></>}
      {name === 'sports' && <><div className="ps-chips"><span>学期进度</span><span>运动记录</span></div><div className="ps-demo-label">本地模拟 · 不计入真实学时</div><article className="ps-surface"><div className="ps-top-tabs"><span className="selected">课程相关</span><span>自主运动</span></div><small>本次运动</small><h2>羽毛球</h2><p>大学体育（羽毛球）</p><div className="ps-sports-ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="67"/><circle className="ps-ring-fill" cx="80" cy="80" r="67"/></svg><div><Activity size={28}/><b>运动时刻</b><small>演示中</small></div></div><p>运动要求 <ChevronRight size={16}/></p><div className="ps-primary"><Play size={16}/>开始运动</div></article><div className="ps-toast"><Check size={18}/>查看记录，回顾每一次出发</div></>}
      {name === 'map' && <><div className="ps-search"><Search size={19}/>搜索地点、楼号或拼音</div><div className="ps-chips"><span>全校</span><span>一期</span><span>二期</span></div><div className="ps-map-scene"><div className="ps-map-ground"><img src="/promo/map.png" alt="实际校园模型视角"/><span className="ps-map-pin"><MapPin size={22}/>学习资源中心</span></div></div><article className="ps-surface ps-map-info"><small>地点详情 · 界面演示</small><h3>学习资源中心</h3><p>一期 · 查看建筑与地点</p><div className="ps-primary">在真实 3D 校园中探索 →</div></article></>}
      {name === 'clubs' && <><h2>找到你的热爱。</h2><p className="ps-subtitle">认识校园里的社团与组织</p><div className="ps-search"><Search size={19}/>搜索社团组织</div>{['校园摄影社','英语交流社','校园运动协会'].map((x,i)=><article className={`ps-surface ps-club ps-delay-${i}`} key={x}><img src={[campus,services,evening][i]} alt="校园活动场景"/><div><h3>{x}</h3><p>认识朋友，分享兴趣</p><span className="ps-follow">＋ 关注组织</span></div></article>)}<div className="ps-toast"><Check size={18}/>关注组织，继续了解新动态</div></>}
      {name === 'alumni' && <><h2>看看走过的路。</h2><p className="ps-subtitle">校友经验与交流</p><div className="ps-chips"><span>全部</span><span>升学</span><span>就业</span><span>成长</span></div>{tile('从校园出发，寻找自己的方向','经验分享 · 演示内容',campus)}<article className="ps-surface"><h3>一场关于未来的对话</h3><p>了解校友方向，查看可交流的时间。</p><div className="ps-slots"><span>查看资料</span><span className="ps-pick">交流时段</span></div></article><div className="ps-toast"><Coffee size={18}/>带着问题，开启交流</div></>}
      {name === 'schedule' && <><h2>我的安排</h2><p className="ps-subtitle">2026 年 10 月</p><div className="ps-calendar">{['一','二','三','四','五','六','日',...Array.from({length:28},(_,i)=>String(i+1))].map((x,i)=><span key={i} className={x==='21'?'ps-calendar-active':''}>{x}</span>)}</div><h4>10 月 21 日 · 我的日程</h4>{['09:00 课程安排','14:00 Coffee Chat','19:00 英语口语工作坊'].map((x,i)=><article className={`ps-surface ps-agenda ps-delay-${i}`} key={x}><CalendarDays size={20}/><b>{x}</b></article>)}<div className="ps-toast"><CalendarDays size={18}/>让课程与日常，都有安排</div></>}
      {name === 'ai' && <><h2>关于校园，问问看。</h2><p className="ps-subtitle">校园问答 · 对话演示</p><div className="ps-question">想认识校园里的社团，从哪里开始？</div><div className="ps-answer"><span className="ps-dots">● ● ●</span><div className="ps-answer-text"><BookOpen size={23}/><p>可以从「社团组织」浏览介绍与联系方式，找到感兴趣的组织。</p><small>入口：校园 → 社团组织</small></div></div><div className="ps-input">输入你想了解的问题 <Send size={18}/></div></>}
      {name === 'messages' && <><div className="ps-chips"><span>全部消息</span><span>通知</span><span>交流</span></div>{['Coffee Chat 预约提醒','队伍里的新回应','你的校园日程'].map((x,i)=><article className={`ps-surface ps-message ps-delay-${i}`} key={x}><span className="ps-avatar">{['☕','林','日'][i]}</span><div><h3>{x}</h3><p>{['查看预约与安排','一起确认时间和地点','看看接下来的计划'][i]}</p></div><i/></article>)}<div className="ps-toast"><MessageCircle size={18}/>重要的回应，集中查看</div></>}
      {name === 'profile' && <><div className="ps-profile-head"><span className="ps-avatar">林</span><h2>林同学</h2><p>在校园里，记录与分享。</p></div><div className="ps-stats"><span><b>0</b>关注</span><span><b>0</b>粉丝</span><span><b>0</b>获赞与收藏</span></div>{['我的笔记','我的收藏','我的活动','我的队伍','设置与偏好'].map((x,i)=><article className={`ps-surface ps-profile-row ps-delay-${i%3}`} key={x}><span>{x}</span>{i===4?<Settings size={19}/>:<ChevronRight size={19}/>}</article>)}<div className="ps-toast"><Check size={18}/>回看参与，也整理自己的空间</div></>}
    </div>
    <footer className="ps-bottom">{[Home, Compass, Users, Activity].map((Icon,i)=><span key={i}><Icon size={20}/>{['首页','发现','校园','运动'][i]}</span>)}<span><span className="ps-avatar">林</span>我的</span></footer>
  </div>
}
