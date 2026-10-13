import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { useFilmFrame } from '../lib/time';
import { Avatar, Btn, Chip, Icon, P, Tag, Txt } from '../kit/base';
import { BrandMark } from '../kit/fx';
import { ActivityCard, actById, AlumniBooking, NextCard, PostCard, POSTS, ROWS, Slot, TeamCard, TEAMS, TimetableDay } from '../kit/product';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, mix, prog } from '../lib/motion';
import { MOMENTS, SHOTS } from '../timeline';

const Wordmark = ({ frame, start, tagline, y = 600 }: { frame: number; start: number; tagline: string; y?: number }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: P.font, color: '#fff' }}>
    <div style={{ display: 'inline-flex', fontSize: 96, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 0 40px rgba(61,123,255,0.45)' }}>
      {[...'BNBU 伴学'].map((ch, i) => {
        const p = prog(frame, start + i * 1.5, 16);
        return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * 34}px) scale(${0.9 + 0.1 * p})`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>{ch}</span>;
      })}
    </div>
    <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, letterSpacing: '0.22em', color: 'rgba(222,230,255,0.9)', opacity: prog(frame, start + 10, 16), transform: `translateY(${(1 - prog(frame, start + 10, 16)) * 16}px)` }}>{tagline}</div>
  </div>
);

// Outline traced on the beat, then content rises inside it.
const Traced = ({ frame, at, w, h, radius = 14, children }: { frame: number; at: number; w: number; h: number; radius?: number; children: ReactNode }) => {
  const line = prog(frame, at - 3, 10, EASE_IN_OUT);
  const fill = prog(frame, at + 3, 10);
  const flash = Math.max(0, 1 - Math.abs(frame - (at + 5)) / 10);
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: P.surface, opacity: fill, boxShadow: `0 0 ${40 + flash * 60}px rgba(61,123,255,${0.25 + flash * 0.5}), 0 20px 50px rgba(0,0,0,0.5)` }} />
      <svg width={w + 4} height={h + 4} style={{ position: 'absolute', left: -2, top: -2, overflow: 'visible' }}>
        <rect x={2} y={2} width={w} height={h} rx={radius} fill="none" stroke="#7FA6FF" strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} opacity={1 - fill * 0.8} style={{ filter: 'drop-shadow(0 0 6px #5B8CFF)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, opacity: fill, transform: `translateY(${(1 - fill) * 10}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  );
};

type Frag = { x: number; y: number; s: number; w: number; h: number; at: number; ry: number; name: string; icon: string; node: (f: number) => ReactNode };
const FRAG_AT = [8, 15, 23, 30, 38, 45];
const FRAGS: Frag[] = [
  { x: 470, y: 270, s: 1.5, w: 360, h: 56, at: FRAG_AT[0], ry: 16, name: '活动', icon: 'calendar', node: (f) => <div style={{ display: 'flex', gap: 8 }}>{['全部', '校园成员活动', '学校邮件活动'].map((l, i) => <Chip key={l} label={l} active={i === 0 ? 1 - prog(f, 16, 6) : i === 2 ? prog(f, 16, 6) : 0} />)}</div> },
  { x: 1450, y: 270, s: 1.5, w: 360, h: 60, at: FRAG_AT[1], ry: -16, name: '社区', icon: 'message', node: (f) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Txt size={15} weight={700}>推荐一门很有收获的选修课</Txt><Icon name="bookmark" size={17} color={P.blue} fill={prog(f, 24, 4) > 0.5 ? P.blue : 'none'} /></div>
  ) },
  { x: 470, y: 520, s: 1.6, w: 260, h: 70, at: FRAG_AT[2], ry: 14, name: '找搭子', icon: 'users', node: (f) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex' }}>{['陈', '许', '林'].map((c, i) => <Avatar key={c} ch={c} size={34} style={{ marginLeft: i ? -8 : 0, border: '2px solid #fff', transform: `scale(${prog(f, 25 + i * 2, 8, LAND)})` }} />)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="users" size={16} color={P.blue} /><Txt size={14} weight={600}>3 / 4 人</Txt></div>
    </div>
  ) },
  { x: 1450, y: 520, s: 1.4, w: 320, h: 94, at: FRAG_AT[3], ry: -14, name: 'Coffee Chat', icon: 'clock', node: () => <Slot date="10月15日星期四" time="15:00 – 15:30" /> },
  { x: 470, y: 770, s: 1.5, w: 300, h: 64, at: FRAG_AT[4], ry: 14, name: '校友同行', icon: 'check', node: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar ch="顾" size={34} style={{ background: '#F2F2F4', color: P.ink }} /><Txt size={15} weight={700}>顾言川</Txt><Tag label="认证校友" tone="grey" /></div>
  ) },
  { x: 1450, y: 770, s: 1.5, w: 330, h: 64, at: FRAG_AT[5], ry: -14, name: '校园 AI', icon: 'search', node: () => (
    <div style={{ background: P.action, color: '#fff', borderRadius: 16, padding: '9px 16px', fontFamily: P.font, fontSize: 14, whiteSpace: 'nowrap' }}>怎么预约老师的 Coffee Chat？</div>
  ) },
];
const MODULES = FRAGS.map((f) => f.name);

export const Opening = () => {
  const frame = useFilmFrame();
  const { from, duration } = SHOTS.opening;
  if (frame < from || frame >= from + duration) return null;
  const gather = prog(frame, 64, 12, EASE_IN);
  const iconP = prog(frame, 74, 18, LAND);
  const draw = prog(frame, 79, 18, EASE_IN_OUT);
  const exit = prog(frame, 112, 14, EASE_IN_OUT);
  const flash = prog(frame, 75, 16, EASE_OUT);
  const C = { x: 960, y: 420 };
  return (
    <AbsoluteFill style={{ perspective: 2200, opacity: 1 - exit, transform: `scale(${1 + exit * 0.14})`, filter: exit > 0.02 ? `blur(${exit * 8}px)` : undefined }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {FRAGS.map((f, i) => {
          const p = prog(frame, 54 + i * 1.5, 10, EASE_IN_OUT) * (1 - prog(frame, 72, 4));
          if (p <= 0) return null;
          const x = mix(f.x, C.x, gather), y = mix(f.y, C.y, gather);
          return <line key={i} x1={x} y1={y} x2={mix(x, C.x, p)} y2={mix(y, C.y, p)} stroke="#6E98FF" strokeWidth={2} strokeLinecap="round" opacity={0.8} style={{ filter: 'drop-shadow(0 0 8px #4D7DFF)' }} />;
        })}
      </svg>
      {FRAGS.map((f, i) => {
        const drift = Math.sin((frame + i * 19) / 24) * 8;
        const x = mix(f.x, C.x, gather), y = mix(f.y + drift, C.y, gather);
        const s = f.s * mix(1, 0.08, gather);
        return (
          <div key={i} style={{ position: 'absolute', left: x - f.w / 2, top: y - f.h / 2, width: f.w, height: f.h, transform: `rotateY(${f.ry * (1 - gather) + Math.sin(frame / 30 + i) * 4}deg) scale(${s})`, opacity: 1 - prog(frame, 72, 5) }}>
            <Traced frame={frame} at={f.at} w={f.w} h={f.h}>{f.node(frame)}</Traced>
          </div>
        );
      })}
      {FRAGS.map((f, i) => {
        const p = prog(frame, f.at, 10, EASE_OUT) * (1 - prog(frame, 62, 6, EASE_IN));
        if (p <= 0) return null;
        const drift = Math.sin((frame + i * 19) / 24) * 8;
        return (
          <div key={f.name} style={{ position: 'absolute', left: f.x - 300, width: 600, top: f.y + drift - (f.h * f.s) / 2 - 66, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, fontFamily: P.font, fontSize: 38, fontWeight: 600, color: '#fff', letterSpacing: '0.06em', textShadow: '0 0 24px rgba(61,123,255,0.6)' }}>
            <Icon name={f.icon} size={30} color="#8FB0FF" stroke={2.2} />{f.name}
          </div>
        );
      })}
      {frame >= 74 && (
        <div style={{ position: 'absolute', left: C.x - 108, top: C.y - 108, transform: `scale(${mix(0.2, 1, iconP)}) rotate(${(1 - iconP) * -12}deg)`, opacity: prog(frame, 74, 4) }}>
          <BrandMark size={216} draw={draw} glow={1 - prog(frame, 84, 30)} id="open" />
        </div>
      )}
      {frame >= 75 && frame < 92 && (
        <div style={{ position: 'absolute', left: C.x - 420 * flash, top: C.y - 420 * flash, width: 840 * flash, height: 840 * flash, borderRadius: '50%', border: `2px solid rgba(140,175,255,${0.75 * (1 - flash)})`, boxShadow: `0 0 60px rgba(61,123,255,${0.6 * (1 - flash)})` }} />
      )}
      <Wordmark frame={frame} start={86} tagline="你的校园，一处展开" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 838, display: 'flex', justifyContent: 'center', gap: 18, fontFamily: P.font, fontSize: 30, fontWeight: 500, color: 'rgba(205,218,255,0.92)', letterSpacing: '0.06em' }}>
        {MODULES.map((m, i) => {
          const p = prog(frame, 94 + i * 2, 10);
          return <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{i > 0 && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#6E98FF' }} />}{m}</span>;
        })}
      </div>

    </AbsoluteFill>
  );
};

// ---------- finale: product cards orbit, collapse into the icon on the last heavy beat ----------
const RING: { node: ReactNode; w: number; h: number; s: number }[] = [
  { node: <ActivityCard act={actById('ai')} w={200} />, w: 200, h: 362, s: 0.62 },
  { node: <TeamCard t={TEAMS[3]} />, w: 300, h: 228, s: 0.62 },
  { node: <Slot date="10月15日星期四" time="15:00 – 15:30" booked={1} />, w: 300, h: 74, s: 0.8 },
  { node: <AlumniBooking typed="想了解产品经理岗位的实习准备。" requested={1} />, w: 620, h: 300, s: 0.4 },
  { node: <TimetableDay />, w: 430, h: 196, s: 0.5 },
  { node: <PostCard post={POSTS[1]} />, w: 230, h: 300, s: 0.6 },
  { node: <NextCard kicker="下一步 · Coffee Chat" when={ROWS.coffee.when} title={ROWS.coffee.title} place={ROWS.coffee.place} w={560} />, w: 560, h: 190, s: 0.48 },
  { node: <ActivityCard act={actById('run')} w={200} />, w: 200, h: 384, s: 0.55 },
];

export const Finale = () => {
  const frame = useFilmFrame();
  const { from } = SHOTS.finale;
  if (frame < from - 2) return null;
  const hit = MOMENTS.finalHit;
  const arrive = prog(frame, from - 2, 16, EASE_OUT);
  const collapse = prog(frame, hit - 12, 12, EASE_IN);
  const spin = (frame - from) * 0.9 + collapse * 120;
  const iconP = prog(frame, hit, 22, LAND);
  const flash = prog(frame, hit, 18, EASE_OUT);
  return (
    <AbsoluteFill style={{ perspective: 2000, perspectiveOrigin: '960px 440px' }}>
      {frame < hit + 1 && (
        <div style={{ position: 'absolute', left: 960, top: 440, transformStyle: 'preserve-3d', transform: `rotateX(-12deg) rotateY(${spin}deg)` }}>
          {RING.map((c, i) => {
            const a = (i / RING.length) * 360;
            const R = mix(mix(1500, 640, arrive), 0, collapse);
            return (
              <div key={i} style={{ position: 'absolute', left: -c.w / 2, top: -c.h / 2, width: c.w, height: c.h, transform: `rotateY(${a}deg) translateZ(${R}px) scale(${c.s * mix(1, 0.1, collapse)})`, opacity: arrive * (1 - prog(frame, hit - 3, 3)), borderRadius: 16, boxShadow: '0 0 60px rgba(61,123,255,0.45)', backfaceVisibility: 'visible' }}>
                {c.node}
              </div>
            );
          })}
        </div>
      )}
      {frame >= hit - 8 && frame < hit + 2 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const p = prog(frame, hit - 8, 9, EASE_IN);
            const r0 = mix(900, 60, p), r1 = mix(1100, 140, p);
            return <line key={i} x1={960 + Math.cos(a) * r0} y1={440 + Math.sin(a) * r0} x2={960 + Math.cos(a) * r1} y2={440 + Math.sin(a) * r1} stroke="#86A8FF" strokeWidth={3} opacity={0.7 * p} strokeLinecap="round" />;
          })}
        </svg>
      )}
      {frame >= hit && (
        <>
          <div style={{ position: 'absolute', left: 960 - 108, top: 420 - 108, transform: `scale(${mix(1.6, 1, iconP)})`, opacity: prog(frame, hit, 3) }}>
            <BrandMark size={216} draw={prog(frame, hit + 2, 18, EASE_IN_OUT)} glow={1 - prog(frame, hit + 6, 34)} id="end" />
          </div>
          {frame < hit + 18 && (
            <>
              <div style={{ position: 'absolute', left: 960 - 560 * flash, top: 420 - 560 * flash, width: 1120 * flash, height: 1120 * flash, borderRadius: '50%', border: `3px solid rgba(150,180,255,${0.85 * (1 - flash)})`, boxShadow: `0 0 90px rgba(61,123,255,${0.7 * (1 - flash)})` }} />
              <AbsoluteFill style={{ background: `radial-gradient(40% 40% at 50% 39%, rgba(120,160,255,${0.5 * (1 - flash)}) 0%, rgba(0,0,0,0) 70%)` }} />
            </>
          )}
          <Wordmark frame={frame} start={hit + 10} tagline="让校园生活，顺手发生" />
        </>
      )}
    </AbsoluteFill>
  );
};
