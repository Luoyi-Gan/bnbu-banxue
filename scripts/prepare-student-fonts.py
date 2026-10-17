"""Prepare local student webfonts from the official source downloads.

Usage: python scripts/prepare-student-fonts.py SOURCE_DIRECTORY
Requires fonttools[woff]. Source files: MiSans.zip, MiSans-License.pdf,
LXGWWenKai-Medium.ttf (v1.520), and LXGW-OFL.txt.
"""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
output = root / "public/fonts"
(output / "misans").mkdir(parents=True, exist_ok=True)
(output / "lxgw-wenkai").mkdir(parents=True, exist_ok=True)

# Keep the Xiaomi-distributed WOFF2 files byte-for-byte unchanged.
with ZipFile(source / "MiSans.zip") as archive:
    for weight in ("Regular", "Semibold"):
        name = f"MiSans-{weight}.woff2"
        (output / "misans" / name).write_bytes(archive.read(f"MiSans/woff2/{name}"))
(output / "misans/License.pdf").write_bytes((source / "MiSans-License.pdf").read_bytes())
(output / "lxgw-wenkai/OFL.txt").write_bytes((source / "LXGW-OFL.txt").read_bytes())

# WenKai is used for campus headings. Retain GB2312, punctuation, Latin,
# and every character currently present in the frontend. Rename the subset.
characters = set(chr(code) for code in range(0x20, 0x250))
characters.update(chr(code) for code in range(0x2000, 0x2070))
characters.update(chr(code) for code in range(0x3000, 0x3040))
characters.update(chr(code) for code in range(0xFF00, 0xFFEF))
for first in range(0xA1, 0xF8):
    for second in range(0xA1, 0xFF):
        try:
            characters.update(bytes((first, second)).decode("gb2312"))
        except UnicodeDecodeError:
            pass
for path in (root / "src").rglob("*"):
    if path.suffix in (".tsx", ".ts"):
        characters.update(path.read_text(encoding="utf-8"))
font = TTFont(source / "LXGWWenKai-Medium.ttf")
options = subset.Options()
options.name_IDs = ["*"]
options.name_legacy = True
options.name_languages = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=sorted(map(ord, characters)))
subsetter.subset(font)
names = {1: "BNBU WenKai", 2: "Medium", 3: "BNBU WenKai Medium 1.520 subset", 4: "BNBU WenKai Medium", 6: "BNBUWenKai-Medium", 16: "BNBU WenKai", 17: "Medium"}
for record in font["name"].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
font.flavor = "woff2"
font.save(output / "lxgw-wenkai/BNBUWenKai-Medium.woff2")

manifest = {
    "sources": {
        "MiSans": "https://hyperos.mi.com/font-download/MiSans.zip",
        "MiSansLicense": "https://hyperos.mi.com/font/zh/download/",
        "WenKai": "https://github.com/lxgw/LxgwWenKai/releases/tag/v1.520",
    },
    "files": {
        str(path.relative_to(output)).replace("\\", "/"): {
            "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
        for path in sorted(output.rglob("*"))
        if path.suffix in (".woff2", ".pdf", ".txt")
    },
}
(output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(manifest, ensure_ascii=False, indent=2))
