"""Make OneTake discovery metadata fit Codex limits while preserving its licensed body."""
from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re

DESCRIPTION = ('Create short product launch films, teasers and feature demos with OneTake: '
               'continuous camera, connected visual beats, deterministic HTML composition and frame rendering. '
               'Use for 产品发布片、15秒动效短片、功能演示、截图复刻视频、分镜、配音字幕或视频连续性评审。'
               'Noncommercial license; check LICENSE before commercial use. Not for ordinary in-app UI transitions.')


def main() -> int:
    home = Path(os.environ.get('CODEX_HOME', Path.home() / '.codex'))
    skill = home / 'skills' / 'onetake' / 'SKILL.md'
    original = skill.read_bytes()
    text = original.decode('utf-8')
    replacement = 'description: ' + json.dumps(DESCRIPTION, ensure_ascii=False)
    updated, count = re.subn(r'^description:.*$', lambda _: replacement, text, count=1, flags=re.M)
    if count != 1:
        raise ValueError('Unexpected OneTake metadata.')
    if updated != text:
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup = home / 'skill-backups' / 'onetake' / stamp / 'SKILL.md'
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(original)
        skill.write_text(updated, encoding='utf-8')
        print(f'Updated discovery description ({len(DESCRIPTION)} characters); upstream backup: {backup}')
    else:
        print('OneTake discovery metadata already configured.')
    print('Installed entrypoint sha256:', hashlib.sha256(skill.read_bytes()).hexdigest())
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
