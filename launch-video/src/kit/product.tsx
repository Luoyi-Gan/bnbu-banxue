import type { CSSProperties, ReactNode } from 'react';
import { Avatar, Box, Btn, Card, Chip, Divider, Icon, Kicker, P, Tag, Txt } from './base';

// ---------------- data (local demo records written through real commands) ----------------
export type Act = { id: string; title: string; date: string; place: string; org: string; tag?: string; a?: string; b?: string; k: number; member?: boolean; marked?: boolean };
export const ACTS: Act[] = [
  { id: 'board', title: '桌游交流夜', date: '10/19周一 19:00', place: 'T2-102', org: '陈予安', k: 0.72, member: true },
  { id: 'career', title: '毕业生经验分享会', date: '10/22周四 18:30', place: '大学会堂', org: '学生事务处', tag: 'CAREER', a: '#1d4ed8', b: '#9333ea', k: 1.25 },
  { id: 'speaking', title: '英文演讲公开课', date: '10/20周二 16:00', place: 'T3-201', org: '语言中心', tag: 'SPEAKING', a: '#4338ca', b: '#0891b2', k: 0.8 },
  { id: 'library', title: '图书馆检索技巧讲座', date: '10/21周三 14:00', place: '图书馆', org: '图书馆', tag: 'LIBRARY', a: '#0ea5e9', b: '#6366f1', k: 1.0 },
  { id: 'cinema', title: '电影放映夜', date: '10/18周日 19:00', place: '演艺厅', org: '电影协会', tag: 'CINEMA', a: '#7c3aed', b: '#db2777', k: 0.95 },
  { id: 'run', title: '秋季校园夜跑', date: '10/17周六 19:30', place: '体育馆', org: '跑步协会', tag: 'NIGHT RUN', a: '#2563eb', b: '#06b6d4', k: 1.3, marked: true },
  { id: 'ai', title: 'AI 创作工作坊', date: '10/16周五 19:00', place: 'T4-105', org: '创新创业中心', tag: 'WORKSHOP', a: '#4f6bff', b: '#8b5cf6', k: 1.2 },
];
export const actById = (id: string) => ACTS.find((a) => a.id === id)!;

export type Team = { type: string; title: string; body: string; time: string; place: string; count: string; by: string };
export const TEAMS: Team[] = [
  { type: '学习', title: '数据分析课程小组', body: '一起完成 Python 作业，互相讲题。', time: '周三 20:00', place: 'T5-301', count: '1/4 人', by: '苏沐言' },
  { type: '学习', title: '期中周 · 图书馆自习', body: '互相监督，每天两小时专注。', time: '每周二、四 19:00', place: '图书馆', count: '3/5 人', by: '许嘉禾' },
  { type: '拼车', title: '周五傍晚拼车去珠海站', body: '两人以上成行，费用平摊。', time: '周五 17:30', place: '东大门', count: '2/4 人', by: '周以宁' },
  { type: '娱乐', title: '周末羽毛球双打', body: '水平不限，球拍可借，打完一起吃饭。', time: '周六 15:00', place: '体育馆', count: '2/4 人', by: '陈予安' },
];

export const SLOTS = [
  { date: '10月20日星期二', time: '14:00 – 14:30' },
  { date: '10月16日星期五', time: '10:30 – 11:00' },
  { date: '10月16日星期五', time: '10:00 – 10:30' },
  { date: '10月15日星期四', time: '15:30 – 16:00' },
  { date: '10月15日星期四', time: '15:00 – 15:30' },
];

export const POSTS = [
  { board: '学习交流', title: '推荐一门很有收获的选修课', body: '老师讲得很清楚，作业量适中，适合想入门数据分析的同学。', by: '苏沐言' },
  { board: '运动健康', title: '夜跑新手的第一次 5 公里', body: '慢慢跑、配速别急，跑完拉伸很重要。', by: '周以宁' },
  { board: '校园生活', title: '图书馆四楼靠窗座位真的很安静', body: '适合需要长时间专注的同学，记得带耳塞。', by: '许嘉禾' },
  { board: '学习交流', title: '期中复习资料怎么整理？', body: '分享我的三步法：先列考点，再做错题本，最后找搭子互相提问。', by: '陈予安' },
];

// ---------------- activities ----------------
export const Cover = ({ act, w, h, radius = 16, tagScale = 1 }: { act: Act; w: number; h: number; radius?: number; tagScale?: number }) => {
  const m = Math.min(w, h);
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', background: `linear-gradient(135deg, ${act.a} 0%, ${act.b} 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 60% at 50% 38%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 100%)' }} />
      {[0.62, 0.42, 0.18].map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: w / 2 - (m * r) / 2, top: h * 0.4 - (m * r) / 2, width: m * r, height: m * r, borderRadius: '50%', border: i < 2 ? '1.5px solid rgba(255,255,255,0.32)' : 'none', background: i === 2 ? 'rgba(255,255,255,0.22)' : 'none' }} />
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: h * 0.72, textAlign: 'center', fontFamily: 'Inter, "Helvetica Neue", sans-serif', fontSize: 11 * tagScale, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{act.tag}</div>
    </div>
  );
};

export const actCardH = (act: Act, w: number) => w * act.k + 104 + (act.marked ? 18 : 0);

export const ActivityCard = ({ act, w = 200, glow = 0 }: { act: Act; w?: number; glow?: number }) => {
  const ch = w * act.k;
  return (
    <div style={{ position: 'relative', width: w, height: actCardH(act, w) }}>
      {act.member ? (
        <div style={{ position: 'relative', width: w, height: ch, borderRadius: 16, background: '#F7F7F9', border: `1px solid ${P.line}`, boxSizing: 'border-box', padding: 14 }}>
          <Txt size={10.5} color={P.muted} style={{ marginTop: 18 }}>校园成员活动</Txt>
          <Txt size={21} weight={700} style={{ marginTop: 8 }}>{act.title}</Txt>
          <Tag label="校园成员活动" tone="white" style={{ position: 'absolute', left: 10, bottom: 10, fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
        </div>
      ) : (
        <div style={{ position: 'relative', boxShadow: glow ? `0 0 ${30 * glow}px rgba(79,107,255,${0.6 * glow})` : undefined, borderRadius: 16 }}>
          <Cover act={act} w={w} h={ch} />
          <Tag label="学校邮件活动" tone="white" style={{ position: 'absolute', left: 10, bottom: 10, fontWeight: 500 }} />
        </div>
      )}
      <div style={{ position: 'absolute', right: 8, top: 8, width: 30, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bookmark" size={14} color="#48484A" /></div>
      <Box x={2} y={ch + 10}>
        <Txt size={14} weight={700}>{act.title}</Txt>
        <Txt size={11.5} color={P.muted} style={{ marginTop: 5 }}>{act.date}</Txt>
        <Txt size={11.5} color={P.muted} style={{ marginTop: 3 }}>{act.place}</Txt>
      </Box>
      <Box x={2} y={ch + 78} w={w - 4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar ch={act.org[0]} size={18} style={{ background: '#F2F2F4', color: '#48484A' }} /><Txt size={11} color="#48484A">{act.org}</Txt></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="heart" size={13} color="#48484A" /><Txt size={11} color="#48484A">0</Txt></div>
      </Box>
      {act.marked && <Box x={2} y={ch + 104}><Txt size={10.5} color={P.success}>已标记参与</Txt></Box>}
    </div>
  );
};

const Fact = ({ icon, label, value, w }: { icon: string; label: string; value: string; w: number }) => (
  <div style={{ width: w, height: 62, borderRadius: 12, border: `1px solid ${P.line}`, background: P.soft, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', boxSizing: 'border-box' }}>
    <Icon name={icon} size={19} color={P.blue} />
    <div><Txt size={10.5} color={P.muted}>{label}</Txt><Txt size={12.5} weight={700} style={{ marginTop: 3 }}>{value}</Txt></div>
  </div>
);

// Detail drawer for AI 创作工作坊. `reveal(i)` gives per-section entrance (0..1); `marked` 0..1.
export const ActivityDetail = ({ reveal, marked }: { reveal: (i: number) => number; marked: number }) => {
  const act = actById('ai');
  const sec = (i: number): CSSProperties => ({ opacity: reveal(i), transform: `translateY(${(1 - reveal(i)) * 18}px)` });
  return (
    <div style={{ position: 'relative', width: 690, height: 712, background: P.surface, fontFamily: P.font }}>
      <Box x={20} y={18} style={sec(0)}><Kicker>学校邮件活动 · 创新创业中心</Kicker><Txt size={20} weight={700} style={{ marginTop: 4 }}>{act.title}</Txt></Box>
      <Box x={636} y={22} w={34} h={34} style={{ borderRadius: 9, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sec(0) }}><Icon name="x" size={16} /></Box>
      <Box x={0} y={82} w={690}><Divider /></Box>
      <Box x={20} y={100} style={sec(1)}><Cover act={act} w={650} h={160} radius={14} tagScale={0} /></Box>
      <Box x={20} y={274} style={sec(2)}><Txt size={14.5} weight={600} color={P.muted}>来自学校邮件</Txt></Box>
      <Box x={20} y={304} style={{ display: 'flex', gap: 10, alignItems: 'center', ...sec(2) }}>
        <Btn label="点赞" kind="secondary" style={{ color: P.ink, fontWeight: 500 }} />
        <Btn label="收藏" kind="secondary" style={{ color: P.ink, fontWeight: 500 }} />
        <Txt size={10.5} color={P.muted}>点赞与收藏保存到伴学后台，不影响参与标记。</Txt>
      </Box>
      <Box x={20} y={360} style={sec(3)}>
        <Txt size={14.5} weight={700}>活动介绍</Txt>
        <Txt size={12.5} color="#3A3A3C" style={{ marginTop: 10, lineHeight: 1.7 }}>从提示词到作品，一晚完成你的第一支 AI 短片。<br />参与条件：全体在校学生<br />来源：学校邮件</Txt>
      </Box>
      <Box x={20} y={470} style={sec(4)}><Txt size={14.5} weight={700}>活动信息</Txt></Box>
      <Box x={20} y={500} style={sec(4)}><Fact icon="calendar" label="时间" value="10月16日周五 19:00 至 10月16日周五 21:00" w={319} /></Box>
      <Box x={351} y={500} style={sec(5)}><Fact icon="pin" label="地点" value="T4-105" w={319} /></Box>
      <Box x={20} y={572} style={sec(5)}><Fact icon="users" label="人数上限" value="未提供" w={319} /></Box>
      <Box x={351} y={572} style={sec(6)}><Fact icon="megaphone" label="主办方" value="创新创业中心" w={319} /></Box>
      <Box x={20} y={654} style={sec(6)}>
        <div style={{ position: 'relative', height: 38, width: 92 + marked * 22 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: P.action, opacity: 1 - marked }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: P.accentSoft, opacity: marked }} />
          <Txt size={13} weight={700} color="#fff" style={{ position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center', opacity: 1 - marked }}>标记参与</Txt>
          <Txt size={13} weight={700} color={P.action} style={{ position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center', opacity: marked }}>取消参与标记</Txt>
        </div>
      </Box>
      <Box x={128 + marked * 22} y={665} style={sec(6)}>
        <Txt size={11} color={P.muted} style={{ position: 'absolute', opacity: 1 - marked }}>标记不占用活动名额。</Txt>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: marked, color: P.success }}>
          <Icon name="check" size={13} color={P.success} stroke={2.6} style={{ clipPath: `inset(0 ${(1 - marked) * 100}% 0 0)` }} /><Txt size={11} color={P.success}>已保存参与标记。</Txt>
        </div>
      </Box>
    </div>
  );
};

// ---------------- teams ----------------
const FactRow = ({ icon, text, size = 12 }: { icon: string; text: string; size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name={icon} size={size + 3} color="#3A3A3C" /><Txt size={size} color="#48484A">{text}</Txt></div>
);

export const TeamCard = ({ t, w = 300 }: { t: Team; w?: number }) => (
  <Card w={w} h={228} radius={14}>
    <Box x={18} y={18}><Tag label={t.type} /></Box>
    <Box x={w - 38} y={18}><Icon name="bookmark" size={18} color="#48484A" /></Box>
    <Box x={18} y={52}><Txt size={16} weight={700}>{t.title}</Txt><Txt size={12} color={P.muted} style={{ marginTop: 6 }}>{t.body}</Txt></Box>
    <Box x={18} y={110} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <FactRow icon="clock" text={t.time} /><FactRow icon="pin" text={t.place} /><FactRow icon="users" text={t.count} />
    </Box>
    <Box x={18} y={186} w={w - 36}><Divider /></Box>
    <Box x={18} y={198} w={w - 36} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Txt size={11.5} color={P.muted}>{t.by} 发起</Txt>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: P.action }}><Txt size={12} weight={700} color={P.action}>查看详情</Txt><Icon name="arrow" size={14} color={P.action} /></div>
    </Box>
  </Card>
);

// Rolling digit (e.g. 2 → 3).
export const Roll = ({ from, to, p, size, color = P.ink, weight = 400 }: { from: string; to: string; p: number; size: number; color?: string; weight?: number }) => (
  <span style={{ display: 'inline-block', position: 'relative', height: size * 1.3, overflow: 'hidden', verticalAlign: 'bottom' }}>
    <span style={{ display: 'block', transform: `translateY(${-p * size * 1.3}px)` }}>
      <Txt size={size} color={color} weight={weight} style={{ height: size * 1.3 }}>{from}</Txt>
      <Txt size={size} color={color} weight={weight} style={{ height: size * 1.3 }}>{to}</Txt>
    </span>
  </span>
);

// Team drawer: apply → pending → joined. members: per-chip reveal for the three members.
export const TeamDetail = ({ stage, applyP, joinP, chipP, countP, enterP }: { stage: number; applyP: number; joinP: number; chipP: number[]; countP: number; enterP: number }) => (
  <div style={{ position: 'relative', width: 480, height: 430, background: P.surface }}>
    <Box x={20} y={18}><Kicker>娱乐 · 陈予安 发起</Kicker><Txt size={20} weight={700} style={{ marginTop: 4 }}>周末羽毛球双打</Txt></Box>
    <Box x={426} y={22} w={34} h={34} style={{ borderRadius: 9, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></Box>
    <Box x={0} y={82} w={480}><Divider /></Box>
    <Box x={20} y={102}><Txt size={15} weight={600} color={P.muted}>水平不限，球拍可借，打完一起吃饭。</Txt></Box>
    <Box x={20} y={142} w={440} h={104} style={{ borderRadius: 12, background: '#F2F6FC', padding: '14px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}><Icon name="clock" size={16} color={P.blue} /><Txt size={13} color="#3A3A3C">周六 15:00</Txt></div>
      <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}><Icon name="pin" size={16} color={P.blue} /><Txt size={13} color="#3A3A3C">体育馆</Txt></div>
      <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}><Icon name="users" size={16} color={P.blue} /><Txt size={13} color="#3A3A3C"><Roll from="2" to="3" p={countP} size={13} color="#3A3A3C" /> / 4 人</Txt></div>
    </Box>
    {stage < 2 && (
      <Box x={20} y={272} style={{ opacity: 1 - joinP }}>
        <div style={{ position: 'relative', width: mixW(104, 84, applyP), height: 38 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: P.action, opacity: 1 - applyP, transform: `scale(${1 - applyP * 0.1})` }} />
          <Txt size={13} weight={700} color="#fff" style={{ position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center', opacity: 1 - applyP }}>申请加入</Txt>
          <div style={{ position: 'absolute', left: 0, top: 7, opacity: applyP, transform: `translateY(${(1 - applyP) * 8}px)` }}><Tag label="申请待处理" tone="grey" style={{ height: 24 }} /></div>
        </div>
      </Box>
    )}
    {stage >= 2 && (
      <>
        <Box x={20} y={272} style={{ opacity: joinP, transform: `translateY(${(1 - joinP) * 12}px)` }}><Txt size={16} weight={700}>已加入成员</Txt></Box>
        {[['陈', '陈予安'], ['许', '许嘉禾'], ['林', '林知夏']].map(([c, n], i) => (
          <Box key={n} x={20 + i * 82} y={306} style={{ opacity: chipP[i], transform: `scale(${0.6 + 0.4 * chipP[i]})` }}>
            <div style={{ height: 30, borderRadius: 15, background: '#EDF3FF', padding: '0 11px', display: 'flex', alignItems: 'center' }}><Txt size={12} color={P.accentInk}>{c} · {n}</Txt></div>
          </Box>
        ))}
        <Box x={20} y={356} style={{ opacity: enterP, transform: `translateY(${(1 - enterP) * 12}px)` }}><Btn label="进入队伍消息" icon="arrow" /></Box>
      </>
    )}
  </div>
);
const mixW = (a: number, b: number, p: number) => a + (b - a) * p;

export const MSGS = [
  { who: '陈', name: '陈予安', time: '2026/10/13 12:27:51', body: '周六 15:00 体育馆二号场，我带了两支备用拍。' },
  { who: '许', name: '许嘉禾', time: '2026/10/13 12:27:52', body: '收到！欢迎新队友一起来。' },
  { who: '陈', name: '陈予安', time: '2026/10/13 12:28:05', body: '欢迎知夏！周六 15:00 体育馆见。' },
];

export const ChatPanel = ({ msgP }: { msgP: number[] }) => (
  <div style={{ position: 'relative', width: 640, height: 440, background: P.surface }}>
    <Box x={22} y={18} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={19} color={P.action} /></div>
      <div><Txt size={14} weight={700}>周末羽毛球双打</Txt><Txt size={11} color={P.muted} style={{ marginTop: 2 }}>队伍会话 · 已连接伴学后台</Txt></div>
    </Box>
    <Box x={0} y={74} w={640} h={290} style={{ background: P.soft, borderTop: `1px solid ${P.line}`, borderBottom: `1px solid ${P.line}` }}>
      {MSGS.map((m, i) => {
        const p = msgP[i];
        return (
          <Box key={i} x={22} y={18 + i * 88} style={{ opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 26}px) scale(${0.94 + 0.06 * p})`, transformOrigin: '0% 100%' }}>
            <Txt size={10.5} color={P.muted} style={{ marginLeft: 46 }}>{m.name}&nbsp;&nbsp;{m.time}</Txt>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
              <Avatar ch={m.who} size={34} />
              <div style={{ background: P.surface, borderRadius: 16, padding: '11px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}><Txt size={13.5}>{m.body}</Txt></div>
            </div>
          </Box>
        );
      })}
    </Box>
    <Box x={22} y={378} w={596} h={44} style={{ borderRadius: 22, background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 0 18px', boxSizing: 'border-box' }}>
      <Txt size={12.5} color="#8E8E93">聊点什么...</Txt>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: '#E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowUp" size={16} color="#8E8E93" /></div>
    </Box>
  </div>
);

// ---------------- teacher Coffee Chat ----------------
export const TeacherCard = () => (
  <Card w={420} h={176} radius={14} style={{ background: '#F7F9FF' }}>
    <Box x={22} y={20}><Kicker>COFFEE CHAT · FST</Kicker></Box>
    <Box x={22} y={40}><Txt size={22} weight={700}>王老师</Txt><Txt size={12} color={P.muted} style={{ marginTop: 3 }}>· 理工科技学院</Txt></Box>
    <Box x={22} y={100}><Txt size={12} color="#3A3A3C">数据科学方向，欢迎聊课程、科研与升学。</Txt></Box>
    <Box x={22} y={128} style={{ display: 'flex', gap: 8 }}>{['课程规划', '科研入门', '升学选择'].map((t) => <Tag key={t} label={t} />)}</Box>
  </Card>
);

// state: 0 open, 1 selected, 2 booked; p = transition progress into `state`.
export const Slot = ({ date, time, sel = 0, booked = 0 }: { date: string; time: string; sel?: number; booked?: number }) => {
  const border = booked > 0 ? `rgba(36,138,61,${0.35 + 0.4 * booked})` : sel > 0 ? `rgba(0,122,255,${0.25 + 0.6 * sel})` : 'rgba(0,122,255,0.22)';
  return (
    <div style={{ position: 'relative', width: 300, height: 74, borderRadius: 12, border: `${1 + sel * 0.5}px solid ${border}`, background: P.surface, boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#F0F6FF', opacity: sel * (1 - booked) }} />
      <div style={{ position: 'absolute', inset: 0, background: '#EEF8F0', opacity: booked }} />
      <Box x={16} y={14} style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Icon name="calendar" size={14} color={booked > 0.5 ? P.success : P.blue} /><Txt size={11} color="#48484A">{date}</Txt></Box>
      <Box x={16} y={38} style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Icon name="clock" size={15} color={booked > 0.5 ? P.success : P.blue} /><Txt size={17} weight={700}>{time}</Txt></Box>
      <Box x={230} y={30} w={56} style={{ textAlign: 'right' }}>
        <Txt size={11} weight={700} color={P.action} style={{ position: 'absolute', right: 0, opacity: 1 - booked }}>可预约</Txt>
        <Txt size={11} weight={700} color={P.success} style={{ position: 'absolute', right: 0, opacity: booked }}>已预约</Txt>
      </Box>
    </div>
  );
};

// ---------------- alumni ----------------
export const AlumniCard = () => (
  <Card w={460} h={300} radius={16}>
    <Box x={24} y={24}><Avatar ch="顾" size={34} style={{ background: '#F2F2F4', color: P.ink }} /></Box>
    <Box x={370} y={64}><Tag label="认证校友" tone="grey" /></Box>
    <Box x={24} y={72}><Txt size={22} weight={700}>顾言川</Txt></Box>
    <Box x={24} y={110}><Txt size={12.5} color={P.muted}>2022 届 · 计算机科学与技术</Txt><Txt size={12.5} color={P.muted} style={{ marginTop: 10 }}>深圳 · 互联网公司产品经理</Txt></Box>
    <Box x={24} y={172} w={412} h={38} style={{ borderRadius: 10, background: P.soft, display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box' }}><Txt size={12.5}>求职准备、产品岗位、实习选择</Txt></Box>
    <Box x={24} y={234} style={{ display: 'flex', gap: 10 }}><Btn label="了解校友" icon="arrow" /><Btn label="关注" kind="secondary" /></Box>
  </Card>
);

export const AlumniBooking = ({ typed, requested }: { typed: string; requested: number }) => (
  <Card w={620} h={300} radius={16}>
    <Box x={24} y={22}><Txt size={16} weight={700}>Coffee Chat</Txt><Txt size={11.5} color={P.muted} style={{ marginTop: 3 }}>提交交流问题后，等待校友确认</Txt></Box>
    <Box x={24} y={78}><Txt size={11} weight={600} color="#3B5B8C">交流主题与问题</Txt></Box>
    <Box x={24} y={100} w={572} h={52} style={{ borderRadius: 10, border: `1.5px solid ${requested > 0 ? P.line : P.blue}`, padding: '10px 12px', boxSizing: 'border-box' }}>
      <Txt size={12.5} weight={600}>{typed}{typed.length < 15 && requested === 0 ? <span style={{ color: P.blue }}>|</span> : null}</Txt>
    </Box>
    <Box x={24} y={172}><Txt size={15} weight={700}>2026/10/18 10:00:00 — 2026/10/18 10:45:00</Txt><Txt size={12.5} style={{ marginTop: 6 }}>线上视频</Txt></Box>
    <Box x={24} y={236}>
      <div style={{ position: 'relative', width: 82 + requested * 26, height: 38 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: P.action, opacity: 1 - requested }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: '#F2F2F4', opacity: requested }} />
        <Txt size={13} weight={700} color="#fff" style={{ position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center', opacity: 1 - requested }}>申请交流</Txt>
        <Txt size={12.5} weight={600} color="#8E8E93" style={{ position: 'absolute', left: 0, right: 0, top: 9, textAlign: 'center', opacity: requested }}>等待校友确认</Txt>
      </div>
    </Box>
  </Card>
);

// ---------------- home ----------------
export const SchedRow = ({ when, title, place, tag, w = 640 }: { when: string; title: string; place: string; tag: string; w?: number }) => (
  <div style={{ position: 'relative', width: w, height: 58, borderTop: `1px solid ${P.line}` }}>
    <Box x={0} y={20}><Txt size={11.5} weight={700} color="#48484A">{when}</Txt></Box>
    <Box x={140} y={11}><Txt size={12.5} weight={700}>{title}</Txt><Txt size={10.5} color={P.muted} style={{ marginTop: 3 }}>{place}</Txt></Box>
    <Box x={w - 80} y={18} w={80} style={{ display: 'flex', justifyContent: 'flex-end' }}><Tag label={tag} tone="grey" style={{ fontWeight: 500, fontSize: 10.5 }} /></Box>
  </div>
);

export const ROWS = {
  coffee: { when: '10月15日周四 15:00', title: '与王思远的 Coffee Chat', place: 'T6-512 办公室', tag: 'Coffee Chat' },
  ai: { when: '10月16日周五 19:00', title: 'AI 创作工作坊', place: 'T4-105', tag: '已标记参与' },
  run: { when: '10月17日周六 19:30', title: '秋季校园夜跑', place: '体育馆', tag: '已标记参与' },
  team: { when: '周六 15:00', title: '周末羽毛球双打', place: '体育馆', tag: '我的搭子' },
};

export const NextCard = ({ kicker, when, title, place, w = 680, bar = 1 }: { kicker: string; when: string; title: string; place: string; w?: number; bar?: number }) => (
  <Card w={w} h={190} radius={16}>
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: P.blue, transform: `scaleY(${bar})`, transformOrigin: 'top' }} />
    <Box x={26} y={24}><Txt size={10.5} weight={600} color="#48484A" style={{ letterSpacing: '0.08em' }}>{kicker}</Txt></Box>
    <Box x={26} y={48}><Txt size={24} weight={700}>{when}</Txt><Txt size={18} weight={700} style={{ marginTop: 2 }}>{title}</Txt></Box>
    <Box x={26} y={114} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="pin" size={13} color="#48484A" /><Txt size={11.5} color="#48484A">{place}</Txt></Box>
    <Box x={26} y={140} style={{ display: 'flex', gap: 8 }}><Btn label="查看详情" icon="arrow" style={{ height: 34, fontSize: 12 }} /><Btn label="发现活动" kind="secondary" style={{ height: 34, fontSize: 12 }} /></Box>
  </Card>
);

export const TaskCard = ({ w = 680 }: { w?: number }) => (
  <Card w={w} h={132} radius={16}>
    <Box x={22} y={20}><Txt size={15} weight={700}>待处理</Txt><Txt size={11} color={P.muted} style={{ marginTop: 3 }}>与你有关的新进展</Txt></Box>
    <Box x={22} y={70} w={w - 44}><Divider /></Box>
    <Box x={22} y={84} w={w - 44} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Txt size={10} weight={700}>0</Txt></div>
      <div style={{ flex: 1 }}><Txt size={11.5} weight={700}>组队申请</Txt><Txt size={10} color={P.muted} style={{ marginTop: 2 }}>目前无需答复</Txt></div>
      <Icon name="arrow" size={14} color="#48484A" />
    </Box>
  </Card>
);

export const SchedHeader = ({ w = 640 }: { w?: number }) => (
  <div style={{ position: 'relative', width: w, height: 70 }}>
    <Box x={0} y={0}><Txt size={15} weight={700}>近期安排</Txt><Txt size={11} color={P.muted} style={{ marginTop: 3 }}>已标记的活动、已加入的搭子与 Coffee Chat</Txt></Box>
    <Box x={w - 80} y={6} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Txt size={11.5} weight={700} color={P.action}>查看全部</Txt><Icon name="arrow" size={13} color={P.action} /></Box>
  </div>
);

export const ShortcutPill = ({ style }: { style?: CSSProperties }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', borderRadius: 20, background: P.surface, boxShadow: '0 6px 18px rgba(0,0,0,0.10)', ...style }}>
    <Icon name="book" size={17} color={P.action} /><Txt size={12.5} weight={700} color={P.action}>我的课表</Txt>
  </div>
);

export const TimetableDay = () => (
  <Card w={430} h={196} radius={14}>
    <Box x={20} y={18} w={390} style={{ display: 'flex', justifyContent: 'space-between' }}><Txt size={15} weight={700}>周二 · 今天</Txt><Txt size={11} color={P.muted}>2 条课程安排</Txt></Box>
    <Box x={20} y={50} w={390}><Divider /></Box>
    {[['08:00', '数据结构', 'T5-201 · 李老师'], ['14:00', '大学英语', 'T3-105 · 张老师']].map(([t, n, m], i) => (
      <Box key={t} x={20} y={64 + i * 64} style={{ display: 'flex', gap: 16 }}>
        <Txt size={14} weight={700} style={{ width: 48 }}>{t}</Txt>
        <div style={{ width: 3, height: 50, borderRadius: 2, background: P.blue }} />
        <div><Txt size={14} weight={700}>{n}</Txt><Txt size={11} color={P.muted} style={{ marginTop: 4 }}>{m}</Txt></div>
      </Box>
    ))}
  </Card>
);

// ---------------- community & AI ----------------
export const PostCard = ({ post, w = 230, saved = 0 }: { post: (typeof POSTS)[number]; w?: number; saved?: number }) => (
  <div style={{ width: w }}>
    <div style={{ position: 'relative', height: w * 0.98, borderRadius: 14, background: '#F7F7F9', border: `1px solid ${P.line}`, padding: 16, boxSizing: 'border-box' }}>
      <Box x={w - 41.5} y={4.5} w={30} h={30} style={{ borderRadius: 15, background: 'rgba(255,255,255,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.25 * Math.sin(Math.PI * saved)})` }}>
        <Icon name="bookmark" size={15} color={saved > 0.5 ? P.blue : '#48484A'} fill={saved > 0.5 ? P.blue : 'none'} />
      </Box>
      <Txt size={10} color={P.muted} style={{ marginTop: 26 }}>{post.board} · 校园分享</Txt>
      <Txt size={20} weight={700} style={{ marginTop: 8, whiteSpace: 'normal', lineHeight: 1.45 }}>{post.title}</Txt>
      <Txt size={11} color={P.muted} style={{ marginTop: 10, whiteSpace: 'normal', lineHeight: 1.6 }}>{post.body}</Txt>
    </div>
    <Txt size={12.5} weight={700} style={{ marginTop: 10, overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</Txt>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Avatar ch={post.by[0]} size={18} style={{ background: '#F2F2F4', color: '#48484A' }} /><Txt size={11} color="#48484A">{post.by}</Txt></div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}><Icon name="heart" size={13} color="#48484A" /><Txt size={11} color="#48484A">0</Txt></div>
    </div>
  </div>
);

export const ANSWER_MAIN = '如何预约老师的 Coffee Chat：在 Coffee Chat 页面选择老师的开放时段并填写交流问题，提交后即形成预约；如需取消可在预约中操作。';
export const ANSWER_SRC = '来源：如何预约老师的 Coffee Chat（伴学帮助中心 · Coffee Chat）';

export const Chips = ({ labels, active, gap = 8 }: { labels: string[]; active: number[]; gap?: number }) => (
  <div style={{ display: 'flex', gap }}>{labels.map((l, i) => <Chip key={l} label={l} active={active[i] ?? 0} />)}</div>
);

export const Frame = ({ w, h, bg = P.canvas, children, style }: { w: number; h: number; bg?: string; children?: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: 'relative', width: w, height: h, background: bg, ...style }}>{children}</div>
);
