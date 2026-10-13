import type { CSSProperties } from 'react';
import { AbsoluteFill } from 'remotion';
import { useFilmFrame } from '../lib/time';
import { Box, Chip, Kicker, P, Txt } from '../kit/base';
import { Burst, Cam, camToScreen, type CamState, Win } from '../kit/fx';
import { ActivityCard, actCardH, ActivityDetail, ACTS, NextCard, Roll, ROWS, SchedHeader, SchedRow, TaskCard } from '../kit/product';
import { Cursor, pathAt } from '../lib/ui';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';
import { CLICKS, MOMENTS, SHOTS } from '../timeline';

const live = (frame: number, key: keyof typeof SHOTS) => frame >= SHOTS[key].from && frame < SHOTS[key].from + SHOTS[key].duration;
const pop = (p: number): CSSProperties => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})` });

// ---------- home: heading types on, panels build on the beat, dive through the 夜跑 row ----------
const HEADING = '今天，先做好下一件事';
export const Home = () => {
  const frame = useFilmFrame();
  if (!live(frame, 'home')) return null;
  const dive = prog(frame, MOMENTS.pushThrough - 1, 27, EASE_IN);
  const row = { x: 270, y: 512 + 88 + 29 };
  let cam: CamState = {
    z: keys(frame, [[120, 2.1], [142, 2.0], [166, 1.38]]),
    fx: keys(frame, [[120, 260], [142, 300], [166, 380]]),
    fy: keys(frame, [[120, 74], [142, 80], [166, 350]]),
    ry: keys(frame, [[120, -16], [166, 0]]), rx: keys(frame, [[120, 6], [166, 0]]),
  };
  if (dive > 0) cam = { z: 1.38 * Math.pow(12 / 1.38, dive), fx: mix(380, row.x, dive), fy: mix(350, row.y, dive), blur: prog(frame, 186, 12) * 14, opacity: 1 - prog(frame, 193, 7) };
  const [p1, p2, p3] = MOMENTS.homePanels.map((m) => prog(frame, m, 16, LAND));
  const chars = Math.round(prog(frame, 121, 14, (t) => t) * HEADING.length);
  const hl = prog(frame, 168, 8);
  return (
    <Cam cam={{ ...cam, opacity: (cam.opacity ?? 1) * prog(frame, 120, 6) }}>
      <Win x={0} y={0} w={760} h={700} glow={0.5}>
        <Box x={40} y={30}><Kicker>CAMPUS / TODAY</Kicker></Box>
        <Box x={40} y={50}>
          <Txt size={30} weight={700}>
            {[...HEADING].map((c, i) => <span key={i} style={{ opacity: i < chars ? 1 : 0, display: 'inline-block', transform: `translateY(${i < chars ? 0 : 10}px)` }}>{c}</span>)}
          </Txt>
        </Box>
        <Box x={40} y={98} style={{ opacity: prog(frame, 132, 8) }}><Txt size={12.5} color={P.muted}>你好，林知夏。你的校园安排和需要处理的事项都在这里。</Txt></Box>
        <Box x={40} y={124} style={{ opacity: prog(frame, 136, 8) }}><Txt size={11.5} weight={600} color="#48484A">10月13日，星期二&nbsp;&nbsp;·&nbsp;&nbsp;1 项近期安排</Txt></Box>
        <Box x={40} y={160} style={pop(p1)}><TaskCard /></Box>
        <Box x={40} y={306} style={pop(p2)}><NextCard kicker="下一步 · 已标记参与" when={ROWS.run.when} title={ROWS.run.title} place={ROWS.run.place} bar={prog(frame, MOMENTS.homePanels[1] + 4, 12)} /></Box>
        <Box x={40} y={512} style={pop(p3)}>
          <div style={{ position: 'relative', width: 680, height: 162, borderRadius: 16, background: P.surface, border: `1px solid ${P.line}`, boxShadow: '0 12px 32px rgba(36,36,36,0.07)' }}>
            <Box x={20} y={20}><SchedHeader /></Box>
            <Box x={12} y={86} w={656} h={60} style={{ borderRadius: 10, background: P.accentSoft, opacity: hl }} />
            <Box x={20} y={88}><SchedRow {...ROWS.run} /></Box>
          </div>
        </Box>
      </Win>
    </Cam>
  );
};

// ---------- activity discovery ----------
const CW = 214, GAP = 16, GX = 32, GY = 232;
const masonry = (ids: string[]) => {
  const col = [0, 0, 0, 0];
  const out: Record<string, { x: number; y: number }> = {};
  for (const id of ids) {
    const a = ACTS.find((x) => x.id === id)!;
    const c = col.indexOf(Math.min(...col));
    out[id] = { x: GX + c * (CW + GAP), y: GY + col[c] };
    col[c] += actCardH(a, CW) + 18;
  }
  return out;
};
const ALL = masonry(ACTS.map((a) => a.id));
const MAIL = masonry(ACTS.filter((a) => !a.member).map((a) => a.id));
const CHIP_W = [52, 104, 104];
const chipX = (i: number) => GX + CHIP_W.slice(0, i).reduce((s, w) => s + w + 8, 0);

export const DETAIL = { x: 1060, y: 140, k: 1.1 };

export const Activities = () => {
  const frame = useFilmFrame();
  if (!live(frame, 'activities')) return null;
  const f = CLICKS.actFilter;
  const run = ALL.run;
  const open = prog(frame, CLICKS.actOpen, 16, EASE_IN_OUT);
  const cam: CamState = {
    z: keys(frame, [[190, 3.4], [212, 0.95], [230, 0.95], [252, 1.22]]),
    fx: keys(frame, [[190, run.x + CW / 2], [212, 484], [230, 484], [252, 700]]),
    fy: keys(frame, [[190, run.y + 150], [212, 430], [230, 430], [252, 640]]),
    ax: mix(1200, 800, open), ay: 500,
    blur: prog(frame, 190, 1) * (1 - prog(frame, 190, 16)) * 12 + open * 3,
    opacity: prog(frame, 190, 6) * mix(1, 0.45, open) * (1 - prog(frame, 300, 6)),
  };
  const filt = prog(frame, f + 1, 8);
  const cam0: CamState = { z: 0.95, fx: 484, fy: 430, ax: 1200, ay: 500 };
  const cam1: CamState = { z: 1.22, fx: 700, fy: 640, ax: 1200, ay: 500 };
  const chipPt = camToScreen(cam0, chipX(2) + CHIP_W[2] / 2, 199);
  const aiTitle = camToScreen(cam1, MAIL.ai.x + 60, MAIL.ai.y + CW * 1.2 + 18);
  const markPt = { x: DETAIL.x + 66 * DETAIL.k, y: DETAIL.y + 673 * DETAIL.k };
  const cur = pathAt(frame, [[204, 1560, 980], [221, chipPt.x, chipPt.y], [229, chipPt.x, chipPt.y], [251, aiTitle.x, aiTitle.y], [258, aiTitle.x, aiTitle.y], [281, markPt.x, markPt.y], [300, markPt.x + 40, markPt.y + 30]]);

  // shared-element morph: the AI card cover grows into the detail drawer
  const aiRect = { ...camToScreen(cam1, MAIL.ai.x, MAIL.ai.y), w: CW * 1.22, h: CW * 1.2 * 1.22 };
  const dRect = { x: DETAIL.x, y: DETAIL.y, w: 690 * DETAIL.k, h: 712 * DETAIL.k };
  const mp = prog(frame, CLICKS.actOpen + 1, 14, EASE_IN_OUT);
  const mr = { x: mix(aiRect.x, dRect.x, mp), y: mix(aiRect.y, dRect.y, mp), w: mix(aiRect.w, dRect.w, mp), h: mix(aiRect.h, dRect.h, mp) };
  const reveal = (i: number) => prog(frame, CLICKS.actOpen + 10 + i * 2.2, 12);
  const marked = prog(frame, CLICKS.actMark + 1, 10, EASE_OUT);
  const out = prog(frame, 298, 8, EASE_IN_OUT);
  const ai = ACTS.find((a) => a.id === 'ai')!;
  return (
    <AbsoluteFill>
      <Cam cam={cam}>
        <Win x={0} y={0} w={968} h={960} glow={0.45}>
          <Box x={32} y={28}><Kicker>DISCOVER / EVENTS</Kicker><Txt size={30} weight={700} style={{ marginTop: 4 }}>发现活动</Txt><Txt size={12.5} color={P.muted} style={{ marginTop: 4 }}>发现感兴趣的事，让校园生活多一种可能。</Txt></Box>
          <Box x={32} y={132}><Txt size={16} weight={700}>所有活动</Txt><Txt size={11.5} color={P.muted} style={{ marginTop: 3 }}><Roll from="7" to="6" p={filt} size={11.5} color={P.muted} /> 个结果</Txt></Box>
          {['全部', '校园成员活动', '学校邮件活动'].map((l, i) => (
            <Box key={l} x={chipX(i)} y={184}><Chip label={l} active={i === 0 ? 1 - filt : i === 2 ? filt : 0} style={{ width: CHIP_W[i], justifyContent: 'center', padding: 0 }} /></Box>
          ))}
          {ACTS.map((a, i) => {
            const from = ALL[a.id], to = MAIL[a.id];
            if (a.member) {
              const g = prog(frame, f + 1, 9, EASE_IN);
              return <Box key={a.id} x={from.x} y={from.y} style={{ opacity: 1 - g, transform: `scale(${1 - g * 0.25})` }}><ActivityCard act={a} w={CW} /></Box>;
            }
            const m = prog(frame, f + 3 + i * 1.5, 14, EASE_IN_OUT);
            const ent = a.id === 'run' ? 1 : prog(frame, 194 + i * 2, 14, LAND);
            return (
              <Box key={a.id} x={mix(from.x, to.x, m)} y={mix(from.y, to.y, m) + (1 - ent) * 60} style={{ opacity: Math.min(1, ent * 1.4) * (a.id === 'ai' ? 1 - prog(frame, CLICKS.actOpen + 1, 3) : 1) }}>
                <ActivityCard act={a} w={CW} glow={a.id === 'ai' ? prog(frame, 244, 8) * (1 - prog(frame, CLICKS.actOpen, 6)) : 0} />
              </Box>
            );
          })}
        </Win>
      </Cam>
      {frame > CLICKS.actOpen && (
        <div style={{ position: 'absolute', left: mr.x, top: mr.y, width: mr.w, height: mr.h, borderRadius: mix(16, 22, mp), overflow: 'hidden', background: `linear-gradient(135deg, ${ai.a}, ${ai.b})`, opacity: 1 - out, transform: `scale(${1 - out * 0.1})`, boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 90px rgba(79,107,255,0.45)' }}>
          <div style={{ position: 'absolute', inset: 0, background: P.surface, opacity: prog(frame, CLICKS.actOpen + 8, 6) }} />
          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${mr.w / 690})` }}>
            <ActivityDetail reveal={reveal} marked={marked} />
          </div>
        </div>
      )}
      <Burst frame={frame} at={CLICKS.actMark + 2} x={markPt.x} y={markPt.y} color="#4F86FF" r={70} />
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.actFilter, CLICKS.actOpen, CLICKS.actMark]} opacity={prog(frame, 204, 6) * (1 - prog(frame, 292, 8))} />
    </AbsoluteFill>
  );
};