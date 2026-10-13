import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { box, Cursor, Float, pathAt, Shot, Stage, T, toScreen, viewOf, type Pose, type Rect } from '../lib/ui';
import { EASE_IN_OUT, EASE_OUT, LAND, keys, mix, prog } from '../lib/motion';
import { CLICKS, MOMENTS, SHOTS } from '../timeline';

const live = (frame: number, key: keyof typeof SHOTS) => frame >= SHOTS[key].from && frame < SHOTS[key].from + SHOTS[key].duration;
const Abs = ({ x, y, w, h, style, children }: { x: number; y: number; w?: number; h?: number; style?: CSSProperties; children?: ReactNode }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

const Fit = ({ name, region, w, h, opacity }: { name: string; region: Rect; w: number; h: number; opacity: number }) => {
  const k = Math.min(w / region.w, h / region.h);
  return <Shot name={name} region={region} s={k} style={{ left: (w - region.w * k) / 2, top: (h - region.h * k) / 2, opacity }} />;
};

// ---------- 24–31s: confirmed items flow into home ----------
type Mini = { name: string; region: Rect; s: number; x: number; y: number; target: string; land: number; pad?: number };

export const Schedule = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'schedule')) return null;
  const S = 0.8, R: Rect = { x: 0, y: 0, w: 900, h: 1240 };
  const W = R.w * S, H = R.h * S;
  const enter = prog(frame, 720, 18, EASE_OUT);
  const focus = prog(frame, 848, 40, EASE_IN_OUT);
  const out = prog(frame, 924, 10, EASE_IN_OUT);
  const settled: Pose = { x: 1250, y: 530 };
  const pose: Pose = { x: mix(1900, 1250, enter) - out * 160, y: 530, ry: mix(-20, 0, enter) - focus * 6, scale: 1 + focus * 0.03, opacity: prog(frame, 720, 8) * (1 - out), z: mix(-300, 0, enter) };
  const local = (r: Rect) => ({ x: (r.x - R.x) * S, y: (r.y - R.y) * S, w: r.w * S, h: r.h * S });

  const [l0, l1, l2, l3] = MOMENTS.scheduleLand;
  const minis: Mini[] = [
    { name: 'coffee_booked', region: box('coffee_booked', 'slot'), s: 1.25, x: 480, y: 300, target: 'row0', land: l0 },
    { name: 'act_marked', region: { x: 750, y: 0, w: 640, h: 72 }, s: 0.8, x: 330, y: 440, target: 'row1', land: l1 },
    { name: 'team_joined', region: { x: 920, y: 0, w: 520, h: 190 }, s: 0.82, x: 520, y: 610, target: 'row3', land: l2 },
    { name: 'timetable', region: { x: 14, y: 188, w: 570, h: 118 }, s: 0.7, x: 420, y: 790, target: 'shortcut', land: l3, pad: 8 },
  ];
  return (
    <Stage>
      <Float pose={pose} w={W} h={H} glow={0.5}>
        <Shot name="home_after" region={R} s={S} />
        {minis.map((m, i) => {
          const b = box('home_after', m.target);
          const r = local(b);
          const pad = (m.pad ?? 0) * S;
          const reveal = prog(frame, m.land - 2, 5);
          const ring = prog(frame, m.land, 16, EASE_OUT);
          return (
            <div key={i}>
              <Abs x={r.x - pad} y={r.y - pad + (m.pad ? 0 : 1)} w={r.w + pad * 2} h={r.h + pad * 2 - (m.pad ? 0 : 1)} style={{ background: m.pad ? T.canvas : T.surface, opacity: 1 - reveal }} />
              {ring > 0 && ring < 1 && <Abs x={r.x - 4} y={r.y - 2} w={r.w + 8} h={r.h + 4} style={{ borderRadius: m.pad ? 30 : 10, border: `2px solid rgba(61,123,255,${0.9 * (1 - ring)})`, boxShadow: `0 0 30px rgba(61,123,255,${0.6 * (1 - ring)})`, background: `rgba(232,242,255,${0.6 * (1 - ring)})` }} />}
            </div>
          );
        })}
      </Float>
      {minis.map((m, i) => {
        const appear = prog(frame, 724 + i * 5, 16, LAND);
        if (frame >= m.land + 2) return null;
        const b = box('home_after', m.target);
        const tl = toScreen(settled, W, H, R, S, b.x, b.y);
        const tw = b.w * S, th = b.h * S;
        const sw = m.region.w * m.s, sh = m.region.h * m.s;
        const f = prog(frame, m.land - 20, 20, EASE_IN_OUT);
        const bob = Math.sin((frame + i * 17) / 14) * 6 * (1 - f);
        const cx = mix(m.x, tl.x + tw / 2, f), cy = mix(m.y + bob, tl.y + th / 2, f) - Math.sin(Math.PI * f) * 70;
        const w = mix(sw, tw, f), h = mix(sh, th, f);
        const into = prog(frame, m.land - 9, 8, EASE_IN_OUT);
        return (
          <Abs key={i} x={cx - w / 2} y={cy - h / 2} w={w} h={h} style={{ borderRadius: mix(14, m.pad ? 22 : 6, f), overflow: 'hidden', background: T.surface, opacity: prog(frame, 724 + i * 5, 8), transform: `scale(${mix(0.8, 1, appear)}) rotate(${(1 - f) * [-3, 4, -2, 2][i]}deg)`, boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 ${30 + 30 * f}px rgba(61,123,255,${0.35 + 0.3 * f})` }}>
            <Fit name={m.name} region={m.region} w={w} h={h} opacity={1 - into} />
            <Fit name="home_after" region={b} w={w} h={h} opacity={into} />
          </Abs>
        );
      })}
    </Stage>
  );
};

// ---------- 31–35s: community + campus knowledge Q&A with sources ----------
export const Knowledge = () => {
  const frame = useCurrentFrame();
  if (!live(frame, 'knowledge')) return null;
  const CS = 0.95, CR: Rect = { x: 240, y: 60, w: 1160, h: 760 };
  const ce = prog(frame, 930, 14, EASE_OUT);
  const cOut = prog(frame, 970, 12, EASE_IN_OUT);
  const commPose: Pose = { x: 1150 - cOut * 500, y: 470, z: mix(-600, 0, ce) - cOut * 300, ry: mix(22, 6, ce) + cOut * 14, scale: 1 + prog(frame, 940, 30, EASE_IN_OUT) * 0.05, opacity: prog(frame, 930, 8) * (1 - cOut) };

  const S = 1.3, W = 870 * S, H = 480;
  const fy = keys(frame, [[972, 715], [CLICKS.aiSend + 2, 715], [CLICKS.aiSend + 16, 390]]);
  const cam = { s: S, fx: 955, fy };
  const R = viewOf(W, H, cam);
  const ai = prog(frame, 972, 16, EASE_OUT);
  const out = prog(frame, 1046, 10, EASE_IN_OUT);
  const settled: Pose = { x: 1240, y: 440 };
  const pose: Pose = { x: 1240, y: mix(740, 440, ai), rx: mix(-14, 0, ai), opacity: prog(frame, 972, 8) * (1 - out), scale: 1 - out * 0.1 };
  const sendPt = toScreen(settled, W, H, viewOf(W, H, { s: S, fx: 955, fy: 715 }), S, 1356, 884);
  const cur = pathAt(frame, [[976, 1600, 1010], [987, sendPt.x, sendPt.y], [1000, sendPt.x, sendPt.y]]);
  const ansO = prog(frame, CLICKS.aiSend + 2, 6, EASE_IN_OUT);
  const ans = box('ai_answer', 'answer');
  const pop = prog(frame, 1008, 16, LAND);
  const AS = S * keys(frame, [[1008, 1], [1024, 1.18]], EASE_OUT);
  const aw = ans.w * AS, ah = ans.h * AS;
  const ac = { x: (ans.x - R.x) * S, y: (ans.y - R.y + ans.h / 2) * S };
  const under = prog(frame, 1020, 14, EASE_OUT);
  return (
    <Stage>
      {cOut < 1 && (
        <Float pose={commPose} w={CR.w * CS} h={CR.h * CS} glow={0.5}>
          <Shot name="community" region={CR} s={CS} />
        </Float>
      )}
      {frame >= 972 && (
        <Float pose={pose} w={W} h={H} bg={T.surface} glow={0.5}>
          <Shot name="ai_typed" region={R} s={S} />
          <Shot name="ai_answer" region={R} s={S} style={{ opacity: ansO }} />
          {pop > 0 && (
            <>
              <Abs x={0} y={0} w={W} h={H} style={{ background: `rgba(10,14,30,${0.28 * prog(frame, 1008, 12)})` }} />
              <Abs x={ac.x + 8 * pop} y={ac.y - ah / 2 + 30 * pop} w={aw} h={ah} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 40px rgba(61,123,255,${0.45 * pop})` }}>
                <Shot name="ai_answer" region={ans} s={AS} />
                <Abs x={178 * AS} y={51 * AS} w={356 * AS * under} h={3} style={{ background: T.action, borderRadius: 2, boxShadow: '0 0 10px rgba(8,101,209,0.7)' }} />
              </Abs>
            </>
          )}
        </Float>
      )}
      <Cursor x={cur.x} y={cur.y} clicks={[CLICKS.aiSend]} opacity={prog(frame, 976, 5) * (1 - prog(frame, 998, 6))} />
    </Stage>
  );
};
