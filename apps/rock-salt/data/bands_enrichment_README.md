# Bands enrichment queue

This CSV is a staging queue for enriching band records before inserting updates into Supabase.

## Columns
- name, slug: Canonical identifiers.
- origin_city/state/country: Geography.
- formed_year/disbanded_year/status: Lifecycle.
- description/history: Short narrative fields.
- website_url/spotify_url/bandcamp_url/instagram_handle/facebook_url/youtube_url: Links.
- press_contact: Email or contact channel.
- notes: Internal notes.
- source_urls: Comma-separated citations for verification.
- verification_status: unverified | verified | needs_review.
- genres: Optional comma-separated genres (creates band_genres links).

## Workflow
1. Fill in data from trusted sources.
2. Keep at least one source URL for each non-empty fact.
3. When ready, generate SQL from the CSV:
   - `python3 scripts/generate_band_enrichment_sql.py`
4. Run `supabase/BANDS_ENRICHMENT_FROM_CSV.sql` in the Supabase SQL editor.
