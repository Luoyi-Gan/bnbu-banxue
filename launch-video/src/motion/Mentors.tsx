import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Avatar, Box, Btn, Icon, Kicker, P, Tag, Txt } from '../kit/base';
import { Burst, typed, Win } from '../kit/fx';
import { AlumniBooking, AlumniCard, Slot, SLOTS, TeacherCard } from '../kit/product';
import { Cursor, pathAt, SubCaption, Sweep } from '../lib/ui';
import { EASE_IN_OUT, EASE_OUT, LAND, mix, prog } from '../lib/motion';
import { CLICKS, MOMENTS, SHOTS } from '../timeline';

const live = (frame: number, key: keyof typeof SHOTS) => frame >= SHOTS[key].from && frame < SHOTS[key].from + SHOTS[key].duration;
const BW = { x: 860, y: 120, k: 1.3 };
const slotPos = (i: number) => ({ x: 22 + (i % 2) * 312, y: 96 + Math.floor(i / 2) * 86 });
const TOPIC = '想请教数据科学方向的选课与科研入门。';

export const Coffee = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'coffee')) return null;
  const ci = prog(frame, 510, 16, EASE_OUT);
  const xo = prog(frame, 612, 14, EASE_IN_OUT);
  const sel = prog(frame, CLICKS.coffeeSlot + 1, 6, EASE_OUT);
  const booked = prog(frame, CLICKS.coffeeConfirm + 1, 8, EASE_OUT);
  const text = typed(TOPIC, prog(frame, MOMENTS.coffeeTyping, 20, (t) => t));
  const sp = slotPos(4);
  const slotPt = { x: BW.x + (sp.x + 150) * BW.k, y: BW.y + (sp.y + 37) * BW.k };
  const confirmPt = { x: BW.x + 578 * BW.k, y: BW.y + 478 * BW.k };
  const cur = pathAt(frame, [[526, 1350, 1000], [552, slotPt.x, slotPt.y], [560, slotPt.x, slotPt.y], [578, confirmPt.x - 80, confirmPt.y + 40], [583, confirmPt.x, confirmPt.y], [600, confirmPt.x, confirmPt.y], [614, confirmPt.x + 60, confirmPt.y + 60]]);
  const tc = prog(frame, 516, 16, EASE_OUT);
  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      <div style={{ position: 'absolute', left: mix(-500, 200, tc) - xo * 500, top: 150, transformOrigin: '0 0', transform: `scale(1.25) rotateY(${(1 - tc) * 30 + xo * 20}deg)`, opacity: tc * (1 - xo), borderRadius: 14, boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(61,123,255,0.35)' }}>
        <TeacherCard />
      </div>
      <div style={{ position: 'absolute', left: mix(2200, BW.x, ci) - xo * 800, top: BW.y, transformOrigin: '0 0', transform: `scale(${BW.k}) rotateY(${(1 - ci) * -24 + xo * 24}deg)`, opacity: 1 - xo, filter: xo > 0.02 ? `blur(${xo * 6}px)` : undefined }}>
        <Win x={0} y={0} w={660} h={560} radius={18} bg={P.surface} glow={0.5}>
          <Box x={22} y={20}><Kicker>AVAILABLE TIMES</Kicker><Txt size={18} weight={700} style={{ marginTop: 4 }}>选择预约时间</Txt><Txt size={11} color={P.muted} style={{ marginTop: 4 }}>按老师开放的起止时间交流；预约符合条件即成立。</Txt></Box>
          <Box x={612} y={30}><Icon name="calendar" size={22} color={P.blue} /></Box>
          {SLOTS.map((s, i) => {
            const p = prog(frame, 518 + i * 3, 12, LAND);
            const q = slotPos(i);
            return <Box key={i} x={q.x} y={q.y} style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 26}px) scale(${(0.92 + 0.08 * p) * (i === 4 ? 1 + 0.03 * Math.sin(Math.PI * sel) : 1)})` }}><Slot {...s} sel={i === 4 ? sel : 0} booked={i === 4 ? booked : 0} /></Box>;
          })}
          <Box x={22} y={96} w={616} h={246} style={{ overflow: 'hidden', borderRadius: 12 }}><Sweep start={534} duration={22} strength={0.35} /></Box>
          <Box x={22} y={358}><Txt size={14} weight={600}>想交流的问题</Txt></Box>
          <Box x={22} y={386} w={616} h={52} style={{ borderRadius: 10, border: `1.5px solid ${sel > 0.5 && booked < 0.5 ? P.ink : P.line}`, padding: '10px 12px', boxSizing: 'border-box' }}>
            <Txt size={12.5} color={text ? P.ink : '#8E8E93'}>{text || '请填写交流主题或问题'}{text && text.length < [...TOPIC].length ? <span style={{ color: P.blue }}>|</span> : null}</Txt>
          </Box>
          <Box x={22} y={452} w={616} h={52} style={{ borderRadius: 12, background: '#F7F9FF', border: `1px solid ${P.line}` }}>
            <Box x={16} y={17} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="pin" size={15} color={P.blue} /><Txt size={12} weight={700} color="#1F3A60">T6-512 办公室</Txt>
              <Txt size={11} color={P.muted} style={{ marginLeft: 8 }}>{sel > 0.5 ? '10月15日星期四 · 15:00' : '请先选择一个时段'}</Txt>
            </Box>
            <Box x={508} y={9}><Btn label="确认预约" icon="arrow" kind={sel > 0.5 ? 'primary' : 'disabled'} w={96} style={{ height: 34, fontSize: 12 }} /></Box>
          </Box>
          <Box x={22} y={518} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: booked }}>
            <Icon name="check" size={14} color={P.success} stroke={2.6} style={{ clipPath: `inset(0 ${(1 - prog(frame, CLICKS.coffeeConfirm + 4, 8)) * 100}% 0 0)` }} />
            <Txt size={12} weight={600} color={P.success}>预约成功，老师已收到通知。</Txt>
          </Box>
        </Win>
      </div>
      <Burst frame={frame} at={CLICKS.coffeeConfirm + 3} x={slotPt.x} y={slotPt.y} color="#3DBB61" r={110} n={12} />
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.coffeeSlot, CLICKS.coffeeConfirm]} opacity={prog(frame, 526, 6) * (1 - prog(frame, 606, 8))} />
    </AbsoluteFill>
  );
};

const QUESTION = '想了解产品经理岗位的实习准备。';
export const Alumni = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'alumni')) return null;
  const CA = { x: 860, y: 250, k: 1.35 };
  const BK = { x: 800, y: 220, k: 1.45 };
  const flip = prog(frame, 615, 16, EASE_OUT);
  const m = prog(frame, CLICKS.alumniOpen + 1, 14, EASE_IN_OUT);
  const out = prog(frame, 710, 12, EASE_IN_OUT);
  const rect = { x: mix(CA.x, BK.x, m), y: mix(CA.y, BK.y, m), w: mix(460 * CA.k, 620 * BK.k, m), h: mix(300 * CA.k, 300 * BK.k, m) };
  const learnPt = { x: CA.x + 72 * CA.k, y: CA.y + 253 * CA.k };
  const reqPt = { x: BK.x + 65 * BK.k, y: BK.y + 255 * BK.k };
  const text = typed(QUESTION, prog(frame, MOMENTS.alumniTyping, 18, (t) => t));
  const requested = prog(frame, CLICKS.alumniRequest + 1, 10, EASE_OUT);
  const cur = pathAt(frame, [[618, 1450, 950], [627, learnPt.x, learnPt.y], [634, learnPt.x, learnPt.y], [660, reqPt.x + 40, reqPt.y + 70], [672, reqPt.x, reqPt.y], [682, reqPt.x, reqPt.y], [700, reqPt.x + 90, reqPt.y + 90]]);
  const btnC = { x: BK.x + 78 * BK.k, y: BK.y + 255 * BK.k };
  const pill = prog(frame, CLICKS.alumniOpen + 8, 12, EASE_OUT);
  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      <div style={{ position: 'absolute', left: rect.x + (1 - flip) * 700 - out * 200, top: rect.y, width: rect.w, height: rect.h, borderRadius: 18, overflow: 'hidden', background: P.surface, transform: `rotateY(${(1 - flip) * -70}deg) scale(${1 - out * 0.08})`, opacity: Math.min(1, flip * 2) * (1 - out), boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 80px rgba(61,123,255,0.4)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${rect.w / 460})`, opacity: 1 - prog(frame, CLICKS.alumniOpen + 1, 7) }}><AlumniCard /></div>
        <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${rect.w / 620})`, opacity: prog(frame, CLICKS.alumniOpen + 6, 8) }}><AlumniBooking typed={text} requested={requested} /></div>
      </div>
      <div style={{ position: 'absolute', left: BK.x, top: BK.y - 74, opacity: pill * (1 - out), transform: `translateY(${(1 - pill) * 20}px) scale(1.3)`, transformOrigin: '0 0', display: 'flex', alignItems: 'center', gap: 10, background: P.surface, borderRadius: 24, padding: '6px 14px 6px 6px', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
        <Avatar ch="顾" size={30} style={{ background: '#F2F2F4', color: P.ink }} /><Txt size={13} weight={700}>顾言川</Txt><Tag label="认证校友" tone="grey" />
      </div>
      {[CLICKS.alumniRequest + 10, CLICKS.alumniRequest + 26].map((f) => {
        const q = prog(frame, f, 22, EASE_OUT);
        if (q <= 0 || q >= 1) return null;
        const w = 108 * BK.k * (1 + q * 0.5), h = 38 * BK.k * (1 + q * 0.9);
        return <div key={f} style={{ position: 'absolute', left: btnC.x - w / 2, top: btnC.y - h / 2, width: w, height: h, borderRadius: 16, border: `2px solid rgba(160,185,235,${0.9 * (1 - q)})` }} />;
      })}
      <SubCaption text="等待校友本人确认" from={CLICKS.alumniRequest + 8} to={716} />
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.alumniOpen, CLICKS.alumniRequest]} opacity={prog(frame, 618, 5) * (1 - prog(frame, 696, 8))} />
    </AbsoluteFill>
  );
};
