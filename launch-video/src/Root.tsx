import { Composition } from 'remotion';
import { Film, FILM_FRAMES } from './film/Film';
import { Main } from './Main';
import { FPS, TOTAL_OUT } from './timeline';

export const Root = () => (
  <>
    <Composition
      id="BanxueFilm"
      component={Film}
      durationInFrames={FILM_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ bgm: false }}
    />
    <Composition
      id="BanxueLaunch"
      component={Main}
      durationInFrames={TOTAL_OUT}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ bgm: true, vo: false }}
    />
  </>
);
