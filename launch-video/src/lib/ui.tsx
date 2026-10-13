import { AbsoluteFill } from 'remotion';
import { useFilmFrame } from './time';
import { EASE_IN_OUT, EASE_OUT, mix, prog } from './motion';

// Film-level colours layered over the product tokens in kit/base.
export const T = {
  electric: '#3D7BFF',
  violet: '#8A63FF',
  night: '#030409',
  font: '"PingFang SC", Inter, -apple-system, "Helvetica Neue", sans-serif',
};

// One diagonal light pass, clipped by the parent's rounded overflow (used once per hero element).
export const Sweep = ({ start, duration = 26, strength = 0.55 }: { start: number; duration?: number; strength?: number }) => {
  const frame = useFilmFrame();
  const p = prog(frame, start, duration, EASE_IN_OUT);
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-50%', bottom: '-50%', width: '34%', left: `${mix(-40, 120, p)}%`,
        transform: 'rotate(18deg)',
        background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(180,205,255,${strength * 0.55}) 45%, rgba(255,255,255,${strength}) 50%, rgba(200,180,255,${strength * 0.5}) 55%, rgba(255,255,255,0) 100%)`,
        mixBlendMode: 'screen',
      }} />
    </div>
  );
};

export const Backdrop = () => {
  const frame = useFilmFrame();
  const t = Math.min(frame, 1120) / 30;
  const bx = 68 + Math.sin(t * 0.35) * 6, by = 30 + Math.cos(t * 0.27) * 5;
  const vx = 24 + Math.cos(t * 0.31) * 6, vy = 72 + Math.sin(t * 0.22) * 5;
  return (
    <AbsoluteFill style={{ background: T.night }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 55% at ${bx}% ${by}%, rgba(46,96,255,0.30) 0%, rgba(46,96,255,0.08) 45%, rgba(0,0,0,0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(55% 50% at ${vx}% ${vy}%, rgba(132,86,255,0.24) 0%, rgba(132,86,255,0.06) 45%, rgba(0,0,0,0) 72%)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};

// Pointer path: [[frame, x, y], ...] in the coordinate space of the parent.
export const pathAt = (frame: number, pts: [number, number, number][]) => {
  if (frame <= pts[0][0]) return { x: pts[0][1], y: pts[0][2] };
  for (let i = 0; i < pts.length - 1; i++) {
    const [f0, x0, y0] = pts[i];
    const [f1, x1, y1] = pts[i + 1];
    if (frame <= f1) {
      const p = EASE_IN_OUT((frame - f0) / Math.max(1, f1 - f0));
      return { x: mix(x0, x1, p), y: mix(y0, y1, p) };
    }
  }
  const last = pts[pts.length - 1];
  return { x: last[1], y: last[2] };
};

export const Cursor = ({ x, y, clicks, opacity = 1, size = 34, at }: { x: number; y: number; clicks: number[]; opacity?: number; size?: number; at?: number }) => {
  const film = useFilmFrame();
  const frame = at ?? film;
  const press = clicks.reduce((m, c) => Math.max(m, 1 - Math.min(1, Math.abs(frame - c) / 4)), 0);
  const ripples = clicks.filter((c) => frame >= c && frame < c + 18);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, zIndex: 50 }}>
      {ripples.map((c) => {
        const p = (frame - c) / 18;
        const r = 10 + EASE_OUT(p) * 34;
        return <div key={c} style={{ position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid rgba(77,139,255,${0.75 * (1 - p)})`, boxShadow: `0 0 24px rgba(77,139,255,${0.5 * (1 - p)})` }} />;
      })}
      <svg width={size} height={size * 1.25} viewBox="0 0 24 30" style={{ position: 'absolute', left: -3, top: -2, transform: `scale(${1 - press * 0.16})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.45))' }}>
        <path d="M2 1.5 L2 23 L7.6 17.6 L11.4 26.6 L15 25 L11.3 16.3 L19 16.3 Z" fill="#ffffff" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Large Chinese headline: per-character rise from soft focus, accent rule in product blue.
export const Caption = ({ text, from, to, right = 120, y = 856, size = 76 }: { text: string; from: number; to: number; right?: number; y?: number; size?: number }) => {
  const frame = useFilmFrame();
  if (frame < from - 2 || frame > to + 12) return null;
  const out = prog(frame, to, 12, EASE_IN_OUT);
  const rule = prog(frame, from, 18);
  return (
    <div style={{ position: 'absolute', right, top: y, zIndex: 80, opacity: 1 - out, transform: `translateY(${-out * 14}px)`, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ width: 84 * rule, height: 6, borderRadius: 3, marginBottom: 22, background: `linear-gradient(90deg, ${T.violet}, ${T.electric})`, boxShadow: '0 0 18px rgba(61,123,255,0.8)' }} />
      <div style={{ display: 'flex', fontFamily: T.font, fontWeight: 600, fontSize: size, lineHeight: 1.15, color: '#fff', letterSpacing: '0.04em', whiteSpace: 'nowrap', textShadow: '0 4px 30px rgba(0,0,0,0.6), 0 0 40px rgba(61,123,255,0.35)' }}>
        {[...text].map((ch, i) => {
          const p = prog(frame, from + i * 1.6, 16);
          return <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>{ch === ' ' ? '\u00a0' : ch}</span>;
        })}
      </div>
    </div>
  );
};

export const SubCaption = ({ text, from, to, right = 124, y = 984 }: { text: string; from: number; to: number; right?: number; y?: number }) => {
  const frame = useFilmFrame();
  const p = prog(frame, from, 14) * (1 - prog(frame, to, 10));
  if (p <= 0) return null;
  return <div style={{ position: 'absolute', right, top: y, zIndex: 80, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, fontFamily: T.font, fontWeight: 500, fontSize: 48, color: 'rgba(236,241,255,0.96)', letterSpacing: '0.06em', textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>{text}</div>;
};
