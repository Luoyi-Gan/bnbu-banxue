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
const TITLE_SFX: Sfx[] = [{ at: 0, src: 'sfx/transition-soft.mp3', volume: 0.3 }];
const OPENING_SFX: Sfx[] = [
  { at: 2, src: 'sfx/sparkle-touch.mp3', volume: 0.2, len: 60 },
  { at: B(5) - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.26 },
  { at: 117, src: 'sfx/sparkle.mp3', volume: 0.26 },
  { at: B(9) - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.3 },
];
const FINALE_SFX: Sfx[] = [
  { at: 0, src: 'sfx/warp-slide.mp3', volume: 0.24 },
  { at: 48, src: 'sfx/sparkle.mp3', volume: 0.26 },
];

const SCENES: { C: FC; len: number; sfx: Sfx[] }[] = [
  { C: Opening, len: OPENING_FRAMES, sfx: OPENING_SFX },
  { C: Events, len: EVENTS_FRAMES, sfx: [...TITLE_SFX, ...EVENTS_SFX] },
  { C: Community, len: COMMUNITY_FRAMES, sfx: [...TITLE_SFX, ...COMMUNITY_SFX] },
  { C: Teams, len: TEAMS_FRAMES, sfx: [...TITLE_SFX, ...TEAMS_SFX] },
  { C: Coffee, len: COFFEE_FRAMES, sfx: [...TITLE_SFX, ...COFFEE_SFX] },
  { C: Alumni, len: ALUMNI_FRAMES, sfx: [...TITLE_SFX, ...ALUMNI_SFX] },
  { C: Ask, len: ASK_FRAMES, sfx: [...TITLE_SFX, ...ASK_SFX] },
  { C: Finale, len: FINALE_FRAMES, sfx: FINALE_SFX },
];
const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((s, x) => s + x.len, 0));
export const FILM_FRAMES = SCENES.reduce((s, x) => s + x.len, 0);

export const Film = () => (
  <AbsoluteFill style={{ background: T.night }}>
    <Backdrop />
    {SCENES.map(({ C, len, sfx }, i) => (
      <Sequence key={i} from={STARTS[i]} durationInFrames={len}>
        <C />
        {sfx.map((s, j) => (
          <Sequence key={j} from={s.at} durationInFrames={s.len ?? 45} layout="none">
            <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
          </Sequence>
        ))}
      </Sequence>
    ))}
  </AbsoluteFill>
);
