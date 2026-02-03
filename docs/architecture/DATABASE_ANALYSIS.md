# Database Structure Analysis

## Current Database Overview

Your Supabase database contains **55 tables** focused on a **travel/education platform** for Utah destinations, tripkits, and staykits. This is a different project from the DAROS consultation platform.

---

## Core Domain: Travel & Education Platform

### Primary Entities

#### 1. **Destinations** (59 columns)
- Utah travel destinations
- Rich content structure with media, attributes, content
- Related to: county_facts, county_profiles, film_locations

#### 2. **Tripkits** (44 columns)
- Travel planning products/bundles
- Pricing, subscriptions, marketing copy
- Related to: tripkit_bundles, tripkit_orders, user_tripkit_access

#### 3. **Staykits** (46 columns)
- Stay/experience products
- Tasks, sections, days structure
- Related to: staykit_tasks, staykit_days, staykit_versions

#### 4. **County Facts & Profiles**
- `county_facts` (44 columns) - Comprehensive Utah county data
- `county_profiles` (15 columns) - County summaries
- Educational content for Utah studies

#### 5. **User Management**
- `profiles` - User profiles (linked to auth.users)
- `purchases` - Product purchases
- `user_tripkit_access` - Access management
- `user_tripkit_progress` - Progress tracking

#### 6. **Content & Media**
- `destination_media` - Images/videos for destinations
- `destination_content` - Rich text content
- `deep_dive_stories` - Long-form content
- `film_locations` - Movie filming locations

#### 7. **Commerce**
- `purchases` - Transaction records
- `tripkit_orders` - Order management
- `flash_sale_config` / `flash_sale_purchases` - Sales
- `tripkit_subscription_plans` - Recurring billing

#### 8. **Education Features**
- `educator_submissions` - Teacher content submissions
- `guardians` / `guardian_beats` - Guardian/educator system
- `user_tripkit_progress` - Learning progress

---

## Key Relationships

### Destination Ecosystem
```
destinations (core)
├── destination_media
├── destination_content
├── destination_attributes
├── destination_affiliate_gear
├── destination_provenance_log
└── film_locations
```

### Tripkit System
```
tripkits (core)
├── tripkit_bundles
├── tripkit_bundle_components
├── tripkit_orders
├── tripkit_destinations
├── tripkit_access_codes
├── user_tripkit_access
└── user_tripkit_progress
```

### Staykit System
```
staykits (core)
├── staykit_versions
├── staykit_days
├── staykit_sections
├── staykit_tasks
├── staykit_tips
├── staykit_destinations
└── staykit_user_progress
```

### User Journey
```
profiles (auth.users)
├── purchases
├── user_tripkit_access
├── user_tripkit_progress
├── user_staykit_progress
├── user_trips
└── user_favorites
```

---

## Tables by Category

### Content & Media (12 tables)
- destinations
- destination_media
- destination_content
- destination_attributes
- deep_dive_stories
- film_locations
- county_facts
- county_profiles
- morbid_destinations
- mystery_destinations
- water_destinations
- destination_affiliate_gear

### Products & Commerce (15 tables)
- tripkits
- tripkit_bundles
- tripkit_bundle_components
- staykits
- purchases
- tripkit_orders
- flash_sale_config
- flash_sale_purchases
- tripkit_subscription_plans
- tripkit_pricing_tiers
- tripkit_discount_codes
- categories
- affiliate_products
- customer_product_access
- user_product_library

### User Management (10 tables)
- profiles
- user_tripkit_access
- user_tripkit_progress
- user_staykit_progress
- user_trips
- user_favorites
- user_tokens
- user_task_completion
- email_captures
- tripkit_email_subscribers

### Staykit System (10 tables)
- staykits
- staykit_versions
- staykit_days
- staykit_sections
- staykit_tasks
- staykit_tips
- staykit_destinations
- staykit_access_codes
- staykit_community_tips
- staykit_notifications
- staykit_snapshots

### Education & Community (5 tables)
- educator_submissions
- guardians
- guardian_beats
- tripkit_interest
- tripkit_sources

### Analytics & Tracking (3 tables)
- trip_planner_analytics
- enhancement_progress
- snapshot_jobs

---

## Notable Features

### 1. Versioning System
- `staykit_versions` - Version control for staykits
- `snapshot_jobs` - Snapshot generation
- `staykit_snapshots` - Version snapshots

### 2. Provenance Tracking
- `destination_provenance_log` - Change tracking
- `verified_by` / `changed_by` foreign keys

### 3. Access Control
- `tripkit_access_codes` - Code-based access
- `staykit_access_codes` - Code-based access
- `customer_product_access` - Access management

### 4. Marketing & Sales
- `tripkit_marketing_copy` - Marketing content
- `flash_sale_config` - Time-limited sales
- `tripkit_discount_codes` - Promo codes

### 5. Community Features
- `staykit_community_tips` - User-generated tips
- `guardian_beats` - Community content
- `educator_submissions` - Teacher contributions

---

## Comparison with DAROS Schema

### What's Missing (DAROS needs):
- ❌ `districts` table
- ❌ `artifacts` table
- ❌ `controls` / `district_controls` tables
- ❌ `stakeholder_matrix` table
- ❌ `interventions` table
- ❌ `vendors` / `district_vendors` tables
- ❌ `briefing_sessions` table
- ❌ `adoption_plans` table

### What Exists (Can Reuse):
- ✅ `email_captures` - Lead capture (already exists, different structure)
- ✅ `profiles` - User management (can extend)
- ✅ Provenance/versioning patterns (good reference)

---

## Recommendations

### Option 1: Separate Schema
Keep DAROS tables separate from travel platform. They serve different purposes:
- Travel platform = consumer product
- DAROS = B2B consultation tool

### Option 2: Shared Foundation
Use existing patterns:
- Extend `profiles` for consultant/district users
- Reuse versioning patterns for artifacts
- Use provenance_log pattern for audit trails

### Option 3: New Database
Create separate Supabase project for DAROS to keep domains clean.

---

## Next Steps

1. **Clarify Intent**: Is DAROS a separate product, or should it integrate with this travel platform?

2. **If Separate**: Apply DAROS schema to this database (or new project)

3. **If Integrated**: Design integration points:
   - Shared user authentication
   - Cross-product analytics
   - Unified dashboard

---

**Database Status**: Travel/education platform is well-structured with 55 tables  
**DAROS Status**: Schema designed but not yet applied  
**Decision Needed**: Integration strategy
