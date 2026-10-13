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
- `src/scenes/`：`Brand.tsx`（开场与收尾）、`Flows.tsx`（首页、活动、找搭子、Coffee Chat、校友）、`Closing.tsx`（近期安排汇入、校园问答）。
- `src/lib/ui.tsx`：浮动窗口、截图裁切、光标、字幕、背景；`src/lib/motion.ts`：缓动。
- `public/ui/*.png` + `layout.json`：真实界面 2x 截图与元素坐标（CSS px）。
- `audio/compose_music.py`：原创配乐合成脚本（numpy/scipy，固定随机种子），输出 `public/audio/bgm-original.wav`。
- `public/audio/sfx/`：点击、滑动、转场音效。

## 素材来源与数据说明

- 画面全部来自本项目 `/v2` 学生端的真实页面，由 `capture/capture.mjs` 用 Playwright 按剧情顺序操作并截图；品牌图标取自 `src/assets/brand/brand-app-icon-a.svg`。
- 截图使用的是验收库的**副本**（`capture-data/`，不入库）。`capture/seed.mjs` 通过真实业务命令写入演示数据：演示姓名、活动、队伍、Coffee Chat 时段、校友档案、社区帖子、知识条目、课表。这些都是本地演示记录，不代表真实用户或使用数据。
- 活动封面是 seed 生成的抽象渐变图，不含校园照片。Coffee Chat 老师详情的照片区和活动详情的「校园位置」地图区在裁切时排除；首页按产品自身 ≤900px 布局截取，该布局不显示校园照片卡片。
- 活动详情的真实按钮文案是「标记参与」，片中按原样呈现。
- 校友交流申请停在「等待校友确认」，不进入近期安排，这与业务规则一致。
- 演示账号没有已确认的运动进度，所以片中不出现运动卡片。

## 重新截图

```bash
# 仓库根目录，先停止本地服务
bash launch-video/capture/reset.sh
BNBU_DATABASE=launch-video/capture-data/video.sqlite BNBU_LOCAL_OUTBOX=1 npm run dev:local
node launch-video/capture/capture.mjs
```

`capture/recapture.mjs` 只补拍队伍消息和校友卡片两张图。
