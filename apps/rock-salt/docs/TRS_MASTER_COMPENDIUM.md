This is the **Rock Salt Technical Compendium**.

As a Senior Developer, I have structured this not just as text, but as a **Context Package** specifically formatted for an LLM (Cursor/Claude). It converts your emotional and strategic "North Star" into strict architectural constraints, data schemas, and UI rules.

**Instructions:**

1. Create a folder in your project root called `docs` or `context`.
2. Save the content below into a file named `TRS_MASTER_COMPENDIUM.md`.
3. When starting a chat with Cursor, type: *"@TRS_MASTER_COMPENDIUM.md Read this file. It is the absolute truth for this project. Do not deviate from these constraints."*

---

---

## 05. CODING RULES & CONSTRAINTS

1. **NO SOCIAL BLOAT:** Do not install Facebook Pixels, "Share to X" buttons, or comment sections (Disqus, etc.). The site is a read-only terminal.
2. **PERFORMANCE IS AESTHETIC:** The site must load instantly. It is a utility.
3. **MOBILE FIRST:** The "164" silent observers are viewing this on their phones in a bar.
* Buttons/Tap targets must be large.
* Contrast must be high (dim lighting environments).


4. **ERROR HANDLING:**
* Do not say "Whoops!" or "Oh no!"
* Say "Error 404. File not found." Keep the tone robotic/industrial.


5. **IMAGES:**
* Always use `Next/Image` (or equivalent) for optimization.
* Force `grayscale` filter via CSS by default, potentially `hover:grayscale-0`.



---

## 06. CONTENT STRATEGY (FOR AI GENERATION)

If generating text/copy for placeholders:

* **Voice:** Clinical, observational, dry.
* **Banned Words:** "Vibe," "Lit," "Insane," "Check out," "Fam," "Passion."
* **Approved Words:** "Session," "Frequency," "Load-in," "Decibels," "Output," "Log."

*Example Placeholder Text:*

> "Session 000. Placeholder Band at The Depot. 22:00 MST. Audio captured via board mix. Low end frequency response nominal."

---

## 07. INTEGRATION FLOWS

1. **Ingestion:**
* User fills out Google Form (Super Form).
* Data is sanitized.
* Admin reviews.
* Data is pushed to Website DB.


2. **Distribution:**
* Website updates.
* Admin manually copies link to Facebook/Instagram (The "Notification").



**END OF COMPENDIUM**

```

```THE ROCK SALT (TRS) — TECHNICAL COMPENDIUM & DEVELOPER DOCTRINE

Version: 1.0.0
Authority: ABSOLUTE
Context: Local Music Infrastructure (Salt Lake City)

01. CORE PHILOSOPHY (THE "WHY")

The 164:1 Rule:
Data analysis proves that for every 1 user who engages (posts/comments), 164 users silently consume.

Implication: We do not build for engagement. We build for utility.

Result: The UI must be an "Archive" and a "Tool," not a "Feed."

Identity:
TRS is infrastructure. It is a digital telephone pole. It is a logbook.

Anti-Pattern: Social media feeds, "Buy Tickets" buttons, pop-ups, gamification, "trending" sections.

Pro-Pattern: Searchable tables, raw data logs, persistent audio players, utilitarian typography.

02. ARCHITECTURE & FEATURES (THE "WHAT")

Feature A: The Personnel Manifest (Solves "The Bassist Crisis")

Concept: A friction-heavy, high-quality classifieds section.

UX: A dense, searchable data table. No photos. Text only.

Input: Google Form (The "Super Form").

Display Logic:

Sorted by: Role > Location > Status.

Expiration: Entries auto-flag after 30 days.

Feature B: The Archive (Session Logs)

Concept: Detailed documentation of live sessions.

UX: "The Contact Sheet." High-contrast B&W imagery + Technical Data.

Components:

The Narrative: Observation only. No opinions.

The Tech Spec: Gear used (Amps, Mics, Drums).

The Audio: Embedded track.

Feature C: The Signal (Radio)

Concept: Passive consumption. 24/7 Local Audio.

Integration: Azuracast Stream.

UX: Persistent Global Footer.

MUST display: Artist Name - Track Title.

MUST link: Clicking the artist name routes to their TRS Profile/Archive.

Feature D: The Gig Guide

Concept: Weekly aggregation.

UX: A simple list view. Date | Venue | Lineup | Cost.

Constraint: No flyers. Text only.

03. UI/UX GUIDELINES (THE "LOOK")

Visual Metaphor:
"An old flyer stapled to a telephone pole." / "A recording studio logbook."

Typography:

Data/Specs: Monospaced (Courier, Roboto Mono, or JetBrains Mono).

Headings: Stark Sans-Serif (Inter, Helvetica, or similar).

Body: High legibility serif or sans.

Color Palette:

Primary: Black (#000000)

Secondary: Off-White/Paper (#F5F5F5 or #FFFFFF)

Accent: NONE. (Or a strict "Recording Red" #FF0000 only for "Live" indicators).

Interaction Design:

Hover States: Hard underlines. No fades. No bounces.

Animations: Instant. 0ms duration.

Images: * Grayscale or Desaturated.

Aspect Ratios: 1:1 or 4:5.

No rounded corners. border-radius: 0px strictly.

04. DATA SCHEMAS (TYPESCRIPT INTERFACES)

Use these strict types for all database models and component props.

// THE PERSONNEL MANIFEST
type MusicianStatus = 'Active' | 'Seeking' | 'Hired' | 'Inactive';

interface MusicianEntry {
  id: string;
  name: string; // First Name only preferred
  role: 'Bassist' | 'Drummer' | 'Guitarist' | 'Vocalist' | 'Keys' | 'Audio Engineer';
  location: string; // e.g., "West Valley", "Provo"
  gear_manifest: string; // e.g., "Ampeg SVT, Fender P-Bass" - CRITICAL for credibility
  commitment_level: 'Touring' | 'Gigging' | 'Studio Only' | 'Jam';
  contact_method: string; // Email or IG Handle
  status: MusicianStatus;
  last_updated: Date;
}

// THE ARCHIVE LOG
interface SessionLog {
  id: string;
  session_number: number; // e.g., 105
  artist_name: string;
  venue: string;
  date: Date;
  narrative_log: string; // The "Logbook" entry. Dry. Observational.
  tech_specs: {
    mics_used?: string[];
    amps_used?: string[];
    house_engineer?: string;
  };
  media: {
    cover_image_url: string; // B&W
    gallery_urls: string[];
    audio_url?: string; // Raw board mix
  };
}

// THE GIG GUIDE
interface ShowEntry {
  date: Date;
  venue: string;
  lineup: string[]; // Array of band names
  door_time: string; // "19:00"
  price: number;
  ticket_link?: string;
}

