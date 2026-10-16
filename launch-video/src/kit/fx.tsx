import { createContext, type CSSProperties, type ReactNode, useContext } from 'react';
import { AbsoluteFill } from 'remotion';
import { EASE_OUT, mix } from '../lib/motion';
import { P } from './base';

// World camera: point (fx, fy) in world px lands on screen anchor (ax, ay) at zoom z.
export type CamState = { z: number; fx: number; fy: number; ax?: number; ay?: number; rx?: number; ry?: number; blur?: number; opacity?: number };
export const camToScreen = (c: CamState, x: number, y: number) => ({ x: (c.ax ?? 960) + (x - c.fx) * c.z, y: (c.ay ?? 540) + (y - c.fy) * c.z });

// Camera tilt, read by windows to light themselves from the same direction.
const Tilt = createContext({ rx: 0, ry: 0 });

export const Cam = ({ cam, children }: { cam: CamState; children: ReactNode }) => (
  <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: `${cam.ax ?? 960}px ${cam.ay ?? 540}px`, opacity: cam.opacity ?? 1, filter: (cam.blur ?? 0) > 0.05 ? `blur(${cam.blur}px)` : undefined }}>
    <div style={{ position: 'absolute', left: cam.ax ?? 960, top: cam.ay ?? 540, width: 0, height: 0, transformStyle: 'preserve-3d', transformOrigin: '0 0', transform: `rotateX(${cam.rx ?? 0}deg) rotateY(${cam.ry ?? 0}deg) scale(${cam.z}) translate(${-cam.fx}px, ${-cam.fy}px)` }}>
      <Tilt.Provider value={{ rx: cam.rx ?? 0, ry: cam.ry ?? 0 }}>{children}</Tilt.Provider>
    </div>
  </AbsoluteFill>
);

// Contact, mid and ambient shadows fall away from the light as the camera turns; then the brand glow.
const glowShadow = (glow: number, rx: number, ry: number) => {
  const sx = ry * 1.6, sy = 1 + rx * 0.8;
  return [
    `${sx * 0.1}px ${2 * sy}px 3px rgba(0,0,0,0.35)`,
    `${sx * 0.4}px ${12 * sy}px 28px rgba(0,0,0,0.32)`,
    `${sx}px ${38 * sy}px 90px rgba(0,0,0,0.5)`,
    '0 0 0 1px rgba(170,195,255,0.2)',
    `0 0 ${60 + glow * 60}px rgba(61,123,255,${0.14 + glow * 0.28})`,
    `0 0 ${120 + glow * 80}px rgba(138,99,255,${0.06 + glow * 0.14})`,
  ].join(', ');
};

// Floating product window/card. Position is top-left in the parent's space.
export const Win = ({ x, y, w, h, radius = 22, bg = P.canvas, glow = 0.5, scale = 1, opacity = 1, tz = 0, rx = 0, ry = 0, origin = '50% 50%', style, children }: {
  x: number; y: number; w: number; h: number; radius?: number; bg?: string; glow?: number; scale?: number; opacity?: number; tz?: number; rx?: number; ry?: number; origin?: string; style?: CSSProperties; children?: ReactNode;
}) => {
  const tilt = useContext(Tilt);
  const ty = tilt.ry + ry, tx = tilt.rx + rx;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, background: bg, overflow: 'hidden', boxShadow: glowShadow(glow, tx, ty), opacity, transform: `translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`, transformOrigin: origin, ...style }}>
      {children}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(112deg, rgba(255,255,255,0) ${28 - ty * 2.4}%, rgba(255,255,255,0.11) ${40 - ty * 2.4}%, rgba(255,255,255,0) ${54 - ty * 2.4}%)` }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: radius, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
    </div>
  );
};

// Brand icon rebuilt from src/assets/brand/brand-app-icon-a.svg; `draw` animates the swan outline.
export const BrandMark = ({ size, draw = 1, glow = 0, id = 'm' }: { size: number; draw?: number; glow?: number; id?: string }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.219, boxShadow: `0 0 ${60 + glow * 90}px rgba(61,123,255,${0.3 + glow * 0.45}), 0 0 ${150 + glow * 120}px rgba(138,99,255,${0.15 + glow * 0.25}), 0 30px 80px rgba(0,0,0,0.6)` }}>
    <svg id={id} width={size} height={size} viewBox="0 0 1024 1024" style={{ display: 'block' }}>
      <rect width="1024" height="1024" rx="224" fill="#DDEBEC" />
      <g transform="translate(-87 -64) scale(1.17)">
        <path d="M270 359 L339 340 C365 299 417 295 443 332 C468 367 439 414 426 455 C407 514 443 552 492 551 C553 548 584 468 648 444 C701 425 739 477 783 525 C724 592 651 629 567 637 C451 648 370 595 350 513 C338 463 352 404 383 367"
          fill="none" stroke="#173B46" strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        <circle cx="400" cy="339" r="10" fill="#173B46" opacity={Math.min(1, Math.max(0, (draw - 0.8) * 5))} />
      </g>
    </svg>
  </div>
);

// Radial spark burst for confirmations.
export const Burst = ({ frame, at, x, y, color = '#5B8CFF', r = 60, n = 10 }: { frame: number; at: number; x: number; y: number; color?: string; r?: number; n?: number }) => {
  const t = (frame - at) / 18;
  if (t <= 0 || t >= 1) return null;
  const e = EASE_OUT(t);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none', zIndex: 40 }}>
      <div style={{ position: 'absolute', left: -r * e, top: -r * e, width: r * 2 * e, height: r * 2 * e, borderRadius: '50%', border: `2px solid ${color}`, opacity: 1 - t }} />
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = mix(r * 0.3, r * 1.25, e);
        return <div key={i} style={{ position: 'absolute', left: Math.cos(a) * d - 3, top: Math.sin(a) * d - 3, width: 6, height: 6, borderRadius: 3, background: color, opacity: 1 - t, boxShadow: `0 0 10px ${color}` }} />;
      })}
    </div>
  );
};

// Text revealed per character (no half glyphs).
export const typed = (text: string, p: number) => [...text].slice(0, Math.round(p * [...text].length)).join('');

export type Rect = { x: number; y: number; w: number; h: number };
export const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p), w: mix(a.w, b.w, p), h: mix(a.h, b.h, p) });
