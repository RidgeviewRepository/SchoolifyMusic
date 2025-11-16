#!/usr/bin/env python3
"""
Scan `assets/mp3` and `assets/Covers` and generate `assets/manifest.json`.
Matches files by base filename (case-insensitive).
Run this locally after adding files: `python3 generate_manifest.py`.
"""
import json
from pathlib import Path

root = Path(__file__).parent
mp3_dir = root / 'assets' / 'mp3'
covers_dir = root / 'assets' / 'Covers'
manifest_file = root / 'assets' / 'manifest.json'

mp3_dir.mkdir(parents=True, exist_ok=True)
covers_dir.mkdir(parents=True, exist_ok=True)

mp3_files = list(mp3_dir.glob('*'))
cover_files = list(covers_dir.glob('*'))

# build dict of covers by lowercase stem
covers_map = {}
for f in cover_files:
    if f.is_file():
        covers_map[f.stem.lower()] = f.name

songs = []
for f in mp3_files:
    if not f.is_file():
        continue
    if f.suffix.lower() not in ['.mp3', '.wav', '.m4a', '.ogg']:
        continue
    stem = f.stem
    key = stem.lower()
    cover_name = covers_map.get(key)
    cover_path = f"assets/Covers/{cover_name}" if cover_name else None
    songs.append({
        'title': stem,
        'artist': '',
        'mp3': f"assets/mp3/{f.name}",
        'cover': cover_path
    })

with manifest_file.open('w', encoding='utf-8') as fh:
    json.dump({'songs': songs}, fh, indent=2)

print(f'Wrote {len(songs)} songs to {manifest_file}')
