import { AbsoluteFill } from 'remotion';
import { useFilmFrame } from '../lib/time';
import { Avatar, Box, Chip, Icon, P, Txt } from '../kit/base';
import { Burst, Cam, camToScreen, type CamState, Win } from '../kit/fx';
import { actById, ChatPanel, Cover, Roll, TeamCard, TeamDetail, TEAMS } from '../kit/product';
import { Cursor, pathAt } from '../lib/ui';
import { EASE_IN_OUT, EASE_OUT, LAND, mix, prog } from '../lib/motion';
import { CLICKS, MOMENTS, SHOTS } from '../timeline';
import { DETAIL } from './Discover';

const live = (frame: number, key: keyof typeof SHOTS) => frame >= SHOTS[key].from && frame < SHOTS[key].from + SHOTS[key].duration;
const cardPos = (i: number) => ({ x: 28 + (i % 3) * 316, y: 188 + Math.floor(i / 3) * 244 });
const TD = { x: 1180, y: 170, k: 1.35 };
const CH = { x: 640, y: 150, k: 1.5 };

export const Teams = () => {
  const frame = useFilmFrame();
  if (!live(frame, 'teams')) return null;
  const filt = prog(frame, CLICKS.teamFilter + 1, 8);
  const dd = prog(frame, CLICKS.teamOpen + 1, 15, EASE_IN_OUT);
  const toChat = prog(frame, CLICKS.teamEnter, 16, EASE_IN_OUT);
  const base: CamState = { z: 1, fx: 500, fy: 350, ax: 1180, ay: 470 };
  const wi = prog(frame, 304, 18, EASE_OUT);
  const cam: CamState = { ...base, ax: mix(1180, 860, dd) - toChat * 1400, rx: mix(10, 0, wi), z: mix(0.8, 1, wi), opacity: wi * mix(1, 0.45, dd) * (1 - toChat), blur: dd * 3 };

  // match cut: detail drawer folds into the first team card
  const firstCard = camToScreen(base, cardPos(0).x, cardPos(0).y);
  const mp = prog(frame, 300, 22, EASE_IN_OUT);
  const from = { x: DETAIL.x, y: DETAIL.y, w: 690 * DETAIL.k, h: 712 * DETAIL.k };
  const mr = { x: mix(from.x, firstCard.x, mp), y: mix(from.y, firstCard.y, mp), w: mix(from.w, 300, mp), h: mix(from.h, 228, mp) };

  const moved = prog(frame, CLICKS.teamFilter + 5, 16, EASE_IN_OUT);
  const bPos = { x: cardPos(3).x, y: mix(cardPos(3).y, cardPos(0).y, moved) };
  const chipPt = camToScreen(base, 28 + 2 * 60 + 26, 151);
  const openPt = camToScreen(base, 270, 188 + 206);
  const cardS = camToScreen(base, cardPos(0).x, cardPos(0).y);
  const dRect = { x: TD.x, y: TD.y, w: 480 * TD.k, h: 430 * TD.k };
  const dm = { x: mix(cardS.x, dRect.x, dd), y: mix(cardS.y, dRect.y, dd), w: mix(300, dRect.w, dd), h: mix(228, dRect.h, dd) };
  const applyPt = { x: TD.x + 72 * TD.k, y: TD.y + 291 * TD.k };
  const enterPt = { x: TD.x + 90 * TD.k, y: TD.y + 375 * TD.k };
  const linPt = { x: TD.x + 214 * TD.k, y: TD.y + 321 * TD.k };

  const ap = MOMENTS.teamApproved;
  const stage = frame >= ap - 8 ? 2 : 1;
  const applyP = prog(frame, CLICKS.teamApply + 1, 9, EASE_OUT);
  const joinP = prog(frame, ap - 8, 10);
  const chipP = [prog(frame, ap - 6, 9, LAND), prog(frame, ap - 3, 9, LAND), prog(frame, ap + 1, 9, LAND)];
  const fly = prog(frame, ap - 12, 13, EASE_IN_OUT);
  const countP = prog(frame, ap + 1, 8, EASE_OUT);
  const enterP = prog(frame, ap + 7, 10);

  const cw = prog(frame, CLICKS.teamEnter + 1, 18, EASE_OUT);
  const ce = prog(frame, 500, 16, EASE_IN_OUT);
  const msgP = [prog(frame, CLICKS.teamEnter + 7, 10, LAND), prog(frame, CLICKS.teamEnter + 11, 10, LAND), prog(frame, MOMENTS.chatMessage, 14, LAND)];

  const cur = pathAt(frame, [[328, 1500, 900], [342, chipPt.x, chipPt.y], [349, chipPt.x, chipPt.y], [372, openPt.x, openPt.y], [378, openPt.x, openPt.y], [402, applyPt.x, applyPt.y], [410, applyPt.x, applyPt.y], [450, enterPt.x + 50, enterPt.y + 70], [462, enterPt.x, enterPt.y], [470, enterPt.x, enterPt.y]]);
  const ai = actById('ai');
  return (
    <AbsoluteFill>
      <Cam cam={cam}>
        <Win x={0} y={0} w={1000} h={700} glow={0.45} bg={P.surface}>
          <Box x={28} y={24}><Txt size={16} weight={700}>搭子大厅</Txt><Txt size={11.5} color={P.muted} style={{ marginTop: 4 }}><Roll from="4" to="1" p={filt} size={11.5} color={P.muted} /> 个正在招募的队伍</Txt></Box>
          <Box x={850} y={28} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Txt size={11.5} weight={700} color={P.action}>我的申请与队伍</Txt><Icon name="arrow" size={13} color={P.action} /></Box>
          <Box x={28} y={80} w={320} h={40} style={{ borderRadius: 10, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box' }}><Icon name="search" size={16} color="#8E8E93" /><Txt size={12} color="#8E8E93">搜索队伍、地点或关键词</Txt></Box>
          {['全部', '拼车', '娱乐', '学习'].map((l, i) => <Box key={l} x={28 + i * 60} y={136}><Chip label={l} active={i === 0 ? 1 - filt : i === 2 ? filt : 0} style={{ width: 52, justifyContent: 'center', padding: 0 }} /></Box>)}
          {TEAMS.map((t, i) => {
            if (i === 3) return <Box key={i} x={bPos.x} y={bPos.y} style={{ opacity: dd > 0 ? 0 : 1 }}><TeamCard t={t} /></Box>;
            const g = prog(frame, CLICKS.teamFilter + 1 + i * 2, 9, EASE_IN_OUT);
            const p = cardPos(i);
            return <Box key={i} x={p.x} y={p.y - g * 18} style={{ opacity: (1 - g) * (frame < 324 && i === 0 ? 0 : 1), transform: `scale(${1 - g * 0.08})` }}><TeamCard t={t} /></Box>;
          })}
        </Win>
      </Cam>
      {frame < 326 && (
        <div style={{ position: 'absolute', left: mr.x, top: mr.y, width: mr.w, height: mr.h, borderRadius: mix(22, 14, mp), overflow: 'hidden', background: P.surface, boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 ${70 * (1 - mp) + 20}px rgba(79,107,255,0.5)`, opacity: 1 - prog(frame, 322, 4) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - prog(frame, 304, 10) }}><Cover act={ai} w={mr.w} h={mr.h} radius={0} tagScale={0} /></div>
          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${mr.w / 300})`, opacity: prog(frame, 306, 10) }}><TeamCard t={TEAMS[0]} /></div>
        </div>
      )}
      {dd > 0 && toChat < 1 && (
        <div style={{ position: 'absolute', left: dm.x - toChat * 1400, top: dm.y, width: dm.w, height: dm.h, borderRadius: mix(14, 22, dd), overflow: 'hidden', background: P.surface, opacity: 1 - toChat, boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 80px rgba(61,123,255,0.4)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - prog(frame, CLICKS.teamOpen + 3, 7), transformOrigin: '0 0', transform: `scale(${dm.w / 300})` }}><TeamCard t={TEAMS[3]} /></div>
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: prog(frame, CLICKS.teamOpen + 5, 8), transformOrigin: '0 0', transform: `scale(${dm.w / 480})` }}>
            <TeamDetail stage={stage} applyP={applyP} joinP={joinP} chipP={chipP} countP={countP} enterP={enterP} />
          </div>
        </div>
      )}
      {fly > 0 && fly < 1 && (
        <div style={{ position: 'absolute', left: mix(560, linPt.x - 40, fly) - 30, top: mix(860, linPt.y, fly) - 30 - Math.sin(Math.PI * fly) * 140, transform: `scale(${mix(1.8, 0.8, fly)})` }}>
          <Avatar ch="林" size={60} style={{ boxShadow: '0 0 0 3px #fff, 0 0 40px rgba(61,123,255,0.8)' }} />
        </div>
      )}
      <Burst frame={frame} at={ap + 1} x={linPt.x} y={linPt.y} color="#5B8CFF" r={80} />
      {cw > 0 && (
        <div style={{ position: 'absolute', left: mix(2100, CH.x, cw) - ce * 1900, top: CH.y, width: 640 * CH.k, height: 440 * CH.k, borderRadius: 22, overflow: 'hidden', transform: `rotateY(${ce * 20}deg)`, opacity: 1 - ce * 0.5, boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 90px rgba(61,123,255,0.4)' }}>
          <div style={{ transformOrigin: '0 0', transform: `scale(${CH.k})` }}><ChatPanel msgP={msgP} /></div>
        </div>
      )}
      <Burst frame={frame} at={MOMENTS.chatMessage + 3} x={CH.x + 300 * CH.k} y={CH.y + (74 + 18 + 176 + 36) * CH.k} color="#7FA6FF" r={60} n={8} />
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.teamFilter, CLICKS.teamOpen, CLICKS.teamApply, CLICKS.teamEnter]} opacity={prog(frame, 328, 6) * (1 - prog(frame, CLICKS.teamEnter + 6, 8))} />
    </AbsoluteFill>
  );
};
