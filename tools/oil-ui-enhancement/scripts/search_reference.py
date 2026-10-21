"""Search the local enhanced reference collection without network access."""
from __future__ import annotations

import argparse
from pathlib import Path
import re


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query', nargs='+')
    parser.add_argument('--limit', type=int, default=12)
    args = parser.parse_args()
    # Source package: scripts/search_reference.py. Installed: scripts/enhanced/search_reference.py.
    base = Path(__file__).resolve().parents[1]
    root = base / 'references'
    if not root.is_dir():
        root = base.parent / 'references' / 'enhanced'
    tokens = [x.casefold() for x in re.split(r'\s+', ' '.join(args.query)) if x]
    results = []
    for file in root.rglob('*'):
        if file.suffix not in {'.md', '.csv'}:
            continue
        lines = file.read_text(encoding='utf-8').splitlines()
        hits = [(i, line.strip()) for i, line in enumerate(lines, 1) if any(t in line.casefold() for t in tokens)]
        if hits:
            text = '\n'.join(lines).casefold()
            coverage = sum(t in text for t in tokens)
            results.append((coverage, len(hits), file, hits))
    for _, _, file, hits in sorted(results, key=lambda x: (-x[0], -x[1], str(x[2])))[:max(1, args.limit)]:
        print(file)
        for number, line in hits[:3]:
            print(f'  {number}: {line[:240]}')
    if not results:
        print('No local matches. Use a narrower term or the source index; do not invent a verified match.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
