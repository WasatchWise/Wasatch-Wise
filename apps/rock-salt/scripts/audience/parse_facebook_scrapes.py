import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


FILES = [
    Path("/Users/johnlyman/Downloads/facebook (10).csv"),
    Path("/Users/johnlyman/Downloads/facebook (8).csv"),
    Path("/Users/johnlyman/Downloads/facebook (9).csv"),
    Path("/Users/johnlyman/Downloads/facebook (7).csv"),
    Path("/Users/johnlyman/Downloads/facebook (6).csv"),
]

OUTPUT_DIR = Path("/Users/johnlyman/Desktop/the-rock-salt/data/audience/facebook_scrapes")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

URL_RE = re.compile(r"https?://\S+")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}")

STOP_VALUES = {
    "",
    "Facebook",
    "Like",
    "Comment",
    "Share",
    "Reply",
    "See more",
    "Most relevant",
    "All reactions:",
    "Comment as John",
    "Write something...",
    "Joined",
    "Invite",
    "People",
    "Events",
    "Media",
    "Files",
    "More",
    "Discussion",
    "Request or offer help",
    "Top contributor",
    "Admin",
    "Author",
    "Public group",
    "Shared with Public group",
    "Shared with Public",
    "Follow",
    "Interested",
    "View insights",
    "Add topic",
    "Anonymous post",
}


def clean_text(value: str) -> str:
    return re.sub(r"\\s+", " ", value).strip()


def is_text_candidate(value: str) -> bool:
    if not value or value in STOP_VALUES:
        return False
    if URL_RE.search(value):
        return False
    if "emoji.php" in value:
        return False
    if len(value) < 20:
        return False
    if len(re.findall(r"[A-Za-z]", value)) < 5:
        return False
    return True


def extract_urls(row):
    urls = []
    for cell in row:
        if isinstance(cell, str):
            urls.extend(URL_RE.findall(cell))
    return list(dict.fromkeys(urls))


FACEBOOK_PAGE_IGNORE = {
    "l.php",
    "hashtag",
    "search",
    "images",
    "share",
    "sharer.php",
    "story.php",
    "photo",
    "reel",
    "watch",
    "stories",
}


def classify_facebook_url(url):
    if "facebook.com/groups/" in url:
        match = re.search(r"facebook\.com/groups/([^/?#]+)", url)
        if match:
            return ("facebook_group", match.group(1))
    if "facebook.com/events/" in url:
        match = re.search(r"facebook\.com/events/([^/?#]+)", url)
        if match:
            return ("facebook_event", match.group(1))
    if "facebook.com/profile.php" in url:
        match = re.search(r"profile\.php\?id=([^&]+)", url)
        if match:
            return ("facebook_profile_id", match.group(1))
    match = re.search(r"facebook\.com/([^/?#]+)", url)
    if match:
        slug = match.group(1)
        if slug in FACEBOOK_PAGE_IGNORE or slug.endswith(".php"):
            return None
        if slug not in {"groups", "events", "profile.php"}:
            return ("facebook_page", slug)
    return None


SOCIAL_HANDLE_IGNORE = {"p", "reel", "reels", "tv", "stories", "explore", "watch"}


def classify_social_url(url):
    social_patterns = [
        ("instagram", r"https?://(?:www\.)?instagram\.com/([^/?#]+)"),
        ("tiktok", r"(?:www\.)?tiktok\.com/@([^/?#]+)"),
        ("youtube", r"(?:www\.)?youtube\.com/(?:channel/|@|c/|user/)([^/?#]+)"),
        ("youtube_video", r"(?:www\.)?youtu\.be/([^/?#]+)"),
        ("spotify", r"open\.spotify\.com/(artist|album|track)/([^/?#]+)"),
        ("bandcamp", r"https?://([^.]+)\.bandcamp\.com"),
        ("soundcloud", r"(?:www\.)?soundcloud\.com/([^/?#]+)"),
        ("x", r"(?:www\.)?(?:x|twitter)\.com/([^/?#]+)"),
        ("linktree", r"(?:www\.)?linktr\.ee/([^/?#]+)"),
        ("beacons", r"(?:www\.)?beacons\.ai/([^/?#]+)"),
    ]
    for platform, pattern in social_patterns:
        match = re.search(pattern, url)
        if match:
            handle = match.group(1)
            if isinstance(handle, str) and handle.lower() in SOCIAL_HANDLE_IGNORE:
                return None
            return (platform, handle)
    return None


def extract_text_candidates(row):
    candidates = []
    for cell in row:
        if not isinstance(cell, str):
            continue
        if is_text_candidate(cell):
            candidates.append(clean_text(cell))
    # De-dupe while preserving order
    seen = set()
    unique = []
    for item in candidates:
        if item not in seen:
            unique.append(item)
            seen.add(item)
    return unique


def extract_emails(texts):
    emails = []
    for text in texts:
        emails.extend(EMAIL_RE.findall(text))
    return list(dict.fromkeys(emails))


def extract_phones(texts):
    phones = []
    for text in texts:
        phones.extend(PHONE_RE.findall(text))
    return list(dict.fromkeys(phones))


def extract_at_handles(texts):
    handles = []
    for text in texts:
        for match in re.findall(r"@([A-Za-z0-9_.]{2,30})", text):
            handles.append(match)
    return list(dict.fromkeys(handles))


def main():
    entity_counter = Counter()
    entity_samples = {}
    group_counter = Counter()
    topic_counter = Counter()
    file_row_counts = Counter()

    topic_patterns = {
        "booking_show_requests": [r"book", r"booking", r"looking for bands", r"open slot", r"open date", r"show", r"gig", r"host", r"venue"],
        "band_member_search": [r"drummer", r"bassist", r"guitarist", r"keys", r"keyboard", r"vocalist", r"singer", r"bandmate", r"looking for"],
        "lessons_teaching": [r"lesson", r"lessons", r"teaching", r"coach", r"instructor"],
        "studio_services": [r"mixing", r"mastering", r"studio", r"recording", r"producer", r"engineering"],
        "promotion_marketing": [r"new single", r"new album", r"out now", r"stream", r"watch", r"video", r"playlist"],
        "events_calendar": [r"event", r"fri", r"sat", r"sun", r"pm", r"am", r"no cover", r"free show"],
        "gear_marketplace": [r"for sale", r"selling", r"wts", r"wtt", r"gear", r"amp", r"pedal"],
        "community_help": [r"recommend", r"looking for", r"where can i", r"who knows"],
    }

    output_jsonl = OUTPUT_DIR / "normalized_posts.jsonl"
    with output_jsonl.open("w", encoding="utf-8") as out:
        for file_path in FILES:
            try:
                with file_path.open(newline="", encoding="utf-8") as fh:
                    reader = csv.reader(fh)
                    header = next(reader, None)
                    for idx, row in enumerate(reader):
                        urls = extract_urls(row)
                        text_candidates = extract_text_candidates(row)
                        emails = extract_emails(text_candidates)
                        phones = extract_phones(text_candidates)
                        at_handles = extract_at_handles(text_candidates)

                        fb_entities = []
                        socials = []
                        external_links = []
                        for url in urls:
                            fb_entity = classify_facebook_url(url)
                            if fb_entity:
                                entity_counter[fb_entity] += 1
                                entity_samples.setdefault(fb_entity, url)
                                if fb_entity[0] == "facebook_group":
                                    group_counter[fb_entity[1]] += 1
                                fb_entities.append({"type": fb_entity[0], "id": fb_entity[1], "url": url})
                                continue

                            social = classify_social_url(url)
                            if social:
                                social_key = f"{social[0]}:{social[1]}"
                                entity_counter[("social", social_key)] += 1
                                entity_samples.setdefault(("social", social_key), url)
                                socials.append({"platform": social[0], "handle": social[1], "url": url})
                                continue

                            external_links.append(url)

                        # Topic tagging
                        topics = set()
                        combined_text = " ".join(text_candidates).lower()
                        for topic, patterns in topic_patterns.items():
                            if any(re.search(pat, combined_text) for pat in patterns):
                                topics.add(topic)
                                topic_counter[topic] += 1

                        payload = {
                            "source_file": file_path.name,
                            "row_index": idx,
                            "text_candidates": text_candidates[:4],
                            "emails": emails,
                            "phones": phones,
                            "facebook_entities": fb_entities,
                            "socials": socials,
                            "at_handles": at_handles,
                            "external_links": external_links[:10],
                            "topics": sorted(topics),
                        }
                        out.write(json.dumps(payload, ensure_ascii=False) + "\n")
                        file_row_counts[file_path.name] += 1
            except Exception as exc:
                error_payload = {
                    "source_file": file_path.name,
                    "error": str(exc),
                }
                out.write(json.dumps(error_payload, ensure_ascii=False) + "\n")

    # Entity index
    entity_index_path = OUTPUT_DIR / "entity_index.csv"
    with entity_index_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["entity_type", "identifier", "count", "sample_url"])
        for (etype, identifier), count in entity_counter.most_common():
            writer.writerow([etype, identifier, count, entity_samples.get((etype, identifier), "")])

    summary_path = OUTPUT_DIR / "summary.json"
    summary = {
        "total_entities": sum(entity_counter.values()),
        "group_counts": group_counter.most_common(20),
        "topic_counts": topic_counter.most_common(),
        "file_counts": file_row_counts.most_common(),
    }
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
