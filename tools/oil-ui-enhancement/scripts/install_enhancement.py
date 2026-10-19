"""Apply, verify or restore the local Oil UI enhancement without replacing upstream tools."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

ROOT = Path(__file__).resolve().parents[1]
START = '<!-- huitongli-enhancement:start -->'
END = '<!-- huitongli-enhancement:end -->'
DESCRIPTION = ('设计、改进和评审网站、App、后台与组件：探索设计方向、生成同屏对比页、基于截图打磨；'
               '补充交互状态、表单弹窗、移动端与键盘适配，Motion/GSAP动效、SVG/Canvas特效、性能与减少动态、真实任务验证。'
               '按需读取本地增强参考，沿用项目已有技术栈。纯业务逻辑、无界面变化的整理和改法已明确的日常文案修改不触发。')


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as out:
        temporary = Path(out.name)
        out.write(data)
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def payloads() -> dict[str, bytes]:
    result = {}
    for path in (ROOT / 'references').rglob('*'):
        if path.is_file():
            result['references/enhanced/' + path.relative_to(ROOT / 'references').as_posix()] = path.read_bytes()
    for path in (ROOT / 'assets').rglob('*'):
        if path.is_file():
            result['assets/enhanced/' + path.relative_to(ROOT / 'assets').as_posix()] = path.read_bytes()
    for name in ('search_reference.py', 'audit_motion.py'):
        path = ROOT / 'scripts' / name
        if path.is_file():
            result['scripts/enhanced/' + name] = path.read_bytes()
    result['references/enhanced/sources.lock.json'] = (ROOT / 'sources.lock.json').read_bytes()
    result['references/enhanced/LICENSE.local'] = (ROOT / 'LICENSE').read_bytes()
    for name in ('github-discovery.json', 'inspected-repositories.json'):
        result['references/enhanced/research/' + name] = (ROOT / 'research' / name).read_bytes()
    return result


def verify_sources() -> None:
    lock = json.loads((ROOT / 'sources.lock.json').read_text(encoding='utf-8'))
    for item in lock['files']:
        path = (ROOT / item['local_path']).resolve()
        if not path.is_relative_to(ROOT) or sha(path.read_bytes()) != item['sha256']:
            raise ValueError(f'Source verification failed: {item["local_path"]}')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    home = Path(os.environ.get('CODEX_HOME', Path.home() / '.codex'))
    parser.add_argument('--target', type=Path, default=home / 'skills' / 'oil-ui')
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true')
    mode.add_argument('--restore', action='store_true')
    args = parser.parse_args()
    target = args.target.resolve()
    skill = target / 'SKILL.md'
    state_file = target / 'references' / 'enhanced' / 'installed.json'
    if not skill.is_file():
        raise ValueError(f'Install oil-ui first: {skill}')
    old = skill.read_text(encoding='utf-8')
    state = json.loads(state_file.read_text(encoding='utf-8')) if state_file.is_file() else None
    if args.restore:
        if not state:
            raise ValueError('No installed enhancement state found.')
        # Refuse to erase subsequent edits, including edits to the entrypoint.
        for relative, expected in state['files'].items():
            path = target / relative
            if not path.is_file() or sha(path.read_bytes()) != expected:
                raise ValueError(f'Changed after installation, not restored: {path}')
        backup = Path(state['backup'])
        if sha(backup.read_bytes()) != state['upstream_sha256']:
            raise ValueError('Backup hash mismatch.')
        atomic(skill, backup.read_bytes())
        # Leave reference files recoverable; the restored entrypoint no longer loads them.
        print(f'Restored upstream entrypoint from {backup}; reference files retained.')
        return 0
    verify_sources()
    files = payloads()
    block = START + '\n' + (ROOT / 'extension.md').read_text(encoding='utf-8').strip() + '\n' + END
    if START in old or END in old:
        if old.count(START) != 1 or old.count(END) != 1:
            raise ValueError('Ambiguous enhancement markers.')
        before, rest = old.split(START, 1)
        _, after = rest.split(END, 1)
        new = before + block + after
    else:
        anchor = '\n# oil-ui\n'
        if anchor not in old:
            raise ValueError('Unexpected upstream entrypoint; review before applying.')
        new = old.replace(anchor, anchor + '\n' + block + '\n', 1)
    new, count = re.subn(r'^description:.*$', lambda _: 'description: ' + json.dumps(DESCRIPTION, ensure_ascii=False), new, count=1, flags=re.M)
    if count != 1:
        raise ValueError('Unexpected upstream discovery metadata.')
    files['SKILL.md'] = new.encode('utf-8')
    if args.check:
        if not state or sha(skill.read_bytes()) != state['files'].get('SKILL.md'):
            raise ValueError('Entrypoint changed after installation, or installation state is missing.')
        bad = [name for name, data in files.items() if not (target / name).is_file() or (target / name).read_bytes() != data]
        if bad:
            raise ValueError('Installed files differ: ' + ', '.join(bad))
        print(f'Installed enhancement verified: {len(files)} files; source hashes verified.')
        return 0
    if START not in old:
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup = home / 'skill-backups' / 'oil-ui' / stamp / 'SKILL.md'
        original = skill.read_bytes()
        atomic(backup, original)
        state = {'backup': str(backup), 'upstream_sha256': sha(original)}
    elif not state:
        raise ValueError('Existing enhancement has no backup manifest; review before updating.')
    for relative, data in files.items():
        atomic(target / relative, data)
    state.update({'version': 'huitongli-enhancement-1', 'source': str(ROOT),
                  'installed_at_utc': datetime.now(timezone.utc).isoformat(),
                  'files': {name: sha(data) for name, data in files.items()}})
    atomic(state_file, (json.dumps(state, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    print(f'Installed {len(files)} enhancement files in {target}; backup: {state["backup"]}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
