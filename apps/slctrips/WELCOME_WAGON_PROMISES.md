# Welcome Wagon Deliverable Blueprint

Source of truth: `src/app/welcome-wagon/page.tsx`, `/api/welcome-wagon/send-guide`, SendGrid templates, and marketing copy across readiness docs. This list captures every commitment we currently make to prospects so content teams can build or verify the actual assets.

---

## 1. Universal Positioning

- 90-day relocation program guided by Mt. Olympian “Jorah” for Salt Lake County newcomers  
- Coverage from moving day through “feeling like a local”  
- Promise that “hundreds of newcomers trust Welcome Wagon”

## 2. Product Tiers & CTAs

### Week 1 Survival Guide (Free, email capture modal)
- Instant delivery via email  
- “Complete guide instantly” promise  
- Contains moving-day checklist, first 24-hour essentials, DMV/utility setup, grocery/banking/healthcare setup, Utah quirks primer, and top 5 must-visit destinations  
- “No spam” reassurance

### 90-Day Welcome Wagon (Featured, $49, reservation modal)
- “Complete roadmap from newcomer to local”  
- Includes everything from Week 1 plus:
  - Full 90-day relocation timeline
  - Neighborhood comparison guide
  - Essential services directory
  - Utah culture & quirks deep dive
  - Interactive checklist tracker
  - “New in Town” Mt. Olympian quest
  - Lifetime updates & support  
- Reservation flow promises launch notification email and no upfront payment

### Corporate/HR Edition ($299 contact form)
- Everything in 90-day guide plus:
  - Bulk access for up to 25 employees
  - Custom branding
  - HR dashboard & tracking
  - Priority email support
  - Onboarding integration toolkit
  - Quarterly content updates  
- Promise of a response “within 24 hours” after submission

## 3. Feature Section Commitments

1. Neighborhood Insights (10+ Salt Lake area profiles with housing costs, school ratings, walkability, nearby attractions)  
2. Mt. Olympian-led exploration quest with hidden gems/local favorites  
3. Interactive checklists that save progress and send reminders  
4. Utah culture guide covering liquor laws, altitude, LDS culture, air quality alerts  
5. Outdoor adventure primer leveraging SLCTrips destination database (1,634+ listings)  
6. Local expert support from Utah locals who have helped hundreds of families

## 4. Social Proof Section

- Testimonials referencing:  
  - Utility/DMV setup within 3 days  
  - Liquor law explanation value  
  - Corporate edition saving HR hours and enabling progress tracking  
  - Neighborhood comparison leading to Sugarhouse decision for families

## 5. FAQ Commitments

1. **Week 1 Guide Contents**: detailed moving day checklist, first 24-hour essentials, utility providers, DMV, banking, healthcare, Utah quirks, top 5 destinations.  
2. **90-Day Guide Delivery**: immediate access to an online portal with downloadable PDFs, interactive checklists, neighborhood comparisons, accessible on any device, progress tracking.  
3. **Upgrade Path**: Day 7 email with special upgrade offer; purchase available anytime.  
4. **Differentiation**: consolidated, current info unavailable elsewhere, including LDS culture, air quality, Mt. Olympian insights.  
5. **Corporate Customization**: branding, internal resource integration, onboarding alignment, demo availability.  
6. **Refund Policy**: 30-day money-back guarantee for the $49 product.

## 6. Free Guide Email (SendGrid template) Content Requirements

- 7-day checklist with detailed tasks (moving day essentials, utilities/services, getting settled)  
- Utah-specific tips: liquor laws, altitude adjustment, air quality link, LDS culture etiquette, weather summary  
- Top 5 destinations list (Temple Square, Great Salt Lake State Park, Memory Grove Park, Red Butte Garden, This Is The Place Heritage Park)  
- CTA to “Get the Complete 90-Day Guide”  
- Support contact (Dan@slctrips.com) and privacy assurance  
- Promise that the free guide helps recipients “hit the ground running”

## 7. Future/Pipeline Promises Not Yet Delivered

- Stripe purchase unlock for 90-day and corporate tiers via `customer_product_access` table  
- “Accept Welcome Wagon reservations/purchases” in readiness docs implies automated fulfillment and portal access  
- Week 1 guide referenced as PDF/download despite only existing as inline email today  
- “Interactive checklist tracker” and “portal” experiences need actual UX/content  
- Corporate HR dashboard + onboarding toolkit require dedicated assets

## 8. StayKit vs TripKit Alignment

- **Terminology:** Welcome Wagon is a StayKit (relocation vertical). TripKits remain adventure-focused digital guidebooks. Keep copy, schema names, and UI labels consistent with this split.  
- **Shared library:** Reuse the TripKit purchase/access pattern so StayKits appear in the same “library” experience (cover art, progress ring, “Open” + “Download PDF” CTAs). Distinguish product type via badge (`StayKit`, `TripKit`).  
- **Access + fulfillment:** Mirror `tripkit_access_codes` + `customer_product_access` flows. Week 1 free StayKit slots into the same email-gated pattern as TK-000; paid StayKits rely on Stripe + access codes just like TripKits.  
- **Living document UI:** StayKit viewer should fork `TripKitViewer` conventions (guardian intro, progress autosave, notes, offline-friendly PWA) but swap destination cards for day/task timelines.  
- **Snapshot expectation:** Every StayKit (and TripKit) needs a downloadable PDF snapshot tied to the dynamic content version. Treat PDFs as “Audiobook-style downloads” in the shared library so users can store/print static copies.  
- **Data model parity:** When designing StayKit tables (versions, days, tasks, progress, notifications), follow the same conventions as `tripkits`, `tripkit_destinations`, and `user_tripkit_progress` for easier tooling reuse and analytics rollups.

## 9. StayKit Schema Blueprint (Supabase)

- **Core catalog (`staykits`)**: mirror `tripkits` columns (id, code, slug, status, tier, price, cover_image_url, tagline, features, destination_count-equivalent) so admin tooling treats both products uniformly.  
- **Versioning (`staykit_versions`)**: id, staykit_id, version_number, release_date, release_notes, is_active, notebooklm_sync_date, pdf_template_version. Drives both dynamic content and PDF snapshots.  
- **Day content (`staykit_days`)**: version_id FK, day_number, week_number, title, subtitle, icon_name, content_json (rich blocks), unlock_condition JSON, mt_olympian_message, weather_context, last_synced_from_notebooklm.  
- **Tasks (`staykit_tasks`)**: day_id FK, task_text, category, priority, time_estimate_minutes, location_coords, auto_complete_trigger, smart_notifications JSON, resource_links JSON[], phone_numbers JSON[].  
- **Guide sections (`staykit_sections`)**: key, title, content_json, last_notebooklm_update, user_contributed_tips JSONB[], upvotes/downvotes.  
- **Destinations bridge (`staykit_destinations`)**: join table to existing `public_destinations`/`tripkit_destinations` so StayKits can reuse curated places.  
- **User progress (`staykit_user_progress`)**: user_id FK, staykit_id, started_date, current_day, completed_tasks UUID[], visited_destinations UUID[], notes JSONB, preferences JSONB, achievement_unlocks JSONB, jorah_relationship_score. Enforce RLS by user_id.  
- **Notifications (`staykit_notifications`)**: user_id, staykit_id, day_trigger, notification_type, title, body, action_url, sent_at, interacted_at for push/email scheduling.  
- **Community tips (`staykit_community_tips`)**: user_id, day_number, tip_text, category, upvotes, is_verified, created_at.  
- **Snapshots (`staykit_snapshots`)**: version_id, generated_at, asset_url, checksum, generator, notes. Stores PWA → PDF exports.

## 10. Library & Snapshot Implementation Plan

- **User library table:** extend/introduce `user_product_library` (id, user_id, product_type, product_id, access_source, status, progress_percent, dynamic_version_id, snapshot_asset_url, last_snapshot_generated_at, needs_refresh). Auto-populate when Stripe purchase/email gate succeeds.  
- **Library UI:** shared page showing cards for each owned StayKit/TripKit. Cards feature product badge, cover art, progress ring, last-opened timestamp, `Open StayKit`, `Download Snapshot`, `Sync Content`. Upsells appear as locked cards.  
- **Snapshot pipeline:** headless renderer (e.g., Playwright → PDF) consumes StayKit version data, generates branded PDF, uploads to Supabase Storage/S3, writes `staykit_snapshots` + `user_product_library.snapshot_asset_url`. Jobs tracked in `snapshot_jobs` (status, trigger, log).  
- **Sync messaging:** when a new StayKit version activates, mark `needs_refresh` for affected users. Library card shows banner (“New version ready — sync to update dynamic content and PDF”). User action calls `/api/staykits/sync` to pull latest data and queue PDF if stale.  
- **APIs:**  
  - `GET /api/library` returns all products with metadata + signed URLs.  
  - `POST /api/staykits/snapshot` enqueues generator for a specific version or user.  
  - `GET /api/staykits/snapshot/:libraryItemId` redirects to signed PDF link.  
  - `POST /api/staykits/progress` handles autosave from viewer.  
- **Notifications:** email/push triggered on successful snapshot generation or when a new purchase hits the library (similar to TripKit access-code email).

## 11. StayKit Viewer Blueprint

- **Layout:** fork `TripKitViewer` to create `StayKitViewer` with the same hero, guardian voice module, progress chips, and autosave UX, but replace the destinations grid with day-by-day accordion cards (Day 1–7 for free tier, 90-day for full access).  
- **Tabs / sections:**  
  - `Today`: current day’s tasks + Mt. Olympian message.  
  - `Journey`: timeline of 90 days with completion indicators.  
  - `Guide`: living sections (liquor laws, altitude, LDS culture, etc.) pulling from `staykit_sections`.  
  - `Explore`: map/list of linked destinations (reusing TripKit destination cards).  
  - `Community`: stream of verified tips + ability to submit new ones.  
- **Interactions:** swipeable day cards, checklist toggles tied to `staykit_tasks`, quick-add notes, file/photo uploads for proof, `Share progress` action, offline cache via service worker.  
- **Gamification:** achievements (First Day Hero, DMV Warrior, etc.) surface as badges in the viewer header; `jorah_relationship_score` animates when tasks complete.  
- **PDF parity:** include `Download latest snapshot` button that calls the shared snapshot API so users can export the exact content they’re viewing.  
- **Access control:** viewer reads from `user_product_library` to ensure the user owns the StayKit; Week 1-only access hides future weeks behind a CTA to upgrade (using the same component slot as TripKit upsells).

---

### Implementation Guidance

1. **Content owners**  
   - Week 1 guide copywriter (convert checklist into PDF + landing snippets)  
   - 90-day curriculum lead (timeline, neighborhood profiles, services directory, culture deep dive, quest design)  
   - Corporate success owner (dashboard spec, integrations, branding templates)

2. **Delivery mechanics**  
   - Host PDFs/assets under `public/welcome-wagon/` or gated portal  
   - Update SendGrid template with attachment/download links once assets exist  
   - Define portal architecture for interactive checklists + Mt. Olympian quest  
   - Build automation to grant access when Stripe webhook fires

3. **Quality gates**  
   - Each promise above should map to a concrete artifact before marketing push  
   - Provide acceptance checklist per tier (content completeness, QA, delivery test)  
   - Keep this doc in sync with landing page copy to avoid over-promising

Owned by: Welcome Wagon product lead. Please update whenever landing copy changes or new promises are made.

