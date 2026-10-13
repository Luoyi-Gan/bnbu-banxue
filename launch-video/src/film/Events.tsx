import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Box, P } from '../kit/base';
import { Burst, Cam, camToScreen, type CamState, Win } from '../kit/fx';
import { ActivityCard, actById, ActivityDetail } from '../kit/product';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';
import { camKeys, camMix, FeatureTitle, Focused, Tap, Trace, Wiped } from './kit';

const ROW_IDS = ['career', 'speaking', 'library', 'cinema', 'run', 'ai'];
const CARD_W = 214, CARD_GAP = 250;
const AI_X = ROW_IDS.indexOf('ai') * CARD_GAP + CARD_W / 2;
const CARDS_IN = 42;
const OPEN = 126;
const MARK = 210;
const BTN = { x: 20, y: 654, h: 38 };
const CAM_IN: CamState = { z: 2.7, fx: 150, fy: 668, ry: -6, rx: 2 };
const CAM_OUT: CamState = { z: 1.08, fx: 345, fy: 370, ry: -18, rx: 7 };
export const EVENTS_FRAMES = 286;

export const EVENTS_SFX = [
  { at: CARDS_IN - 2, src: 'sfx/whoosh-big.mp3', volume: 0.26 },
  { at: OPEN, src: 'sfx/swoosh-quick.mp3', volume: 0.26 },
  { at: MARK - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
  { at: MARK, src: 'sfx/sparkle-touch.mp3', volume: 0.22 },
];

const Cards = ({ f }: { f: number }) => {
  if (f < CARDS_IN || f >= OPEN + 14) return null;
  const fx = keys(f, [[CARDS_IN, 300], [OPEN - 6, AI_X]]);
  const zoom = prog(f, OPEN, 14, EASE_IN);
  const cam: CamState = {
    z: keys(f, [[CARDS_IN, 1.7], [OPEN - 6, 2.3]]) * (1 + zoom * 1.6), fx, fy: 200, rx: 10, ry: keys(f, [[CARDS_IN, -30], [OPEN - 6, -8]]),
    opacity: 1 - zoom, blur: zoom * 10,
  };
  return (
    <>
      <Cam cam={cam}>
        {ROW_IDS.map((id, i) => {
          const d = Math.abs(i * CARD_GAP + CARD_W / 2 - fx);
          const inP = prog(f, CARDS_IN + i * 2, 16, LAND);
          return (
            <Box key={id} x={i * CARD_GAP} y={0} style={{ opacity: Math.min(1, inP * 2), filter: `blur(${Math.min(8, d / 45)}px) brightness(${1 - Math.min(0.6, d / 560)})`, transform: `translateZ(${(1 - inP) * -900}px)` }}>
              <ActivityCard act={actById(id)} w={CARD_W} glow={id === 'ai' ? prog(f, OPEN - 16, 12) : 0} />
            </Box>
          );
        })}
      </Cam>
      {f < CARDS_IN + 14 && <AbsoluteFill style={{ background: `radial-gradient(50% 50% at 50% 46%, rgba(160,190,255,${0.3 * (1 - prog(f, CARDS_IN, 14))}) 0%, rgba(0,0,0,0) 70%)` }} />}
    </>
  );
};

const Detail = ({ f }: { f: number }) => {
  if (f < OPEN + 2) return null;
  const open = prog(f, OPEN + 2, 18, EASE_OUT);
  const pull = prog(f, MARK + 4, 24, EASE_OUT);
  const near = camKeys(f, {
    z: [[OPEN, 1.18], [162, 1.22], [180, 1.7], [200, CAM_IN.z]],
    fx: [[OPEN, 345], [162, 345], [180, 330], [200, CAM_IN.fx]],
    fy: [[OPEN, 350], [162, 330], [180, 540], [200, CAM_IN.fy]],
    ry: [[OPEN, -12], [162, -6], [180, -4], [200, CAM_IN.ry!]],
    rx: [[OPEN, 6], [162, 3], [180, 2], [200, CAM_IN.rx!]],
  });
  const cam = pull > 0 ? camMix(CAM_IN, CAM_OUT, pull) : near;
  const marked = prog(f, MARK + 1, 10, EASE_OUT);
  const press = Math.max(0, 1 - Math.abs(f - MARK) / 4);
  const focusY = keys(f, [[162, 540], [182, 540], [200, BTN.y + BTN.h / 2]]);
  const amount = prog(f, 162, 14, EASE_IN_OUT) * (1 - prog(f, MARK + 4, 12));
  const btnScreen = camToScreen(CAM_IN, BTN.x + 46, BTN.y + BTN.h / 2);
  const rim = prog(f, MARK + 6, 20, EASE_IN_OUT);
  const page = () => (
    <Cam cam={{ ...cam, opacity: open }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - open) * 80}px) scale(${mix(0.9, 1, open)})`, transformOrigin: '345px 356px' }}>
        <Win x={0} y={0} w={690} h={712} bg={P.surface} glow={0.35 + rim * 0.5}>
          <ActivityDetail reveal={(i) => prog(f, OPEN + 6 + i * 2, 12)} marked={marked} press={press} />
        </Win>
        {pull < 0.5 && <Tap id="e-mark" f={f} at={MARK} x={BTN.x} y={BTN.y} w={92} h={BTN.h} r={9} />}
        <Trace id="e-win" x={0} y={0} w={690} h={712} r={22} p={rim} width={1.4} />
      </div>
    </Cam>
  );
  return (
    <>
      <Focused y={camToScreen(cam, 345, focusY).y} band={100} amount={amount} render={page} />
      <Burst frame={f} at={MARK + 1} x={btnScreen.x} y={btnScreen.y} color="#7FA6FF" r={110} n={12} />
    </>
  );
};

export const Events = () => {
  const f = useCurrentFrame();
  return (
    <Wiped f={f} at={EVENTS_FRAMES - 24}>
      <FeatureTitle f={f} text="活动" id="ev" />
      <Cards f={f} />
      <Detail f={f} />
    </Wiped>
  );
};
