import type { CSSProperties, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { Box, Chip, Divider, Icon, Kicker, P, Txt } from '../kit/base';
import { Burst, Cam, camToScreen, typed, Win } from '../kit/fx';
import { PostCard, POSTS } from '../kit/product';
import { EASE_IN_OUT, EASE_OUT, keys, prog } from '../lib/motion';
import { camKeys, enter, FeatureTitle, Focused, Tap, Wiped } from './kit';

export const COMMUNITY_FRAMES = 420;
const FEED_IN = 42;
const LIKE = 112;
const SAVE = 136;
const OPEN = 160;
const SEND = 270;
const COMPOSE = 282;
const SUBMIT = 384;

const POST = POSTS[0];
const COMMENT = '感谢推荐，下学期也想选这门课。';
const TITLE = '分享一个期中复习的小方法';
const BODY = '先列考点，再做错题本，最后找搭子互相提问。';
const BOARDS = ['全部', '校园', '学习', '生活', '活动', '互助', '校友升学', '校友就业'];
const DRAWER = { x: 1090, y: 60, w: 560, h: 380 };

export const COMMUNITY_SFX = [
  { at: FEED_IN - 2, src: 'sfx/whoosh-fast.mp3', volume: 0.26 },
  { at: LIKE - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: SAVE - 1, src: 'sfx/ui-click.wav', volume: 0.45, len: 12 },
  { at: OPEN, src: 'sfx/swoosh-quick.mp3', volume: 0.26 },
  { at: 230, src: 'sfx/keyboard.mp3', volume: 0.26, len: 30 },
  { at: SEND - 1, src: 'sfx/ui-click.wav', volume: 0.5, len: 12 },
  { at: COMPOSE - 2, src: 'sfx/transition-soft.mp3', volume: 0.28 },
  { at: 300, src: 'sfx/keyboard.mp3', volume: 0.24, len: 22 },
  { at: 330, src: 'sfx/keyboard.mp3', volume: 0.24, len: 30 },
  { at: SUBMIT - 1, src: 'sfx/ui-click.wav', volume: 0.55, len: 12 },
];

const Field = ({ x, y, w, h, text, placeholder, active, children }: { x: number; y: number; w: number; h: number; text: string; placeholder: string; active: boolean; children?: ReactNode }) => (
  <Box x={x} y={y} w={w} h={h} style={{ borderRadius: 10, border: `1.5px solid ${active ? P.blue : P.line}`, background: P.surface, padding: '11px 14px', boxSizing: 'border-box' }}>
    <Txt size={13} color={text ? P.ink : '#8E8E93'} style={{ whiteSpace: 'normal', lineHeight: 1.5 }}>{text || placeholder}{active && <span style={{ color: P.blue }}>|</span>}</Txt>
    {children}
  </Box>
);

const PrimaryBtn = ({ label, icon, w, h = 38, style }: { label?: string; icon?: string; w: number; h?: number; style?: CSSProperties }) => (
  <div style={{ width: w, height: h, borderRadius: 9, background: P.action, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: P.font, fontSize: 13, fontWeight: 700, ...style }}>
    {icon && <Icon name={icon} size={16} color="#fff" stroke={2.2} />}{label}
  </div>
);

const Feed = ({ f }: { f: number }) => (
  <Win x={0} y={0} w={1040} h={500} glow={0.45} bg={P.canvas}>
    <Box x={32} y={28}><Kicker>CAMPUS / COMMUNITY</Kicker><Txt size={30} weight={700} style={{ marginTop: 4 }}>校园社区</Txt><Txt size={12.5} color={P.muted} style={{ marginTop: 4 }}>先看内容，再决定要不要参与讨论。</Txt></Box>
    <Box x={876} y={44}><PrimaryBtn icon="plus" label="发布帖子" w={132} /></Box>
    <Box x={32} y={128} w={250} h={40} style={{ borderRadius: 10, border: `1px solid ${P.line}`, background: P.surface, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box' }}><Icon name="search" size={16} color="#8E8E93" /><Txt size={12} color="#8E8E93">搜索话题或关键词</Txt></Box>
    <Box x={298} y={133} style={{ display: 'flex', gap: 8 }}>{BOARDS.map((l, i) => <Chip key={l} label={l} active={i === 0 ? 1 : 0} />)}</Box>
    {POSTS.map((p, i) => (
      <Box key={i} x={32 + i * 250} y={190} style={enter(f, FEED_IN + 4 + i * 3, 16)}>
        <PostCard post={p} liked={i === 0 ? prog(f, LIKE + 1, 10, EASE_OUT) : 0} saved={i === 0 ? prog(f, SAVE + 1, 8, EASE_OUT) : 0} />
      </Box>
    ))}
    <Tap id="c-like" f={f} at={LIKE} x={236} y={448} w={28} h={22} r={8} />
    <Tap id="c-save" f={f} at={SAVE} x={220.5} y={194.5} w={30} h={30} r={15} />
  </Win>
);

const Drawer = ({ f }: { f: number }) => {
  const sent = f >= SEND + 2;
  const text = sent ? '' : typed(COMMENT, prog(f, 230, 30, (t) => t));
  return (
    <Win x={DRAWER.x} y={DRAWER.y} w={DRAWER.w} h={DRAWER.h} radius={20} bg={P.surface} glow={0.55} style={enter(f, OPEN, 18)}>
      <Box x={24} y={20}><Kicker>{POST.board} · {POST.by}</Kicker><Txt size={20} weight={700} style={{ marginTop: 4 }}>{POST.title}</Txt></Box>
      <Box x={502} y={22} w={34} h={34} style={{ borderRadius: 9, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></Box>
      <Box x={0} y={82} w={DRAWER.w}><Divider /></Box>
      <Box x={24} y={102} w={512}><Txt size={15} color={P.muted} style={{ whiteSpace: 'normal', lineHeight: 1.6 }}>{POST.body}</Txt></Box>
      <Box x={24} y={176} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P.blue }}><Icon name="heart" size={22} color={P.blue} fill={P.blue} /><Txt size={13} weight={600} color={P.blue}>1 次赞</Txt></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 9, border: `1px solid ${P.line}`, color: P.blue }}><Icon name="bookmark" size={16} color={P.blue} fill={P.blue} /><Txt size={13} weight={700} color={P.blue}>已收藏</Txt></div>
      </Box>
      <Box x={24} y={240} w={512} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Txt size={16} weight={700}>评论</Txt><Txt size={11.5} color={P.muted}>0 条已展示</Txt></Box>
      <Field x={24} y={290} w={440} h={46} text={text} placeholder="写下你的评论" active={f >= 226 && !sent} />
      <Box x={476} y={290}><PrimaryBtn icon="send" w={60} h={46} style={{ background: text ? P.action : '#C7D8F0' }} /></Box>
      <Tap id="c-send" f={f} at={SEND} x={476} y={290} w={60} h={46} r={9} />
    </Win>
  );
};

const Compose = ({ f }: { f: number }) => {
  const title = typed(TITLE, prog(f, 300, 22, (t) => t));
  const body = typed(BODY, prog(f, 330, 30, (t) => t));
  return (
    <Win x={0} y={0} w={620} h={650} radius={20} bg={P.surface} glow={0.55} style={enter(f, COMPOSE, 18)}>
      <Box x={24} y={22}><Txt size={18} weight={700}>发布社区帖子</Txt></Box>
      <Box x={562} y={18} w={34} h={34} style={{ borderRadius: 9, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={16} /></Box>
      <Box x={0} y={70} w={620}><Divider /></Box>
      <Box x={24} y={88}><Txt size={13} weight={600}>话题标题</Txt></Box>
      <Field x={24} y={112} w={572} h={44} text={title} placeholder="想和同学聊什么？" active={f >= 296 && f < 326} />
      <Box x={24} y={170}><Txt size={13} weight={600}>选择分区</Txt></Box>
      <Box x={24} y={194} w={572} h={44} style={{ borderRadius: 10, border: `1.5px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', boxSizing: 'border-box' }}><Txt size={13}>学习</Txt><Icon name="chevronDown" size={16} color="#48484A" /></Box>
      <Box x={24} y={252}><Txt size={13} weight={600}>正文</Txt></Box>
      <Field x={24} y={276} w={572} h={96} text={body} placeholder="分享一点具体的经历或问题" active={f >= 326 && f < 364} />
      <Box x={24} y={388} w={572} h={156} style={{ borderRadius: 12, border: `1px solid ${P.line}`, background: P.soft }}>
        <Box x={16} y={14} w={540} style={{ display: 'flex', justifyContent: 'space-between' }}><Txt size={13} weight={700}>添加图片</Txt><Txt size={12} color={P.muted}>0 / 9 张</Txt></Box>
        <Box x={16} y={44} w={88} h={80} style={{ borderRadius: 10, border: `1.5px dashed ${P.outline}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="imagePlus" size={22} color="#48484A" /><Txt size={11} color="#48484A">添加照片</Txt></Box>
        <Box x={16} y={132}><Txt size={11} color={P.muted}>最多 9 张，图片会压缩后上传保存。</Txt></Box>
      </Box>
      <Box x={24} y={562}><Txt size={11.5} color={P.muted}>发布后进入审核队列。</Txt></Box>
      <Box x={420} y={590} w={72} h={38} style={{ borderRadius: 9, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Txt size={13} weight={700} color={P.action}>取消</Txt></Box>
      <Box x={500} y={590}><PrimaryBtn label="提交帖子" w={96} style={{ transform: `scale(${1 - Math.max(0, 1 - Math.abs(f - SUBMIT) / 4) * 0.08})` }} /></Box>
      <Tap id="c-submit" f={f} at={SUBMIT} x={500} y={590} w={96} h={38} r={9} />
    </Win>
  );
};

export const Community = () => {
  const f = useCurrentFrame();
  const toDrawer = prog(f, OPEN, 26, EASE_IN_OUT);
  const cam = camKeys(f, {
    z: [[FEED_IN, 1.2], [84, 1.3], [104, 2.4], [OPEN, 2.4], [186, 1.6], [214, 1.6], [230, 2.3]],
    fx: [[FEED_IN, 520], [84, 520], [104, 150], [OPEN, 150], [186, 1370], [214, 1370], [230, 1360]],
    fy: [[FEED_IN, 270], [84, 260], [104, 330], [OPEN, 330], [186, 250], [214, 250], [230, 372]],
    rx: [[FEED_IN, 14], [84, 0], [OPEN, 0], [186, 0]],
    ry: [[FEED_IN, -10], [84, 0], [104, -6], [OPEN, -6], [186, 0], [230, -4]],
  });
  const out = prog(f, COMPOSE - 6, 12, EASE_IN_OUT);
  const ccam = camKeys(f, {
    z: [[COMPOSE, 1.25], [296, 1.25], [306, 1.6], [362, 1.6], [374, 1.7]],
    fx: [[COMPOSE, 310], [296, 310], [306, 310], [362, 310], [374, 380]],
    fy: [[COMPOSE, 325], [296, 325], [306, 200], [326, 200], [340, 320], [362, 320], [374, 560]],
    rx: [[COMPOSE, 10], [296, 0]],
    ry: [[COMPOSE, -8], [296, 0], [374, -6]],
  });
  const feedFocus = prog(f, 90, 12, EASE_IN_OUT) * (1 - prog(f, OPEN, 10));
  const drawerFocus = prog(f, 216, 12, EASE_IN_OUT) * (1 - out);
  const composeFocus = prog(f, 298, 10, EASE_IN_OUT) * (1 - prog(f, 364, 10));
  const sendPt = camToScreen(cam, DRAWER.x + 506, DRAWER.y + 313);
  const submitPt = camToScreen(ccam, 548, 609);
  const scene = () => (
    <Cam cam={{ ...cam, opacity: prog(f, FEED_IN, 8) * (1 - out) }}>
      <div style={{ filter: toDrawer > 0.01 ? `brightness(${1 - toDrawer * 0.6}) blur(${toDrawer * 4}px)` : undefined }}><Feed f={f} /></div>
      {f >= OPEN && <Drawer f={f} />}
    </Cam>
  );
  const focusY = f < OPEN ? camToScreen(cam, 0, 459).y : camToScreen(cam, 0, DRAWER.y + 313).y;
  return (
    <Wiped f={f} at={COMMUNITY_FRAMES - 24}>
      <FeatureTitle f={f} text="社区" id="cm" />
      {f >= FEED_IN && f < COMPOSE + 4 && <Focused y={focusY} band={90} amount={Math.max(feedFocus, drawerFocus)} render={scene} />}
      {f >= COMPOSE && (
        <Focused y={camToScreen(ccam, 0, keys(f, [[300, 134], [326, 134], [340, 324]])).y} band={95} amount={composeFocus} render={() => <Cam cam={ccam}><Compose f={f} /></Cam>} />
      )}
      <Burst frame={f} at={SEND + 1} x={sendPt.x} y={sendPt.y} color="#7FA6FF" r={70} n={10} />
      <Burst frame={f} at={SUBMIT + 1} x={submitPt.x} y={submitPt.y} color="#7FA6FF" r={90} n={12} />
      <Burst frame={f} at={LIKE + 1} x={camToScreen(cam, 248, 459).x} y={camToScreen(cam, 248, 459).y} color="#7FA6FF" r={50} n={8} />
    </Wiped>
  );
};
