import type { ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Avatar, Chip, Icon, P, Tag, Txt } from '../kit/base';
import { BrandMark } from '../kit/fx';
import { Slot } from '../kit/product';
import { EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';
import { ICON_PULSE, iconPoint, iconStroke, Line, LINE_W, type Pt, resample, upToX } from './kit';

const B = (n: number) => Math.round(n * 21);
const LINE_Y = 540;
const CHIMES = [0.5, 1, 1.5, 2, 2.5, 3].map(B);
const TIP = 74;
const CARD_S = 1.5;

type Feat = { name: string; icon: string; up: boolean; w: number; h: number; node: (f: number, at: number) => ReactNode };
const FEATS: Feat[] = [
  { name: '活动', icon: 'calendar', up: true, w: 330, h: 54, node: (f, at) => <div style={{ display: 'flex', gap: 8 }}>{['全部', '校园成员活动', '学校邮件活动'].map((l, i) => <Chip key={l} label={l} active={i === 0 ? 1 - prog(f, at + 12, 6) : i === 2 ? prog(f, at + 12, 6) : 0} />)}</div> },
  { name: '社区', icon: 'message', up: false, w: 320, h: 56, node: (f, at) => <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Txt size={15} weight={700}>推荐一门很有收获的选修课</Txt><Icon name="bookmark" size={17} color={P.blue} fill={prog(f, at + 14, 4) > 0.5 ? P.blue : 'none'} /></div> },
  { name: '找搭子', icon: 'users', up: true, w: 240, h: 64, node: (f, at) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex' }}>{['陈', '许', '林'].map((c, i) => <Avatar key={c} ch={c} size={32} style={{ marginLeft: i ? -8 : 0, border: '2px solid #fff', transform: `scale(${prog(f, at + 6 + i * 2, 8, LAND)})` }} />)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="users" size={16} color={P.blue} /><Txt size={14} weight={600}>3 / 4 人</Txt></div>
    </div>
  ) },
  { name: 'Coffee Chat', icon: 'clock', up: false, w: 300, h: 74, node: () => <Slot date="10月15日星期四" time="15:00 – 15:30" /> },
  { name: '校友同行', icon: 'check', up: true, w: 280, h: 60, node: () => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar ch="顾" size={32} style={{ background: '#F2F2F4', color: P.ink }} /><Txt size={15} weight={700}>顾言川</Txt><Tag label="认证校友" tone="grey" /></div> },
  { name: '校园 AI', icon: 'search', up: false, w: 310, h: 60, node: () => <div style={{ background: P.action, color: '#fff', borderRadius: 16, padding: '9px 16px', fontFamily: P.font, fontSize: 14, whiteSpace: 'nowrap' }}>怎么预约老师的 Coffee Chat？</div> },
];
export const MODULES = FEATS.map((f) => f.name);
const featX = (i: number) => 310 + i * 262;
const featCardY = (f: Feat) => (f.up ? LINE_Y - TIP - 66 - (f.h * CARD_S) / 2 : LINE_Y + TIP + 66 + (f.h * CARD_S) / 2);

const LONG: Pt[] = [[-80, LINE_Y]];
FEATS.forEach((f, i) => {
  const x = featX(i), dir = f.up ? -1 : 1;
  LONG.push([x - 42, LINE_Y], [x - 20, LINE_Y - dir * 12], [x, LINE_Y + dir * TIP], [x + 18, LINE_Y - dir * 20], [x + 36, LINE_Y]);
});
LONG.push([2000, LINE_Y]);

const ICON = { x: 960, y: 400, s: 216 };
const iconPt = iconPoint(ICON.x, ICON.y, ICON.s);
const ICON_W = iconStroke(ICON.s);
const N = 160;
const LONG_R = resample(LONG, N);
const ICON_R = resample(ICON_PULSE.map(iconPt), N);

const Wordmark = ({ f, at, tagline }: { f: number; at: number; tagline: string }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: P.font, color: '#fff' }}>
    <div style={{ display: 'inline-flex', fontSize: 92, fontWeight: 600, letterSpacing: '0.05em', textShadow: '0 0 40px rgba(61,123,255,0.45)' }}>
      {[...'BNBU 伴学'].map((ch, i) => {
        const p = prog(f, at + i * 1.5, 14);
        return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>{ch}</span>;
      })}
    </div>
    <div style={{ marginTop: 18, fontSize: 40, fontWeight: 500, letterSpacing: '0.22em', color: 'rgba(222,230,255,0.9)', opacity: prog(f, at + 10, 12) }}>{tagline}</div>
  </div>
);

const ModuleRow = ({ f, at }: { f: number; at: number }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', justifyContent: 'center', gap: 18, fontFamily: P.font, fontSize: 30, fontWeight: 500, color: 'rgba(205,218,255,0.92)', letterSpacing: '0.06em' }}>
    {MODULES.map((m, i) => {
      const p = prog(f, at + i * 2, 10);
      return <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{i > 0 && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#6E98FF' }} />}{m}</span>;
    })}
  </div>
);

const Icon3 = ({ f, at, id }: { f: number; at: number; id: string }) => {
  const square = prog(f, at, 14, LAND);
  const ring = prog(f, at + 3, 18, EASE_OUT);
  return (
    <>
      <div style={{ position: 'absolute', left: ICON.x - ICON.s / 2, top: ICON.y - ICON.s / 2, transform: `scale(${mix(0.4, 1, square)})`, opacity: prog(f, at, 4) }}>
        <BrandMark size={ICON.s} draw={1} glow={1 - prog(f, at + 10, 30)} id={id} />
      </div>
      {ring > 0 && ring < 1 && (
        <div style={{ position: 'absolute', left: ICON.x - 460 * ring, top: ICON.y - 460 * ring, width: 920 * ring, height: 920 * ring, borderRadius: '50%', border: `1.5px solid rgba(160,190,255,${0.7 * (1 - ring)})`, boxShadow: `0 0 50px rgba(61,123,255,${0.5 * (1 - ring)})` }} />
      )}
    </>
  );
};

const morph = (fold: number): Pt[] => LONG_R.map((p, i): Pt => [mix(p[0], ICON_R[i][0], fold), mix(p[1], ICON_R[i][1], fold)]);

// 0–7 s: the pulse runs past the six modules, folds into the icon, then extends out of it.
export const OPENING_FRAMES = 212;
export const Opening = () => {
  const f = useCurrentFrame();
  const hx = keys(f, [[2, -80], ...FEATS.map((_, i): [number, number] => [CHIMES[i], featX(i)]), [86, 2000]], (t) => t);
  const fold = prog(f, B(5), 18, EASE_IN_OUT);
  const ext = prog(f, B(9) - 6, 14, EASE_IN_OUT);
  const pan = prog(f, B(9) + 6, 18, (t) => t * t);
  const end = iconPt(ICON_PULSE[ICON_PULSE.length - 1]);
  const extHead = mix(end[0], 2000, ext) + pan * 800;
  return (
    <AbsoluteFill style={{ transform: `translateX(${-pan * 900}px)`, opacity: 1 - prog(f, 204, 8) }}>
      {FEATS.map((ft, i) => {
        const at = CHIMES[i];
        const pop = prog(f, at, 12, LAND);
        if (pop <= 0) return null;
        const g = prog(f, B(5) - 2, 14, (t) => t * t);
        const x0 = featX(i), cy = featCardY(ft);
        const x = mix(x0, ICON.x, g), y = mix(cy, ICON.y, g);
        const s = CARD_S * mix(1, 0.1, g) * mix(0.6, 1, pop);
        const drift = Math.sin((f + i * 23) / 26) * 5 * (1 - g);
        const tipY = LINE_Y + (ft.up ? -TIP : TIP);
        const tickTo = ft.up ? cy + (ft.h * CARD_S) / 2 + 6 : cy - (ft.h * CARD_S) / 2 - 6;
        const tick = prog(f, at, 8, EASE_OUT) * (1 - prog(f, B(5) - 4, 6));
        const labelY = ft.up ? cy - (ft.h * CARD_S) / 2 - 58 : cy + (ft.h * CARD_S) / 2 + 18;
        return (
          <div key={ft.name} style={{ opacity: Math.min(1, pop * 1.5) * (1 - prog(f, B(5) + 8, 6)) }}>
            {tick > 0 && <Line id={`tick-${i}`} w={1.4} pts={[[x0, tipY], [x0, mix(tipY, tickTo, tick)]]} />}
            <div style={{ position: 'absolute', left: x - ft.w / 2, top: y + drift - ft.h / 2, width: ft.w, height: ft.h, transform: `scale(${s})` }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: P.surface, boxShadow: '0 0 0 1px rgba(170,195,255,0.55), 0 0 36px rgba(61,123,255,0.45), 0 18px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ft.node(f, at)}</div>
            </div>
            <div style={{ position: 'absolute', left: x0 - 200, width: 400, top: labelY + drift, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: prog(f, at + 2, 12) * (1 - g), transform: `translateY(${(1 - prog(f, at + 2, 12)) * (ft.up ? 12 : -12)}px)`, fontFamily: P.font, fontSize: 36, fontWeight: 600, color: '#fff', letterSpacing: '0.06em', textShadow: '0 0 22px rgba(61,123,255,0.55)' }}>
              <Icon name={ft.icon} size={28} color="#9DB8FF" stroke={2.2} />{ft.name}
            </div>
          </div>
        );
      })}
      {f >= 118 && <Icon3 f={f} at={118} id="open" />}
      {f < 130 && <Line id="o-line" pts={fold > 0 ? morph(fold) : upToX(LONG, hx)} w={mix(LINE_W, ICON_W, fold)} head={fold === 0 && f < 86} opacity={1 - prog(f, 124, 6)} />}
      {ext > 0 && (
        <>
          <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <polygon points={`${end[0] - 4},${end[1] - ICON_W / 2} ${end[0] + 70},${end[1] - LINE_W / 2} ${end[0] + 70},${end[1] + LINE_W / 2} ${end[0] - 4},${end[1] + ICON_W / 2}`} fill="#F5F8FF" />
          </svg>
          <Line id="o-ext" pts={[[end[0] + 60, end[1]], [extHead, end[1]]]} head />
        </>
      )}
      <Wordmark f={f} at={126} tagline="你的校园，一处展开" />
      <ModuleRow f={f} at={144} />
    </AbsoluteFill>
  );
};

// Last 5.7 s: the same line returns with every module on it and folds back into the icon.
export const FINALE_FRAMES = 170;
export const Finale = () => {
  const f = useCurrentFrame();
  const hx = keys(f, [[0, -80], [28, 2000]], (t) => t);
  const fold = prog(f, 34, 18, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: 1 - prog(f, FINALE_FRAMES - 18, 18) }}>
      {FEATS.map((ft, i) => {
        const x = featX(i);
        const at = mix(0, 28, (x + 80) / 2080);
        const p = prog(f, at, 10) * (1 - prog(f, 32, 6));
        if (p <= 0) return null;
        return (
          <div key={ft.name} style={{ position: 'absolute', left: x - 200, width: 400, top: ft.up ? LINE_Y - TIP - 64 : LINE_Y + TIP + 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: p, fontFamily: P.font, fontSize: 34, fontWeight: 600, color: '#fff', letterSpacing: '0.06em', textShadow: '0 0 22px rgba(61,123,255,0.55)' }}>
            <Icon name={ft.icon} size={26} color="#9DB8FF" stroke={2.2} />{ft.name}
          </div>
        );
      })}
      {f >= 48 && <Icon3 f={f} at={48} id="end" />}
      {f < 60 && <Line id="f-line" pts={fold > 0 ? morph(fold) : upToX(LONG, hx)} w={mix(LINE_W, ICON_W, fold)} head={fold === 0} opacity={1 - prog(f, 54, 6)} />}
      <Wordmark f={f} at={58} tagline="让校园生活，顺手发生" />
    </AbsoluteFill>
  );
};
