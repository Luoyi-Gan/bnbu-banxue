import { Composition } from 'remotion';
import { Main } from './Main';
import { FPS, TOTAL_OUT } from './timeline';

export const Root = () => (
  <Composition
    id="BanxueLaunch"
    component={Main}
    durationInFrames={TOTAL_OUT}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ bgm: true, vo: false }}
  />
);
