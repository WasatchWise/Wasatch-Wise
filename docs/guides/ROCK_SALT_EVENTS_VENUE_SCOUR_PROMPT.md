# Rock Salt Events Team – Venue Show Scour Prompt (Through March 31)

Use this prompt with the **Claude Chrome extension** so it visits each of our venue sites, finds all listed shows/events through **March 31** [year], and reports back in one place.

**Latest report (shows through March 31, 2026):** [ROCK_SALT_VENUE_SCOUR_2026-02-10.md](../reports/ROCK_SALT_VENUE_SCOUR_2026-02-10.md) — 16+ venues (Tier 1 + Tier 3 + **24tix.com** addendum: Aces High, Beehive, Quarters, DLC at Quarters, Metro extras), 320+ shows. **Bookmark:** [24tix.com/search](https://www.24tix.com/search) as primary Utah indie/DIY aggregator.

---

## 0. 24tix.com – do this first (or in same run)

**24tix.com** is the main ticketing aggregator for Utah’s indie/DIY and small-venue scene. It lists S&S Presents (Kilby, Urban Lounge), JRC Events, Quarters, KRCL Presents, and many others in one place.

- **URL:** [24tix.com/search](https://www.24tix.com/search) — search “Salt Lake City” (or Utah), filter by date range through March 31.
- **In the prompt:** Ask Claude to open 24tix search, use “Next” to paginate, and extract every show through March 31; report by venue. This often yields hundreds of additional shows and venues (e.g. Aces High Saloon, The Beehive, Quarters Arcade Bar, The DLC at Quarters, extra Metro Music Hall shows).

---

## 1. Our venues (fill in before using)

**Paste your venue list here so the prompt has exact URLs.** Example:

| Venue name   | Events/calendar URL |
|-------------|----------------------|
| Venue A     | https://…            |
| Venue B     | https://…            |
| Venue C     | https://…            |

*(Replace the table above with your real venues and URLs, then copy the prompt below.)*

---

## 2. Copy this into Claude (Chrome extension)

```
You are helping the Rock Salt events team collect every show/event across our venues through March 31 [YEAR]. Use the browser: open each venue’s events or calendar page, scroll or paginate as needed, and extract every show that has a date on or before March 31.

**Venues to scour** (I’ll paste the list, or use the table below):
[PASTE YOUR VENUE LIST HERE – name + full URL to events/calendar page]

**Also scour 24tix.com:** Open https://www.24tix.com/search, search Salt Lake City (or Utah), set date range through March 31, and click “Next” until you’ve seen all results. Extract every show; many venues (Aces High, Beehive, Quarters, The DLC at Quarters, Metro, etc.) appear only or additionally here. Add those to the report by venue.

**For each venue:**
1. Open the events/calendar URL. If the site has multiple pages or “Load more,” follow them until you’ve seen all events through March 31.
2. For every show/event with a date ≤ March 31, record:
   - Venue name
   - Show/event name
   - Date (and time if shown)
   - Venue location or room (if listed)
   - Link to the event page or ticket page (exact URL)
   - Any note (e.g. “sold out,” “on sale soon,” “doors 7pm”).
3. If a venue has no events page or you can’t find events, say so and note the URL you checked.
4. If events are in a different section (e.g. “Concerts” vs “Comedy”), check those sections too and include them.

**Report format:**
- **By venue:** List all shows for that venue, then move to the next.
- **Summary:** Total shows found per venue; total across all venues; any venues with no events or broken pages.
- **Dates covered:** Confirm you only included events through March 31.

If you can’t access a site (paywall, login, or block), say which venue and what happened so the team can check manually.
```

---

## 3. Short version (quick run)

Use this when you’ve already pasted the venue list in the chat and want a compact instruction:

```
Scour each of our venue events/calendar pages in the browser. Also scour 24tix.com/search (Salt Lake City / Utah, through March 31; paginate with Next). For every show with a date on or before March 31 [YEAR], record: venue name, show name, date/time, event or ticket URL, and any note. Report by venue, then a short summary (counts per venue, total, and any venues with no events or access issues). Only include events through March 31.
```

---

## 4. How to use

1. **Update the doc:** In the “Our venues” section above, replace the example table with your real venue names and events/calendar URLs.
2. **Open Claude Chrome extension** and start a new conversation.
3. **Paste the full prompt** (Section 2), and in the `[PASTE YOUR VENUE LIST HERE]` part, paste your venue list (e.g. the same table: venue name + URL per line or in a table).
4. **Replace [YEAR]** with the correct year (e.g. 2026).
5. Send. Claude will open each URL, follow “Load more” or pagination as needed, and extract shows through March 31.
6. **Use the report** to update your master calendar, confirm nothing’s missing, or hand off to whoever builds the March run of shows.

Use the **short version** (Section 3) when the venue list is already in the thread and you only need a quick re-scour or reminder of the task.

---

## 5. Venue index & coverage (79 venues)

**Scourable online (have working event/calendar pages):** Abravanel Hall, Eccles Theater, The Complex, The State Room, The Urban Lounge, The Depot, Kilby Court, Soundwell, Velour (partial). Use these URLs in the prompt for full extraction.

**Often need Ticketmaster/AXS/24tix or venue site:** Eccles, State Room (AXS), Urban Lounge (24tix), Depot (depotslc.com), Complex (thecomplexslc.com), Kilby (kilbycourt.com), Soundwell (soundwellslc.com), Utah Symphony (utahsymphony.org for Abravanel).

**On 24tix.com (use 24tix search for full run):** Aces High Saloon, The Beehive, Quarters Arcade Bar, The DLC at Quarters; Metro Music Hall also has extra shows on 24tix. Redemption, Tailgate Tavern, Urban Lounge, Kilby Court appear on 24tix too.

**Likely need manual / Facebook / phone:** Avalon Theatre, Barbary Coast Saloon, Club DV8, Diabolical Records, Hog Wallow / Hog Wallow Pub, Ice Haus, Kamikazes, Leatherheads, Lighthouse Lounge, Liquid Joe's, Piper Down (both), The Cabin, The Commonwealth Room, The Garage on Beck, The Roxy, The Speedway Café, The Woodshed, The Word, The Zephyr Club, Twilite Lounge, Why Kiki, WhySound, and most regional/smaller rooms.

**Regional (multi-state):** Center for the Arts, Colonial Theater, Covey Center (Provo), Delta Center, Egyptian Theatre (Park City), Elko Convention Center, Ellen Eccles (Logan), Idaho Botanical Garden – Outlaw Field, Knitting Factory Boise, Las Colonias Park Amphitheater, Maverik Center, Mesa Theater (Grand Junction), Million Dollar Cowboy Bar (Jackson), Morrison Center (Boise), Neurolux (Boise), O.P. Rockwell (Park City), Ogden Amphitheater, Peery's Egyptian (Ogden), Peppermill Concert Hall (Wendover), Portneuf Health Trust Amphitheatre, Red Butte Garden, Revolution Concert House (Garden City), Sandy Amphitheater, Shoshone Bannock Casino Amphitheater, Snow King Amphitheater (Jackson), The Gem (Idaho Falls), The Hitt Event Center (Idaho Falls), The Pink Garter (Jackson), The Shredder (Boise), The Social (Provo), Tuacahn (Ivins), University of Wyoming Concert Hall (Laramie), USANA Amphitheatre, Velour (Provo).

When you run the prompt, paste the subset of venues you want (with their events URLs). For “scourable online” venues, use the report above as the source for current URLs.
