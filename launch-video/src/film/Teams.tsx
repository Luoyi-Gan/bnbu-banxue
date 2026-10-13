import { useCurrentFrame } from 'remotion';
import { Box, Chip, Icon, P, Txt } from '../kit/base';
import { Burst, Cam, camToScreen, Win } from '../kit/fx';
import { ChatPanel, Roll, TeamCard, TeamDetail, TEAMS } from '../kit/product';
import { EASE_IN_OUT, EASE_OUT, LAND, prog } from '../lib/motion';
import { camKeys, enter, FeatureTitle, Note, Tap, Wiped } from './kit';

export const TEAMS_FRAMES = 324;
const HALL_IN = 42;
const FILTER = 76;
const OPEN = 130;
const APPLY = 192;
const APPROVED = 222;
const ENTER = 256;
const DETAIL = { x: 1060, y: 120 };
const CHAT = { x: 1640, y: 40 };
const cardPos = (i: number) => ({ x: 28 + (i % 3) * 316, y: 188 + Math.floor(i / 3) * 244 });

export const TEAMS_SFX = [
  { at: HALL_IN - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.26 },
  { at: FILTER - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: FILTER + 4, src: 'sfx/scroll-short.wav', volume: 0.34, len: 22 },
  { at: OPEN - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: OPEN + 2, src: 'sfx/swoosh-quick.mp3', volume: 0.24 },
  { at: APPLY - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
  { at: APPROVED, src: 'sfx/sparkle-touch.mp3', volume: 0.26 },
  ...[2, 5, 9].map((d, i) => ({ at: APPROVED + d, src: `sfx/pop-${i + 1}.wav`, volume: 0.24, len: 10 })),
  { at: ENTER - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: ENTER + 4, src: 'sfx/swoosh-quick.mp3', volume: 0.24 },
  ...[14, 22, 34].map((d, i) => ({ at: ENTER + d, src: `sfx/pop-${i * 2}.wav`, volume: 0.2, len: 10 })),
];

export const Teams = () => {
  const f = useCurrentFrame();
  const filt = prog(f, FILTER + 1, 8);
  const moved = prog(f, FILTER + 5, 16, EASE_IN_OUT);
  const bPos = { x: cardPos(3).x, y: cardPos(3).y + (cardPos(0).y - cardPos(3).y) * moved };
  const cam = camKeys(f, {
    z: [[HALL_IN, 1.05], [100, 1.05], [124, 2.0], [OPEN + 6, 2.0], [166, 1.75], [ENTER, 1.75], [ENTER + 30, 1.45]],
    fx: [[HALL_IN, 500], [100, 500], [124, 178], [OPEN + 6, 178], [166, 1300], [ENTER, 1300], [ENTER + 30, CHAT.x + 320]],
    fy: [[HALL_IN, 330], [100, 330], [124, 302], [OPEN + 6, 302], [166, 335], [ENTER, 335], [ENTER + 30, CHAT.y + 220]],
    rx: [[HALL_IN, 12], [90, 0]],
    ry: [[HALL_IN, -10], [90, 0], [124, -6], [OPEN + 6, -6], [166, 0], [ENTER, 0], [ENTER + 30, -4]],
  }, { opacity: prog(f, HALL_IN, 8) });
  const dim = prog(f, OPEN + 4, 18, EASE_IN_OUT);
  const stage = f >= APPROVED ? 2 : 1;
  const applyP = prog(f, APPLY + 1, 9, EASE_OUT);
  const joinP = prog(f, APPROVED, 10);
  const chipP = [prog(f, APPROVED + 2, 9, LAND), prog(f, APPROVED + 5, 9, LAND), prog(f, APPROVED + 9, 9, LAND)];
  const countP = prog(f, APPROVED + 9, 8, EASE_OUT);
  const enterP = prog(f, APPROVED + 15, 10);
  const chatDim = prog(f, ENTER + 6, 18, EASE_IN_OUT);
  const msgP = [prog(f, ENTER + 14, 10, LAND), prog(f, ENTER + 22, 10, LAND), prog(f, ENTER + 34, 12, LAND)];
  const linPt = camToScreen(cam, DETAIL.x + 214, DETAIL.y + 321);
  return (
    <Wiped f={f} at={TEAMS_FRAMES - 24}>
      <FeatureTitle f={f} text="找搭子" id="tm" />
      {f >= HALL_IN && (
        <Cam cam={cam}>
          <div style={{ filter: dim > 0.01 ? `brightness(${1 - dim * 0.6}) blur(${dim * 4}px)` : undefined }}>
            <Win x={0} y={0} w={1000} h={700} glow={0.45} bg={P.surface} style={enter(f, HALL_IN, 18)}>
              <Box x={28} y={24}><Txt size={16} weight={700}>搭子大厅</Txt><Txt size={11.5} color={P.muted} style={{ marginTop: 4 }}><Roll from="4" to="1" p={filt} size={11.5} color={P.muted} /> 个正在招募的队伍</Txt></Box>
              <Box x={850} y={28} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Txt size={11.5} weight={700} color={P.action}>我的申请与队伍</Txt><Icon name="arrow" size={13} color={P.action} /></Box>
              <Box x={28} y={80} w={320} h={40} style={{ borderRadius: 10, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box' }}><Icon name="search" size={16} color="#8E8E93" /><Txt size={12} color="#8E8E93">搜索队伍、地点或关键词</Txt></Box>
              {['全部', '拼车', '娱乐', '学习'].map((l, i) => <Box key={l} x={28 + i * 60} y={136}><Chip label={l} active={i === 0 ? 1 - filt : i === 2 ? filt : 0} style={{ width: 52, justifyContent: 'center', padding: 0 }} /></Box>)}
              {TEAMS.map((t, i) => {
                if (i === 3) return <Box key={i} x={bPos.x} y={bPos.y}><TeamCard t={t} /></Box>;
                const g = prog(f, FILTER + 1 + i * 2, 9, EASE_IN_OUT);
                const p = cardPos(i);
                return <Box key={i} x={p.x} y={p.y - g * 18} style={{ opacity: 1 - g, transform: `scale(${1 - g * 0.08})` }}><TeamCard t={t} /></Box>;
              })}
              <Tap id="t-chip" f={f} at={FILTER} x={148} y={136} w={52} h={30} r={15} />
              <Tap id="t-open" f={f} at={OPEN} x={cardPos(0).x + 210} y={cardPos(0).y + 196} w={76} h={22} r={6} />
            </Win>
          </div>
          {f >= OPEN && (
            <div style={{ filter: chatDim > 0.01 ? `brightness(${1 - chatDim * 0.6}) blur(${chatDim * 4}px)` : undefined }}>
              <Win x={DETAIL.x} y={DETAIL.y} w={480} h={430} radius={20} bg={P.surface} glow={0.55} style={enter(f, OPEN + 2, 18)}>
                <TeamDetail stage={stage} applyP={applyP} joinP={joinP} chipP={chipP} countP={countP} enterP={enterP} />
                <Tap id="t-apply" f={f} at={APPLY} x={20} y={272} w={104} h={38} r={9} />
                <Tap id="t-enter" f={f} at={ENTER} x={20} y={356} w={133} h={38} r={9} />
              </Win>
            </div>
          )}
          {f >= ENTER && (
            <Win x={CHAT.x} y={CHAT.y} w={640} h={440} radius={20} bg={P.surface} glow={0.55} style={enter(f, ENTER + 4, 18)}>
              <ChatPanel msgP={msgP} />
            </Win>
          )}
        </Cam>
      )}
      <Note f={f} text="队长同意后，加入队伍" from={APPLY + 12} to={ENTER - 6} />
      <Burst frame={f} at={APPROVED + 9} x={linPt.x} y={linPt.y} color="#5B8CFF" r={80} />
    </Wiped>
  );
};
