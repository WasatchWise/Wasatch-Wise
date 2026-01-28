#!/usr/bin/env python3
import csv
import os
import time
import requests

AZURACAST_BASE = "https://a8.asurahosting.com"
STATION_ID = "693"

API_KEY = os.getenv("AZURACAST_API_KEY")
CSV_PATH = os.getenv("AZURACAST_CSV", "agent_outputs/therocksalt_all_media_normalized.csv")
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"

if not API_KEY:
    raise SystemExit("Missing AZURACAST_API_KEY env var")


def api_get(path):
    r = requests.get(
        f"{AZURACAST_BASE}{path}",
        headers={"X-API-Key": API_KEY},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def api_post(path, payload=None):
    r = requests.post(
        f"{AZURACAST_BASE}{path}",
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    if r.status_code not in (200, 201, 204):
        try:
            msg = r.json()
        except Exception:
            msg = r.text
        return False, msg
    return True, None


def api_put(path):
    r = requests.put(
        f"{AZURACAST_BASE}{path}",
        headers={"X-API-Key": API_KEY},
        timeout=30,
    )
    if r.status_code not in (200, 201, 204):
        try:
            msg = r.json()
        except Exception:
            msg = r.text
        return False, msg
    return True, None


playlists = api_get(f"/api/station/{STATION_ID}/playlists")
playlist_map = {p["name"].strip().lower(): p["id"] for p in playlists}


def get_playlist_id(name):
    return playlist_map.get(name.strip().lower())


missing = []
assigned = 0
failed = 0

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        media_id = row["id"]
        genre = (row.get("genre") or "Unsorted").strip()
        playlist_id = get_playlist_id(genre)
        if not playlist_id:
            missing.append(genre)
            continue

        if DRY_RUN:
            print(f"[DRY RUN] {media_id} -> {genre}")
            continue

        # Try AzuraCast playlist assignment endpoints
        ok, err = api_put(
            f"/api/station/{STATION_ID}/playlists/{playlist_id}/media/{media_id}"
        )
        if not ok:
            ok, err = api_put(
                f"/api/station/{STATION_ID}/playlist/{playlist_id}/media/{media_id}"
            )
        if not ok:
            ok, err = api_post(
                f"/api/station/{STATION_ID}/playlists/{playlist_id}/media",
                {"media_id": media_id},
            )
        if ok:
            assigned += 1
        else:
            failed += 1
            print(f"[WARN] {media_id} -> {genre}: {err}")
        time.sleep(0.1)

print(f"Assigned: {assigned} | Failed: {failed}")
if missing:
    print("Missing playlists:", sorted(set(missing)))
