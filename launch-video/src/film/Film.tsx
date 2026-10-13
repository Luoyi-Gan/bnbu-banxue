import type { FC } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Backdrop, T } from '../lib/ui';
import { Ask, ASK_FRAMES, ASK_SFX } from './Ask';
import { Finale, FINALE_FRAMES, Opening, OPENING_FRAMES } from './Brand';
import { Community, COMMUNITY_FRAMES, COMMUNITY_SFX } from './Community';
import { Events, EVENTS_FRAMES, EVENTS_SFX } from './Events';
import { Alumni, ALUMNI_FRAMES, ALUMNI_SFX, Coffee, COFFEE_FRAMES, COFFEE_SFX } from './Mentors';
import { Teams, TEAMS_FRAMES, TEAMS_SFX } from './Teams';

type Sfx = { at: number; src: string; volume: number; len?: number };
const B = (n: number) => Math.round(n * 21);
const TITLE_SFX: Sfx[] = [
  { at: 0, src: 'sfx/transition-soft.mp3', volume: 0.3 },
  { at: 6, src: 'sfx/sparkle-touch.mp3', volume: 0.14 },
];
const wipe = (len: number): Sfx[] => [{ at: len - 25, src: 'sfx/zip.wav', volume: 0.32, len: 24 }];
const OPENING_SFX: Sfx[] = [
  { at: B(0.5) - 2, src: 'sfx/impact-deep-whoosh.mp3', volume: 0.42, len: 60 },
  { at: B(0.5), src: 'sfx/sparkle.mp3', volume: 0.3, len: 60 },
  { at: B(3) - 2, src: 'sfx/swoosh-quick.mp3', volume: 0.3 },
  { at: B(4), src: 'sfx/line-run.wav', volume: 0.3, len: 80 },
  ...[4.5, 5, 5.5, 6, 6.5, 7].map((b, i): Sfx => ({ at: B(b), src: `sfx/pop-${i}.wav`, volume: 0.34, len: 12 })),
  { at: B(9) + 4, src: 'sfx/whoosh-fast.mp3', volume: 0.32 },
];
const FINALE_SFX: Sfx[] = [
  { at: 0, src: 'sfx/line-run.wav', volume: 0.28, len: 34 },
  ...[0, 1, 2, 3, 4, 5].map((i): Sfx => ({ at: Math.round(((310 + i * 262 + 80) / 2080) * 28), src: `sfx/pop-${i}.wav`, volume: 0.22, len: 10 })),
  { at: 34, src: 'sfx/warp-slide.mp3', volume: 0.26 },
  { at: 46, src: 'sfx/impact-deep-whoosh.mp3', volume: 0.4, len: 60 },
  { at: 48, src: 'sfx/sparkle.mp3', volume: 0.3, len: 60 },
];

const SCENES: { C: FC; len: number; sfx: Sfx[] }[] = [
  { C: Opening, len: OPENING_FRAMES, sfx: OPENING_SFX },
  { C: Events, len: EVENTS_FRAMES, sfx: [...TITLE_SFX, ...EVENTS_SFX, ...wipe(EVENTS_FRAMES)] },
  { C: Community, len: COMMUNITY_FRAMES, sfx: [...TITLE_SFX, ...COMMUNITY_SFX, ...wipe(COMMUNITY_FRAMES)] },
  { C: Teams, len: TEAMS_FRAMES, sfx: [...TITLE_SFX, ...TEAMS_SFX, ...wipe(TEAMS_FRAMES)] },
  { C: Coffee, len: COFFEE_FRAMES, sfx: [...TITLE_SFX, ...COFFEE_SFX, ...wipe(COFFEE_FRAMES)] },
  { C: Alumni, len: ALUMNI_FRAMES, sfx: [...TITLE_SFX, ...ALUMNI_SFX, ...wipe(ALUMNI_FRAMES)] },
  { C: Ask, len: ASK_FRAMES, sfx: [...TITLE_SFX, ...ASK_SFX] },
  { C: Finale, len: FINALE_FRAMES, sfx: FINALE_SFX },
];
const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((s, x) => s + x.len, 0));
export const FILM_FRAMES = SCENES.reduce((s, x) => s + x.len, 0);

export const Film = ({ bgm = false }: { bgm?: boolean }) => (
  <AbsoluteFill style={{ background: T.night }}>
    <Backdrop />
    {bgm && <Audio src={staticFile('audio/film-score.wav')} volume={0.5} />}
    {SCENES.map(({ C, len, sfx }, i) => (
      <Sequence key={i} from={STARTS[i]} durationInFrames={len}>
        <C />
        {sfx.map((s, j) => (
          <Sequence key={j} from={s.at} durationInFrames={s.len ?? 45} layout="none">
            <Audio src={staticFile(`audio/${s.src}`)} volume={Math.min(1, s.volume * (bgm ? 1 : 1.6))} />
          </Sequence>
        ))}
      </Sequence>
    ))}
  </AbsoluteFill>
);
