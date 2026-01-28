import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


INPUT_JSONL = Path("/Users/johnlyman/Desktop/the-rock-salt/data/audience/facebook_scrapes/normalized_posts.jsonl")
OUTPUT_CSV = Path("/Users/johnlyman/Desktop/the-rock-salt/data/audience/facebook_scrapes/outreach_queue.csv")
OUTPUT_JSON = Path("/Users/johnlyman/Desktop/the-rock-salt/data/audience/facebook_scrapes/outreach_queue.json")


def infer_role(text_blob: str, topics: set) -> str:
    text_blob = text_blob.lower()
    if "studio" in text_blob or "mixing" in text_blob or "mastering" in text_blob:
        return "service_provider"
    if "lesson" in text_blob or "teacher" in text_blob or "instructor" in text_blob:
        return "educator"
    if "venue" in text_blob or "open slot" in text_blob or "booking" in text_blob:
        return "venue_or_promoter"
    if "looking for" in text_blob and any(t in topics for t in {"band_member_search"}):
        return "band_or_musician"
    return "band_or_musician"


def recommend_flow(topics: set) -> str:
    if "booking_show_requests" in topics:
        return "booking_intent"
    if "band_member_search" in topics:
        return "bandmate_board"
    if "studio_services" in topics:
        return "service_directory"
    if "lessons_teaching" in topics:
        return "lessons_directory"
    if "promotion_marketing" in topics:
        return "promo_packet"
    if "events_calendar" in topics:
        return "event_submission"
    return "general_claim"


def main():
    entities = {}

    with INPUT_JSONL.open("r", encoding="utf-8") as fh:
        for line in fh:
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if "error" in row:
                continue

            text_candidates = row.get("text_candidates", [])
            text_blob = " ".join(text_candidates)
            topics = set(row.get("topics", []))

            fb_entities = row.get("facebook_entities", [])
            socials = row.get("socials", [])
            at_handles = row.get("at_handles", [])

            keys = []
            for fb in fb_entities:
                if fb.get("type") in {"facebook_page", "facebook_profile_id"}:
                    keys.append(("facebook", f"{fb.get('type')}:{fb.get('id')}"))

            for social in socials:
                keys.append(("social", f"{social.get('platform')}:{social.get('handle')}"))

            for handle in at_handles:
                keys.append(("handle", f"mention:{handle}"))

            for source_type, key in keys:
                entry = entities.setdefault(
                    key,
                    {
                        "key": key,
                        "source_type": source_type,
                        "count": 0,
                        "topics": Counter(),
                        "sample_text": None,
                        "socials": set(),
                        "fb_refs": set(),
                    },
                )
                entry["count"] += 1
                for topic in topics:
                    entry["topics"][topic] += 1
                if not entry["sample_text"] and text_blob:
                    entry["sample_text"] = text_blob[:280]
                for social in socials:
                    entry["socials"].add(f"{social.get('platform')}:{social.get('handle')}")
                for fb in fb_entities:
                    fb_type = fb.get("type")
                    if fb_type in {"facebook_page", "facebook_profile_id"}:
                        entry["fb_refs"].add(f"{fb_type}:{fb.get('id')}")

    rows = []
    for entry in entities.values():
        topics = set(entry["topics"].keys())
        row = {
            "entity_key": entry["key"],
            "source_type": entry["source_type"],
            "count": entry["count"],
            "primary_topics": ",".join([t for t, _ in entry["topics"].most_common(3)]),
            "recommended_flow": recommend_flow(topics),
            "role_guess": infer_role(entry.get("sample_text") or "", topics),
            "socials": ",".join(sorted(entry["socials"])),
            "fb_refs": ",".join(sorted(entry["fb_refs"])),
            "sample_text": entry.get("sample_text") or "",
        }
        rows.append(row)

    rows.sort(key=lambda r: r["count"], reverse=True)

    with OUTPUT_CSV.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "entity_key",
                "source_type",
                "count",
                "primary_topics",
                "recommended_flow",
                "role_guess",
                "socials",
                "fb_refs",
                "sample_text",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    OUTPUT_JSON.write_text(json.dumps(rows[:1000], indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
