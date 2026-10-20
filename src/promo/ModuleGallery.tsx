import { ScreenPreview, type ScreenName } from './ProductScreen'
import { useState } from 'react'
import { ArrowUpRight, ChevronRight } from 'lucide-react'

const modules = [
  { name: '论坛', en: 'COMMUNITY', screen: 'forum', title: '把校园日常，聊成共同话题。', text: '从一篇图文到一条回复，分享发现、提出问题，也收藏值得再看的经验。', features: ['图文发布与编辑', '话题浏览与搜索', '关注、评论与收藏'], route: '/v2/community' },
  { name: 'Coffee Chat', en: 'CONVERSATION', screen: 'coffee', title: '一次认真交流，打开新的思路。', text: '看看老师的交流主题与开放时段，把学习、规划和成长中的问题带到一场对话里。', features: ['教师与交流主题', '开放时段', '预约与安排'], route: '/v2/coffee' },
  { name: '找搭子', en: 'TOGETHER', screen: 'partners', title: '想做的事，找到一起的人。', text: '自习、拼车、运动与兴趣活动，从浏览队伍到发起组队，让计划有同行的人。', features: ['分类寻找队伍', '时间与地点', '发起和加入'], route: '/v2/partners' },
  { name: '运动', en: 'MOVE', screen: 'sports', title: '每次出发，都有自己的节奏。', text: '体育课程、运动入口和记录集中查看。当前界面展示本地模拟流程，不计入真实学时。', features: ['体育课程', '运动打卡入口', '记录与进度'], route: '/v2/sports' },
  { name: '活动', en: 'DISCOVER', screen: 'discover', title: '课表之外，也有值得期待的事。', text: '了解校园活动的时间、地点与详情，收藏感兴趣的内容，安排下一次出发。', features: ['发现校园活动', '活动详情', '收藏与参与标记'], route: '/v2/activities' },
  { name: '社团组织', en: 'BELONG', screen: 'clubs', title: '让兴趣，找到同频的地方。', text: '浏览社团与校园组织，了解介绍和联系方式，关注你感兴趣的组织。', features: ['组织介绍', '联系信息', '关注动态'], route: '/v2/organizations' },
  { name: '校友交流', en: 'BEYOND CAMPUS', screen: 'alumni', title: '未来的路，听听走过的人怎么说。', text: '阅读校友经验，了解不同方向，查看交流时段并发起预约。', features: ['经验分享', '校友与方向', '交流预约'], route: '/v2/alumni' },
  { name: '日程课表', en: 'YOUR DAY', screen: 'schedule', title: '把今天理清楚，把时间留给生活。', text: '从日历查看安排，让课程与校园日程有一个熟悉的入口。', features: ['日历视图', '课程安排', '个人日程'], route: '/v2/schedule' },
  { name: '校园与地图', en: 'EXPLORE', screen: 'map', title: '从一个地点，认识整座校园。', text: '在立体校园里搜索楼栋、切换校区、查看地点，也从校园页面找到常用服务。', features: ['3D 校园', '地点搜索', '校园服务入口'], route: '/v2/campus' },
  { name: '校园问答', en: 'ASK', screen: 'ai', title: '关于校园的问题，从这里问起。', text: '通过校园问答入口提问，查看回答与可用来源，让信息更容易查找。', features: ['问题输入', '回答记录', '来源提示'], route: '/v2/ai' },
  { name: '消息', en: 'STAY CONNECTED', screen: 'messages', title: '让重要的回应，有一个落点。', text: '在消息中心查看通知与交流记录，及时接上与你有关的校园动态。', features: ['通知', '交流记录', '未读提示'], route: '/v2/messages' },
  { name: '个人中心', en: 'YOUR SPACE', screen: 'profile', title: '属于你的校园生活，慢慢积累。', text: '从个人主页回看自己的内容与参与，管理资料、收藏和使用偏好。', features: ['个人资料与内容', '收藏与参与', '语言、显示与隐私设置'], route: '/v2/me' },
]

export function ModuleGallery() {
  const [selected, setSelected] = useState(0)
  const active = modules[selected]
  return <section id="modules" className="promo-modules" aria-labelledby="modules-title">
    <div className="promo-modules-heading">
      <p className="promo-eyebrow">ONE CAMPUS. MANY POSSIBILITIES.</p>
      <h2 id="modules-title">校园生活的每一面，<br /><em>都有一个入口。</em></h2>
      <p>十二个模块，串起学习、交流、运动与日常。</p>
    </div>
    <div className="promo-module-tabs" role="group" aria-label="浏览平台模块">
      {modules.map((item, i) => <button key={item.name} aria-pressed={selected === i} aria-controls="module-detail" onClick={() => setSelected(i)}>{item.name}</button>)}
    </div>
    <div className="promo-module-stage">
      <div className="promo-module-copy" id="module-detail" aria-live="polite" aria-atomic="true">
        <p className="promo-eyebrow">{String(selected + 1).padStart(2, '0')} / {active.en}</p>
        <h3>{active.title}</h3><p>{active.text}</p>
        <ul>{active.features.map(feature => <li key={feature}><ChevronRight size={15}/>{feature}</li>)}</ul>
        <a className="promo-text-link" href={active.route}>打开{active.name}<ArrowUpRight size={18}/></a>
      </div>
      <div className="promo-module-device" aria-label={`${active.name}真实界面`}>
        <div className="promo-module-status" aria-hidden="true"><span>9:41</span><i/><span>▰</span></div>
        <div className="promo-module-screen">{modules.map((item, i) => <ScreenPreview key={item.name} name={item.screen as ScreenName} active={selected === i}/>)}</div>
      </div>
    </div>
  </section>
}
