#!/usr/bin/env python3
"""Generate SQL updates from bands enrichment CSV."""
from __future__ import annotations

import csv
import sys
from pathlib import Path

DEFAULT_INPUT = Path("data/bands_enrichment_queue.csv")
DEFAULT_OUTPUT = Path("supabase/BANDS_ENRICHMENT_FROM_CSV.sql")

BAND_COLUMNS = [
    "origin_city",
    "state",
    "country",
    "formed_year",
    "disbanded_year",
    "status",
    "description",
    "history",
    "website_url",
    "spotify_url",
    "bandcamp_url",
    "instagram_handle",
    "facebook_url",
    "youtube_url",
    "press_contact",
    "notes",
    "bio",
]


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def normalize(value: str | None) -> str:
    if value is None:
        return ""
    return value.strip()


def build_update(row: dict[str, str]) -> str | None:
    slug = normalize(row.get("slug"))
    if not slug:
        return None

    assignments: list[str] = []
    for col in BAND_COLUMNS:
        value = normalize(row.get(col))
        if not value:
            continue
        if col in ("formed_year", "disbanded_year"):
            assignments.append(f"{col} = {int(value)}")
        else:
            assignments.append(f"{col} = '{sql_escape(value)}'")

    source_urls = normalize(row.get("source_urls"))
    notes = normalize(row.get("notes"))
    if source_urls:
        combined = notes
        if combined:
            combined = f"{combined} | Sources: {source_urls}"
        else:
            combined = f"Sources: {source_urls}"
        assignments = [a for a in assignments if not a.startswith("notes = ")]
        assignments.append(f"notes = '{sql_escape(combined)}'")

    if not assignments:
        return None

    return (
        "UPDATE public.bands\nSET "
        + ",\n  ".join(assignments)
        + f"\nWHERE slug = '{sql_escape(slug)}';"
    )


def parse_genres(value: str) -> list[str]:
    if not value:
        return []
    return [g.strip() for g in value.split(",") if g.strip()]


def main() -> int:
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    if not input_path.exists():
        print(f"Missing input CSV: {input_path}", file=sys.stderr)
        return 1

    updates: list[str] = []
    genre_rows: list[tuple[str, str]] = []
    all_genres: set[str] = set()

    with input_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            update = build_update(row)
            if update:
                updates.append(update)

            slug = normalize(row.get("slug"))
            for genre in parse_genres(normalize(row.get("genres"))):
                all_genres.add(genre)
                if slug:
                    genre_rows.append((slug, genre))

    lines: list[str] = []
    lines.append("-- Auto-generated from bands_enrichment_queue.csv")
    lines.append("-- Safe to re-run; uses slug + genre names as keys\n")

    if all_genres:
        lines.append("INSERT INTO public.genres (name)")
        lines.append("VALUES")
        for i, genre in enumerate(sorted(all_genres)):
            suffix = "," if i < len(all_genres) - 1 else ""
            lines.append(f"  ('{sql_escape(genre)}'){suffix}")
        lines.append("ON CONFLICT (name) DO NOTHING;\n")

    if genre_rows:
        lines.append("INSERT INTO public.band_genres (band_id, genre_id)")
        lines.append("SELECT b.id, g.id")
        lines.append("FROM public.bands b")
        lines.append("JOIN public.genres g ON g.name = v.genre")
        lines.append("JOIN (VALUES")
        for i, (slug, genre) in enumerate(genre_rows):
            suffix = "," if i < len(genre_rows) - 1 else ""
            lines.append(
                f"  ('{sql_escape(slug)}', '{sql_escape(genre)}'){suffix}"
            )
        lines.append(") AS v(slug, genre) ON v.slug = b.slug")
        lines.append("ON CONFLICT DO NOTHING;\n")

    if updates:
        lines.append("-- Band updates")
        lines.extend(updates)
        lines.append("")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
