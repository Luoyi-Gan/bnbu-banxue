import { Easing, interpolate } from 'remotion';

// Motion voice: calm-confident (education product). Entrances settle without bounce,
// camera moves use a symmetric in-out curve; only landing cards get a slight overshoot.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);
export const LAND = Easing.bezier(0.34, 1.32, 0.64, 1);

export const prog = (frame: number, start: number, duration: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// Piecewise keyframes: [[frame, value], ...] with a shared easing between keys.
export const keys = (frame: number, pairs: [number, number][], easing = EASE_IN_OUT) => {
  if (frame <= pairs[0][0]) return pairs[0][1];
  for (let i = 0; i < pairs.length - 1; i++) {
    const [f0, v0] = pairs[i];
    const [f1, v1] = pairs[i + 1];
    if (frame <= f1) return mix(v0, v1, easing((frame - f0) / Math.max(1, f1 - f0)));
  }
  return pairs[pairs.length - 1][1];
};

export const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
