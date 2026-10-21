"""Find a small set of motion risks in explicit source paths. Findings require human review."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re

RULES = [
    ('transition-all', r'transition\s*:\s*all\b', 'Explicitly name transitioned properties.'),
    ('continuous-filter', r'(?:filter\s*:|backdrop-filter\s*:).*blur\(', 'Check animated surface size and frequency; static blur may be valid.'),
    ('global-will-change', r'will-change\s*:\s*(?:transform|opacity)', 'Check this layer is temporary and scoped.'),
    ('timer-or-loop', r'\b(?:requestAnimationFrame|setInterval)\s*\(', 'Check stop conditions, background/offscreen behavior and unmount cleanup.'),
    ('global-gsap-target', r'gsap\.(?:to|from|fromTo)\s*\(\s*[\'"]', 'Verify selectors are inside an explicit scope/context.'),
]


def scan(path: Path) -> list[dict]:
    text = path.read_text(encoding='utf-8')
    findings = []
    for rule, pattern, note in RULES:
        for match in re.finditer(pattern, text):
            findings.append({'file': str(path), 'line': text[:match.start()].count('\n') + 1,
                             'rule': rule, 'note': note, 'review_required': True})
    if re.search(r'@keyframes|\banimation\s*:|\bmotion\.|\bgsap\.', text) and not re.search(r'prefers-reduced-motion|useReducedMotion|reducedMotion|matchMedia', text):
        findings.append({'file': str(path), 'line': 1, 'rule': 'reduced-motion-not-local',
                         'note': 'Check parent/shared reduced-motion handling; absence in this file is not proof of a bug.', 'review_required': True})
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('paths', nargs='+', type=Path)
    args = parser.parse_args()
    paths = []
    for path in args.paths:
        if not path.exists():
            parser.error(f'Path does not exist: {path}')
        paths.extend(p for p in path.rglob('*') if p.is_file() and p.suffix in {'.css', '.js', '.jsx', '.ts', '.tsx', '.html'}) if path.is_dir() else paths.append(path)
    findings = [item for path in paths for item in scan(path)]
    print(json.dumps({'files_scanned': len(paths), 'findings': findings,
                      'scope': 'Static hints only; not an accessibility or performance acceptance result.'}, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
