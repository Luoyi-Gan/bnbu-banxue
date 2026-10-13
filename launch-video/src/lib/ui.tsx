import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import layoutJson from '../../public/ui/layout.json';
import { EASE_IN_OUT, EASE_OUT, mix, prog } from './motion';

export type Rect = { x: number; y: number; w: number; h: number };
type Capture = { w: number; h: number; boxes: Record<string, Rect> };
export const L = layoutJson as unknown as Record<string, Capture>;
export const box = (shot: string, key: string) => {
  const b = L[shot]?.boxes[key];
  if (!b) throw new Error(`missing box ${shot}.${key}`);
  return b;
};
export const center = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

// Product tokens (src/v2/studentTheme.css + brand icon) and film extensions.
export const T = {
  canvas: '#F2F2F7',
  surface: '#FFFFFF',
  action: '#0865D1',
  brand: '#0166A4',
  accentSoft: '#E8F2FF',
  ink: '#1C1C1E',
  electric: '#3D7BFF',
  violet: '#8A63FF',
  night: '#030409',
  font: '"PingFang SC", Inter, -apple-system, "Helvetica Neue", sans-serif',
};

// Crop of a 2x capture. `region` is in capture CSS px; `s` maps CSS px to output px.
// The image is laid out at its final size (no transform scale) so text stays sharp.
export const Shot = ({ name, region, s, dy = 0, style }: { name: string; region: Rect; s: number; dy?: number; style?: CSSProperties }) => {
  const cap = L[name];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: region.w * s, height: region.h * s, overflow: 'hidden', ...style }}>
      <Img
        src={staticFile(`ui/${name}.png`)}
        style={{ position: 'absolute', left: -region.x * s, top: -(region.y + dy) * s, width: cap.w * s, height: cap.h * s, maxWidth: 'none' }}
      />
    </div>
  );
};

export const Stage = ({ children, perspective = 2600 }: { children: ReactNode; perspective?: number }) => (
  <AbsoluteFill style={{ perspective, perspectiveOrigin: '50% 50%', transformStyle: 'preserve-3d' }}>{children}</AbsoluteFill>
);

export type Pose = { x: number; y: number; z?: number; rx?: number; ry?: number; rz?: number; scale?: number; opacity?: number; blur?: number };

// A floating product window/card centred at (x, y) on the 1920x1080 stage.
export const Float = ({ pose, w, h, radius = 18, glow = 0.6, bg = T.canvas, children, chrome = true, zIndex }: {
  pose: Pose; w: number; h: number; radius?: number; glow?: number; bg?: string; children: ReactNode; chrome?: boolean; zIndex?: number;
}) => {
  const { x, y, z = 0, rx = 0, ry = 0, rz = 0, scale = 1, opacity = 1, blur = 0 } = pose;
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, zIndex,
        transform: `translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
        opacity, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, borderRadius: radius, background: bg,
        boxShadow: chrome
          ? `0 40px 110px rgba(0,0,0,0.62), 0 0 0 1px rgba(170,195,255,0.16), 0 0 ${70 + glow * 60}px rgba(61,123,255,${0.18 + glow * 0.3}), 0 0 ${140 + glow * 80}px rgba(138,99,255,${0.08 + glow * 0.16})`
          : undefined,
        overflow: 'hidden', willChange: 'transform',
      }}
    >
      {children}
      {chrome && <div style={{ position: 'absolute', inset: 0, borderRadius: radius, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)', pointerEvents: 'none' }} />}
    </div>
  );
};

// One diagonal light pass, clipped by the parent's rounded overflow (used once per hero element).
export const Sweep = ({ start, duration = 26, strength = 0.55 }: { start: number; duration?: number; strength?: number }) => {
  const frame = useCurrentFrame();
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
  const frame = useCurrentFrame();
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

export const Cursor = ({ x, y, clicks, opacity = 1, size = 34 }: { x: number; y: number; clicks: number[]; opacity?: number; size?: number }) => {
  const frame = useCurrentFrame();
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
export const Caption = ({ text, from, to, x = 120, y = 856, size = 76 }: { text: string; from: number; to: number; x?: number; y?: number; size?: number }) => {
  const frame = useCurrentFrame();
  if (frame < from - 2 || frame > to + 12) return null;
  const out = prog(frame, to, 12, EASE_IN_OUT);
  const rule = prog(frame, from, 18);
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 80, opacity: 1 - out, transform: `translateY(${-out * 14}px)` }}>
      <div style={{ width: 84 * rule, height: 6, borderRadius: 3, marginBottom: 22, background: `linear-gradient(90deg, ${T.electric}, ${T.violet})`, boxShadow: '0 0 18px rgba(61,123,255,0.8)' }} />
      <div style={{ display: 'flex', fontFamily: T.font, fontWeight: 600, fontSize: size, lineHeight: 1.15, color: '#fff', letterSpacing: '0.04em', whiteSpace: 'nowrap', textShadow: '0 4px 30px rgba(0,0,0,0.6), 0 0 40px rgba(61,123,255,0.35)' }}>
        {[...text].map((ch, i) => {
          const p = prog(frame, from + i * 1.6, 16);
          return <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>{ch === ' ' ? '\u00a0' : ch}</span>;
        })}
      </div>
    </div>
  );
};

export const SubCaption = ({ text, from, to, x = 124, y = 984 }: { text: string; from: number; to: number; x?: number; y?: number }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, from, 14) * (1 - prog(frame, to, 10));
  if (p <= 0) return null;
  return <div style={{ position: 'absolute', left: x, top: y, zIndex: 80, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, fontFamily: T.font, fontWeight: 500, fontSize: 48, color: 'rgba(236,241,255,0.96)', letterSpacing: '0.06em', textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>{text}</div>;
};

// Camera inside a fixed-size window: zoom `s` (output px per CSS px) around focus (fx, fy) in capture px.
export type Cam = { s: number; fx: number; fy: number };
export const viewOf = (W: number, H: number, cam: Cam): Rect => ({ x: cam.fx - W / (2 * cam.s), y: cam.fy - H / (2 * cam.s), w: W / cam.s, h: H / cam.s });

export type Layer = { name: string; opacity?: number; dy?: number };
export const PageView = ({ layers, W, H, cam, pose, glow, radius = 18, children }: {
  layers: Layer[]; W: number; H: number; cam: Cam; pose: Pose; glow?: number; radius?: number;
  children?: (at: (x: number, y: number) => { x: number; y: number }, s: number) => ReactNode;
}) => {
  const region = viewOf(W, H, cam);
  const at = (x: number, y: number) => ({ x: (x - region.x) * cam.s, y: (y - region.y) * cam.s });
  return (
    <Float pose={pose} w={W} h={H} glow={glow} radius={radius}>
      {layers.map((l, i) => (l.opacity ?? 1) > 0.001 && (
        <Shot key={`${l.name}-${i}`} name={l.name} region={region} s={cam.s} dy={l.dy} style={{ opacity: l.opacity ?? 1 }} />
      ))}
      {children?.(at, cam.s)}
    </Float>
  );
};

// Screen position of a capture point shown in a PageView/Float with no rotation.
export const toScreen = (pose: Pose, W: number, H: number, region: Rect, s: number, x: number, y: number) => {
  const k = pose.scale ?? 1;
  const lx = (x - region.x) * s - W / 2, ly = (y - region.y) * s - H / 2;
  return { x: pose.x + lx * k, y: pose.y + ly * k };
};

export const fadeIn = (frame: number, start: number, d = 10) => interpolate(frame, [start, start + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
