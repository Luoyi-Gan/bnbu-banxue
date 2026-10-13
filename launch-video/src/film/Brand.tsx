import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { Avatar, Chip, Icon, P, Tag, Txt } from '../kit/base';
import { BrandMark } from '../kit/fx';
import { Slot } from '../kit/product';
import { EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';
import { ICON_PULSE, iconPoint, iconStroke, Line, LINE_W, type Pt, resample, upToX, useF } from './kit';

const B = (n: number) => Math.round(n * 21);
const LINE_Y = 540;
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

// Opening: the icon and wordmark first; the icon slides left and its pulse line runs out past the six modules.
const ICON_AT = B(0.5);
const MOVE = B(3);
const RUN = B(4);
const OPEN_CHIMES = [4.5, 5, 5.5, 6, 6.5, 7].map(B);
const SMALL_S = 120;
// Small icon placed so the end of its pulse sits exactly on the feature line.
const SMALL = { x: 120, y: LINE_Y + 0.0394 * SMALL_S, s: SMALL_S };
const openX = (i: number) => 430 + i * 248;
const smallEnd = iconPoint(SMALL.x, SMALL.y, SMALL.s)(ICON_PULSE[ICON_PULSE.length - 1]);
const RUN_LINE: Pt[] = [[smallEnd[0], LINE_Y]];
FEATS.forEach((ft, i) => {
  const x = openX(i), dir = ft.up ? -1 : 1;
  RUN_LINE.push([x - 42, LINE_Y], [x - 20, LINE_Y - dir * 12], [x, LINE_Y + dir * TIP], [x + 18, LINE_Y - dir * 20], [x + 36, LINE_Y]);
});
RUN_LINE.push([2000, LINE_Y]);

export const OPENING_FRAMES = 212;
export const Opening = () => {
  const f = useF();
  const square = prog(f, ICON_AT, 14, LAND);
  const ring = prog(f, ICON_AT + 3, 18, EASE_OUT);
  const mv = prog(f, MOVE, 20, EASE_IN_OUT);
  const icon = { x: mix(ICON.x, SMALL.x, mv), y: mix(ICON.y, SMALL.y, mv), s: mix(ICON.s, SMALL.s, mv) };
  const hx = keys(f, [[RUN, smallEnd[0]], ...FEATS.map((_, i): [number, number] => [OPEN_CHIMES[i], openX(i)]), [B(7.6), 2000]], (t) => t);
  const pan = prog(f, B(9) + 6, 18, (t) => t * t);
  return (
    <AbsoluteFill style={{ transform: `translateX(${-pan * 900}px)`, opacity: 1 - prog(f, 204, 8) }}>
      {FEATS.map((ft, i) => {
        const at = OPEN_CHIMES[i];
        const pop = prog(f, at, 12, LAND);
        if (pop <= 0) return null;
        const x = openX(i), cy = featCardY(ft);
        const drift = Math.sin((f + i * 23) / 26) * 5;
        const tipY = LINE_Y + (ft.up ? -TIP : TIP);
        const tickTo = ft.up ? cy + (ft.h * CARD_S) / 2 + 6 : cy - (ft.h * CARD_S) / 2 - 6;
        const tick = prog(f, at, 8, EASE_OUT);
        const labelY = ft.up ? cy - (ft.h * CARD_S) / 2 - 58 : cy + (ft.h * CARD_S) / 2 + 18;
        const lab = prog(f, at + 2, 12);
        return (
          <div key={ft.name} style={{ opacity: Math.min(1, pop * 1.5) }}>
            <Line id={`tick-${i}`} w={1.4} pts={[[x, tipY], [x, mix(tipY, tickTo, tick)]]} />
            <div style={{ position: 'absolute', left: x - ft.w / 2, top: cy + drift - ft.h / 2, width: ft.w, height: ft.h, transform: `scale(${CARD_S * mix(0.6, 1, pop)})` }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: P.surface, boxShadow: '0 0 0 1px rgba(170,195,255,0.55), 0 0 36px rgba(61,123,255,0.45), 0 18px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ft.node(f, at)}</div>
            </div>
            <div style={{ position: 'absolute', left: x - 200, width: 400, top: labelY + drift, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, opacity: lab, transform: `translateY(${(1 - lab) * (ft.up ? 12 : -12)}px)`, fontFamily: P.font, fontSize: 36, fontWeight: 600, color: '#fff', letterSpacing: '0.06em', textShadow: '0 0 22px rgba(61,123,255,0.55)' }}>
              <Icon name={ft.icon} size={28} color="#9DB8FF" stroke={2.2} />{ft.name}
            </div>
          </div>
        );
      })}
      {f >= ICON_AT && (
        <div style={{ position: 'absolute', left: icon.x - icon.s / 2, top: icon.y - icon.s / 2, width: icon.s, height: icon.s, transform: `scale(${mix(0.4, 1, square)})`, opacity: prog(f, ICON_AT, 4) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${icon.s / ICON.s})` }}>
            <BrandMark size={ICON.s} draw={1} glow={Math.max(1 - prog(f, ICON_AT + 10, 30), prog(f, RUN - 6, 8) * 0.6)} id="open" />
          </div>
        </div>
      )}
      {ring > 0 && ring < 1 && (
        <div style={{ position: 'absolute', left: ICON.x - 460 * ring, top: ICON.y - 460 * ring, width: 920 * ring, height: 920 * ring, borderRadius: '50%', border: `1.5px solid rgba(160,190,255,${0.7 * (1 - ring)})`, boxShadow: `0 0 50px rgba(61,123,255,${0.5 * (1 - ring)})` }} />
      )}
      {f > RUN && <Line id="o-run" pts={upToX(RUN_LINE, hx)} head={hx < 2000} />}
      <div style={{ opacity: 1 - prog(f, MOVE - 4, 10) }}>
        <Wordmark f={f} at={ICON_AT + 8} tagline="你的校园，一处展开" />
      </div>
    </AbsoluteFill>
  );
};

// Last 5.7 s: the same line returns with every module on it and folds back into the icon.
export const FINALE_FRAMES = 170;
export const Finale = () => {
  const f = useF();
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
