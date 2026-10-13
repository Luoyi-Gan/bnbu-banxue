import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { box, Cursor, Float, PageView, pathAt, Shot, Stage, SubCaption, Sweep, T, toScreen, viewOf, type Pose, type Rect } from '../lib/ui';
import { EASE_IN, EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';

import { CLICKS, MOMENTS, SHOTS } from '../timeline';

type ShotKey = keyof typeof SHOTS;
const live = (frame: number, key: ShotKey) => frame >= SHOTS[key].from && frame < SHOTS[key].from + SHOTS[key].duration;

const Abs = ({ x, y, w, h, style, children }: { x: number; y: number; w?: number; h?: number; style?: CSSProperties; children?: ReactNode }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

// ---------- 4–10s: home, push in, panels pop, pass through an activity row ----------
export const Home = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'home')) return null;
  const W = 860, H = 900;
  const through = prog(frame, MOMENTS.pushThrough - 1, 27, EASE_IN);
  const row = box('home_before', 'row0');
  let s = keys(frame, [[120, 1.0], [142, 1.62], [168, 0.98]]);
  let fx = W / (2 * s) + 14;
  let fy = keys(frame, [[120, 470], [142, 280], [168, 520]]);
  if (through > 0) {
    s = 0.98 * Math.pow(7.5 / 0.98, through);
    fx = mix(450, 240, through);
    fy = mix(520, row.y + row.h / 2, through);
  }
  const enter = prog(frame, 120, 20);
  const pose: Pose = {
    x: 1080, y: 520, z: mix(-600, 0, enter), rx: 3 * (1 - through), ry: mix(-24, -8, prog(frame, 120, 24)) * (1 - prog(frame, 168, 12)),
    opacity: prog(frame, 120, 8) * (1 - prog(frame, 192, 8)), blur: prog(frame, 184, 14) * 16,
  };
  const panels = ['task', 'next', 'schedule'] as const;
  return (
    <Stage>
      <PageView layers={[{ name: 'home_before' }]} W={W} H={H} cam={{ s, fx, fy }} pose={pose} glow={0.5}>
        {(at, k) => panels.map((key, i) => {
          const b = box('home_before', key);
          const p = prog(frame, MOMENTS.homePanels[i], 14, LAND);
          const o = prog(frame, MOMENTS.homePanels[i], 8);
          const pt = at(b.x, b.y);
          return (
            <div key={key}>
              <Abs x={pt.x - 4} y={pt.y - 4} w={b.w * k + 8} h={b.h * k + 8} style={{ background: T.canvas, opacity: 1 - o }} />
              <Abs x={pt.x} y={pt.y} w={b.w * k} h={b.h * k} style={{ opacity: o, transform: `translateY(${(1 - p) * 46}px) scale(${0.96 + 0.04 * p})`, borderRadius: 14 * k, overflow: 'hidden', boxShadow: o < 1 ? `0 0 ${40 * (1 - p)}px rgba(61,123,255,0.5)` : undefined }}>
                <Shot name="home_before" region={b} s={k} />
              </Abs>
            </div>
          );
        })}
      </PageView>
    </Stage>
  );
};

// ---------- activities: filter, open detail, mark participation ----------
export const Activities = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'activities')) return null;
  const W = 1274, H = 778, s = 1.08, fx = 826;
  const fy = keys(frame, [[190, 830], [230, 830], [252, 1290]]);
  const enter = prog(frame, 190, 18);
  const d = prog(frame, CLICKS.actOpen, 16);
  const exit = prog(frame, 294, 10, EASE_IN_OUT);
  const pagePose: Pose = { x: mix(1060, 860, d) - exit * 120, y: 480, scale: mix(1.7, 1, enter) * mix(1, 0.94, d), blur: (1 - enter) * 14, opacity: prog(frame, 190, 8) * (1 - exit) };

  const DS = 1.12, DR: Rect = { x: 750, y: 0, w: 690, h: 830 };
  const DW = DR.w * DS, DH = DR.h * DS;
  const drawerPose: Pose = { x: mix(2400, 1440, d) + exit * 80, y: 540, scale: 1 + prog(frame, CLICKS.actMark + 3, 12) * 0.03, opacity: 1 - exit };

  const basePose: Pose = { x: 1060, y: 480 };
  const chip = box('act_filtered', 'chipMail');
  const chipPt = toScreen(basePose, W, H, viewOf(W, H, { s, fx, fy: 830 }), s, chip.x + chip.w / 2, chip.y + chip.h / 2);
  const titlePt = toScreen(basePose, W, H, viewOf(W, H, { s, fx, fy: 1290 }), s, 900, 1510);
  const mark = box('act_detail', 'mark');
  const markPt = toScreen(drawerPose, DW, DH, DR, DS, mark.x + mark.w / 2, mark.y + mark.h / 2);
  const cur = pathAt(frame, [
    [200, 1500, 1000], [221, chipPt.x, chipPt.y], [229, chipPt.x, chipPt.y], [252, titlePt.x, titlePt.y], [258, titlePt.x, titlePt.y],
    [281, markPt.x, markPt.y], [300, markPt.x + 40, markPt.y + 30],
  ]);
  return (
    <Stage>
      <PageView layers={[{ name: 'act_list' }, { name: 'act_filtered', opacity: prog(frame, CLICKS.actFilter + 1, 6, EASE_IN_OUT) }]} W={W} H={H} cam={{ s, fx, fy }} pose={pagePose} glow={0.45}>
        {() => <Abs x={0} y={0} w={W} h={H} style={{ background: `rgba(0,0,0,${0.35 * d})` }} />}
      </PageView>
      {d > 0 && (
        <Float pose={drawerPose} w={DW} h={DH} glow={0.6 + prog(frame, CLICKS.actMark, 8) * 0.4 * (1 - prog(frame, CLICKS.actMark + 8, 16))} bg={T.surface}>
          <Shot name="act_detail" region={DR} s={DS} />
          <Shot name="act_marked" region={DR} s={DS} style={{ opacity: prog(frame, CLICKS.actMark + 1, 6, EASE_IN_OUT) }} />
        </Float>
      )}
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.actFilter, CLICKS.actOpen, CLICKS.actMark]} opacity={prog(frame, 200, 6) * (1 - prog(frame, 292, 8))} />
    </Stage>
  );
};

// ---------- teams: match cut, filter, detail, apply, approved, team messages ----------
const Avatar = ({ ch, size }: { ch: string; size: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: T.accentSoft, color: '#1D4F91', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, fontWeight: 600, fontSize: size * 0.44, boxShadow: '0 0 0 3px rgba(255,255,255,0.9), 0 0 30px rgba(61,123,255,0.65)' }}>{ch}</div>
);

export const Teams = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'teams')) return null;
  const W = 1240, H = 700, cam = { s: 1, fx: 800, fy: 465 };
  const region = viewOf(W, H, cam);
  const wi = prog(frame, 304, 18);
  const filtO = prog(frame, CLICKS.teamFilter + 1, 6, EASE_IN_OUT);
  const dd = prog(frame, CLICKS.teamOpen, 16);
  const cwOut = prog(frame, CLICKS.teamEnter, 16, EASE_IN_OUT);
  const pagePose: Pose = { x: mix(1100, 980, dd) - cwOut * 1500, y: 470, z: mix(-300, 0, wi), ry: mix(14, 0, wi), opacity: wi * (1 - cwOut) };

  const DS = 1.3, DR: Rect = { x: 920, y: 0, w: 520, h: 440 };
  const DW = DR.w * DS, DH = DR.h * DS;
  const drawerPose: Pose = { x: mix(2300, 1440, dd) - cwOut * 1500, y: 470, opacity: 1 - cwOut };

  // match cut: the activity card becomes the first team card
  const card = box('teams_list', 'cards');
  const B = toScreen({ x: 1100, y: 470 }, W, H, region, 1, card.x, card.y);
  const mp = prog(frame, 300, 24, EASE_IN_OUT);
  const mr = { x: mix(1150, B.x, mp), y: mix(270, B.y, mp), w: mix(300, card.w, mp), h: mix(499, card.h, mp) };
  const ai = box('act_filtered', 'aiCard');

  const chip = box('teams_list', 'chipEnt');
  const chipPt = toScreen({ x: 1100, y: 470 }, W, H, region, 1, chip.x + chip.w / 2, chip.y + chip.h / 2);
  const openPt = toScreen({ x: 1100, y: 470 }, W, H, region, 1, 590, 557);
  const settled: Pose = { x: 1440, y: 470 };
  const apply = box('team_drawer', 'apply');
  const applyPt = toScreen(settled, DW, DH, DR, DS, apply.x + apply.w / 2, apply.y + apply.h / 2);
  const enter = box('team_joined', 'enter');
  const enterPt = toScreen(settled, DW, DH, DR, DS, enter.x + enter.w / 2, enter.y + enter.h / 2);
  const cur = pathAt(frame, [
    [328, 1500, 900], [342, chipPt.x, chipPt.y], [349, chipPt.x, chipPt.y], [372, openPt.x, openPt.y], [378, openPt.x, openPt.y],
    [402, applyPt.x, applyPt.y], [410, applyPt.x, applyPt.y], [448, applyPt.x + 60, applyPt.y + 90], [462, enterPt.x, enterPt.y], [480, enterPt.x, enterPt.y],
  ]);

  // members gather after approval
  const chipCenters = [957, 1035, 1112].map((x) => toScreen(settled, DW, DH, DR, DS, x, 344));
  const starts = [{ x: 760, y: 280 }, { x: 1850, y: 150 }, { x: 1700, y: 990 }];
  const gp = prog(frame, MOMENTS.teamApproved - 14, 16, EASE_IN_OUT);
  const gFade = prog(frame, MOMENTS.teamApproved + 2, 10);

  // chat
  const CS = 1.0, CR: Rect = { x: 216, y: 64, w: 1224, h: 625 };
  const cw = prog(frame, CLICKS.teamEnter, 18, EASE_OUT);
  const ce = prog(frame, 500, 16, EASE_IN_OUT);
  const chatPose: Pose = { x: mix(2700, 1110, cw) - ce * 1800, y: 450, ry: ce * 18, scale: 1 + prog(frame, 484, 20, EASE_IN_OUT) * 0.04, opacity: 1 - ce * 0.6 };
  const msgR: Rect = { x: 640, y: 582, w: 360, h: 82 };
  const mpop = prog(frame, MOMENTS.chatMessage, 14, LAND);
  const mo = prog(frame, MOMENTS.chatMessage, 6);

  return (
    <Stage>
      {cwOut < 1 && (
        <PageView layers={[{ name: 'teams_list' }, { name: 'teams_filtered', dy: 210, opacity: filtO }]} W={W} H={H} cam={cam} pose={pagePose} glow={0.45}>
          {(at) => (
            <>
              <Abs x={0} y={at(0, 600).y} w={W} h={H} style={{ background: T.canvas, opacity: filtO }} />
              <Abs x={0} y={0} w={W} h={H} style={{ background: `rgba(0,0,0,${0.35 * dd})` }} />
            </>
          )}
        </PageView>
      )}
      {frame < 330 && (
        <Abs x={mr.x} y={mr.y} w={mr.w} h={mr.h} style={{ borderRadius: 16, overflow: 'hidden', background: T.surface, opacity: 1 - prog(frame, 325, 4), boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 ${60 * (1 - mp) + 20}px rgba(61,123,255,0.6)` }}>
          <Shot name="act_filtered" region={ai} s={mr.w / ai.w} />
          <Shot name="teams_list" region={card} s={mr.w / card.w} style={{ opacity: prog(frame, 306, 12, EASE_IN_OUT) }} />
        </Abs>
      )}
      {dd > 0 && cwOut < 1 && (
        <Float pose={drawerPose} w={DW} h={DH} glow={0.6} bg={T.surface}>
          <Shot name="team_drawer" region={DR} s={DS} />
          <Shot name="team_applied" region={DR} s={DS} style={{ opacity: prog(frame, CLICKS.teamApply + 1, 6, EASE_IN_OUT) }} />
          <Shot name="team_joined" region={DR} s={DS} style={{ opacity: prog(frame, MOMENTS.teamApproved - 5, 6, EASE_IN_OUT) }} />
        </Float>
      )}
      {gp > 0 && gFade < 1 && ['陈', '许', '林'].map((ch, i) => {
        const x = mix(starts[i].x, chipCenters[i].x, gp), y = mix(starts[i].y, chipCenters[i].y, gp) - Math.sin(Math.PI * gp) * 60;
        const size = mix(72, 30, gp);
        return <Abs key={ch} x={x - size / 2} y={y - size / 2} style={{ opacity: prog(frame, MOMENTS.teamApproved - 14, 4) * (1 - gFade) }}><Avatar ch={ch} size={size} /></Abs>;
      })}
      {frame >= MOMENTS.teamApproved && frame < MOMENTS.teamApproved + 24 && (() => {
        const q = prog(frame, MOMENTS.teamApproved, 24);
        const a = chipCenters[0], b = chipCenters[2];
        return <Abs x={a.x - 70 - q * 20} y={a.y - 30 - q * 10} w={b.x - a.x + 140 + q * 40} h={60 + q * 20} style={{ borderRadius: 40, border: `2px solid rgba(110,160,255,${0.8 * (1 - q)})`, boxShadow: `0 0 40px rgba(61,123,255,${0.6 * (1 - q)})` }} />;
      })()}
      {cw > 0 && (
        <Float pose={chatPose} w={CR.w * CS} h={CR.h * CS} glow={0.55}>
          <Shot name="team_chat" region={CR} s={CS} />
          <Abs x={(msgR.x - CR.x) * CS} y={(msgR.y - CR.y) * CS} w={msgR.w * CS} h={msgR.h * CS} style={{ background: '#F8F8FA', opacity: 1 - mo }} />
          <Abs x={(msgR.x - CR.x) * CS} y={(msgR.y - CR.y) * CS} w={msgR.w * CS} h={msgR.h * CS} style={{ opacity: mo, transform: `translateY(${(1 - mpop) * 30}px) scale(${0.9 + 0.1 * mpop})`, transformOrigin: '10% 80%' }}>
            <Shot name="team_chat" region={msgR} s={CS} />
          </Abs>
        </Float>
      )}
      <SubCaption text="队长同意后加入队伍" from={MOMENTS.teamApproved - 8} to={CLICKS.teamEnter} />
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.teamFilter, CLICKS.teamOpen, CLICKS.teamApply, CLICKS.teamEnter]} opacity={prog(frame, 328, 6) * (1 - prog(frame, CLICKS.teamEnter + 6, 8))} />
    </Stage>
  );
};

// ---------- teacher Coffee Chat: open slots, select, type, confirm ----------
export const Coffee = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'coffee')) return null;
  const S = 1.36, R: Rect = { x: 0, y: 350, w: 690, h: 550 };
  const W = R.w * S, H = R.h * S;
  const ci = prog(frame, 510, 16, EASE_OUT);
  const xo = prog(frame, 612, 14, EASE_IN_OUT);
  const settled: Pose = { x: 1250, y: 485 };
  const pose: Pose = { x: mix(2700, 1250, ci) - xo * 750, y: 485, z: -500 * xo, ry: mix(-18, 0, ci) + 20 * xo, opacity: 1 - xo, blur: xo * 6 };
  const local = (x: number, y: number) => ({ x: (x - R.x) * S, y: (y - R.y) * S });

  const tb = box('coffee_open', 'teacher');
  const teacher: Rect = { x: tb.x - 18, y: tb.y - 14, w: tb.w + 30, h: tb.h + 26 };
  const tc = prog(frame, 518, 16);
  const slots = box('coffee_open', 'slots');
  const slot = box('coffee_open', 'slot');
  const confirm = box('coffee_selected', 'confirm');
  const slotPt = toScreen(settled, W, H, R, S, slot.x + slot.w / 2, slot.y + slot.h / 2);
  const confirmPt = toScreen(settled, W, H, R, S, confirm.x + confirm.w / 2, confirm.y + confirm.h / 2);
  const cur = pathAt(frame, [[526, 1350, 1000], [552, slotPt.x, slotPt.y], [560, slotPt.x, slotPt.y], [578, confirmPt.x - 80, confirmPt.y + 40], [583, confirmPt.x, confirmPt.y], [600, confirmPt.x, confirmPt.y], [614, confirmPt.x + 60, confirmPt.y + 60]]);

  const selO = prog(frame, CLICKS.coffeeSlot + 1, 5, EASE_IN_OUT);
  const bookO = prog(frame, CLICKS.coffeeConfirm + 1, 3, EASE_IN_OUT);
  const typed = Math.floor(prog(frame, MOMENTS.coffeeTyping, 20, (t) => t) * 18) / 18;
  const sl = box('coffee_booked', 'slot');
  const slP = local(sl.x, sl.y);
  const pop = prog(frame, CLICKS.coffeeConfirm + 4, 16, LAND);
  const popGlow = prog(frame, CLICKS.coffeeConfirm + 4, 8) * (1 - prog(frame, CLICKS.coffeeConfirm + 16, 18));
  const fb = box('coffee_booked', 'feedback');
  const fbP = local(fb.x, fb.y);
  return (
    <Stage>
      <Float pose={{ x: mix(240, 450, tc) - xo * 400, y: 330, ry: 10, opacity: tc * (1 - xo) }} w={teacher.w * 1.22} h={teacher.h * 1.22} bg={T.surface} glow={0.4} radius={16}>
        <Shot name="coffee_open" region={teacher} s={1.22} />
      </Float>
      <Float pose={pose} w={W} h={H} bg={T.surface} glow={0.5}>
        <Shot name="coffee_open" region={R} s={S} />
        <Shot name="coffee_selected" region={R} s={S} style={{ opacity: selO }} />
        {frame < CLICKS.coffeeConfirm + 2 && (() => {
          const p = local(35 + typed * 214, 762);
          return <Abs x={p.x} y={p.y} w={(640 - 35 - typed * 214) * S} h={38 * S} style={{ background: T.surface, opacity: selO }} />;
        })()}
        <Shot name="coffee_booked" region={R} s={S} style={{ opacity: bookO }} />
        {bookO > 0 && (
          <Abs x={slP.x} y={slP.y} w={sl.w * S} h={sl.h * S} style={{ borderRadius: 14 * S, overflow: 'hidden', transform: `scale(${1 + 0.05 * pop - 0.05 * prog(frame, 600, 12, EASE_IN_OUT)})`, boxShadow: `0 0 ${50 * popGlow}px rgba(36,138,61,${0.55 * popGlow})`, opacity: bookO }}>
            <Shot name="coffee_booked" region={sl} s={S} />
          </Abs>
        )}
        {bookO > 0 && <Abs x={fbP.x} y={fbP.y + fb.h * S + 4} w={176 * S * prog(frame, CLICKS.coffeeConfirm + 8, 14)} h={3} style={{ background: '#248A3D', borderRadius: 2, boxShadow: '0 0 12px rgba(36,138,61,0.7)' }} />}
        <Abs x={local(slots.x, slots.y).x} y={local(slots.x, slots.y).y} w={slots.w * S} h={slots.h * S} style={{ overflow: 'hidden', borderRadius: 14 }}>
          <Sweep start={530} duration={24} strength={0.4} />
        </Abs>
      </Float>
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.coffeeSlot, CLICKS.coffeeConfirm]} opacity={prog(frame, 526, 6) * (1 - prog(frame, 606, 8))} />
    </Stage>
  );
};

// ---------- alumni: profile card, request, waiting for the alumnus to confirm ----------
export const Alumni = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'alumni')) return null;
  const card = box('alumni_people', 'card');
  const CS = 1.2, CW = card.w * CS, CH = card.h * CS;
  const cf = prog(frame, 615, 14, EASE_OUT);
  const cardOut = prog(frame, CLICKS.alumniOpen + 1, 10);
  const cardPose: Pose = { x: mix(2300, 1150, cf), y: 520, ry: mix(-30, 0, cf), scale: 1 + cardOut * 0.15, opacity: 1 - cardOut };
  const learn = box('alumni_people', 'learn');
  const learnPt = toScreen({ x: 1150, y: 520 }, CW, CH, card, CS, learn.x + learn.w / 2, learn.y + learn.h / 2);

  const S = 1.0, R: Rect = { x: 270, y: 190, w: 1120, h: 610 };
  const W = R.w * S, H = R.h * S;
  const wg = prog(frame, CLICKS.alumniOpen + 1, 16, EASE_OUT);
  const out = prog(frame, 710, 12, EASE_IN_OUT);
  const pose: Pose = { x: mix(1150, 1250, wg) - out * 200, y: mix(520, 450, wg), scale: mix(0.6, 1, wg) * (1 - out * 0.1), opacity: prog(frame, CLICKS.alumniOpen + 1, 8) * (1 - out) };
  const local = (x: number, y: number) => ({ x: (x - R.x) * S, y: (y - R.y) * S });
  const reqPt = toScreen({ x: 1250, y: 450 }, W, H, R, S, 335, 771);
  const typed = Math.floor(prog(frame, MOMENTS.alumniTyping, 18, (t) => t) * 15) / 15;
  const reqO = prog(frame, CLICKS.alumniRequest + 1, 6, EASE_IN_OUT);
  const ZR: Rect = { x: 271, y: 678, w: 540, h: 126 };
  const zp = prog(frame, CLICKS.alumniRequest + 7, 16, LAND);
  const ZS = S * mix(1, 1.3, zp);
  const z0 = local(ZR.x, ZR.y);
  const btn = { x: (295 - ZR.x) * ZS, y: (752 - ZR.y) * ZS };
  const cur = pathAt(frame, [[618, 1450, 950], [627, learnPt.x, learnPt.y], [634, learnPt.x, learnPt.y], [660, reqPt.x + 40, reqPt.y + 70], [672, reqPt.x, reqPt.y], [682, reqPt.x, reqPt.y], [700, reqPt.x + 90, reqPt.y + 90]]);
  return (
    <Stage>
      {cardOut < 1 && (
        <Float pose={cardPose} w={CW} h={CH} bg={T.surface} glow={0.6}>
          <Shot name="alumni_people" region={card} s={CS} />
        </Float>
      )}
      {frame > CLICKS.alumniOpen && (
        <Float pose={pose} w={W} h={H} bg={T.surface} glow={0.5}>
          <Shot name="alumni_person" region={R} s={S} />
          {frame < CLICKS.alumniRequest + 2 && (() => {
            const p = local(292 + typed * 177, 604);
            return <Abs x={p.x} y={p.y} w={(1365 - 292 - typed * 177) * S} h={50 * S} style={{ background: T.surface }} />;
          })()}
          <Shot name="alumni_requested" region={R} s={S} style={{ opacity: reqO }} />
          {zp > 0 && (
            <>
              <Abs x={0} y={0} w={W} h={H} style={{ background: `rgba(10,14,30,${0.3 * zp})` }} />
              <Abs x={z0.x + 24 * zp} y={z0.y - 60 * zp} w={ZR.w * ZS} h={ZR.h * ZS} style={{ background: T.surface, borderRadius: 16, boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 40px rgba(61,123,255,${0.4 * zp})` }}>
                <Shot name="alumni_requested" region={ZR} s={ZS} />
                {[CLICKS.alumniRequest + 14, CLICKS.alumniRequest + 30].map((f) => {
                  const q = prog(frame, f, 20, EASE_OUT);
                  if (q <= 0 || q >= 1) return null;
                  return <Abs key={f} x={btn.x - 4} y={btn.y - 4} w={104 * ZS + 8} h={38 * ZS + 8} style={{ borderRadius: 12, border: `2px solid rgba(110,140,200,${0.85 * (1 - q)})`, transform: `scale(${1 + q * 0.25})` }} />;
                })}
              </Abs>
            </>
          )}
        </Float>
      )}
      <SubCaption text="等待校友本人确认" from={CLICKS.alumniRequest + 8} to={716} />
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.alumniOpen, CLICKS.alumniRequest]} opacity={prog(frame, 618, 5) * (1 - prog(frame, 696, 8))} />
    </Stage>
  );
};