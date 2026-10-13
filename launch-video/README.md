# BNBU 伴学 · 56 秒发布视频

Remotion 工程，1920×1080 / 30fps / 1680 帧，H.264。

## 输出

```bash
npm install
npm run render:film     # out/banxue-film.mp4（新版全片 BanxueFilm，约 71s，仅音效、暂无配乐；源码在 src/film/）
npm run render          # out/banxue-launch.mp4（配乐 + 音效，无旁白）
npm run render:nobgm    # out/banxue-launch-nobgm.mp4（仅音效，便于另配音乐）
npm run render:vo       # out/banxue-launch-vo.mp4（可选：配乐 + 女声旁白 + 音效）
npm run dev             # Remotion Studio 预览与调整
```

## 结构

- `src/timeline.ts`：唯一的时间来源。镜头按 1200 帧「故事帧」编排（120 BPM，每拍 15 帧），播放时由 `src/lib/time.ts` 的 `STRETCH = 1.4` 统一放慢到 1680 帧；旁白起读帧 `VO_AT` 用播放帧，其余用故事帧。镜头区间、点击帧、字幕、功能特写机位（`FOCUS`）、音效表都在这里。
- `src/kit/base.tsx`：产品设计令牌（`src/v2/studentTheme.css`）与基础组件：图标、按钮、筛选 Chip、标签、卡片、头像。
- `src/kit/product.tsx`：用代码重建的产品界面组件（活动卡片与详情、队伍卡片与详情、队伍消息、Coffee Chat 时段、校友卡片与申请、首页近期安排、课表、社区帖子）及其演示数据。
- `src/kit/fx.tsx`：2.5D 摄像机、发光窗口、矢量品牌图标（脉搏线可逐笔描出）、粒子爆点、逐字输入。
- `src/motion/`：`Brand.tsx`（开场与收尾）、`Discover.tsx`（首页、活动）、`Connect.tsx`（找搭子）、`Mentors.tsx`（Coffee Chat、校友）、`Gather.tsx`（近期安排汇入、社区与校园问答）。
- `src/lib/ui.tsx`：光标、字幕、背景、扫光；`src/lib/motion.ts`：缓动。
- `audio/compose_music.py`：原创配乐合成脚本，按参考录屏的音乐结构设计（随画面放慢为 120/1.4 ≈ 85.7 BPM、A 小调、附点八分脉冲铺垫、14 秒进入四拍底鼓与律动和弦、尾段撤鼓回到脉冲），旋律为原创；numpy/scipy，固定随机种子，输出 `public/audio/bgm-original.wav`。
- `audio/compose_sfx.py`：合成点击音效 `public/audio/sfx/ui-click.wav`。
- `audio/narrate.py`：可选女声旁白（默认不混入成片，只在 `render:vo` 中出现；只读不出字幕），本地开源模型 Kokoro-82M v1.1-zh（Apache-2.0）合成，默认音色 `zf_078`，输出 `public/audio/vo/*.wav` 与时长表 `lines.json`；起读帧在 `src/timeline.ts` 的 `VO_AT`，旁白期间配乐自动压低。重新合成：
  `uv venv --python 3.12 .venv-tts && VIRTUAL_ENV=.venv-tts uv pip install kokoro "misaki[zh]" soundfile` 后运行 `.venv-tts/bin/python audio/narrate.py [音色]`（首次运行从 Hugging Face 下载模型）。
- `public/audio/sfx/`：点击、滑动、转场音效。

## 素材来源与数据说明

- 片中不使用截图。所有界面都用 React 组件矢量重建，配色、圆角、字号、版式与文案对照本项目 `/v2` 学生端的真实页面；品牌图标按 `src/assets/brand/brand-app-icon-a.svg` 重建为可动画的 SVG。
- 演示数据来自 `capture/seed.mjs` 写入验收库副本的记录（演示姓名、活动、队伍、Coffee Chat 时段、校友档案、社区帖子、知识条目、课表），抄录在 `src/kit/product.tsx`。这些都是本地演示记录，不代表真实用户或使用数据。
- 活动封面按 seed 的渐变色重建为抽象图形，不含校园照片；老师照片区、校园地图区、首页校园照片卡片均不出现。
- 活动详情的真实按钮文案是「标记参与」，片中按原样呈现。
- 校友交流申请停在「等待校友确认」，不进入近期安排，这与业务规则一致。
- 演示账号没有已确认的运动进度，所以片中不出现运动卡片。

## 对照真实页面

```bash
# 仓库根目录，先停止本地服务；在验收库副本中写入同一套演示数据后打开 /v2 对照
bash launch-video/capture/reset.sh
BNBU_DATABASE=launch-video/capture-data/video.sqlite BNBU_LOCAL_OUTBOX=1 npm run dev:local
```
