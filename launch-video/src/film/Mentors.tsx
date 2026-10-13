import { useCurrentFrame } from 'remotion';
import { Avatar, Box, Btn, Icon, Kicker, P, Tag, Txt } from '../kit/base';
import { Burst, Cam, camToScreen, typed, Win } from '../kit/fx';
import { AlumniBooking, AlumniCard, Slot, SLOTS, TeacherCard } from '../kit/product';
import { EASE_IN_OUT, EASE_OUT, LAND, prog } from '../lib/motion';
import { camKeys, enter, FeatureTitle, Focused, Tap, Wiped } from './kit';

// ---------------- Coffee Chat with a teacher ----------------
export const COFFEE_FRAMES = 254;
const C_IN = 42;
const SLOT = 112;
const CONFIRM = 192;
const TOPIC = '想请教数据科学方向的选课与科研入门。';
const slotPos = (i: number) => ({ x: 22 + (i % 2) * 312, y: 96 + Math.floor(i / 2) * 86 });

export const COFFEE_SFX = [
  { at: C_IN - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.26 },
  { at: 86, src: 'sfx/scroll-short.wav', volume: 0.28, len: 22 },
  { at: SLOT - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: SLOT + 1, src: 'sfx/pop-3.wav', volume: 0.22, len: 10 },
  { at: 124, src: 'sfx/scroll-short.wav', volume: 0.3, len: 20 },
  { at: 140, src: 'sfx/keyboard.mp3', volume: 0.26, len: 28 },
  { at: 172, src: 'sfx/scroll-short.wav', volume: 0.26, len: 18 },
  { at: CONFIRM - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
  { at: CONFIRM + 2, src: 'sfx/sparkle-touch.mp3', volume: 0.24 },
];

export const Coffee = () => {
  const f = useCurrentFrame();
  const cam = camKeys(f, {
    z: [[C_IN, 1.15], [84, 1.15], [104, 1.75], [124, 1.75], [138, 1.8], [172, 1.8], [184, 1.9], [204, 1.9], [226, 1.5]],
    fx: [[C_IN, 95], [84, 95], [104, 330], [124, 330], [138, 330], [172, 330], [184, 420], [204, 420], [226, 330]],
    fy: [[C_IN, 280], [84, 280], [104, 210], [124, 210], [138, 412], [172, 412], [184, 490], [204, 490], [226, 400]],
    rx: [[C_IN, 12], [84, 0]],
    ry: [[C_IN, 12], [84, 0], [104, -6], [226, -4]],
  }, { opacity: prog(f, C_IN, 8) });
  const sel = prog(f, SLOT + 1, 6, EASE_OUT);
  const booked = prog(f, CONFIRM + 1, 8, EASE_OUT);
  const text = typed(TOPIC, prog(f, 140, 26, (t) => t));
  const sp = slotPos(4);
  const slotPt = camToScreen(cam, sp.x + 150, sp.y + 37);
  const focus = prog(f, 136, 10, EASE_IN_OUT) * (1 - prog(f, 172, 10));
  const page = () => (
    <Cam cam={cam}>
      <div style={{ position: 'absolute', left: -470, top: 40, borderRadius: 14, boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(61,123,255,0.35)', ...enter(f, C_IN, 18) }}><TeacherCard /></div>
      <Win x={0} y={0} w={660} h={560} radius={18} bg={P.surface} glow={0.5} style={enter(f, C_IN + 6, 18)}>
        <Box x={22} y={20}><Kicker>AVAILABLE TIMES</Kicker><Txt size={18} weight={700} style={{ marginTop: 4 }}>选择预约时间</Txt><Txt size={11} color={P.muted} style={{ marginTop: 4 }}>按老师开放的起止时间交流；预约符合条件即成立。</Txt></Box>
        <Box x={612} y={30}><Icon name="calendar" size={22} color={P.blue} /></Box>
        {SLOTS.map((s, i) => {
          const p = prog(f, C_IN + 10 + i * 3, 12, LAND);
          const q = slotPos(i);
          return <Box key={i} x={q.x} y={q.y} style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 26}px) scale(${(0.92 + 0.08 * p) * (i === 4 ? 1 + 0.03 * Math.sin(Math.PI * sel) : 1)})` }}><Slot {...s} sel={i === 4 ? sel : 0} booked={i === 4 ? booked : 0} /></Box>;
        })}
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
          <Icon name="check" size={14} color={P.success} stroke={2.6} style={{ clipPath: `inset(0 ${(1 - prog(f, CONFIRM + 4, 8)) * 100}% 0 0)` }} />
          <Txt size={12} weight={600} color={P.success}>预约成功，老师已收到通知。</Txt>
        </Box>
        <Tap id="cf-slot" f={f} at={SLOT} x={sp.x} y={sp.y} w={300} h={74} r={12} />
        <Tap id="cf-confirm" f={f} at={CONFIRM} x={530} y={461} w={96} h={34} r={9} />
      </Win>
    </Cam>
  );
  return (
    <Wiped f={f} at={COFFEE_FRAMES - 24}>
      <FeatureTitle f={f} text="Coffee Chat" id="cf" />
      {f >= C_IN && <Focused y={camToScreen(cam, 0, 412).y} band={80} amount={focus} render={page} />}
      <Burst frame={f} at={CONFIRM + 3} x={slotPt.x} y={slotPt.y} color="#3DBB61" r={110} n={12} />
    </Wiped>
  );
};

// ---------------- alumni exchange request ----------------
export const ALUMNI_FRAMES = 224;
const A_IN = 42;
const LEARN = 98;
const REQUEST = 164;
const QUESTION = '想了解产品经理岗位的实习准备。';

export const ALUMNI_SFX = [
  { at: A_IN - 2, src: 'sfx/swoosh-quick.mp3', volume: 0.28 },
  { at: LEARN - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: LEARN + 3, src: 'sfx/warp-slide.mp3', volume: 0.2 },
  { at: LEARN + 12, src: 'sfx/pop-3.wav', volume: 0.24, len: 10 },
  { at: 126, src: 'sfx/keyboard.mp3', volume: 0.26, len: 26 },
  { at: REQUEST - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
  { at: REQUEST + 2, src: 'sfx/sparkle-touch.mp3', volume: 0.2 },
];

export const Alumni = () => {
  const f = useCurrentFrame();
  const cam = camKeys(f, {
    z: [[A_IN, 1.85], [90, 2.05], [LEARN + 6, 2.05], [124, 1.95], [REQUEST + 30, 1.8]],
    fx: [[A_IN, 230], [90, 230], [LEARN + 6, 230], [124, 310], [REQUEST + 30, 310]],
    fy: [[A_IN, 160], [90, 150], [LEARN + 6, 150], [124, 130], [REQUEST + 30, 130]],
    rx: [[A_IN, 10], [80, 0]],
    ry: [[A_IN, -14], [80, 0], [124, -5]],
  }, { opacity: prog(f, A_IN, 8) });
  const flip = prog(f, LEARN + 4, 14, EASE_IN_OUT);
  const text = typed(QUESTION, prog(f, 126, 24, (t) => t));
  const requested = prog(f, REQUEST + 1, 10, EASE_OUT);
  const pill = prog(f, LEARN + 12, 12, EASE_OUT);
  return (
    <Wiped f={f} at={ALUMNI_FRAMES - 24}>
      <FeatureTitle f={f} text="校友同行" id="al" />
      {f >= A_IN && (
        <Cam cam={cam}>
          <div style={{ position: 'absolute', left: 0, top: 0, ...enter(f, A_IN, 18) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '230px 150px', transform: `rotateY(${flip * 90}deg)`, opacity: flip < 0.5 ? 1 : 0, borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(61,123,255,0.4)' }}>
              <AlumniCard />
              <Tap id="al-learn" f={f} at={LEARN} x={24} y={234} w={107} h={38} r={9} />
            </div>
          </div>
          {flip >= 0.5 && (
            <>
              <div style={{ position: 'absolute', left: 0, top: -70, opacity: pill, transform: `translateY(${(1 - pill) * 16}px)`, display: 'flex', alignItems: 'center', gap: 10, background: P.surface, borderRadius: 24, padding: '6px 14px 6px 6px', boxShadow: '0 12px 30px rgba(0,0,0,0.4), 0 0 30px rgba(61,123,255,0.35)' }}>
                <Avatar ch="顾" size={30} style={{ background: '#F2F2F4', color: P.ink }} /><Txt size={13} weight={700}>顾言川</Txt><Tag label="认证校友" tone="grey" />
              </div>
              <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '310px 150px', transform: `rotateY(${(1 - flip) * -90}deg)`, borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(61,123,255,0.4)' }}>
                <AlumniBooking typed={text} requested={requested} />
                <Tap id="al-req" f={f} at={REQUEST} x={24} y={236} w={82} h={38} r={9} />
              </div>
            </>
          )}
        </Cam>
      )}
    </Wiped>
  );
};
