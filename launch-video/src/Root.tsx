import { Composition } from 'remotion';
import { Main } from './Main';
import { Sample15, SAMPLE_FRAMES } from './sample/Sample15';
import { FPS, TOTAL_OUT } from './timeline';

export const Root = () => (
  <>
    <Composition
      id="BanxueLaunch"
      component={Main}
      durationInFrames={TOTAL_OUT}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ bgm: true, vo: false }}
    />
    <Composition
      id="BanxueSample15"
      component={Sample15}
      durationInFrames={SAMPLE_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ bgm: true }}
    />
  </>
);
