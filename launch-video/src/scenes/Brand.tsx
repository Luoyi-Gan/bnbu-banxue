import { Img, staticFile, useCurrentFrame } from 'remotion';
import { box, Float, Shot, Stage, Sweep, T, type Rect } from '../lib/ui';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, mix, prog } from '../lib/motion';
import { MOMENTS, SHOTS } from '../timeline';

const BrandIcon = ({ size, glow }: { size: number; glow: number }) => (
  <div style={{ position: 'relative', width: size, height: size, borderRadius: size * 0.219, overflow: 'hidden', boxShadow: `0 0 ${60 + glow * 90}px rgba(61,123,255,${0.35 + glow * 0.4}), 0 0 ${160 + glow * 120}px rgba(138,99,255,${0.18 + glow * 0.25}), 0 30px 80px rgba(0,0,0,0.6)` }}>
    <Img src={staticFile('brand/brand-app-icon-a.svg')} style={{ width: size, height: size, display: 'block' }} />
  </div>
);

const Wordmark = ({ frame, start, tagline, y = 600 }: { frame: number; start: number; tagline: string; y?: number }) => {
  const word = 'BNBU 伴学';
  const tagStart = start + 10;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: T.font, color: '#fff' }}>
      <div style={{ display: 'inline-flex', fontSize: 96, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 0 40px rgba(61,123,255,0.45)' }}>
        {[...word].map((ch, i) => {
          const p = prog(frame, start + i * 1.5, 16);
          return <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined, whiteSpace: 'pre' }}>{ch}</span>;
        })}
      </div>
      <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, letterSpacing: '0.22em', color: 'rgba(222,230,255,0.9)', opacity: prog(frame, tagStart, 16), transform: `translateY(${(1 - prog(frame, tagStart, 16)) * 16}px)` }}>{tagline}</div>
    </div>
  );
};

type Card = { name: string; key?: string; region?: Rect; s: number; x: number; y: number; z: number; rx: number; ry: number; at: number };
const OPEN_CARDS: Card[] = [
  { name: 'act_filtered', key: 'aiCard', s: 0.92, x: 400, y: 520, z: -120, rx: 4, ry: 22, at: 15 },
  { name: 'alumni_people', key: 'card', s: 0.8, x: 950, y: 250, z: -280, rx: 12, ry: 0, at: 30 },
  { name: 'teams_filtered', key: 'card', s: 1.05, x: 1510, y: 370, z: -80, rx: 4, ry: -20, at: 45 },
  { name: 'coffee_booked', key: 'slot', s: 1.3, x: 1480, y: 790, z: -40, rx: -6, ry: -16, at: 60 },
  { name: 'home_after', key: 'next', s: 0.62, x: 900, y: 830, z: -180, rx: -12, ry: 4, at: 60 },
];

export const Opening = () => {
  const frame = useCurrentFrame();
  const { from, duration } = SHOTS.opening;
  if (frame < from || frame >= from + duration) return null;
  const gather = prog(frame, 63, 15, EASE_IN);
  const iconP = prog(frame, 75, 20, LAND);
  const exit = prog(frame, 112, 14, EASE_IN_OUT);
  const flash = prog(frame, 75, 16, EASE_OUT);
  return (
    <Stage>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - exit, transform: `scale(${1 + exit * 0.12})`, filter: exit > 0.02 ? `blur(${exit * 8}px)` : undefined }}>
        {OPEN_CARDS.map((c, i) => {
          const region = c.region ?? box(c.name, c.key!);
          const lit = prog(frame, c.at - 2, 12);
          const w = region.w * c.s, h = region.h * c.s;
          const drift = Math.sin((frame + i * 23) / 26) * 8;
          const x = mix(c.x + drift, 960, gather), y = mix(c.y - drift * 0.6, 440, gather);
          const pulse = Math.max(0, 1 - Math.abs(frame - c.at) / 18);
          return (
            <Float key={i} w={w} h={h} radius={16} glow={0.25 + pulse * 0.75} bg={T.surface}
              pose={{ x, y, z: mix(c.z, 0, gather), rx: mix(c.rx, 0, gather), ry: mix(c.ry, 0, gather), scale: mix(1, 0.07, gather), opacity: lit * (1 - prog(frame, 72, 6)), blur: gather * 5 }}>
              <Shot name={c.name} region={region} s={c.s} />
            </Float>
          );
        })}
        {frame >= 74 && (
          <div style={{ position: 'absolute', left: 960 - 108, top: 420 - 108, width: 216, height: 216, transform: `scale(${mix(0.35, 1, iconP)})`, opacity: prog(frame, 74, 5) }}>
            <BrandIcon size={216} glow={1 - prog(frame, 80, 30)} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 47, overflow: 'hidden' }}><Sweep start={84} duration={24} /></div>
          </div>
        )}
        {frame >= 75 && frame < 92 && (
          <div style={{ position: 'absolute', left: 960 - 400 * flash, top: 420 - 400 * flash, width: 800 * flash, height: 800 * flash, borderRadius: '50%', border: `2px solid rgba(140,175,255,${0.7 * (1 - flash)})`, boxShadow: `0 0 60px rgba(61,123,255,${0.6 * (1 - flash)})` }} />
        )}
        <Wordmark frame={frame} start={84} tagline="你的校园，一处展开" />
      </div>
    </Stage>
  );
};

type Tile = { name: string; region: Rect; s: number };
const TILES: Tile[] = [
  { name: 'home_after', region: { x: 0, y: 0, w: 900, h: 1240 }, s: 0.3 },
  { name: 'act_filtered', region: { x: 236, y: 600, w: 1180, h: 700 }, s: 0.3 },
  { name: 'team_chat', region: { x: 216, y: 64, w: 1224, h: 817 }, s: 0.28 },
  { name: 'coffee_booked', region: { x: 0, y: 350, w: 690, h: 550 }, s: 0.46 },
  { name: 'alumni_requested', region: { x: 250, y: 60, w: 1150, h: 790 }, s: 0.3 },
  { name: 'ai_answer', region: { x: 520, y: 175, w: 870, h: 725 }, s: 0.38 },
  { name: 'community', region: { x: 240, y: 60, w: 1160, h: 760 }, s: 0.3 },
];

export const Finale = () => {
  const frame = useCurrentFrame();
  const { from } = SHOTS.finale;
  if (frame < from - 2) return null;
  const hit = MOMENTS.finalHit;
  const arrive = prog(frame, from, 18, EASE_OUT);
  const collapse = prog(frame, hit - 13, 13, EASE_IN);
  const iconP = prog(frame, hit, 22, LAND);
  const flash = prog(frame, hit, 18, EASE_OUT);
  return (
    <Stage>
      {frame < hit + 2 && TILES.map((t, i) => {
        const a = (i / TILES.length) * Math.PI * 2 - Math.PI / 2 + frame * 0.004;
        const rx = 650, ry = 340;
        const ringX = 960 + Math.cos(a) * rx, ringY = 470 + Math.sin(a) * ry;
        const farX = 960 + Math.cos(a) * rx * 2.1, farY = 470 + Math.sin(a) * ry * 2.3;
        const x = mix(mix(farX, ringX, arrive), 960, collapse);
        const y = mix(mix(farY, ringY, arrive), 440, collapse);
        const w = t.region.w * t.s, h = t.region.h * t.s;
        return (
          <Float key={i} w={w} h={h} radius={12} glow={0.5 + collapse * 0.5}
            pose={{ x, y, z: mix(-500, 0, arrive), ry: mix(-Math.cos(a) * 26, 0, collapse), rx: Math.sin(a) * 10 * (1 - collapse), scale: mix(1, 0.05, collapse), opacity: arrive * (1 - prog(frame, hit - 3, 3)) }}>
            <Shot name={t.name} region={t.region} s={t.s} />
          </Float>
        );
      })}
      {frame >= hit && (
        <>
          <div style={{ position: 'absolute', left: 960 - 108, top: 420 - 108, width: 216, height: 216, transform: `scale(${mix(1.5, 1, iconP)})`, opacity: prog(frame, hit, 3) }}>
            <BrandIcon size={216} glow={1 - prog(frame, hit + 4, 34)} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 47, overflow: 'hidden' }}><Sweep start={hit + 14} duration={26} /></div>
          </div>
          {frame < hit + 18 && (
            <>
              <div style={{ position: 'absolute', left: 960 - 520 * flash, top: 420 - 520 * flash, width: 1040 * flash, height: 1040 * flash, borderRadius: '50%', border: `3px solid rgba(150,180,255,${0.8 * (1 - flash)})`, boxShadow: `0 0 90px rgba(61,123,255,${0.7 * (1 - flash)})` }} />
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(40% 40% at 50% 39%, rgba(120,160,255,${0.45 * (1 - flash)}) 0%, rgba(0,0,0,0) 70%)` }} />
            </>
          )}
          <Wordmark frame={frame} start={hit + 10} tagline="让校园生活，顺手发生" />
        </>
      )}
    </Stage>
  );
};