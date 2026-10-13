import type { ReactNode } from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Backdrop, Caption, SubCaption } from './lib/ui';
import { keys } from './lib/motion';
import { Finale, Opening } from './motion/Brand';
import { Activities, Home } from './motion/Discover';
import { Teams } from './motion/Connect';
import { Alumni, Coffee } from './motion/Mentors';
import { Knowledge, Schedule } from './motion/Gather';
import { CAPTIONS, FOCUS, SFX, SUBCAPTIONS, TOTAL } from './timeline';

const Focus = ({ children }: { children: ReactNode }) => {
  const frame = useCurrentFrame();
  const z = keys(frame, FOCUS.map(([f, k]) => [f, k]));
  const tx = keys(frame, FOCUS.map(([f, k, px, , sx]) => [f, sx - px * k]));
  const ty = keys(frame, FOCUS.map(([f, k, , py, , sy]) => [f, sy - py * k]));
  return <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>{children}</AbsoluteFill>;
};

export const Main = ({ bgm }: { bgm: boolean }) => (
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
        volume={(f) => interpolate(f, [0, 6, TOTAL - 4, TOTAL], [0, 0.75, 0.75, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.duration ?? 45} layout="none">
        <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
