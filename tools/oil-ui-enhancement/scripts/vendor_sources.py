"""Fetch reviewed MIT reference documents at pinned commits; never execute upstream code."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import base64
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SELECTION = {
    'emilkowalski/skills': ['skills/animate/', 'skills/animation-performance/', 'skills/animation-vocabulary/', 'skills/improve-animations/', 'skills/review-animations/', 'skills/find-animation-opportunities/'],
    'greensock/gsap-skills': ['skills/'],
    'ibelick/ui-skills': ['skills/fixing-motion-performance/', 'skills/fixing-accessibility/', 'skills/baseline-ui/'],
    'kylezantos/design-motion-principles': ['skills/design-motion-principles/'],
    'jakubkrehel/skills': ['skills/better-interface/', 'skills/state-machine/', 'skills/interface-review/', 'skills/better-accessibility/'],
    'Leonxlnx/taste-skill': ['skills/taste-skill/'],
    'nextlevelbuilder/ui-ux-pro-max-skill': ['.claude/skills/ui-ux-pro-max/SKILL.md', '.claude/skills/ui-ux-pro-max/references/', 'src/ui-ux-pro-max/data/ux-guidelines.csv'],
}


def fetch(task: tuple) -> dict:
    repo, commit, entry, stars = task
    source = entry['path']
    url = f'https://raw.githubusercontent.com/{repo}/{commit}/{source}'
    proc = subprocess.run(['gh', 'api', f'repos/{repo}/git/blobs/{entry["sha"]}'],
                          capture_output=True, text=True, encoding='utf-8', check=True)
    payload = json.loads(proc.stdout)
    if payload.get('encoding') != 'base64':
        raise ValueError(f'Unsupported Git blob encoding: {repo}/{source}')
    data = base64.b64decode(payload['content'])
    actual = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    if actual != entry['sha']:
        raise ValueError(f'Git blob mismatch: {repo}/{source}')
    # These are references, not additional automatically discoverable skills.
    relative = Path(repo.replace('/', '__')) / source
    if relative.name == 'SKILL.md':
        relative = relative.with_name('GUIDE.md')
    dest = ROOT / 'references' / 'upstream' / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return {'repository': repo, 'commit': commit, 'stars_at_review': stars, 'license': 'MIT',
            'source_path': source, 'url': url, 'git_blob': actual, 'sha256': hashlib.sha256(data).hexdigest(),
            'local_path': str(dest.relative_to(ROOT)).replace('\\', '/'), 'bytes': len(data)}


def main() -> int:
    inspected = json.loads((ROOT / 'research' / 'inspected-repositories.json').read_text(encoding='utf-8'))
    records = {item['repository']: item for item in inspected}
    tasks = []
    for repo, prefixes in SELECTION.items():
        record = records[repo]
        if (record.get('license_api') or {}).get('spdx_id') != 'MIT':
            raise ValueError(f'Unreviewed license: {repo}')
        tree = json.loads((ROOT / 'research' / (repo.replace('/', '__') + '-tree.json')).read_text(encoding='utf-8'))
        if tree.get('truncated'):
            raise ValueError(f'Incomplete tree: {repo}')
        for entry in tree['tree']:
            path = entry['path']
            include = path == 'LICENSE' or any(path == prefix or (prefix.endswith('/') and path.startswith(prefix)) for prefix in prefixes)
            if entry['type'] == 'blob' and include and (path.endswith(('.md', '.csv', '.html')) or path == 'LICENSE'):
                tasks.append((repo, record['commit'], entry, record['stars']))
    with ThreadPoolExecutor(max_workers=6) as pool:
        files = list(pool.map(fetch, tasks))
    lock = {'observed_at_utc': datetime.now(timezone.utc).isoformat(),
            'policy': 'Only reviewed MIT reference documents. SKILL.md renamed GUIDE.md. No upstream scripts or package installers executed.',
            'files': files}
    (ROOT / 'sources.lock.json').write_text(json.dumps(lock, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Verified {len(files)} files from {len(SELECTION)} repositories, {sum(x["bytes"] for x in files)} bytes.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
