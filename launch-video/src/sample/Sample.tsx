import type { ReactNode } from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Avatar, Box, Chip, Icon, Kicker, P, Tag, Txt } from '../kit/base';
import { BrandMark, Burst, Cam, camToScreen, type CamState, Win } from '../kit/fx';
import { ActivityCard, actById, ActivityDetail, NextCard, ROWS, SchedHeader, SchedRow, Slot, TaskCard } from '../kit/product';
import { Backdrop, T } from '../lib/ui';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';

// 20 s look test on raw 30 fps frames. The score's beat is 0.7 s = 21 frames:
// chimes at beats 0.5–3 and 5, riser 16–19, breath 19–20, drums from beat 20 (frame 420).
export const SAMPLE_FRAMES = 600;
const B = (n: number) => Math.round(n * 21);
const DROP = B(20);
const MARK_CLICK = B(27);
const LINE_W = 3;

// ---------------- line drawing ----------------
type Pt = [number, number];
const segLens = (pts: Pt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
const partial = (pts: Pt[], t: number): Pt[] => {
  const lens = segLens(pts);
  let left = lens.reduce((s, l) => s + l, 0) * Math.max(0, Math.min(1, t));
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (left >= lens[i]) { out.push(pts[i + 1]); left -= lens[i]; continue; }
    const k = left / lens[i];
    out.push([mix(pts[i][0], pts[i + 1][0], k), mix(pts[i][1], pts[i + 1][1], k)]);
    break;
  }
  return out;
};
const resample = (pts: Pt[], n: number): Pt[] => Array.from({ length: n }, (_, i) => { const p = partial(pts, i / (n - 1)); return p[p.length - 1]; });
const upToX = (pts: Pt[], hx: number): Pt[] => {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] <= hx) { out.push(pts[i]); continue; }
    const [a, b] = [pts[i - 1], pts[i]];
    const k = (hx - a[0]) / Math.max(1e-6, b[0] - a[0]);
    if (k > 0) out.push([hx, mix(a[1], b[1], k)]);
    break;
  }
  return out;
};
const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

// Thin bright core, tight inner glow, faint wide bloom; the head is a small hot point.
const Line = ({ id, pts, w = LINE_W, head = false, opacity = 1 }: { id: string; pts: Pt[]; w?: number; head?: boolean; opacity?: number }) => {
  if (pts.length < 2) return null;
  const d = toD(pts);
  const tip = pts[pts.length - 1];
  const f = (key: string, sd: number) => <filter id={`${id}-${key}`} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}><feGaussianBlur stdDeviation={sd} /></filter>;
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none' }}>
      <defs>
        {f('wide', w * 3)}{f('near', w * 0.8)}
        <radialGradient id={`${id}-h`}><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="0.3" stopColor="#9DB8FF" stopOpacity="0.45" /><stop offset="1" stopColor="#3D7BFF" stopOpacity="0" /></radialGradient>
      </defs>
      <path d={d} fill="none" stroke={T.electric} strokeWidth={w * 3} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} filter={`url(#${id}-wide)`} />
      <path d={d} fill="none" stroke="#86A6FF" strokeWidth={w * 1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} filter={`url(#${id}-near)`} />
      <path d={d} fill="none" stroke="#F5F8FF" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {head && <><circle cx={tip[0]} cy={tip[1]} r={w * 7} fill={`url(#${id}-h)`} /><circle cx={tip[0]} cy={tip[1]} r={w * 0.9} fill="#FFFFFF" /></>}
    </svg>
  );
};

// Neon outline traced around a rounded rect.
const Trace = ({ id, x, y, w, h, r, p, width = 1.4, glow = 1 }: { id: string; x: number; y: number; w: number; h: number; r: number; p: number; width?: number; glow?: number }) => {
  if (p <= 0) return null;
  const rect = (sw: number, stroke: string, extra: object) => <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke={stroke} strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} {...extra} />;
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs><filter id={id} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}><feGaussianBlur stdDeviation={width * 3} /></filter></defs>
      {rect(width * 3, T.electric, { opacity: 0.45 * glow, filter: `url(#${id})` })}
      {rect(width, '#EEF3FF', {})}
    </svg>
  );
};

// Tilt-shift: page copy blurred and dimmed except a horizontal band of focus.
const Focused = ({ y, band, amount, render }: { y: number; band: number; amount: number; render: () => ReactNode }) => {
  if (amount < 0.02) return <AbsoluteFill>{render()}</AbsoluteFill>;
  const mask = `linear-gradient(180deg, transparent ${y - band * 1.9}px, #000 ${y - band}px, #000 ${y + band}px, transparent ${y + band * 1.9}px)`;
  return (
    <>
      <AbsoluteFill style={{ filter: `blur(${amount * 8}px) brightness(${1 - amount * 0.66})` }}>{render()}</AbsoluteFill>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, opacity: amount }}>{render()}</AbsoluteFill>
      {amount < 0.98 && <AbsoluteFill style={{ opacity: 1 - amount }}>{render()}</AbsoluteFill>}
    </>
  );
};

const GRAD = 'linear-gradient(90deg, #FFFFFF 0%, #B9CCFF 45%, #8E7BFF 100%)';
// One centred word, gradient fill, rising per character.
const Word = ({ frame, text, from, to, y, size, outScale = 0.08 }: { frame: number; text: string; from: number; to: number; y: number; size: number; outScale?: number }) => {
  if (frame < from - 1 || frame > to + 12) return null;
  const out = prog(frame, to, 10, EASE_IN);
  const chars = [...text];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.62, textAlign: 'center', zIndex: 80, whiteSpace: 'nowrap', opacity: 1 - out, transform: `scale(${1 + out * outScale})`, filter: `drop-shadow(0 0 22px rgba(61,123,255,0.5))${out > 0.02 ? ` blur(${out * 8}px)` : ''}` }}>
      {chars.map((ch, i) => {
        const p = prog(frame, from + i * 2, 14);
        return (
          <span key={i} style={{
            display: 'inline-block', fontFamily: T.font, fontSize: size, fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.2,
            backgroundImage: GRAD, backgroundSize: `${chars.length * 100}% 100%`, backgroundPosition: `${chars.length > 1 ? (i / (chars.length - 1)) * 100 : 0}% 0`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

// ---------------- 0–7 s: the pulse runs past the six modules, folds into the icon, then extends out ----------------
const LINE_Y = 540;
const CHIMES = [0.5, 1, 1.5, 2, 2.5, 3].map(B);
type Feat = { name: string; icon: string; x: number; up: boolean; w: number; h: number; node: (f: number, at: number) => ReactNode };
const FEATS: Feat[] = [
  { name: '活动', icon: 'calendar', x: 300, up: true, w: 330, h: 54, node: (f, at) => <div style={{ display: 'flex', gap: 8 }}>{['全部', '校园成员活动', '学校邮件活动'].map((l, i) => <Chip key={l} label={l} active={i === 0 ? 1 - prog(f, at + 12, 6) : i === 2 ? prog(f, at + 12, 6) : 0} />)}</div> },
  { name: '社区', icon: 'message', x: 580, up: false, w: 320, h: 56, node: (f, at) => <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Txt size={15} weight={700}>推荐一门很有收获的选修课</Txt><Icon name="bookmark" size={17} color={P.blue} fill={prog(f, at + 14, 4) > 0.5 ? P.blue : 'none'} /></div> },
  { name: '找搭子', icon: 'users', x: 860, up: true, w: 240, h: 64, node: (f, at) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex' }}>{['陈', '许', '林'].map((c, i) => <Avatar key={c} ch={c} size={32} style={{ marginLeft: i ? -8 : 0, border: '2px solid #fff', transform: `scale(${prog(f, at + 6 + i * 2, 8, LAND)})` }} />)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="users" size={16} color={P.blue} /><Txt size={14} weight={600}>3 / 4 人</Txt></div>
    </div>
  ) },
  { name: 'Coffee Chat', icon: 'clock', x: 1140, up: false, w: 300, h: 74, node: () => <Slot date="10月15日星期四" time="15:00 – 15:30" /> },
  { name: '校友同行', icon: 'check', x: 1420, up: true, w: 280, h: 60, node: () => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar ch="顾" size={32} style={{ background: '#F2F2F4', color: P.ink }} /><Txt size={15} weight={700}>顾言川</Txt><Tag label="认证校友" tone="grey" /></div> },
  { name: '校园 AI', icon: 'search', x: 1700, up: false, w: 310, h: 60, node: () => <div style={{ background: P.action, color: '#fff', borderRadius: 16, padding: '9px 16px', fontFamily: P.font, fontSize: 14, whiteSpace: 'nowrap' }}>怎么预约老师的 Coffee Chat？</div> },
];
const CARD_S = 1.5;
FEATS.forEach((f, i) => { f.x = 310 + i * 262; });
const TIP = 74;
const featCardY = (f: Feat) => (f.up ? LINE_Y - TIP - 46 - (f.h * CARD_S) / 2 - 20 : LINE_Y + TIP + 46 + (f.h * CARD_S) / 2 + 20);

const LONG: Pt[] = [[-80, LINE_Y]];
for (const f of FEATS) {
  const dir = f.up ? -1 : 1;
  LONG.push([f.x - 42, LINE_Y], [f.x - 20, LINE_Y - dir * 12], [f.x, LINE_Y + dir * TIP], [f.x + 18, LINE_Y - dir * 20], [f.x + 36, LINE_Y]);
}
LONG.push([2000, LINE_Y]);

// The visible part of the icon's pulse (its clip trims both ends), in icon path coordinates.
const ICON_PULSE: Pt[] = [[60, 116], [150, 116], [156, 120], [205, 224], [211, 224], [299, 35], [305, 35], [331, 97], [341, 102], [430, 102]];
const ICON = { x: 960, y: 400, s: 216 };
const iconPt = ([u, v]: Pt): Pt => [ICON.x - ICON.s / 2 + ((1.7131 * u + 82.8) * ICON.s) / 1024, ICON.y - ICON.s / 2 + ((1.7131 * v + 296.9) * ICON.s) / 1024];
const ICON_W = (18 * 1.7131 * ICON.s) / 1024;
const N = 160;
const LONG_R = resample(LONG, N);
const ICON_R = resample(ICON_PULSE.map(iconPt), N);
const MODULES = FEATS.map((f) => f.name);

const Opening = ({ frame }: { frame: number }) => {
  if (frame >= 212) return null;
  const hx = keys(frame, [[2, -80], ...FEATS.map((f, i): [number, number] => [CHIMES[i], f.x]), [86, 2000]], (t) => t);
  const fold = prog(frame, B(5), 18, EASE_IN_OUT);
  const square = prog(frame, 118, 14, LAND);
  const ring = prog(frame, 121, 18, EASE_OUT);
  const ext = prog(frame, B(9) - 6, 14, EASE_IN_OUT);
  const pan = prog(frame, B(9) + 6, 18, EASE_IN);
  const end = iconPt(ICON_PULSE[ICON_PULSE.length - 1]);
  const extHead = mix(end[0], 2000, ext) + pan * 800;
  const linePts = fold > 0 ? LONG_R.map((p, i): Pt => [mix(p[0], ICON_R[i][0], fold), mix(p[1], ICON_R[i][1], fold)]) : upToX(LONG, hx);
  const lineW = mix(LINE_W, ICON_W, fold);
  return (
    <AbsoluteFill style={{ transform: `translateX(${-pan * 900}px)`, opacity: 1 - prog(frame, 204, 8) }}>
      {FEATS.map((f, i) => {
        const at = CHIMES[i];
        const pop = prog(frame, at, 12, LAND);
        if (pop <= 0) return null;
        const g = prog(frame, B(5) - 2, 14, EASE_IN);
        const cy = featCardY(f);
        const x = mix(f.x, ICON.x, g), y = mix(cy, ICON.y, g);
        const s = CARD_S * mix(1, 0.1, g) * mix(0.6, 1, pop);
        const drift = Math.sin((frame + i * 23) / 26) * 5 * (1 - g);
        const tickTo = f.up ? cy + (f.h * CARD_S) / 2 + 6 : cy - (f.h * CARD_S) / 2 - 6;
        const tick = prog(frame, at, 8, EASE_OUT) * (1 - prog(frame, B(5) - 4, 6));
        const labelY = f.up ? cy - (f.h * CARD_S) / 2 - 58 : cy + (f.h * CARD_S) / 2 + 18;
        return (
          <div key={f.name} style={{ opacity: Math.min(1, pop * 1.5) * (1 - prog(frame, B(5) + 8, 6)) }}>
            {tick > 0 && <Line id={`tick-${i}`} w={1.4} pts={[[f.x, LINE_Y + (f.up ? -TIP : TIP)], [f.x, mix(LINE_Y + (f.up ? -TIP : TIP), tickTo, tick)]]} />}
            <div style={{ position: 'absolute', left: x - f.w / 2, top: y + drift - f.h / 2, width: f.w, height: f.h, transform: `scale(${s})` }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: P.surface, boxShadow: '0 0 0 1px rgba(170,195,255,0.55), 0 0 36px rgba(61,123,255,0.45), 0 18px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.node(frame, at)}</div>
            </div>
            <div style={{ position: 'absolute', left: f.x - 200, width: 400, top: labelY + drift, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: prog(frame, at + 2, 12) * (1 - g), transform: `translateY(${(1 - prog(frame, at + 2, 12)) * (f.up ? 12 : -12)}px)`, fontFamily: P.font, fontSize: 36, fontWeight: 600, color: '#fff', letterSpacing: '0.06em', textShadow: '0 0 22px rgba(61,123,255,0.55)' }}>
              <Icon name={f.icon} size={28} color="#9DB8FF" stroke={2.2} />{f.name}
            </div>
          </div>
        );
      })}
      {frame >= 118 && (
        <div style={{ position: 'absolute', left: ICON.x - ICON.s / 2, top: ICON.y - ICON.s / 2, transform: `scale(${mix(0.4, 1, square)})`, opacity: prog(frame, 118, 4) }}>
          <BrandMark size={ICON.s} draw={1} glow={1 - prog(frame, 128, 30)} id="s-open" />
        </div>
      )}
      {frame < 130 && <Line id="s-hero" pts={linePts} w={lineW} head={fold === 0 && frame < 86} opacity={1 - prog(frame, 124, 6)} />}
      {frame >= 121 && frame < 140 && (
        <div style={{ position: 'absolute', left: ICON.x - 460 * ring, top: ICON.y - 460 * ring, width: 920 * ring, height: 920 * ring, borderRadius: '50%', border: `1.5px solid rgba(160,190,255,${0.7 * (1 - ring)})`, boxShadow: `0 0 50px rgba(61,123,255,${0.5 * (1 - ring)})` }} />
      )}
      {ext > 0 && (
        <>
          <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <polygon points={`${end[0] - 4},${end[1] - ICON_W / 2} ${end[0] + 70},${end[1] - LINE_W / 2} ${end[0] + 70},${end[1] + LINE_W / 2} ${end[0] - 4},${end[1] + ICON_W / 2}`} fill="#F5F8FF" />
          </svg>
          <Line id="s-ext" pts={[[end[0] + 60, end[1]], [extHead, end[1]]]} head />
        </>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: P.font, color: '#fff' }}>
        <div style={{ display: 'inline-flex', fontSize: 92, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 0 40px rgba(61,123,255,0.45)' }}>
          {[...'BNBU 伴学'].map((ch, i) => {
            const p = prog(frame, 126 + i * 1.5, 14);
            return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>{ch}</span>;
          })}
        </div>
        <div style={{ marginTop: 18, fontSize: 40, fontWeight: 500, letterSpacing: '0.22em', color: 'rgba(222,230,255,0.9)', opacity: prog(frame, 136, 12) }}>你的校园，一处展开</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', justifyContent: 'center', gap: 18, fontFamily: P.font, fontSize: 30, fontWeight: 500, color: 'rgba(205,218,255,0.92)', letterSpacing: '0.06em' }}>
        {MODULES.map((m, i) => {
          const p = prog(frame, 144 + i * 2, 10);
          return <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{i > 0 && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#6E98FF' }} />}{m}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 7–11.2 s: home heading in close-up, then the 下一步 card lifts out ----------------
const HEADING = '今天，先做好下一件事';
const NEXT = { x: 40, y: 306, w: 680, h: 190 };
const underline: Pt[] = ICON_PULSE.map(([u, v]): Pt => [40 + (u - 60) * 0.81, 112 + (v - 116) * 0.14]);

const HomePage = ({ frame, chars, sub, nextOpacity }: { frame: number; chars: number; sub: number; nextOpacity: number }) => (
  <Win x={0} y={0} w={760} h={700} glow={0.4}>
    <Box x={40} y={30}><Kicker>CAMPUS / TODAY</Kicker></Box>
    <Box x={40} y={50}>
      <Txt size={30} weight={700}>{[...HEADING].map((c, i) => <span key={i} style={{ opacity: i < chars ? 1 : 0 }}>{c}</span>)}</Txt>
    </Box>
    <Box x={40} y={98} style={{ opacity: sub }}><Txt size={12.5} color={P.muted}>你好，林知夏。你的校园安排和需要处理的事项都在这里。</Txt></Box>
    <Box x={40} y={124} style={{ opacity: sub }}><Txt size={11.5} weight={600} color="#48484A">10月13日，星期二&nbsp;&nbsp;·&nbsp;&nbsp;1 项近期安排</Txt></Box>
    <Box x={40} y={160}><TaskCard /></Box>
    <Box x={NEXT.x} y={NEXT.y} style={{ opacity: nextOpacity }}><NextCard kicker="下一步 · 已标记参与" when={ROWS.run.when} title={ROWS.run.title} place={ROWS.run.place} /></Box>
    <Box x={40} y={512}>
      <div style={{ position: 'relative', width: 680, height: 162, borderRadius: 16, background: P.surface, border: `1px solid ${P.line}` }}>
        <Box x={20} y={20}><SchedHeader /></Box>
        <Box x={20} y={88}><SchedRow {...ROWS.run} /></Box>
      </div>
    </Box>
    {frame > 230 && frame < 262 && <Line id="s-underline" w={1.2} pts={partial(underline, prog(frame, 230, 16, EASE_IN_OUT))} opacity={1 - prog(frame, 250, 10)} />}
  </Win>
);

const Home = ({ frame }: { frame: number }) => {
  if (frame < 206 || frame >= 358) return null;
  const cam: CamState = {
    z: keys(frame, [[206, 3.6], [250, 3.0], [272, 1.7], [336, 1.86]]),
    fx: keys(frame, [[206, 130], [250, 205], [272, 380], [336, 380]]),
    fy: keys(frame, [[206, 72], [250, 72], [272, 400], [336, 410]]),
    ry: keys(frame, [[206, -14], [250, -5], [272, 0], [336, 5]]),
    rx: keys(frame, [[206, 5], [250, 2], [272, 0], [336, -3]]),
  };
  const chars = Math.round(prog(frame, 210, 18, (t) => t) * HEADING.length);
  const focus = 1 - prog(frame, 248, 14, EASE_IN_OUT);
  const lift = prog(frame, B(13), 16, LAND);
  const rim = prog(frame, B(13) + 2, 20, EASE_IN_OUT);
  const wipe = prog(frame, B(16), 20, EASE_IN_OUT);
  const page = () => (
    <Cam cam={cam}><HomePage frame={frame} chars={chars} sub={prog(frame, 254, 10)} nextOpacity={1 - lift * 0.85} /></Cam>
  );
  return (
    <AbsoluteFill style={{ opacity: prog(frame, 206, 6), clipPath: wipe > 0 ? `inset(0 0 0 ${wipe * 100}%)` : undefined }}>
      <AbsoluteFill style={{ filter: lift > 0.01 ? `blur(${lift * 6}px) brightness(${1 - lift * 0.62})` : undefined }}>
        <Focused y={camToScreen(cam, 190, 82).y} band={110} amount={focus} render={page} />
      </AbsoluteFill>
      {lift > 0 && (
        <Cam cam={cam}>
          <div style={{ position: 'absolute', left: NEXT.x, top: NEXT.y, width: NEXT.w, height: NEXT.h, transformStyle: 'preserve-3d', transform: `translateZ(${lift * 150}px) rotateX(${lift * -5}deg) translateY(${Math.sin((frame - B(13)) / 14) * 3 * lift}px)` }}>
            <div style={{ borderRadius: 16, boxShadow: `0 40px 90px rgba(0,0,0,${0.55 * lift}), 0 0 ${60 * rim}px rgba(61,123,255,${0.45 * rim}), 0 0 ${140 * rim}px rgba(138,99,255,${0.25 * rim})` }}>
              <NextCard kicker="下一步 · 已标记参与" when={ROWS.run.when} title={ROWS.run.title} place={ROWS.run.place} />
            </div>
            <Trace id="s-next" x={0} y={0} w={NEXT.w} h={NEXT.h} r={16} p={rim} width={0.9} />
          </div>
        </Cam>
      )}
      <Word frame={frame} text="下一步" from={284} to={328} y={880} size={92} />
      {wipe > 0 && wipe < 1 && <WipeBar x={wipe * 1920} />}
    </AbsoluteFill>
  );
};

const WipeBar = ({ x }: { x: number }) => (
  <div style={{ position: 'absolute', left: x - 40, top: -40, width: 80, height: 1160, background: 'linear-gradient(90deg, rgba(61,123,255,0) 0%, rgba(120,160,255,0.4) 42%, #F5F8FF 50%, rgba(150,120,255,0.4) 58%, rgba(61,123,255,0) 100%)', filter: 'blur(3px)', zIndex: 90 }} />
);

// ---------------- 11.9–16.1 s: 「活动」 on the riser, cards burst in on the drop and the dolly settles on one ----------------
const ROW_IDS = ['career', 'speaking', 'library', 'cinema', 'run', 'ai'];
const CARD_W = 214, CARD_GAP = 250;
const AI_X = ROW_IDS.indexOf('ai') * CARD_GAP + CARD_W / 2;
const small: Pt[] = ICON_PULSE.map(([u, v]): Pt => [960 + (u - 245) * 1.0, 650 + (v - 129) * 0.36]);
const OPEN = B(23);

const Events = ({ frame }: { frame: number }) => {
  if (frame < B(17) || frame >= OPEN + 14) return null;
  const fx = keys(frame, [[DROP, 300], [OPEN - 6, AI_X]]);
  const zoom = prog(frame, OPEN, 14, EASE_IN);
  const cam: CamState = {
    z: keys(frame, [[DROP, 1.7], [OPEN - 6, 2.3]]) * (1 + zoom * 1.6), fx, fy: 200, rx: 10, ry: keys(frame, [[DROP, -30], [OPEN - 6, -8]]),
    opacity: (frame >= DROP ? 1 : 0) * (1 - zoom), blur: zoom * 10,
  };
  return (
    <AbsoluteFill>
      <Word frame={frame} text="活动" from={B(18)} to={DROP - 2} y={500} size={150} outScale={0.5} />
      {frame > B(18) + 4 && frame < DROP + 8 && <Line id="s-word-line" w={1.8} pts={partial(small, prog(frame, B(18) + 4, 20, EASE_IN_OUT))} opacity={1 - prog(frame, DROP - 2, 8)} />}
      {frame >= DROP && (
        <Cam cam={cam}>
          {ROW_IDS.map((id, i) => {
            const cx = i * CARD_GAP + CARD_W / 2;
            const d = Math.abs(cx - fx);
            const inP = prog(frame, DROP + i * 2, 16, LAND);
            return (
              <Box key={id} x={i * CARD_GAP} y={0} style={{ opacity: Math.min(1, inP * 2), filter: `blur(${Math.min(8, d / 45)}px) brightness(${1 - Math.min(0.6, d / 560)})`, transform: `translateZ(${(1 - inP) * -900}px)` }}>
                <ActivityCard act={actById(id)} w={CARD_W} glow={id === 'ai' ? prog(frame, OPEN - 16, 12) : 0} />
              </Box>
            );
          })}
        </Cam>
      )}
      {frame >= DROP && frame < DROP + 14 && <AbsoluteFill style={{ background: `radial-gradient(50% 50% at 50% 46%, rgba(160,190,255,${0.45 * (1 - prog(frame, DROP, 14))}) 0%, rgba(0,0,0,0) 70%)` }} />}
    </AbsoluteFill>
  );
};

// ---------------- 16.1–20 s: read the detail, then 标记参与 (button press, no pointer) ----------------
const BTN = { x: 20, y: 654, h: 38 };
const CAM_IN: CamState = { z: 2.7, fx: 150, fy: 668, ry: -6, rx: 2 };
const CAM_OUT: CamState = { z: 1.08, fx: 345, fy: 370, ry: -18, rx: 7 };

const Detail = ({ frame }: { frame: number }) => {
  if (frame < OPEN + 2) return null;
  const open = prog(frame, OPEN + 2, 18, EASE_OUT);
  const pull = prog(frame, MARK_CLICK + 4, 24, EASE_OUT);
  const near: CamState = {
    z: keys(frame, [[OPEN, 1.18], [516, 1.22], [534, 1.7], [556, CAM_IN.z]]),
    fx: keys(frame, [[OPEN, 345], [516, 345], [534, 330], [556, CAM_IN.fx]]),
    fy: keys(frame, [[OPEN, 350], [516, 330], [534, 540], [556, CAM_IN.fy]]),
    ry: keys(frame, [[OPEN, -12], [516, -6], [534, -4], [556, CAM_IN.ry!]]),
    rx: keys(frame, [[OPEN, 6], [516, 3], [534, 2], [556, CAM_IN.rx!]]),
  };
  const cam: CamState = pull > 0
    ? { z: mix(CAM_IN.z, CAM_OUT.z, pull), fx: mix(CAM_IN.fx, CAM_OUT.fx, pull), fy: mix(CAM_IN.fy, CAM_OUT.fy, pull), ry: mix(CAM_IN.ry!, CAM_OUT.ry!, pull), rx: mix(CAM_IN.rx!, CAM_OUT.rx!, pull) }
    : near;
  const marked = prog(frame, MARK_CLICK + 1, 10, EASE_OUT);
  const press = Math.max(0, 1 - Math.abs(frame - MARK_CLICK) / 4);
  const btnW = 92 + marked * 22;
  const focusY = keys(frame, [[516, 540], [540, 540], [556, BTN.y + BTN.h / 2]]);
  const amount = prog(frame, 516, 14, EASE_IN_OUT) * (1 - prog(frame, MARK_CLICK + 4, 12));
  const btnScreen = camToScreen(CAM_IN, BTN.x + 46, BTN.y + BTN.h / 2);
  const halo = prog(frame, 548, 16, EASE_IN_OUT);
  const rim = prog(frame, MARK_CLICK + 6, 20, EASE_IN_OUT);
  const page = () => (
    <Cam cam={{ ...cam, opacity: open }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - open) * 80}px) scale(${mix(0.9, 1, open)})`, transformOrigin: '345px 356px' }}>
        <Win x={0} y={0} w={690} h={712} bg={P.surface} glow={0.35 + rim * 0.5}>
          <ActivityDetail reveal={(i) => prog(frame, OPEN + 6 + i * 2, 12)} marked={marked} press={press} />
        </Win>
        <Trace id="s-btn" x={BTN.x - 5} y={BTN.y - 5} w={btnW + 10} h={BTN.h + 10} r={13} p={halo} width={0.8} glow={1 - pull} />
        <Trace id="s-win" x={0} y={0} w={690} h={712} r={22} p={rim} width={1.4} />
      </div>
    </Cam>
  );
  return (
    <AbsoluteFill style={{ opacity: 1 - prog(frame, SAMPLE_FRAMES - 12, 12) }}>
      <Focused y={camToScreen(cam, 345, focusY).y} band={100} amount={amount} render={page} />
      <Burst frame={frame} at={MARK_CLICK + 1} x={btnScreen.x} y={btnScreen.y} color="#7FA6FF" r={110} n={12} />
    </AbsoluteFill>
  );
};

const SFX: { at: number; src: string; volume: number; len?: number }[] = [
  { at: 2, src: 'sfx/sparkle-touch.mp3', volume: 0.2, len: 60 },
  { at: B(5) - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.26 },
  { at: 117, src: 'sfx/sparkle.mp3', volume: 0.26 },
  { at: B(9) - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.3 },
  { at: 204, src: 'sfx/transition-soft.mp3', volume: 0.3 },
  { at: B(13) - 2, src: 'sfx/swoosh-quick.mp3', volume: 0.26 },
  { at: B(16) - 2, src: 'sfx/whoosh-big.mp3', volume: 0.26 },
  { at: DROP - 2, src: 'sfx/impact-deep-whoosh.mp3', volume: 0.32 },
  { at: OPEN, src: 'sfx/swoosh-quick.mp3', volume: 0.26 },
  { at: MARK_CLICK - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
];

export const Sample = ({ bgm = true }: { bgm?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: T.night }}>
      <Backdrop />
      <Opening frame={frame} />
      <Home frame={frame} />
      <Events frame={frame} />
      <Detail frame={frame} />
      {bgm && <Audio src={staticFile('audio/bgm-original.wav')} volume={(f) => interpolate(f, [0, 6, SAMPLE_FRAMES - 20, SAMPLE_FRAMES], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.len ?? 45} layout="none">
          <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
