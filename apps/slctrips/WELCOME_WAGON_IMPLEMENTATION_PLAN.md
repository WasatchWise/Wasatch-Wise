# Welcome Wagon StayKit Implementation Plan

Phased rollout designed to reuse the TripKit stack, avoid regressions, and isolate debugging per milestone. Each phase ends with a verification checklist before moving on.

---

## Phase 1 – Schema & RLS (Foundations)

### 1.1 Supabase migrations
- `staykits` (mirrors `tripkits` columns + `product_key`)
- `staykit_versions`
- `staykit_days`
- `staykit_tasks`
- `staykit_sections`
- `staykit_destinations` (join to `public_destinations`)
- `staykit_user_progress`
- `staykit_notifications`
- `staykit_community_tips`
- `staykit_snapshots`
- `user_product_library` (shared table for StayKits + TripKits)
- `snapshot_jobs` (generic job tracker)

### 1.2 Policies & triggers
- Enable RLS on user-scoped tables (`staykit_user_progress`, `staykit_notifications`, `staykit_community_tips`, `user_product_library`)  
- Trigger to auto-insert `user_product_library` rows when:
  - Week 1 email gate completes (free StayKit)
  - Stripe webhook creates `customer_product_access` entry (`product_type = 'staykit'`)
- Trigger to mark `needs_refresh` when a new version activates or NotebookLM sync finishes.

### 1.3 Verification
- Migration dry-run locally + Supabase CLI diff
- SQL scripts to insert dummy StayKit, version, day, task, progress record
- Confirm RLS blocks cross-user reads and allows owners

---

## Phase 2 – Backend Services (Snapshot + Sync)

### 2.1 Snapshot generator
- Headless renderer (Playwright or `react-pdf`) that:
  - Reads `staykit_versions` + related tables
  - Renders branded PDF
  - Uploads to Supabase Storage/S3 (`staykit_snapshots.asset_url`)
  - Logs status in `snapshot_jobs`
- CLI command + API endpoint `POST /api/staykits/snapshot` to enqueue per version/library item

### 2.2 Sync + content ingestion
- `/api/staykits/sync-content` to pull from NotebookLM (manual trigger to start)
- NotebookLM → Supabase mapping layer for days/tasks/sections
- Idempotent logic with version bumping + `notebooklm_sync_date`

### 2.3 Progress API
- `/api/staykits/progress` (GET/POST) for viewer autosave
- Validation via `user_product_library` ownership

### 2.4 Verification
- Unit test snapshot generator with fixture data
- Smoke-test sync endpoint using staging NotebookLM export
- Confirm API errors/logging surfaced in Vercel console

---

## Phase 3 – Library Experience

### 3.1 Backend
- `GET /api/library` returns both TripKits + StayKits from `user_product_library`
- Extend Stripe webhook handler to insert library rows for TripKit purchases (retrofit) and StayKit purchases
- Signed URL helper for snapshot downloads

### 3.2 Frontend
- `src/app/library/page.tsx` with Audible-style cards:
  - Cover art, product badge (`StayKit`/`TripKit`)
  - Progress ring, last-opened timestamp
  - Buttons: `Open`, `Download Snapshot`, `Sync`
  - Locked cards for upsells

### 3.3 Verification
- Seed dev user with TripKit + StayKit entries
- Ensure TripKit flows unchanged (view page still accessible via access code + library entry optional)
- Lighthouse/PWA audit for library page

---

## Phase 4 – StayKit Viewer & Snapshot UX

### 4.1 StayKit viewer (fork of `TripKitViewer`)
- Tabs: `Today`, `Journey`, `Guide`, `Explore`, `Community`
- Day/task accordion UI with swipe gestures
- Autosave via `/api/staykits/progress`
- Upgrade gating for Week 1 vs 90-day content
- Guardian voice, achievements, offline cache parity

### 4.2 Snapshot hooks
- Viewer button `Download latest snapshot` → call snapshot API if stale, otherwise fetch signed URL
- Library card CTA surfaces “New version available” banner until sync/snapshot completes
- Email/push notification template for “Snapshot ready”

### 4.3 Verification
- E2E test: Week 1 signup → library entry → viewer loads → snapshot download works
- Regression test TripKit viewer to ensure shared components untouched
- QA script for autosave + offline mode

---

## Phase 5 – Monetization & Corporate

### 5.1 Stripe integration
- Update product catalog with StayKit price points
- Webhook path: `checkout.session.completed` → `customer_product_access` (`product_type = 'staykit'`) → library entry → access email
- Support promo codes (Week 1 upgrade discount) and founder pricing

### 5.2 Corporate edition
- Admin dashboard for bulk seat provisioning (assign StayKit to employee emails)
- Branding fields (logo, welcome message) stored per customer and surfaced in viewer/snapshots
- Progress reporting per seat (pull from `staykit_user_progress`)

### 5.3 Verification
- Test purchase sandbox → library entry → viewer access → snapshot generation
- HR dashboard smoke test with mock corporate customer
- Monitoring/alerts for webhook failures

---

## Troubleshooting Guardrails
- Only one phase active in production at a time; keep feature flags around new routes/UI
- Record migrations + config in `CHANGELOG.md`
- Stage snapshot generator and NotebookLM sync jobs before enabling cron
- Maintain parity with TripKit flows; any shared component change must be reviewed against `TripKitViewer` + purchase scripts

Owned by: StayKit program lead. Update as phases progress or scope changes.

