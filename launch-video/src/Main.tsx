import type { ReactNode } from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { toOut, useFilmFrame } from './lib/time';
import { Backdrop, Caption, SubCaption } from './lib/ui';
import { keys } from './lib/motion';
import { Finale, Opening } from './motion/Brand';
import { Activities, Home } from './motion/Discover';
import { Teams } from './motion/Connect';
import { Alumni, Coffee } from './motion/Mentors';
import { Knowledge, Schedule } from './motion/Gather';
import { CAPTIONS, FOCUS, SFX, SUBCAPTIONS, TOTAL_OUT, VO } from './timeline';

const Focus = ({ children }: { children: ReactNode }) => {
  const frame = useFilmFrame();
  const z = keys(frame, FOCUS.map(([f, k]) => [f, k]));
  const tx = keys(frame, FOCUS.map(([f, k, px, , sx]) => [f, sx - px * k]));
  const ty = keys(frame, FOCUS.map(([f, k, , py, , sy]) => [f, sy - py * k]));
  return <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>{children}</AbsoluteFill>;
};

// Music dips under the voice-over with short ramps.
const duck = (f: number) => {
  const d = VO.reduce((m, v) => Math.max(m, interpolate(f, [v.from - 8, v.from, v.from + v.duration, v.from + v.duration + 10], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })), 0);
  return 1 - 0.55 * d;
};

export const Main = ({ bgm, vo = false }: { bgm: boolean; vo?: boolean }) => (
  <AbsoluteFill style={{ background: '#030409' }}>
    <Backdrop />
    <Opening />
    <Focus>
      <Home />
      <Activities />
      <Teams />
      <Coffee />
      <Alumni />
      <Schedule />
      <Knowledge />
    </Focus>
    <Finale />
    {CAPTIONS.map((c) => <Caption key={c.id} text={c.text} from={c.from} to={c.to} />)}
    {SUBCAPTIONS.map((c) => <SubCaption key={c.text} text={c.text} from={c.from} to={c.to} />)}
    {bgm && (
      <Audio
        src={staticFile('audio/bgm-original.wav')}
        volume={(f) => interpolate(f, [0, 6, TOTAL_OUT - 4, TOTAL_OUT], [0, 0.6, 0.6, 0.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * (vo ? duck(f) : 1)}
      />
    )}
    {vo && VO.map((v) => (
      <Sequence key={v.id} from={v.from} durationInFrames={Math.min(v.duration + 2, TOTAL_OUT - v.from)} layout="none">
        <Audio src={staticFile(`audio/vo/${v.id}.wav`)} volume={1} />
      </Sequence>
    ))}
    {SFX.map((s, i) => (
      <Sequence key={i} from={toOut(s.from)} durationInFrames={toOut(s.duration ?? 45)} layout="none">
        <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
