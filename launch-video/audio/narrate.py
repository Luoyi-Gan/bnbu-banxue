"""Gentle female voice-over, synthesised locally with Kokoro-82M v1.1-zh (Apache-2.0).

Run with the project's TTS venv:  .venv-tts/bin/python audio/narrate.py [voice]
Writes public/audio/vo/<id>.wav and public/audio/vo/lines.json (durations in seconds).
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro import KModel, KPipeline

REPO = "hexgrad/Kokoro-82M-v1.1-zh"
VOICE = sys.argv[1] if len(sys.argv) > 1 else "zf_078"
SPEED = 0.95
SR = 24000
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/audio/vo"

LINES = [
    ("open", "B N B U 伴学，你的校园，一处展开。"),
    ("home", "今天，先做好下一件事。"),
    ("activities", "好活动，标记一下就不会错过。"),
    ("teams", "筛选队伍，申请加入，找到同频的人。"),
    ("coffee", "预约老师的 Coffee Chat。"),
    ("alumni", "向校友发出交流申请，等待对方确认。"),
    ("schedule", "确认好的安排，都汇入近期安排。"),
    ("community", "在社区，分享校园经验。"),
    ("ai", "遇到疑问，问问奶蛙，回答附有来源。"),
    ("final", "B N B U 伴学，让校园生活顺手发生。", 1.04),
]

model = KModel(repo_id=REPO).eval()
en = KPipeline(lang_code="a", repo_id=REPO, model=False)


def en_callable(text):
    return next(en(text)).phonemes


zh = KPipeline(lang_code="z", repo_id=REPO, model=model, en_callable=en_callable)


os.makedirs(OUT, exist_ok=True)
meta = {}
for key, text, *rate in LINES:
    chunks = [r.audio.numpy() for r in zh(text, voice=VOICE, speed=SPEED * (rate[0] if rate else 1.0))]
    audio = np.concatenate(chunks)
    nz = np.where(np.abs(audio) > 0.01)[0]
    audio = audio[max(0, nz[0] - 240) : nz[-1] + 2400]
    audio = audio / np.max(np.abs(audio)) * 0.8
    sf.write(f"{OUT}/{key}.wav", audio, SR)
    meta[key] = round(len(audio) / SR, 3)
    print(key, meta[key], "s", text)
json.dump({"voice": VOICE, "lines": meta}, open(f"{OUT}/lines.json", "w"), ensure_ascii=False, indent=1)
