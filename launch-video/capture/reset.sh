#!/bin/sh
# Restore the capture database to the seeded (pre-capture) state. Stop the dev server first.
set -e
cd "$(dirname "$0")/../capture-data"
rm -f video.sqlite video.sqlite-wal video.sqlite-shm
cp seeded.sqlite video.sqlite
echo "restored capture-data/video.sqlite from seeded.sqlite"
