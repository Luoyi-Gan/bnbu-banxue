import { createContext, type ReactNode, useContext } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { T } from '../lib/ui';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, keys, mix, prog } from '../lib/motion';
import type { CamState } from '../kit/fx';

export const LINE_W = 3;

// ---------------- time ----------------
// Scene frame plus a sub-frame offset, so MotionBlur can sample between frames.
const FrameOffset = createContext(0);
export const useF = () => useCurrentFrame() + useContext(FrameOffset);
// Children are rendered at `samples` instants across the shutter and averaged. Every sample must be
// opaque (include the backdrop), otherwise stacked translucent glows would add up.
export const MotionBlur = ({ samples = 5, shutter = 0.5, children }: { samples?: number; shutter?: number; children: ReactNode }) => (
  <>
    {Array.from({ length: samples }, (_, i) => (
      <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
        <FrameOffset.Provider value={-shutter * ((samples - 1 - i) / (samples - 1))}>{children}</FrameOffset.Provider>
      </AbsoluteFill>
    ))}
  </>
);

// ---------------- polylines ----------------
export type Pt = [number, number];
const segLens = (pts: Pt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
export const partial = (pts: Pt[], t: number): Pt[] => {
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
export const resample = (pts: Pt[], n: number): Pt[] => Array.from({ length: n }, (_, i) => { const p = partial(pts, i / (n - 1)); return p[p.length - 1]; });
export const upToX = (pts: Pt[], hx: number): Pt[] => {
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
// The last `len` px of a polyline (the part right behind the head).
const tailOf = (pts: Pt[], len: number): Pt[] => {
  const out: Pt[] = [pts[pts.length - 1]];
  let left = len;
  for (let i = pts.length - 1; i > 0 && left > 0; i--) {
    const [a, b] = [pts[i - 1], pts[i]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (l <= left) { out.unshift(a); left -= l; continue; }
    const k = left / l;
    out.unshift([mix(b[0], a[0], k), mix(b[1], a[1], k)]);
    left = 0;
  }
  return out;
};
const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

// The visible part of the icon's pulse (its clip trims both ends), in icon path coordinates.
export const ICON_PULSE: Pt[] = [[60, 116], [150, 116], [156, 120], [205, 224], [211, 224], [299, 35], [305, 35], [331, 97], [341, 102], [430, 102]];
// Where a pulse point sits inside BrandMark (nested viewBoxes of src/assets/brand/brand-app-icon-a.svg, flattened).
export const iconPoint = (cx: number, cy: number, size: number) => ([u, v]: Pt): Pt => [cx - size / 2 + ((1.7131 * u + 82.8) * size) / 1024, cy - size / 2 + ((1.7131 * v + 296.9) * size) / 1024];
export const iconStroke = (size: number) => (18 * 1.7131 * size) / 1024;

// ---------------- light ----------------
// Thin bright core, tight inner glow, faint wide bloom; the head is a small hot point.
export const Line = ({ id, pts, w = LINE_W, head = false, opacity = 1 }: { id: string; pts: Pt[]; w?: number; head?: boolean; opacity?: number }) => {
  if (pts.length < 2 || opacity <= 0) return null;
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
      {head && [[420, 0.22, 2.6], [200, 0.4, 2.0], [80, 0.7, 1.5]].map(([len, o, k]) => (
        <path key={len} d={toD(tailOf(pts, len))} fill="none" stroke="#C9D8FF" strokeWidth={w * k} strokeLinecap="round" strokeLinejoin="round" opacity={o} filter={`url(#${id}-near)`} />
      ))}
      {head && <><circle cx={tip[0]} cy={tip[1]} r={w * 7} fill={`url(#${id}-h)`} /><circle cx={tip[0]} cy={tip[1]} r={w * 0.9} fill="#FFFFFF" /></>}
    </svg>
  );
};

// Neon outline traced around a rounded rect.
export const Trace = ({ id, x, y, w, h, r, p, width = 1.4, glow = 1 }: { id: string; x: number; y: number; w: number; h: number; r: number; p: number; width?: number; glow?: number }) => {
  if (p <= 0) return null;
  const rect = (sw: number, stroke: string, extra: object) => <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke={stroke} strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} {...extra} />;
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs><filter id={id} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}><feGaussianBlur stdDeviation={width * 3} /></filter></defs>
      {rect(width * 3, T.electric, { opacity: 0.45 * glow, filter: `url(#${id})` })}
      {rect(width, '#EEF3FF', { opacity: glow })}
    </svg>
  );
};

// A press without a pointer: the target is traced, then a ring expands from it on `at`.
export const Tap = ({ id, f, at, x, y, w, h, r = 10 }: { id: string; f: number; at: number; x: number; y: number; w: number; h: number; r?: number }) => {
  const halo = prog(f, at - 14, 12, EASE_IN_OUT) * (1 - prog(f, at + 6, 10));
  const ring = prog(f, at, 18, EASE_OUT);
  return (
    <>
      <Trace id={id} x={x - 5} y={y - 5} w={w + 10} h={h + 10} r={r + 4} p={halo > 0 ? Math.min(1, halo * 1.2) : 0} width={0.9} glow={halo} />
      {ring > 0 && ring < 1 && (
        <div style={{ position: 'absolute', left: x + w / 2, top: y + h / 2, width: 0, height: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: -(w / 2 + 18 * ring), top: -(h / 2 + 14 * ring), width: w + 36 * ring, height: h + 28 * ring, borderRadius: r + 10 * ring, border: `1.5px solid rgba(150,182,255,${0.9 * (1 - ring)})`, boxShadow: `0 0 ${24 * (1 - ring)}px rgba(61,123,255,${0.6 * (1 - ring)})` }} />
          <div style={{ position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, borderRadius: r, background: `rgba(255,255,255,${0.45 * (1 - ring) * (1 - ring)})` }} />
        </div>
      )}
    </>
  );
};

// Tilt-shift: page copy blurred and dimmed except a horizontal band of focus.
export const Focused = ({ y, band, amount, render }: { y: number; band: number; amount: number; render: () => ReactNode }) => {
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

// ---------------- type ----------------
const GRAD = 'linear-gradient(90deg, #FFFFFF 0%, #B9CCFF 45%, #8E7BFF 100%)';
export const Word = ({ f, text, from, to, y = 500, size = 150, outScale = 0.5 }: { f: number; text: string; from: number; to: number; y?: number; size?: number; outScale?: number }) => {
  if (f < from - 1 || f > to + 12) return null;
  const out = prog(f, to, 10, EASE_IN);
  const chars = [...text];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.62, textAlign: 'center', zIndex: 80, whiteSpace: 'nowrap', opacity: 1 - out, transform: `scale(${1 + out * outScale})`, filter: `drop-shadow(0 0 22px rgba(61,123,255,0.5))${out > 0.02 ? ` blur(${out * 8}px)` : ''}` }}>
      {chars.map((ch, i) => {
        const p = prog(f, from + i * Math.min(2, 12 / chars.length), 14);
        return (
          <span key={i} style={{
            display: 'inline-block', fontFamily: T.font, fontSize: size, fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.2, whiteSpace: 'pre',
            backgroundImage: GRAD, backgroundSize: `${chars.length * 100}% 100%`, backgroundPosition: `${chars.length > 1 ? (i / (chars.length - 1)) * 100 : 0}% 0`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

// Small explanatory line under the product (e.g. a step that happens off-screen).
export const Note = ({ f, text, from, to, y = 960 }: { f: number; text: string; from: number; to: number; y?: number }) => {
  const p = prog(f, from, 12) * (1 - prog(f, to, 10));
  if (p <= 0) return null;
  return <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', zIndex: 80, opacity: p, transform: `translateY(${(1 - p) * 10}px)`, fontFamily: T.font, fontSize: 40, fontWeight: 500, letterSpacing: '0.08em', color: 'rgba(226,234,255,0.95)', textShadow: '0 0 20px rgba(61,123,255,0.5), 0 2px 12px rgba(0,0,0,0.7)' }}>{text}</div>;
};

const WORD_LINE: Pt[] = ICON_PULSE.map(([u, v]): Pt => [960 + (u - 245) * 1.0, 650 + (v - 129) * 0.36]);
export const WORD_END = 33;
// Feature title on black: the name rises, a short pulse draws beneath it.
export const FeatureTitle = ({ f, text, id }: { f: number; text: string; id: string }) => (
  <>
    <Word f={f} text={text} from={2} to={WORD_END} />
    {f > 6 && f < WORD_END + 8 && <Line id={`${id}-wl`} w={1.8} pts={partial(WORD_LINE, prog(f, 6, 20, EASE_IN_OUT))} opacity={1 - prog(f, WORD_END, 8)} />}
  </>
);

// Scene exit: a pulse runs left to right and the frame goes dark behind it.
export const WIPE = 22;
export const Wiped = ({ f, at, children }: { f: number; at: number; children: ReactNode }) => {
  const p = prog(f, at, WIPE, EASE_IN_OUT);
  const hx = mix(-120, 2080, p);
  const y = 540;
  const pts: Pt[] = [[hx - 700, y], [hx - 190, y], [hx - 172, y + 10], [hx - 150, y - 64], [hx - 130, y + 18], [hx - 112, y], [hx, y]];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={p > 0 ? { WebkitMaskImage: `linear-gradient(90deg, transparent ${hx - 120}px, #000 ${hx + 20}px)`, maskImage: `linear-gradient(90deg, transparent ${hx - 120}px, #000 ${hx + 20}px)` } : undefined}>{children}</AbsoluteFill>
      {p > 0 && p < 1 && <Line id="wipe" pts={pts} head />}
    </AbsoluteFill>
  );
};

// ---------------- camera ----------------
type Key = [number, number];
// Keyframes run through a Gaussian over ±R frames, so back-to-back moves blend into one continuous
// path instead of stopping at every key; holds keep a slow breathing drift.
const R = 8;
const KERNEL = Array.from({ length: 2 * R + 1 }, (_, i) => Math.exp(-((i - R) ** 2) / (2 * (R / 2) ** 2)));
const KSUM = KERNEL.reduce((s, v) => s + v, 0);
export const smoothKeys = (f: number, pairs: Key[]) => KERNEL.reduce((s, w, i) => s + w * keys(f + i - R, pairs), 0) / KSUM;
export const camKeys = (f: number, k: { z: Key[]; fx: Key[]; fy: Key[]; rx?: Key[]; ry?: Key[] }, extra: Partial<CamState> = {}): CamState => ({
  z: smoothKeys(f, k.z) * (1 + 0.006 * Math.sin(f / 50)),
  fx: smoothKeys(f, k.fx),
  fy: smoothKeys(f, k.fy),
  rx: (k.rx ? smoothKeys(f, k.rx) : 0) + 0.4 * Math.sin(f / 57 + 1),
  ry: (k.ry ? smoothKeys(f, k.ry) : 0) + 0.6 * Math.sin(f / 63),
  ...extra,
});
export const camMix = (a: CamState, b: CamState, p: number): CamState => ({
  z: mix(a.z, b.z, p), fx: mix(a.fx, b.fx, p), fy: mix(a.fy, b.fy, p), rx: mix(a.rx ?? 0, b.rx ?? 0, p), ry: mix(a.ry ?? 0, b.ry ?? 0, p),
});
// Window entrance inside a Cam: rises from depth and settles.
export const enter = (f: number, at: number, dur = 18) => {
  const p = prog(f, at, dur, EASE_OUT);
  return { opacity: prog(f, at, Math.round(dur * 0.7), EASE_IN_OUT), transform: `translateY(${(1 - p) * 90}px) translateZ(${(1 - p) * -160}px) rotateX(${(1 - p) * 18}deg) scale(${mix(0.92, 1, p)})` };
};
