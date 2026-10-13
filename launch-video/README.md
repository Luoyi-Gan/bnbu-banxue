# BNBU 伴学 · 40 秒发布视频

Remotion 工程，1920×1080 / 30fps / 1200 帧，H.264。

## 输出

```bash
npm install
npm run render          # out/banxue-launch.mp4（含原创配乐）
npm run render:nobgm    # out/banxue-launch-nobgm.mp4（仅音效，便于另配音乐）
npm run dev             # Remotion Studio 预览与调整
```

## 结构

- `src/timeline.ts`：唯一的时间来源。120 BPM，每拍 15 帧；镜头区间、点击帧、字幕、音效表都在这里。
- `src/kit/base.tsx`：产品设计令牌（`src/v2/studentTheme.css`）与基础组件：图标、按钮、筛选 Chip、标签、卡片、头像。
- `src/kit/product.tsx`：用代码重建的产品界面组件（活动卡片与详情、队伍卡片与详情、队伍消息、Coffee Chat 时段、校友卡片与申请、首页近期安排、课表、社区帖子）及其演示数据。
- `src/kit/fx.tsx`：2.5D 摄像机、发光窗口、矢量品牌图标（脉搏线可逐笔描出）、粒子爆点、逐字输入。
- `src/motion/`：`Brand.tsx`（开场与收尾）、`Discover.tsx`（首页、活动）、`Connect.tsx`（找搭子）、`Mentors.tsx`（Coffee Chat、校友）、`Gather.tsx`（近期安排汇入、社区与校园问答）。
- `src/lib/ui.tsx`：光标、字幕、背景、扫光；`src/lib/motion.ts`：缓动。
- `audio/compose_music.py`：原创配乐合成脚本（numpy/scipy，固定随机种子），输出 `public/audio/bgm-original.wav`。
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
