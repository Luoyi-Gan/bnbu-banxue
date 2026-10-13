import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { Backdrop, Caption } from './lib/ui';
import { Finale, Opening } from './motion/Brand';
import { Activities, Home } from './motion/Discover';
import { Teams } from './motion/Connect';
import { Alumni, Coffee } from './motion/Mentors';
import { Knowledge, Schedule } from './motion/Gather';
import { CAPTIONS, SFX, TOTAL } from './timeline';

export const Main = ({ bgm }: { bgm: boolean }) => (
  <AbsoluteFill style={{ background: '#030409' }}>
    <Backdrop />
    <Opening />
    <Home />
    <Activities />
    <Teams />
    <Coffee />
    <Alumni />
    <Schedule />
    <Knowledge />
    <Finale />
    {CAPTIONS.map((c) => <Caption key={c.id} text={c.text} from={c.from} to={c.to} />)}
    {bgm && (
      <Audio
        src={staticFile('audio/bgm-original.wav')}
        volume={(f) => interpolate(f, [0, 6, TOTAL - 4, TOTAL], [0, 0.6, 0.6, 0.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.duration ?? 45} layout="none">
        <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
