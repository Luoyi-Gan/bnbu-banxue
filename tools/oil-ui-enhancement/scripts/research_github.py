"""Collect reproducible GitHub discovery evidence through the authenticated gh CLI."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
from urllib.parse import urlencode

QUERIES = [
    'animation skill in:name,description stars:>50 archived:false fork:false',
    'motion skill in:name,description stars:>50 archived:false fork:false',
    'gsap skill in:name,description,readme stars:>100 archived:false fork:false',
    'framer motion skills in:readme stars:>500 archived:false fork:false',
    'animation SKILL.md in:readme stars:>500 archived:false fork:false',
    'frontend design skill in:name,description stars:>1000 archived:false fork:false',
    'ui ux skill in:name,description stars:>1000 archived:false fork:false',
    'scroll animation skill in:name,description,readme stars:>100 archived:false fork:false',
    'svg animation skill in:name,description,readme stars:>100 archived:false fork:false',
    'react animation components in:name,description stars:>5000 archived:false fork:false',
]
TARGETS = [
    'emilkowalski/skills',
    'greensock/gsap-skills', 'kylezantos/design-motion-principles',
    'Rkj0123/motion-ui-skill', 'remotion-dev/skills', 'Leonxlnx/taste-skill',
    'vercel-labs/agent-skills', 'anthropics/skills', 'nextlevelbuilder/ui-ux-pro-max-skill',
    'ibelick/ui-skills', 'mthines/agent-skills', 'iart-ai/motion-skills',
    'acumenix/claude-code-frontend-design-toolkit', 'motiondivision/motion',
    'greensock/GSAP', 'juliangarnier/anime', 'pmndrs/react-spring',
    'DariusDzam/awesome-motion-skills', 'magicuidesign/magicui',
    'DavidHDev/react-bits', 'emilkowalski/vaul', 'oil-oil/oil-ui', 'feitangyuan/onetake',
]


def api(endpoint: str) -> dict:
    proc = subprocess.run(['gh', 'api', endpoint], capture_output=True, text=True, encoding='utf-8')
    if proc.returncode:
        return {'error': proc.stderr.strip(), 'endpoint': endpoint}
    return json.loads(proc.stdout)


def compact(repo: dict) -> dict:
    return {k: repo.get(k) for k in ('full_name', 'html_url', 'description', 'stargazers_count',
            'forks_count', 'pushed_at', 'archived', 'default_branch', 'license', 'topics')}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'research' / 'github-discovery.json')
    args = parser.parse_args()
    queries, found = [], {}
    # Sequential searches respect GitHub's search rate budget. Core metadata calls are independent.
    for q in QUERIES:
        result = api('search/repositories?' + urlencode({'q': q, 'sort': 'stars', 'order': 'desc', 'per_page': 100}))
        items = result.get('items', [])
        queries.append({'query': q, 'total_count': result.get('total_count'), 'retrieved': len(items),
                        'incomplete_results': result.get('incomplete_results'), 'error': result.get('error')})
        for repo in items:
            found[repo['full_name'].lower()] = compact(repo)
        print(f'{q}: {len(items)} / {result.get("total_count")}', flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for target, result in zip(TARGETS, pool.map(lambda name: api('repos/' + name), TARGETS)):
            if result.get('full_name'):
                found[result['full_name'].lower()] = compact(result)
            else:
                queries.append({'target': target, 'error': result.get('error')})
    payload = {'observed_at_utc': datetime.now(timezone.utc).isoformat(),
               'scope': '10 sorted repository searches, first 100 hits per query, plus named official/specialist repositories. Not an exhaustive crawl of GitHub.',
               'queries': queries, 'unique_repositories': len(found),
               'repositories': sorted(found.values(), key=lambda r: r['stargazers_count'], reverse=True)}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Unique repositories: {len(found)}; evidence: {args.output}', flush=True)
    return 1 if any(x.get('error') for x in queries[:len(QUERIES)]) else 0


if __name__ == '__main__':
    raise SystemExit(main())
