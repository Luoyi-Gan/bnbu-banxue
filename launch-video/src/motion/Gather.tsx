import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Box, Btn, Chip, Icon, Kicker, P, Txt } from '../kit/base';
import { Burst, Cam, camToScreen, type CamState, typed, Win } from '../kit/fx';
import { ActivityCard, actById, ANSWER_MAIN, ANSWER_SRC, NextCard, PostCard, POSTS, ROWS, SchedHeader, SchedRow, ShortcutPill, Slot, TaskCard, TeamCard, TEAMS, TimetableDay } from '../kit/product';
import { Cursor, pathAt } from '../lib/ui';
import { EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';
import { CLICKS, MOMENTS, SHOTS } from '../timeline';

const live = (frame: number, key: keyof typeof SHOTS) => frame >= SHOTS[key].from && frame < SHOTS[key].from + SHOTS[key].duration;

type Mini = { node: ReactNode; w: number; h: number; k: number; x: number; y: number; land: number; rot: number };

export const Schedule = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'schedule')) return null;
  const [l0, l1, l2, l3] = MOMENTS.scheduleLand;
  const enter = prog(frame, 720, 18, EASE_OUT);
  const out = prog(frame, 924, 10, EASE_IN_OUT);
  const cam: CamState = { z: keys(frame, [[720, 1.3], [845, 1.3], [900, 1.36]]), fx: 380, fy: keys(frame, [[720, 600], [845, 600], [900, 640]]), ax: 1260 + (1 - enter) * 500 - out * 200, ay: 540, ry: mix(-18, 0, enter) + prog(frame, 845, 50, EASE_IN_OUT) * -4, opacity: prog(frame, 720, 8) * (1 - out) };
  const camL: CamState = { z: 1.3, fx: 380, fy: 600, ax: 1260, ay: 540 };

  // rows in final order: coffee, ai, run (already there), team
  const pres = [prog(frame, l0 - 3, 12, EASE_OUT), prog(frame, l1 - 3, 12, EASE_OUT), 1, prog(frame, l2 - 3, 12, EASE_OUT)];
  const rowsData = [ROWS.coffee, ROWS.ai, ROWS.run, ROWS.team];
  const rowY = (i: number) => 88 + pres.slice(0, i).reduce((s, v) => s + v * 58, 0);
  const n = pres.reduce((s, v) => s + v, 0);
  const count = 1 + prog(frame, l0, 6) + prog(frame, l1, 6) + prog(frame, l2, 6);
  const nextSwap = prog(frame, l0, 12, EASE_IN_OUT);
  const pill = prog(frame, l3 - 2, 12, LAND);

  const minis: Mini[] = [
    { node: <Slot date="10月15日星期四" time="15:00 – 15:30" booked={1} />, w: 300, h: 74, k: 1.25, x: 140, y: 150, land: l0, rot: -4 },
    { node: <ActivityCard act={actById('ai')} w={150} />, w: 150, h: 284, k: 1, x: 560, y: 120, land: l1, rot: 5 },
    { node: <TeamCard t={{ ...TEAMS[3], count: '3/4 人' }} />, w: 300, h: 228, k: 0.95, x: 170, y: 330, land: l2, rot: -3 },
    { node: <TimetableDay />, w: 430, h: 196, k: 0.82, x: 150, y: 600, land: l3, rot: 3 },
  ];
  const targets = [
    { x: 60, y: 512 + 88, w: 640, h: 58 },
    { x: 60, y: 512 + 88 + 58, w: 640, h: 58 },
    { x: 60, y: 512 + 88 + 58 * 3, w: 640, h: 58 },
    { x: 24, y: 870, w: 116, h: 40 },
  ];
  return (
    <AbsoluteFill>
      <Cam cam={cam}>
        <Win x={0} y={0} w={760} h={930} glow={0.5}>
          <Box x={40} y={30}><Kicker>CAMPUS / TODAY</Kicker><Txt size={30} weight={700} style={{ marginTop: 4 }}>今天，先做好下一件事</Txt></Box>
          <Box x={40} y={98}><Txt size={12.5} color={P.muted}>你好，林知夏。你的校园安排和需要处理的事项都在这里。</Txt></Box>
          <Box x={40} y={124}>
            <Txt size={11.5} weight={600} color="#48484A">10月13日，星期二&nbsp;&nbsp;·&nbsp;&nbsp;
              <span style={{ display: 'inline-block', height: 15.5, overflow: 'hidden', verticalAlign: 'bottom' }}>
                <span style={{ display: 'block', transform: `translateY(${-(count - 1) * 15.5}px)` }}>{[1, 2, 3, 4].map((d) => <span key={d} style={{ display: 'block', height: 15.5 }}>{d}</span>)}</span>
              </span>&nbsp;项近期安排</Txt>
          </Box>
          <Box x={40} y={160}><TaskCard /></Box>
          <Box x={40} y={306} w={680} h={190} style={{ overflow: 'hidden', borderRadius: 16 }}>
            <Box x={0} y={-nextSwap * 190}><NextCard kicker="下一步 · 已标记参与" when={ROWS.run.when} title={ROWS.run.title} place={ROWS.run.place} /></Box>
            <Box x={0} y={(1 - nextSwap) * 190}><NextCard kicker="下一步 · Coffee Chat" when={ROWS.coffee.when} title={ROWS.coffee.title} place={ROWS.coffee.place} /></Box>
          </Box>
          <Box x={40} y={512} w={680} h={88 + n * 58 + 14} style={{ borderRadius: 16, background: P.surface, border: `1px solid ${P.line}`, boxShadow: '0 12px 32px rgba(36,36,36,0.07)', overflow: 'hidden' }}>
            <Box x={20} y={20}><SchedHeader /></Box>
            {rowsData.map((r, i) => {
              const p = pres[i];
              if (p <= 0.001) return null;
              const land = [l0, l1, 0, l2][i];
              const hl = i === 2 ? 0 : prog(frame, land, 6) * (1 - prog(frame, land + 8, 20));
              return (
                <Box key={i} x={20} y={rowY(i)} style={{ opacity: p, transform: `scaleY(${0.4 + 0.6 * p})`, transformOrigin: 'top' }}>
                  <div style={{ position: 'absolute', left: -8, top: 0, width: 656, height: 58, borderRadius: 10, background: P.accentSoft, opacity: hl }} />
                  <SchedRow {...r} />
                </Box>
              );
            })}
          </Box>
          <Box x={24} y={870} style={{ transform: `scale(${pill})`, transformOrigin: '20% 50%', opacity: Math.min(1, pill * 2) }}><ShortcutPill /></Box>
        </Win>
      </Cam>
      {minis.map((m, i) => {
        if (frame >= m.land + 1) return null;
        const t = targets[i];
        const tl = camToScreen(camL, t.x, t.y);
        const tw = t.w * camL.z, th = t.h * camL.z;
        const appear = prog(frame, 724 + i * 5, 16, LAND);
        const f = prog(frame, m.land - 20, 20, EASE_IN_OUT);
        const sw = m.w * m.k, sh = m.h * m.k;
        const bob = Math.sin((frame + i * 17) / 13) * 7 * (1 - f);
        const cx = mix(m.x + sw / 2, tl.x + tw / 2, f), cy = mix(m.y + sh / 2 + bob, tl.y + th / 2, f) - Math.sin(Math.PI * f) * 80;
        const k = m.k * mix(1, Math.min(tw / sw, th / sh) * 1.4, f);
        return (
          <div key={i} style={{ position: 'absolute', left: cx - (m.w * k) / 2, top: cy - (m.h * k) / 2, width: m.w, height: m.h, transformOrigin: '0 0', transform: `scale(${k * mix(0.6, 1, appear)}) rotate(${m.rot * (1 - f)}deg)`, opacity: Math.min(1, appear * 2) * (1 - prog(frame, m.land - 5, 5)), borderRadius: 14, boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 ${40 + 40 * f}px rgba(61,123,255,${0.35 + 0.35 * f})` }}>
            {m.node}
          </div>
        );
      })}
      {MOMENTS.scheduleLand.map((l, i) => {
        const t = targets[i];
        const c = camToScreen(camL, t.x + t.w / 2, t.y + t.h / 2);
        return <Burst key={i} frame={frame} at={l} x={c.x} y={c.y} color="#6E98FF" r={i === 3 ? 60 : 90} n={10} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- 31–35s: community + campus Q&A with a source ----------
const QUESTION = '怎么预约老师的 Coffee Chat？';
export const Knowledge = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'knowledge')) return null;
  const cOut = prog(frame, 968, 14, EASE_IN_OUT);
  const ce = prog(frame, 930, 14, EASE_OUT);
  const cam: CamState = { z: mix(0.9, 1.12, ce), fx: keys(frame, [[930, 470], [972, 560]]), fy: 290, ax: 1180 - cOut * 900, ay: 450, rx: mix(14, 0, ce), opacity: prog(frame, 930, 8) * (1 - cOut) };
  const A = { x: 700, y: 150, k: 1.3 };
  const ai = prog(frame, 968, 16, EASE_OUT);
  const out = prog(frame, 1046, 10, EASE_IN_OUT);
  const sent = frame >= CLICKS.aiSend + 1;
  const qTyped = typed(QUESTION, prog(frame, 972, 14, (t) => t));
  const qFly = prog(frame, CLICKS.aiSend + 1, 12, EASE_OUT);
  const dots = frame >= 998 && frame < 1004;
  const mainTxt = typed(ANSWER_MAIN, prog(frame, 1003, 24, (t) => t));
  const srcTxt = typed(ANSWER_SRC, prog(frame, 1027, 9, (t) => t));
  const under = prog(frame, 1036, 10, EASE_OUT);
  const sendPt = { x: A.x + 730 * A.k, y: A.y + 427 * A.k };
  const cur = pathAt(frame, [[976, 1720, 1010], [987, sendPt.x, sendPt.y], [1000, sendPt.x, sendPt.y]]);
  const ansP = prog(frame, 997, 10, LAND);
  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      {cOut < 1 && (
        <Cam cam={cam}>
          <Win x={0} y={0} w={1040} h={540} glow={0.45} bg={P.canvas}>
            <Box x={32} y={28}><Kicker>CAMPUS / COMMUNITY</Kicker><Txt size={30} weight={700} style={{ marginTop: 4 }}>校园社区</Txt><Txt size={12.5} color={P.muted} style={{ marginTop: 4 }}>先看内容，再决定要不要参与讨论。</Txt></Box>
            <Box x={900} y={48}><Btn label="发布帖子" style={{ height: 36, fontSize: 12 }} /></Box>
            <Box x={32} y={136} style={{ display: 'flex', gap: 8 }}>{['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业'].map((l, i) => <Chip key={l} label={l} active={i === 0 ? 1 : 0} />)}</Box>
            {POSTS.map((p, i) => {
              const q = prog(frame, 934 + i * 3, 16, LAND);
              return <Box key={i} x={32 + i * 246} y={188} style={{ opacity: Math.min(1, q * 1.5), transform: `perspective(900px) rotateX(${(1 - q) * 55}deg) translateY(${(1 - q) * 40}px)`, transformOrigin: '50% 100%' }}><PostCard post={p} /></Box>;
            })}
          </Win>
        </Cam>
      )}
      {frame >= 968 && (
        <div style={{ position: 'absolute', left: A.x, top: mix(A.y + 260, A.y, ai), transformOrigin: '0 0', transform: `scale(${A.k * (1 - out * 0.08)}) rotateX(${(1 - ai) * -16}deg)`, opacity: Math.min(1, ai * 2) * (1 - out) }}>
          <Win x={0} y={0} w={780} h={470} radius={18} bg={P.surface} glow={0.5}>
            <Box x={24} y={22}><Kicker>CAMPUS AI</Kicker><Txt size={24} weight={700} style={{ marginTop: 4 }}>问问奶蛙</Txt><Txt size={12.5} color={P.muted} style={{ marginTop: 4 }}>查询已发布的校园知识，回答附有资料来源。</Txt></Box>
            <Box x={24} y={104} w={732} h={1} style={{ background: P.line }} />
            {sent && (
              <div style={{ position: 'absolute', right: 24, top: mix(404, 122, qFly), transform: `scale(${mix(0.9, 1, qFly)})`, transformOrigin: '100% 0', background: P.action, color: '#fff', borderRadius: 16, padding: '10px 16px', fontFamily: P.font, fontSize: 13.5, whiteSpace: 'nowrap' }}>{QUESTION}</div>
            )}
            {dots && (
              <Box x={24} y={180} style={{ display: 'flex', gap: 6, background: '#EEF3FC', borderRadius: 16, padding: '14px 18px' }}>
                {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: '#7C93BF', opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 3) / 3)) }} />)}
              </Box>
            )}
            {frame >= 1003 && (
              <Box x={24} y={180} w={660} style={{ background: '#EEF3FC', borderRadius: 16, padding: '14px 18px', boxSizing: 'border-box', transform: `scale(${0.96 + 0.04 * ansP})`, transformOrigin: '0 0' }}>
                <div style={{ fontFamily: P.font, fontSize: 13.5, lineHeight: 1.75, color: P.ink }}>
                  {mainTxt}
                  {srcTxt && <> <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>{srcTxt}<span style={{ position: 'absolute', left: 0, bottom: -1, height: 2.5, width: `${under * 100}%`, background: P.action, borderRadius: 2, boxShadow: '0 0 8px rgba(8,101,209,0.6)' }} /></span></>}
                </div>
              </Box>
            )}
            <Box x={24} y={404} w={732} h={46} style={{ borderRadius: 23, background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 7px 0 18px', boxSizing: 'border-box' }}>
              <Txt size={13} color={sent || !qTyped ? '#8E8E93' : P.ink}>{sent ? '输入你的校园问题...' : qTyped || '输入你的校园问题...'}</Txt>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: !sent && qTyped ? P.action : '#E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowUp" size={17} color={!sent && qTyped ? '#fff' : '#8E8E93'} /></div>
            </Box>
          </Win>
        </div>
      )}
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.aiSend]} opacity={prog(frame, 976, 5) * (1 - prog(frame, 998, 6))} />
    </AbsoluteFill>
  );
};
