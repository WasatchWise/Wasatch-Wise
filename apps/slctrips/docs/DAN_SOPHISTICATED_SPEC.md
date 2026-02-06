# Dan Concierge — Sophisticated Spec (Google Cloud + Vertex AI)

**Purpose:** Transform Dan from a TripKit chatbot into a real-time, actionable travel concierge using Google Cloud and Vertex AI. This doc is the single reference for implementation.

**Project context:** Wasatch Wise HQ (Google Cloud). slctrips.com is the product; Dan is the AI concierge (currently Gemini + custom tools in `/api/dan/chat`).

---

## Global Dan (Site-Wide Chat)

**Goal:** A mom with three bored kids (or any visitor) can ask Dan from any page—no purchase required. Dan proves value immediately; we upsell TripKits for full access.

| Requirement | Implementation |
|-------------|----------------|
| **Floating chat button** | Bottom-right on every page (except TripKit viewer, where Dan is already in-context). |
| **Where it shows** | Root layout → `GlobalDanConcierge` → `DanConcierge` with `tripkitCode="site"`. Hidden only on `/tripkits/[slug]`. |
| **Free tier** | Limited queries per day (e.g. 5) in site mode so visitors can try Dan without buying. Enough to prove value (“Three bored kids? I got you…”). |
| **Upsell** | When free limit is reached: “You’ve used your free asks for today. Unlock unlimited Dan + curated TripKits → [Browse TripKits].” TripKit owners get unlimited Dan inside that TripKit. |
| **No /chat route required** | Chat is a floating panel; no dedicated route needed. Optional: add `/chat` later for shareable/bookmarkable link. |

**Example (target response for “I have 3 bored kids”):**  
*“Three bored kids? I got you. Here’s what’s happening today within an hour of SLC: Discovery Gateway has a new dinosaur exhibit (open until 6pm). Hogle Zoo is doing their winter lights thing tonight. Scheels has that ferris wheel and fish tank—free entertainment. Weather’s decent today—highs around 42°. If you want to burn off energy outdoors, Antelope Island is gorgeous and the kids can chase bison (from a distance). Call the marina at (801) XXX-XXXX if you want to check conditions—tell them SLCTrips sent you. Want me to build you a quick itinerary?”*

**Files:** `GlobalDanConcierge.tsx` (mount in root layout), `DanConcierge.tsx` (site-mode free-tier limit + upsell UI). Optional server-side rate limit in `/api/dan/chat` by IP or session for enforcement.

---

## What’s Already Enabled (Wasatch Wise HQ)

| Service        | Status | Notes                          |
|----------------|--------|---------------------------------|
| Vertex AI API  | ✅     | 3 requests already made         |
| Vision AI API  | ✅     |                                 |
| BigQuery       | ✅     | Analytics / data warehouse      |
| Cloud Functions| ✅     |                                 |
| Cloud Run      | ✅     |                                 |
| Firestore      | ✅     |                                 |

---

## What Needs Enabling (Google Maps Platform)

None of the Maps APIs are enabled yet. For Dan to give real-time, actionable recommendations:

| API                    | What Dan gets |
|------------------------|---------------|
| **Weather API**        | “Based on current conditions, Mirror Lake might be snowy—pack chains” |
| **Air Quality API**   | “Air quality in Salt Lake is moderate today—consider heading to the mountains” |
| **Places API (New)**   | Real-time hours, reviews, busy times for 200M+ places; verify “Call them” before saying it |
| **Directions API**    | Actual drive times accounting for current traffic |
| **Routes API**        | Optimized multi-stop itineraries |
| **Maps Grounding Lite**| Designed for AI agents—fresh Google Maps data |

**Enable:** [Google Cloud Console → APIs & Services → Enable APIs](https://console.cloud.google.com/apis/library) — search for “Maps” and enable the above as needed.

---

## Phased Approach

### Phase 1: Enable Real-Time Data (Day 1)

**Goal:** Dan has live weather, drive times, and place details so recommendations are current.

1. **Enable in Google Cloud (same project as Vertex AI):**
   - Weather API  
   - Places API (New)  
   - Directions API  
   - Air Quality API  

2. **Secrets / env:**
   - Create or reuse a **Google Maps API key** (or separate keys per API if required).
   - Add to Vercel (slctrips): `GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (only if key is restricted by referrer and safe for client).

3. **New tools for Dan (in `/api/dan/chat` or a shared tools module):**
   - `getCurrentWeather(lat, lng)` — use Weather API; return conditions, temp, precipitation, “pack chains” style hints for mountain routes.
   - `getDriveTime(origin, destination)` — use Directions API; return duration and distance with traffic if available.
   - `getPlaceDetails(placeId)` — use Places API (New); return opening hours, “open now”, phone, website, so Dan can say “Call them” only when we have a number and “they’re open until X”.

4. **Wire tools into Dan:**
   - Declare tools in the Gemini/Vertex chat route (same pattern as existing `get_current_weather`, `get_ski_conditions`, etc.).
   - Implement handlers that call the new APIs and return concise strings for the model.

**Deliverable:** Dan can say things like “Based on current conditions, Mirror Lake might be snowy—pack chains” and “Call (801) XXX-XXXX for reservations—they’re open until 9.”

---

### Phase 2: Ground Dan in Your Data (Week 1)

**Goal:** Dan’s answers are grounded in SLCTrips content (destinations, guardian tips, Dan’s voice).

1. **RAG corpus in Vertex AI:**
   - Create a Vertex AI Search / RAG corpus (or use an existing data store).
   - Ingest: destination records (name, slug, county, description, tips, contact_info), guardian copy, “What Dan Packs,” TripKit blurbs, and any “Dan’s expertise” doc.

2. **Connect Dan to the corpus:**
   - Use Vertex AI Search grounding or a retrieve-then-prompt flow: for each user message, optionally retrieve relevant chunks, then pass them into Dan’s context (system or user turn).
   - Keep existing tools (weather, ski, canyon, events, search_tripkit_destinations); RAG adds “what we say about this place” and guardian voice.

3. **Prompting:**
   - System prompt: “When answering, prefer information from the retrieved SLCTrips context. Use the same tone as the guardians and Dan’s copy.”

**Deliverable:** Dan says things like “Based on what guardians have reported recently and current conditions…”

---

### Phase 3: Multi-Agent Architecture (Week 2–3)

**Goal:** Dan becomes a coordinator of specialized agents (pre-trip, during-trip, post-trip) instead of a single monolithic chat.

1. **Reference:**  
   Fork/adapt the [Travel Concierge sample](https://github.com/google/adk-samples) (Agent Development Kit).

2. **Agents to implement or adapt:**
   - **Pre-trip:** Storm/weather monitoring, travel advisories, packing suggestions (origin + destination).
   - **During-trip:** “Getting from A to B” (transit/drive), event booking verification, day-of conditions.
   - **Post-trip:** Feedback, preference learning for future trips.

3. **SLCTrips-specific agents/tools:**
   - Road-trip focused (not flights/hotels first).
   - `weather_impact_check` for mountain passes (e.g. “Mirror Lake Highway — chains recommended”).
   - `what_to_pack` for Utah-specific gear (already have “What Dan Packs” content; expose as a tool or RAG).
   - Connect to your destinations DB (Supabase) so agents can suggest real places with contact info and “Tell them SLCTrips sent you.”

4. **Orchestration:**
   - One “Dan” entrypoint that routes to the right agent(s) and merges responses, or a single agent that can call sub-agents as tools.

**Deliverable:** Dan can handle “What should I pack for Antelope Island tomorrow?” and “How do I get from SLC to Park City right now?” using specialized logic and tools.

---

### Phase 4: Real-Time Monitoring (Future)

**Goal:** Proactive, contextual nudges.

- **Triggers:** Weather change, road closure, air quality drop on a user’s saved trip or region.
- **Example:** “Storm moving into Park City tonight—consider leaving early.”
- **Implementation:** Cloud Functions or Cloud Run jobs that run on a schedule or on event (e.g. weather alert), look up users with saved trips in that area, send push or email via your existing stack.

**Deliverable:** Optional push/email when conditions change for a saved itinerary.

---

## Quick Wins (Before Full Phases)

Implement these first so Dan is noticeably smarter with minimal new architecture.

### 1. Weather API → Conditions Before Recommendations

- **Enable:** Weather API in Google Cloud.
- **Env:** `GOOGLE_MAPS_API_KEY` (or a key scoped to Weather only) in Vercel.
- **Code:**  
  - You already have `get_current_weather(location)` (OpenWeather?). Option A: Add a **second** tool `get_weather_conditions(lat, lng)` that calls Google Weather API and returns a short summary (e.g. “Snow possible above 7,000 ft; pack chains for Mirror Lake”).  
  - Option B: Replace or augment OpenWeather with Google Weather API in the existing tool and add “pack chains” / “road conditions” style hints in the prompt.
- **Prompt:** “Before recommending outdoor or mountain destinations, call the weather tool and mention current conditions or cautions (e.g. snow, chains, air quality).”

### 2. Places API → Verify “Call Them” and Hours

- **Enable:** Places API (New) in Google Cloud.
- **Env:** Same API key (or a key restricted to Places).
- **Code:**  
  - New tool: `get_place_details(placeId)` or `get_place_by_name(name, near)` that returns opening hours, “open now”, phone, website.  
  - When Dan has a destination with a `place_id` (if you add it to your DB) or name+region, he can call this before saying “Call them for reservations—tell them SLCTrips sent you.”
- **Prompt:** “When suggesting a specific place, if you have a Place ID or name+city, call get_place_details to confirm they’re open and get the current phone number before saying ‘Call them.’ Prefer our destination contact_info when we have it; use Places to verify or fill gaps.”

### 3. Pass Current Conditions Into Dan’s Context

- **Code:**  
  - On each request (or on open), optionally call weather + air quality once for “Salt Lake City” (or user’s stated location).  
  - Prepend to system or first user message: “Current context: [weather summary]. [Air quality summary].”  
- **Prompt:** “Use the current context above when recommending outdoor activities or drive routes.”

**Deliverable:** Dan routinely mentions current conditions and only says “Call them” when we’ve verified open/hours/phone where possible.

---

## Implementation Checklist (Quick Wins)

- [x] Enable Weather API (Google Cloud).
- [x] Enable Air Quality API (Google Cloud).
- [x] Enable Places API (New) (Google Cloud).
- [x] Enable Directions API (Google Cloud).
- [x] Add `GOOGLE_MAPS_API_KEY` (or equivalent) to Vercel env for slctrips.
- [ ] Implement `get_weather_conditions(lat?, lng?)` or augment existing weather tool with Google Weather API and “pack chains” style output.
- [x] Implement `get_air_quality(lat, lng)` with Google Air Quality API.
- [x] Implement `get_place_details(placeId)` using Places API (New).
- [x] Implement `get_drive_time(origin, destination)` using Directions API (with traffic).
- [x] Register new tools in `/api/dan/chat` and add tool handlers.
- [ ] Update Dan system prompt: (1) use weather before outdoor/mountain recs, (2) verify open/phone via Places when saying “Call them,” (3) use “current context” when provided.
- [ ] Optional: On chat open or first message, call weather (+ air quality if enabled) for SLC and inject “Current context: …” into the conversation.

---

## File / Code References (Current Dan)

| Area              | Path |
|-------------------|------|
| Dan chat API      | `apps/slctrips/src/app/api/dan/chat/route.ts` |
| Dan Concierge UI  | `apps/slctrips/src/components/DanConcierge.tsx` |
| Global Dan (site) | `apps/slctrips/src/components/GlobalDanConcierge.tsx` |
| Vertex AI (events)| `apps/slctrips/src/app/api/dan/chat-vertex-ai.ts` |

Existing tools in `route.ts`: `get_current_weather`, `get_ski_conditions`, `get_canyon_road_status`, `search_tripkit_destinations`, `get_todays_events`, `get_weather_conditions`, `get_air_quality`, `get_place_details`, `get_drive_time`. Request/response shape: tool name + args → string result for the model.

---

## Optional: Travel Concierge Agent Garden Template

- **Repo:** [google/adk-samples](https://github.com/google/adk-samples) — Travel Concierge.
- **Use:** Fork and adapt for SLCTrips (road trips, Utah, your DB, “Tell them SLCTrips sent you”), then either replace the current Dan backend with this orchestrator or run it in parallel and route “sophisticated” queries to it.

---

## Decision: Spec Only vs Quick Wins First

- **Spec only:** This doc is the spec; implement phases in order when ready.
- **Quick wins first:** Enable Weather + Places, add the two tools and prompt updates above, then test. After that, do Phase 2 (RAG) and Phase 3 (multi-agent) per this spec.

If you tell me “enable APIs first” or “quick wins only,” the next step is: enable Weather + Places, add env, then implement the two tools and prompt changes in `route.ts` and redeploy.
