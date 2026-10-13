import { AbsoluteFill } from 'remotion';
import { Box, Icon, Kicker, P, Txt } from '../kit/base';
import { Cam, camToScreen, typed, Win } from '../kit/fx';
import { ANSWER_MAIN, ANSWER_SRC } from '../kit/product';
import { EASE_IN_OUT, EASE_OUT, LAND, mix, prog } from '../lib/motion';
import { camKeys, FeatureTitle, Focused, enter, Tap, useF } from './kit';

export const ASK_FRAMES = 230;
const A_IN = 42;
const SEND = 84;
const ANSWER = 112;
const QUESTION = '怎么预约老师的 Coffee Chat？';

export const ASK_SFX = [
  { at: A_IN - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.26 },
  { at: 50, src: 'sfx/keyboard.mp3', volume: 0.24, len: 24 },
  { at: SEND - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: SEND + 1, src: 'sfx/swoosh-quick.mp3', volume: 0.2 },
  { at: 100, src: 'sfx/pop-0.wav', volume: 0.2, len: 10 },
  { at: ANSWER - 1, src: 'sfx/pop-2.wav', volume: 0.24, len: 10 },
  { at: 140, src: 'sfx/scroll-short.wav', volume: 0.22, len: 20 },
  { at: 172, src: 'sfx/sparkle-touch.mp3', volume: 0.22 },
];

export const Ask = () => {
  const f = useF();
  const cam = camKeys(f, {
    z: [[A_IN, 1.55], [SEND + 10, 1.6], [140, 1.95], [200, 2.0]],
    fx: [[A_IN, 390], [SEND + 10, 390], [140, 360], [200, 360]],
    fy: [[A_IN, 245], [SEND + 10, 245], [140, 225], [200, 225]],
    rx: [[A_IN, -12], [80, 0]],
    ry: [[A_IN, 10], [80, 0], [200, -4]],
  }, { opacity: prog(f, A_IN, 14, EASE_IN_OUT) });
  const sent = f >= SEND + 1;
  const qTyped = typed(QUESTION, prog(f, 50, 22, (t) => t));
  const qFly = prog(f, SEND + 1, 12, EASE_OUT);
  const dots = f >= 100 && f < ANSWER;
  const mainTxt = typed(ANSWER_MAIN, prog(f, ANSWER, 44, (t) => t));
  const srcTxt = typed(ANSWER_SRC, prog(f, 158, 12, (t) => t));
  const under = prog(f, 172, 12, EASE_OUT);
  const ansP = prog(f, ANSWER - 2, 10, LAND);
  const focus = prog(f, 150, 14, EASE_IN_OUT);
  const out = prog(f, ASK_FRAMES - 16, 16, EASE_IN_OUT);
  const page = () => (
    <Cam cam={cam}>
      <Win x={0} y={0} w={780} h={470} radius={18} bg={P.surface} glow={0.5} style={enter(f, A_IN, 18)}>
        <Box x={24} y={22}><Kicker>CAMPUS AI</Kicker><Txt size={24} weight={700} style={{ marginTop: 4 }}>问问奶蛙</Txt><Txt size={12.5} color={P.muted} style={{ marginTop: 4 }}>查询已发布的校园知识，回答附有资料来源。</Txt></Box>
        <Box x={24} y={104} w={732} h={1} style={{ background: P.line }} />
        {sent && (
          <div style={{ position: 'absolute', right: 24, top: mix(404, 122, qFly), transform: `scale(${mix(0.9, 1, qFly)})`, transformOrigin: '100% 0', background: P.action, color: '#fff', borderRadius: 16, padding: '10px 16px', fontFamily: P.font, fontSize: 13.5, whiteSpace: 'nowrap' }}>{QUESTION}</div>
        )}
        {dots && (
          <Box x={24} y={180} style={{ display: 'flex', gap: 6, background: '#EEF3FC', borderRadius: 16, padding: '14px 18px' }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: '#7C93BF', opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 3) / 3)) }} />)}
          </Box>
        )}
        {f >= ANSWER && (
          <Box x={24} y={180} w={660} style={{ background: '#EEF3FC', borderRadius: 16, padding: '14px 18px', boxSizing: 'border-box', transform: `scale(${0.96 + 0.04 * ansP})`, transformOrigin: '0 0' }}>
            <div style={{ fontFamily: P.font, fontSize: 13.5, lineHeight: 1.75, color: P.ink }}>
              {mainTxt}
              {srcTxt && <> <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>{srcTxt}<span style={{ position: 'absolute', left: 0, bottom: -1, height: 2.5, width: `${under * 100}%`, background: P.action, borderRadius: 2, boxShadow: '0 0 8px rgba(8,101,209,0.6)' }} /></span></>}
            </div>
          </Box>
        )}
        <Box x={24} y={404} w={732} h={46} style={{ borderRadius: 23, background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 7px 0 18px', boxSizing: 'border-box' }}>
          <Txt size={13} color={sent || !qTyped ? '#8E8E93' : P.ink}>{sent ? '输入你的校园问题...' : qTyped || '输入你的校园问题...'}</Txt>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: !sent && qTyped ? P.action : '#E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowUp" size={17} color={!sent && qTyped ? '#fff' : '#8E8E93'} /></div>
        </Box>
        <Tap id="ask-send" f={f} at={SEND} x={715} y={410} w={34} h={34} r={17} />
      </Win>
    </Cam>
  );
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <FeatureTitle f={f} text="校园 AI" id="ask" />
      {f >= A_IN && <Focused y={camToScreen(cam, 0, 225).y} band={150} amount={focus} render={page} />}
    </AbsoluteFill>
  );
};
