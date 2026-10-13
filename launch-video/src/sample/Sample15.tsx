import type { ReactNode } from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Box, Kicker, P, Txt } from '../kit/base';
import { BrandMark, Burst, Cam, camToScreen, type CamState, Win } from '../kit/fx';
import { ActivityCard, actById, ActivityDetail, NextCard, ROWS, SchedHeader, SchedRow, TaskCard } from '../kit/product';
import { Backdrop, Cursor, pathAt, T } from '../lib/ui';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';

// 15 s look test on raw 30 fps frames. The score's beat is 0.7 s = 21 frames:
// chimes at beats 0.5–3, a chime at beat 5, riser 16–19, breath 19–20, drop at beat 20 (frame 420).
export const SAMPLE_FRAMES = 450;
const B = (n: number) => Math.round(n * 21);
const DROP = B(20);
const MARK_CLICK = B(19);

// ---------- the brand pulse line as a polyline (icon path coordinates, rounded corners dropped) ----------
type Pt = [number, number];
const PULSE: Pt[] = [[45, 116], [150, 116], [156, 120], [205, 224], [211, 224], [299, 35], [305, 35], [331, 97], [341, 102], [445, 102]];

const partial = (pts: Pt[], t: number): Pt[] => {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
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
const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
const mapPts = (pts: Pt[], f: (p: Pt) => Pt) => pts.map(f);

// Where the pulse sits inside BrandMark (nested viewBoxes of src/assets/brand/brand-app-icon-a.svg, flattened).
const iconPt = (cx: number, cy: number, size: number) => ([u, v]: Pt): Pt => [cx - size / 2 + ((1.7131 * u + 82.8) * size) / 1024, cy - size / 2 + ((1.7131 * v + 296.9) * size) / 1024];

const GlowPath = ({ id, d, w, glow = 1, opacity = 1, head }: { id: string; d: string; w: number; glow?: number; opacity?: number; head?: Pt & { r?: number } | null }) => (
  <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity, pointerEvents: 'none' }}>
    <defs>
      <filter id={`${id}-b`} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}><feGaussianBlur stdDeviation={w * 1.8} /></filter>
      <filter id={`${id}-s`} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}><feGaussianBlur stdDeviation={w * 0.35} /></filter>
      <radialGradient id={`${id}-h`}><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.25" stopColor="#BFD2FF" stopOpacity="0.9" /><stop offset="1" stopColor="#3D7BFF" stopOpacity="0" /></radialGradient>
    </defs>
    <path d={d} fill="none" stroke={T.electric} strokeWidth={w * 4.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6 * glow} filter={`url(#${id}-b)`} />
    <path d={d} fill="none" stroke="#8FB2FF" strokeWidth={w * 1.9} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} filter={`url(#${id}-s)`} />
    <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    {head && <circle cx={head[0]} cy={head[1]} r={w * (head.r ?? 6)} fill={`url(#${id}-h)`} />}
  </svg>
);

// Neon outline traced around a rounded rect (world or screen space).
const Trace = ({ id, x, y, w, h, r, p, width = 2.5, glow = 1 }: { id: string; x: number; y: number; w: number; h: number; r: number; p: number; width?: number; glow?: number }) => {
  if (p <= 0) return null;
  const rect = (sw: number, stroke: string, extra: object) => <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke={stroke} strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} {...extra} />;
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs><filter id={id} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}><feGaussianBlur stdDeviation={width * 3} /></filter></defs>
      {rect(width * 5, T.electric, { opacity: 0.7 * glow, filter: `url(#${id})` })}
      {rect(width * 1.6, '#9DB8FF', { opacity: 0.9 })}
      {rect(width * 0.7, '#FFFFFF', {})}
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
// One centred word, keyword gradient, rising per character.
const Word = ({ frame, text, from, to, y, size }: { frame: number; text: string; from: number; to: number; y: number; size: number }) => {
  if (frame < from - 1 || frame > to + 12) return null;
  const out = prog(frame, to, 10, EASE_IN_OUT);
  const chars = [...text];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.62, textAlign: 'center', zIndex: 80, whiteSpace: 'nowrap', opacity: 1 - out, transform: `scale(${1 + out * 0.08})`, filter: `drop-shadow(0 0 26px rgba(61,123,255,0.55))${out > 0.02 ? ` blur(${out * 8}px)` : ''}` }}>
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

// ---------- 0–4.1 s: the pulse line draws, folds into the icon, then shoots off-screen ----------
const CHIMES = [0.5, 1, 1.5, 2, 2.5, 3].map(B);
const ICON = { x: 960, y: 420, s: 216 };
const hero = ([u, v]: Pt): Pt => [960 + (u - 245) * 4, 540 + (v - 129) * 4];

const Opening = ({ frame }: { frame: number }) => {
  if (frame >= 126) return null;
  const draw = prog(frame, 6, 54, EASE_IN_OUT);
  const fold = prog(frame, 60, 14, EASE_IN_OUT);
  const flare = CHIMES.reduce((m, c) => Math.max(m, 1 - Math.abs(frame - c) / 7), 0);
  const drawn = partial(PULSE, draw);
  const pts = mapPts(drawn, (p) => { const a = hero(p), b = iconPt(ICON.x, ICON.y, ICON.s)(p); return [mix(a[0], b[0], fold), mix(a[1], b[1], fold)]; });
  const tip = pts[pts.length - 1];
  const square = prog(frame, 70, 14, LAND);
  const ring = prog(frame, 72, 18, EASE_OUT);
  const exit = prog(frame, 104, 16, EASE_IN);
  const end = iconPt(ICON.x, ICON.y, ICON.s)(PULSE[PULSE.length - 1]);
  const shot = prog(frame, 104, 18, EASE_IN);
  const cometX = mix(end[0], 2500, shot);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + frame * 0.0006 + exit * 0.22})`, opacity: 1 - exit, filter: exit > 0.02 ? `blur(${exit * 10}px)` : undefined }}>
        {frame >= 70 && (
          <div style={{ position: 'absolute', left: ICON.x - ICON.s / 2, top: ICON.y - ICON.s / 2, transform: `scale(${mix(0.3, 1, square)})`, opacity: prog(frame, 70, 4) }}>
            <BrandMark size={ICON.s} draw={1} glow={1 - prog(frame, 80, 30)} id="s-open" />
          </div>
        )}
        {frame < 80 && (
          <GlowPath id="s-hero" d={toD(pts)} w={mix(9, 6.5, fold)} glow={0.75 + flare * 0.6} opacity={1 - prog(frame, 75, 5)}
            head={draw < 1 && fold < 0.5 ? Object.assign([...tip] as Pt, { r: 6 + flare * 5 }) : null} />
        )}
        {frame >= 72 && frame < 92 && (
          <div style={{ position: 'absolute', left: ICON.x - 460 * ring, top: ICON.y - 460 * ring, width: 920 * ring, height: 920 * ring, borderRadius: '50%', border: `2px solid rgba(150,182,255,${0.8 * (1 - ring)})`, boxShadow: `0 0 70px rgba(61,123,255,${0.6 * (1 - ring)})` }} />
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: P.font, color: '#fff' }}>
          <div style={{ display: 'inline-flex', fontSize: 96, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 0 40px rgba(61,123,255,0.45)' }}>
            {[...'BNBU 伴学'].map((ch, i) => {
              const p = prog(frame, 78 + i * 1.5, 14);
              return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>{ch}</span>;
            })}
          </div>
          <div style={{ marginTop: 20, fontSize: 40, fontWeight: 500, letterSpacing: '0.22em', color: 'rgba(222,230,255,0.9)', opacity: prog(frame, 88, 12) }}>你的校园，一处展开</div>
        </div>
      </AbsoluteFill>
      {shot > 0 && shot < 1 && (
        <GlowPath id="s-comet" d={toD([[Math.max(end[0], cometX - 900 * (0.3 + shot)), end[1]], [cometX, end[1]]])} w={7} head={Object.assign([cometX, end[1]] as Pt, { r: 9 })} />
      )}
    </AbsoluteFill>
  );
};

// ---------- 4.1–9.1 s: home heading in extreme close-up, then the 下一步 card lifts out of the page ----------
const HEADING = '今天，先做好下一件事';
const NEXT = { x: 40, y: 306, w: 680, h: 190 };
const underline = mapPts(PULSE, ([u, v]): Pt => [40 + (u - 45) * 0.75, 112 + (v - 116) * 0.16]);

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
    {frame > 146 && frame < 180 && <GlowPath id="s-underline" d={toD(partial(underline, prog(frame, 146, 16, EASE_IN_OUT)))} w={2.4} opacity={1 - prog(frame, 168, 10)} />}
  </Win>
);

const Home = ({ frame }: { frame: number }) => {
  if (frame < 122 || frame >= 274) return null;
  const cam: CamState = {
    z: keys(frame, [[122, 3.6], [168, 3.0], [194, 1.7], [252, 1.86]]),
    fx: keys(frame, [[122, 130], [168, 205], [194, 380], [252, 380]]),
    fy: keys(frame, [[122, 72], [168, 72], [194, 400], [252, 410]]),
    ry: keys(frame, [[122, -14], [168, -5], [194, 0], [252, 5]]),
    rx: keys(frame, [[122, 5], [168, 2], [194, 0], [252, -3]]),
  };
  const chars = Math.round(prog(frame, 126, 18, (t) => t) * HEADING.length);
  const focus = 1 - prog(frame, 166, 14, EASE_IN_OUT);
  const lift = prog(frame, B(9), 16, LAND);
  const rim = prog(frame, B(9) + 2, 20, EASE_IN_OUT);
  const wipe = prog(frame, 252, 20, EASE_IN_OUT);
  const page = () => (
    <Cam cam={cam}><HomePage frame={frame} chars={chars} sub={prog(frame, 170, 10)} nextOpacity={1 - lift * 0.85} /></Cam>
  );
  return (
    <AbsoluteFill style={{ opacity: prog(frame, 122, 5), clipPath: wipe > 0 ? `inset(0 0 0 ${wipe * 100}%)` : undefined }}>
      <AbsoluteFill style={{ filter: lift > 0.01 ? `blur(${lift * 6}px) brightness(${1 - lift * 0.62})` : undefined }}>
        <Focused y={camToScreen(cam, 190, 82).y} band={110} amount={focus} render={page} />
      </AbsoluteFill>
      {lift > 0 && (
        <Cam cam={cam}>
          <div style={{ position: 'absolute', left: NEXT.x, top: NEXT.y, width: NEXT.w, height: NEXT.h, transformStyle: 'preserve-3d', transform: `translateZ(${lift * 150}px) rotateX(${lift * -5}deg) translateY(${Math.sin((frame - 189) / 14) * 3 * lift}px)` }}>
            <div style={{ borderRadius: 16, boxShadow: `0 40px 90px rgba(0,0,0,${0.55 * lift}), 0 0 ${70 * rim}px rgba(61,123,255,${0.55 * rim}), 0 0 ${150 * rim}px rgba(138,99,255,${0.3 * rim})` }}>
              <NextCard kicker="下一步 · 已标记参与" when={ROWS.run.when} title={ROWS.run.title} place={ROWS.run.place} />
            </div>
            <Trace id="s-next" x={0} y={0} w={NEXT.w} h={NEXT.h} r={16} p={rim} width={1.6} />
          </div>
        </Cam>
      )}
      <Word frame={frame} text="下一步" from={200} to={246} y={880} size={92} />
      {wipe > 0 && wipe < 1 && <WipeBar x={wipe * 1920} />}
    </AbsoluteFill>
  );
};

const WipeBar = ({ x }: { x: number }) => (
  <div style={{ position: 'absolute', left: x - 60, top: -40, width: 120, height: 1160, background: 'linear-gradient(90deg, rgba(61,123,255,0) 0%, rgba(120,160,255,0.55) 40%, #FFFFFF 50%, rgba(150,120,255,0.55) 60%, rgba(61,123,255,0) 100%)', filter: 'blur(6px)', zIndex: 90 }} />
);

// ---------- 9.1–11.9 s: 「活动」, then a dolly across the cover cards ----------
const ROW_IDS = ['career', 'speaking', 'library', 'cinema', 'run', 'ai'];
const CARD_W = 214, CARD_GAP = 250;
const small = mapPts(PULSE, ([u, v]): Pt => [960 + (u - 245) * 1.1, 650 + (v - 129) * 0.42]);

const Events = ({ frame }: { frame: number }) => {
  if (frame < 270 || frame >= 360) return null;
  const cards = prog(frame, 304, 8);
  const fx = keys(frame, [[304, 330], [357, ROW_IDS.length * CARD_GAP - CARD_GAP + CARD_W / 2]]);
  const cam: CamState = { z: keys(frame, [[304, 2.0], [357, 2.35]]), fx, fy: 190, rx: 10, ry: keys(frame, [[304, -28], [357, -10]]), opacity: cards };
  return (
    <AbsoluteFill>
      <Word frame={frame} text="活动" from={274} to={304} y={500} size={150} />
      {frame > 280 && frame < 318 && <GlowPath id="s-word-line" d={toD(partial(small, prog(frame, 280, 18, EASE_IN_OUT)))} w={3.2} opacity={1 - prog(frame, 304, 10)} />}
      {cards > 0 && (
        <Cam cam={cam}>
          {ROW_IDS.map((id, i) => {
            const cx = i * CARD_GAP + CARD_W / 2;
            const d = Math.abs(cx - fx);
            return (
              <Box key={id} x={i * CARD_GAP} y={0} style={{ filter: `blur(${Math.min(9, d / 40)}px) brightness(${1 - Math.min(0.65, d / 520)})`, transform: `translateY(${(1 - prog(frame, 304 + i * 2, 14, LAND)) * 80}px)` }}>
                <ActivityCard act={actById(id)} w={CARD_W} glow={id === 'ai' ? prog(frame, 340, 12) : 0} />
              </Box>
            );
          })}
        </Cam>
      )}
    </AbsoluteFill>
  );
};

// ---------- 11.9–15 s: 标记参与 in close-up, click in the breath, pull back on the drop ----------
const BTN = { x: 20, y: 654, h: 38 };
const CAM_IN: CamState = { z: 3.1, fx: 150, fy: 670, ry: -6, rx: 2 };
const CAM_OUT: CamState = { z: 1.08, fx: 345, fy: 370, ry: -18, rx: 7 };

const Mark = ({ frame }: { frame: number }) => {
  if (frame < B(17)) return null;
  const pull = prog(frame, DROP, 24, EASE_OUT);
  const near: CamState = {
    z: keys(frame, [[B(17), 2.4], [396, CAM_IN.z]]), fx: keys(frame, [[B(17), 270], [396, CAM_IN.fx]]), fy: keys(frame, [[B(17), 560], [396, CAM_IN.fy]]),
    ry: keys(frame, [[B(17), -16], [396, CAM_IN.ry!]]), rx: keys(frame, [[B(17), 6], [396, CAM_IN.rx!]]),
  };
  const cam: CamState = pull > 0
    ? { z: mix(CAM_IN.z, CAM_OUT.z, pull), fx: mix(CAM_IN.fx, CAM_OUT.fx, pull), fy: mix(CAM_IN.fy, CAM_OUT.fy, pull), ry: mix(CAM_IN.ry!, CAM_OUT.ry!, pull), rx: mix(CAM_IN.rx!, CAM_OUT.rx!, pull) }
    : near;
  const marked = prog(frame, MARK_CLICK + 1, 10, EASE_OUT);
  const btnW = 92 + marked * 22;
  const btnC = { x: BTN.x + btnW / 2, y: BTN.y + BTN.h / 2 };
  const btnScreen = camToScreen(CAM_IN, 20 + 46, BTN.y + BTN.h / 2);
  const cur = pathAt(frame, [[372, 1560, 1010], [394, btnScreen.x + 12, btnScreen.y + 8], [440, btnScreen.x + 12, btnScreen.y + 8]]);
  const halo = prog(frame, 380, 16, EASE_IN_OUT);
  const rim = prog(frame, DROP + 2, 20, EASE_IN_OUT);
  const flash = prog(frame, DROP, 14, EASE_OUT);
  const page = () => (
    <Cam cam={cam}>
      <Win x={0} y={0} w={690} h={712} bg={P.surface} glow={0.35 + rim * 0.5}>
        <ActivityDetail reveal={() => 1} marked={marked} />
      </Win>
      <Trace id="s-btn" x={BTN.x - 4} y={BTN.y - 4} w={btnW + 8} h={BTN.h + 8} r={12} p={halo} width={1.2} glow={1 - pull} />
      <Trace id="s-win" x={0} y={0} w={690} h={712} r={22} p={rim} width={2.4} />
    </Cam>
  );
  return (
    <AbsoluteFill style={{ opacity: prog(frame, B(17), 3) }}>
      <Focused y={camToScreen(cam, btnC.x, btnC.y).y} band={95} amount={1 - prog(frame, DROP, 10)} render={page} />
      <Burst frame={frame} at={MARK_CLICK + 2} x={btnScreen.x} y={btnScreen.y} color="#5B8CFF" r={120} n={14} />
      <Cursor at={frame} x={cur.x} y={cur.y} clicks={[MARK_CLICK]} size={44} opacity={prog(frame, 372, 6) * (1 - prog(frame, DROP - 4, 6))} />
      {frame >= DROP && frame < DROP + 16 && <AbsoluteFill style={{ background: `radial-gradient(55% 55% at 50% 50%, rgba(170,195,255,${0.6 * (1 - flash)}) 0%, rgba(61,123,255,${0.25 * (1 - flash)}) 45%, rgba(0,0,0,0) 75%)`, zIndex: 95 }} />}
    </AbsoluteFill>
  );
};

const SFX: { at: number; src: string; volume: number; len?: number }[] = [
  { at: 4, src: 'sfx/sparkle-touch.mp3', volume: 0.26, len: 60 },
  { at: 70, src: 'sfx/sparkle.mp3', volume: 0.28 },
  { at: 102, src: 'sfx/whoosh-fast.mp3', volume: 0.34 },
  { at: 121, src: 'sfx/transition-soft.mp3', volume: 0.32 },
  { at: B(9) - 2, src: 'sfx/swoosh-quick.mp3', volume: 0.28 },
  { at: 250, src: 'sfx/whoosh-big.mp3', volume: 0.28 },
  { at: 302, src: 'sfx/swoosh-quick.mp3', volume: 0.24 },
  { at: B(17) - 3, src: 'sfx/whoosh-fast.mp3', volume: 0.28 },
  { at: MARK_CLICK - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
  { at: DROP - 2, src: 'sfx/impact-deep-whoosh.mp3', volume: 0.32 },
];

export const Sample15 = ({ bgm = true }: { bgm?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: T.night }}>
      <Backdrop />
      <Opening frame={frame} />
      <Home frame={frame} />
      <Events frame={frame} />
      <Mark frame={frame} />
      {bgm && <Audio src={staticFile('audio/bgm-original.wav')} volume={(f) => interpolate(f, [0, 6, SAMPLE_FRAMES - 16, SAMPLE_FRAMES], [0, 0.6, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.len ?? 45} layout="none">
          <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
