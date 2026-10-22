import {useEffect,useState,type FormEvent} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {ArrowRight,ArrowUpRight,Building2,CalendarDays,ChevronDown,ChevronRight,MapPin,Sparkles} from 'lucide-react'
import {AnimatePresence,motion} from 'motion/react'
import {useWorkspaceBackend} from './useWorkspaceBackend'
import {useDevicePreferences} from './devicePreferences'
import {StudentSearch} from './StudentSearch'
import {StudentUtilities} from './StudentUtilities'
import {StudentTimetable} from './StudentTimetable'
import {CommunityModal} from './CommunityModal'
import {CampusAIChat} from './CampusAIChat'
import {homepageAgenda,courseClock} from './homeAgenda'
import {campusDate} from './reference/model'
import {Header,Feedback} from './reference/components'
import {uiText,uiLocale,useUiLanguage} from './uiLanguage'
import campus from '../assets/campus/gallery/blue-sky-reflection.webp'
import './campusLife.css'
import {campusLifePrompt} from './campusLifeModel'

const questions={courses:'帮我整理今天接下来的课程安排。',partners:'我想找一起学习的同学，有哪些公开的搭子信息？',clubs:'有哪些适合了解和加入的校园社团？',coffee:'我想认识做创业项目的老师，有哪些可预约的 Coffee Chat？',shops:'推荐适合小组讨论的校园咖啡店，请注明已有资料和待核实的信息。',directory:'学校的在读证明怎么办理，应该联系哪个部门？'}
const entries=[
 {key:'partners',title:'找搭子',description:'一起学习，一起出发',path:'/v2/partners',image:'/clubs/6224a32df7f35874.jpg',alt:'心理健康协会历史活动中的同学互动',caption:'校园互动 · 历史活动配图'},
 {key:'clubs',title:'社团组织',description:'发现兴趣相投的人',path:'/v2/organizations',image:'/clubs/7aa3dfc6c2dad853.jpg',alt:'野蜂户外运动社历史招新现场',caption:'真实社团 · 历史招新现场'},
 {key:'coffee',title:'Coffee Chat',description:'和老师聊一聊，交换新的想法',path:'/v2/coffee',image:'/clubs/b293416bf4acbdd8.jpg',alt:'德意志语言文化交流社成员与老师一起制作水果沙拉',caption:'师生交流 · 历史活动配图'},
 {key:'shops',title:'校园探店',description:'收藏身边的好去处',path:'/v2/shops',image:'/shops/memory-0.jpg',alt:'学校 Memory 纪念品中心的真实室内空间',caption:'Memory · 校园空间'},
] as const

export function CampusLifePage(){
 useUiLanguage()
 const live=useWorkspaceBackend(30000),device=useDevicePreferences(),navigate=useNavigate()
 const [now,setNow]=useState(Date.now),[expanded,setExpanded]=useState(false),[lesson,setLesson]=useState<string|null>(null)
 const [aiOpen,setAiOpen]=useState(false),[draft,setDraft]=useState(''),[question,setQuestion]=useState('')
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer)},[])
 const agenda=homepageAgenda(live.data,now),next=agenda.remainingCourses[0]
 const openAI=(value=draft)=>{setQuestion(value);setDraft(value);setAiOpen(true)}
 const launchAI=(event:FormEvent)=>{event.preventDefault();openAI(draft||campusLifePrompt(now))}
 const formatTime=(value:string)=>new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value))
 const courseRow=(item:typeof agenda.courses[number])=><button key={item.id} className="cl-course-row" onClick={()=>setLesson(item.lessonId!)} aria-label={`${uiText('查看课程')} ${item.title}`}><time>{formatTime(item.startAt!)}<small>{item.endAt?formatTime(item.endAt):uiText('结束待核对')}</small></time><span><strong>{item.title}</strong><small><MapPin size={12}/>{item.location||uiText('教室待确认')}<i>·</i>{uiText(courseClock(item,now).active?'正在上课':courseClock(item,now).ended?'已结束':'待上课')}</small></span><ChevronRight size={15}/></button>
 return <div className="ref-page campus-life">
  <Header title={uiText('校园')} actions={<><StudentSearch/><StudentUtilities hideSettings/></>}/>
  <Feedback live={live}/>
  <div className="cl-body">
   <section className="cl-hero" aria-labelledby="cl-title"><Link to="/v2/campus/explore" aria-label={uiText('在地图里探索校园')}><img src={campus} alt={uiText('蓝天下的校园建筑与湖面')}/><span>{uiText('探索校园地图')}<ArrowUpRight size={16}/></span></Link><div><p>{uiText('你的校园日常')}<time dateTime={campusDate(new Date(now))}>{new Intl.DateTimeFormat(uiLocale(),{timeZone:'Asia/Shanghai',month:'short',day:'numeric',weekday:'short'}).format(now)}</time></p><h2 id="cl-title">{uiText('今天，也有值得期待的事。')}</h2></div></section>
   <div className="cl-daily">
    <section className="cl-courses" aria-labelledby="cl-courses-title"><header><h2 id="cl-courses-title"><CalendarDays size={17}/>{uiText('今日课程')}</h2><Link to="/v2/me?tab=timetable">{uiText('完整课表')}<ChevronRight size={14}/></Link></header>
     {!live.data?<p className="cl-empty" role="status">{uiText(live.error?'课程暂时无法读取，请重试。':'正在读取本人课程…')}</p>:next?courseRow(next):<p className="cl-empty">{uiText(agenda.courses.length?'今天的课程已结束，去探索校园吧。':'今天暂无已核对的课程安排。')}</p>}
     {live.data&&agenda.courses.length>0&&<><button className="cl-course-expand" aria-expanded={expanded} aria-controls="cl-all-courses" onClick={()=>setExpanded(!expanded)}><span>{uiText('今日共')} {agenda.courses.length} {uiText('节课')}<i>·</i>{uiText(expanded?'收起今日课程':'展开查看全部')}</span><ChevronDown size={14} className={expanded?'is-expanded':''}/></button><AnimatePresence initial={false}>{expanded&&<motion.div id="cl-all-courses" initial={{height:device.reducedMotion?'auto':0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:device.reducedMotion?'auto':0,opacity:0}} transition={{duration:device.reducedMotion?0:.24}} className="cl-all-courses">{agenda.courses.filter(item=>item.id!==next?.id).map(courseRow)}{agenda.courses.length===1&&next&&<p className="cl-empty">{uiText('今天只有这一节课。')}</p>}</motion.div>}</AnimatePresence></>}
    </section>
    <section className="cl-ai" aria-labelledby="cl-ai-title"><button className="cl-ai-heading" onClick={()=>openAI()}><span className="cl-ai-mark"><Sparkles size={19}/></span><span><h2 id="cl-ai-title">{uiText('问问校园 AI')}</h2><small>{uiText('课程、办事、活动，都可以问我')}</small></span><ArrowUpRight size={17}/></button><form onSubmit={launchAI}><input aria-label={uiText('想问校园 AI 的问题')} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={uiText(campusLifePrompt(now))} maxLength={500}/><button aria-label={uiText('打开校园 AI 对话')} type="submit"><ArrowRight size={17}/></button></form></section>
   </div>
   <section className="cl-explore" aria-labelledby="cl-explore-title"><header><div><p>CAMPUS LIFE</p><h2 id="cl-explore-title">{uiText('探索校园')}</h2></div><Link to="/v2/discover">{uiText('发现更多')}<ArrowRight size={15}/></Link></header><div className="cl-explore-grid">{entries.map(entry=><article key={entry.key} className={`cl-entry cl-entry-${entry.key}`}><Link to={entry.path} className="cl-entry-link"><div className="cl-entry-photo"><img src={entry.image} alt={uiText(entry.alt)} loading="lazy" decoding="async"/><span>{uiText(entry.caption)}</span><ArrowUpRight size={17}/></div><div className="cl-entry-copy"><h3>{uiText(entry.title)}</h3><p>{uiText(entry.description)}</p></div></Link><button className="cl-context-question" onClick={()=>openAI(questions[entry.key])} aria-label={`${uiText('问 AI：')}${uiText(entry.title)}`}><Sparkles size={12}/><span>{uiText('问 AI')}</span></button></article>)}</div></section>
   <Link to="/v2/campus?service=directory" className="cl-directory"><span><Building2 size={22}/></span><div><h2>{uiText('校园办事')}</h2><p>{uiText('办事指南 · 常用服务 · 校园联系')}</p></div><ChevronRight size={18}/></Link>
   <details className="cl-photo-sources"><summary>{uiText('关于本页配图')}</summary><p>{uiText('校园实景及学校公开历史活动配图，保留原作者版权；配图不代表正在招募的搭子、可预约交流或当前活动。')}</p><a href="https://www.bnbu.edu.cn/info/1077/13899.htm" target="_blank" rel="noreferrer">{uiText('同学互动配图来源')}</a><a href="https://www.bnbu.edu.cn/info/1077/13899.htm" target="_blank" rel="noreferrer">{uiText('师生交流配图来源')}</a><a href="https://www.bnbu.edu.cn/info/1076/5861.htm" target="_blank" rel="noreferrer">{uiText('社团招新配图来源')}</a><a href="https://ic.bnbu.edu.cn/souvenir/introduction.htm" target="_blank" rel="noreferrer">{uiText('Memory 空间配图来源')}</a></details>
  </div>
  {lesson&&<StudentTimetable key={lesson} embedded detailOnly initialWorkspace={live.data??undefined} initialLessonId={lesson} onCloseDetails={()=>setLesson(null)}/>}
  {aiOpen&&<CommunityModal title={uiText('校园 AI')} onClose={()=>setAiOpen(false)}><div className="cl-ai-sheet"><CampusAIChat embedded initialQuestion={question} onDraftChange={setDraft} onExpand={value=>navigate('/v2/ai',{state:{campusAIDraft:value}})}/></div></CommunityModal>}
 </div>
}
