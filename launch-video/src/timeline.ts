// Single source of truth for timing. 120 BPM at 30 fps: one beat = 15 frames.
export const FPS = 30;
export const BEAT = 15;
export const beatF = (n: number) => Math.round(n * BEAT);
export const TOTAL = 1200;

export const SHOTS = {
  opening: { from: 0, duration: beatF(8) + 6 },
  home: { from: beatF(8), duration: beatF(5) + 5 },
  activities: { from: beatF(12) + 10, duration: beatF(8) - 4 },
  teams: { from: beatF(20), duration: beatF(14) + 6 },
  coffee: { from: beatF(34), duration: beatF(7) + 11 },
  alumni: { from: beatF(41), duration: beatF(7) },
  schedule: { from: beatF(48), duration: beatF(14) + 4 },
  knowledge: { from: beatF(62), duration: beatF(8) + 4 },
  finale: { from: beatF(70), duration: TOTAL - beatF(70) },
} as const;

// Cursor clicks inside product UI (absolute frames, each on a beat).
export const CLICKS = {
  actFilter: beatF(15),
  actOpen: beatF(17),
  actMark: beatF(19),
  teamFilter: beatF(23),
  teamOpen: beatF(25),
  teamApply: beatF(27),
  teamEnter: beatF(31),
  coffeeSlot: beatF(37),
  coffeeConfirm: beatF(39),
  alumniOpen: beatF(42),
  alumniRequest: beatF(45),
  aiSend: beatF(66),
} as const;

export const MOMENTS = {
  homePanels: [beatF(9), beatF(10), beatF(11)],
  pushThrough: beatF(11) + 8,
  teamApproved: beatF(29),
  chatMessage: beatF(32),
  coffeeTyping: beatF(37) + 4,
  alumniTyping: beatF(43) + 3,
  scheduleLand: [beatF(53), beatF(54), beatF(55), beatF(56)],
  finalHit: beatF(72),
} as const;

export const CAPTIONS = [
  { id: 'activities', text: '好活动，别错过', from: beatF(15), to: beatF(20) - 4 },
  { id: 'teams', text: '找到同频的人', from: beatF(22), to: beatF(34) - 4 },
  { id: 'mentors', text: '向老师请教，与校友交流', from: beatF(35), to: beatF(48) - 4 },
  { id: 'schedule', text: '下一步，清晰可见', from: beatF(52), to: beatF(62) - 4 },
  { id: 'knowledge', text: '校园问答，附资料来源', from: beatF(63), to: beatF(70) - 4 },
] as const;

const click = (from: number) => ({ from: from - 1, src: 'sfx/switch-click-quick.mp3', volume: 0.42, duration: 18 });

export const SFX: { from: number; src: string; volume: number; duration?: number; note: string }[] = [
  { from: beatF(5) - 2, src: 'sfx/sparkle-touch.mp3', volume: 0.3, duration: 50, note: 'icon forms from gathered cards' },
  { from: beatF(8) - 4, src: 'sfx/transition-soft.mp3', volume: 0.38, note: 'home window enters' },
  { from: MOMENTS.pushThrough, src: 'sfx/whoosh-big.mp3', volume: 0.42, note: 'camera passes through the activity row' },
  { ...click(CLICKS.actFilter), note: 'click 学校邮件活动 filter' },
  { ...click(CLICKS.actOpen), note: 'click AI 创作工作坊 card' },
  { from: CLICKS.actOpen + 2, src: 'sfx/swoosh-quick.mp3', volume: 0.26, note: 'detail drawer slides in' },
  { ...click(CLICKS.actMark), note: 'click 标记参与' },
  { from: beatF(20) - 4, src: 'sfx/whoosh-fast.mp3', volume: 0.4, note: 'activity card match-cuts to team card' },
  { ...click(CLICKS.teamFilter), note: 'click 娱乐 filter' },
  { ...click(CLICKS.teamOpen), note: 'click 查看详情' },
  { from: CLICKS.teamOpen + 2, src: 'sfx/swoosh-quick.mp3', volume: 0.22, note: 'team drawer slides in' },
  { ...click(CLICKS.teamApply), note: 'click 申请加入' },
  { from: MOMENTS.teamApproved - 10, src: 'sfx/sparkle-touch.mp3', volume: 0.3, duration: 45, note: 'member avatars gather' },
  { ...click(CLICKS.teamEnter), note: 'click 进入队伍消息' },
  { from: CLICKS.teamEnter + 2, src: 'sfx/swoosh-quick.mp3', volume: 0.24, note: 'chat window slides in' },
  { from: SHOTS.coffee.from - 6, src: 'sfx/warp-slide.mp3', volume: 0.36, duration: 40, note: 'slide to Coffee Chat' },
  { ...click(CLICKS.coffeeSlot), note: 'select open slot' },
  { from: MOMENTS.coffeeTyping, src: 'sfx/keyboard.mp3', volume: 0.3, duration: 22, note: 'type topic' },
  { ...click(CLICKS.coffeeConfirm), note: 'click 确认预约' },
  { from: SHOTS.alumni.from - 4, src: 'sfx/swoosh-quick.mp3', volume: 0.3, note: 'alumni card flies in' },
  { ...click(CLICKS.alumniOpen), note: 'click 了解校友' },
  { from: MOMENTS.alumniTyping, src: 'sfx/keyboard.mp3', volume: 0.28, duration: 20, note: 'type question' },
  { ...click(CLICKS.alumniRequest), note: 'click 申请交流' },
  { from: SHOTS.schedule.from - 4, src: 'sfx/transition-soft.mp3', volume: 0.36, note: 'mini cards appear' },
  ...MOMENTS.scheduleLand.map((f, i) => ({ from: f - 3, src: i % 2 ? 'sfx/switch-tap.mp3' : 'sfx/swoosh-quick.mp3', volume: [0.3, 0.26, 0.24, 0.22][i], duration: 18, note: `mini card ${i + 1} lands in 近期安排` })),
  { from: SHOTS.knowledge.from - 4, src: 'sfx/whoosh-fast.mp3', volume: 0.34, note: 'community close-up' },
  { ...click(CLICKS.aiSend), note: 'send question' },
  { from: SHOTS.finale.from, src: 'sfx/whoosh-big.mp3', volume: 0.4, note: 'windows gather' },
  { from: MOMENTS.finalHit - 2, src: 'sfx/impact-deep-whoosh.mp3', volume: 0.5, note: 'windows collapse into app icon' },
  { from: MOMENTS.finalHit + 14, src: 'sfx/sparkle.mp3', volume: 0.32, note: 'wordmark shimmer tail' },
];
