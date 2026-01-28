#!/usr/bin/env python3
import csv
import os
from pathlib import Path

CSV_PATH = "agent_outputs/therocksalt_all_media_normalized.csv"

# Local mount or SFTP-mapped directory for AzuraCast media
# Example: /mnt/azuracast/stations/therocksalt/media
MEDIA_ROOT = os.getenv("AZURACAST_MEDIA_ROOT")

if not MEDIA_ROOT:
    raise SystemExit("Set AZURACAST_MEDIA_ROOT to the AzuraCast media folder")

media_root = Path(MEDIA_ROOT)

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        genre = (row.get("genre") or "Unsorted").strip() or "Unsorted"
        filename = row.get("path") or ""
        basename = Path(filename).name
        src = media_root / filename
        dst_dir = media_root / genre
        dst_dir.mkdir(parents=True, exist_ok=True)
        dst = dst_dir / basename

        if src.exists():
            if dst.exists():
                continue
            src.rename(dst)
        else:
            print(f"[MISSING] {src}")
