# Database Schema Documentation

## Overview

The Ring at Fullmer Legacy Center database schema supports a comprehensive youth development platform with quest tracking, portfolio management, badge systems, and multi-site replication capabilities.

## Entity Relationship Diagram

```
┌─────────────┐
│    Sites    │ (Multi-tenant foundation)
└──────┬──────┘
       │
       ├───┐
       │   │
┌──────▼───▼──────┐
│ User Profiles   │
└──────┬──────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
┌──────▼──────────┐            ┌──────────▼──────────┐
│ Site Memberships│            │    Portfolios      │
└─────────────────┘            └──────────┬──────────┘
                                         │
                                         │
┌─────────────┐              ┌──────────▼──────────┐
│    Rings    │              │     Artifacts        │
│  (9 domains)│              └──────────────────────┘
└──────┬──────┘
       │
       │
┌──────▼──────┐
│   Pillars   │
│  (4 pillars)│
└──────┬──────┘
       │
       │
┌──────▼──────┐
│   Quests    │
└──────┬──────┘
       │
       ├──────────────────────┐
       │                      │
┌──────▼──────────┐  ┌────────▼──────────┐
│ Quest Versions  │  │ Quest Participation│
│ (HOMAGO config) │  └────────────────────┘
└─────────────────┘
```

## Core Tables

### Sites & Multi-Tenancy

#### `sites`
Each Ring implementation location. Enables replication to multiple cities.

- `id` (UUID) - Primary key
- `slug` (TEXT) - Unique identifier (e.g., 'south-jordan-flc')
- `name` (TEXT) - Display name
- `city`, `state`, `country` (TEXT) - Location
- `timezone` (TEXT) - Default timezone
- `is_active` (BOOLEAN) - Active status

### User Management

#### `user_profiles`
Extended user information linked to Supabase auth.users.

- `id` (UUID) - Primary key
- `auth_user_id` (UUID) - References auth.users
- `display_name`, `first_name`, `last_name` (TEXT)
- `champion_name` (TEXT) - Youth's chosen champion name
- `avatar_url` (TEXT)
- `bio` (TEXT)

#### `site_memberships`
User's role at each site (supports multi-site participation).

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `user_id` (UUID) - References user_profiles
- `role` (ENUM) - 'youth', 'staff', 'mentor', 'partner', 'parent_guardian', 'admin'
- `is_primary_site` (BOOLEAN)

### Rings & Pillars

#### `rings`
The nine domains of The Ring system.

1. Self - Personal identity and values
2. Body - Physical health and fitness
3. Brain - Cognitive development
4. Bubble - Immediate family
5. Scene - Peer groups
6. Neighborhood - Local community
7. Community - Broader civic engagement
8. World - Global awareness
9. Ether - Digital spaces

#### `pillars`
The four program pillars.

1. Wellness - Physical and mental health
2. TechNest - Technology and digital skills
3. Creative Studio - Arts and creative expression
4. Civic Lab - Community service and leadership

### Quest System

#### `quests`
Core programmable unit. Each curriculum file becomes one or more quests.

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `pillar_id` (UUID) - References pillars
- `slug` (TEXT) - Unique identifier
- `title` (TEXT)
- `description_md` (TEXT) - Markdown description
- `difficulty` (INT) - 1-5 scale
- `estimated_weeks` (INT)
- `is_active` (BOOLEAN)

#### `quest_versions`
Quest evolution over time with HOMAGO configuration.

- `id` (UUID) - Primary key
- `quest_id` (UUID) - References quests
- `version_number` (INT)
- `homago_config` (JSONB) - HOMAGO structure:
  - `hanging_out` - Initial engagement
  - `messing_around` - Exploration phase
  - `geeking_out` - Deep mastery phase
- `is_current` (BOOLEAN)

#### `quest_participation`
Youth enrollment in quests.

- `id` (UUID) - Primary key
- `quest_id` (UUID) - References quests
- `user_id` (UUID) - References user_profiles
- `crew_name` (TEXT) - Optional crew/team name
- `status` (ENUM) - 'not_started', 'in_progress', 'completed', 'dropped'
- `started_at`, `completed_at` (TIMESTAMPTZ)

### Portfolios

#### `portfolios`
Champion's Portfolio per youth per site.

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `user_id` (UUID) - References user_profiles
- `public_slug` (TEXT) - For shareable URLs
- `mission_stmt` (TEXT) - Personal mission statement
- `values` (TEXT[]) - Array of core values
- `color_palette` (JSONB) - Brand colors
- `is_public` (BOOLEAN)

#### `artifacts`
Portfolio content (images, videos, documents, etc.).

- `id` (UUID) - Primary key
- `portfolio_id` (UUID) - References portfolios
- `quest_id` (UUID) - Optional quest association
- `ring_id` (UUID) - Optional ring association
- `type` (ENUM) - 'image', 'video', 'audio', 'document', 'link', 'code', 'other'
- `storage_path` (TEXT) - Supabase storage key
- `external_url` (TEXT) - External link

### Badges

#### `badges`
Badge catalog (3 Minute Warrior, Varsity Ready, Cyborg Builder, etc.).

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites (nullable for global badges)
- `slug` (TEXT) - Unique identifier
- `name` (TEXT)
- `description` (TEXT)
- `ring_id` (UUID) - Optional ring association
- `pillar_id` (UUID) - Optional pillar association

#### `user_badges`
Badge awards to users.

- `id` (UUID) - Primary key
- `user_id` (UUID) - References user_profiles
- `badge_id` (UUID) - References badges
- `quest_id` (UUID) - Optional quest association
- `awarded_by` (UUID) - References user_profiles (mentor/staff)
- `awarded_at` (TIMESTAMPTZ)

### Ring Activation

#### `ring_activation_snapshots`
Cyclone visualization data - tracks ring activation levels.

- `id` (UUID) - Primary key
- `user_id` (UUID) - References user_profiles
- `site_id` (UUID) - References sites
- `ring_id` (UUID) - References rings
- `score` (NUMERIC) - Weighted sum from quests/badges
- `level` (INT) - Discrete level for UI visualization
- `computed_at` (TIMESTAMPTZ)

### Operations

#### `sessions`
Daily program activities.

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `title` (TEXT)
- `session_type` (ENUM) - 'open_dropin', 'quest_block', 'class_like', 'event', 'field_trip'
- `pillar_id` (UUID) - Optional pillar association
- `quest_id` (UUID) - Optional quest association
- `location_label` (TEXT)
- `starts_at`, `ends_at` (TIMESTAMPTZ)

#### `session_attendance`
Attendance tracking.

- `id` (UUID) - Primary key
- `session_id` (UUID) - References sessions
- `user_id` (UUID) - References user_profiles
- `status` (ENUM) - 'present', 'late', 'left_early', 'no_show'
- `check_in_at`, `check_out_at` (TIMESTAMPTZ)

### Service & Civic Engagement

#### `service_activities`
Civic engagement programs (Disaster Response Crew, Shelter Squad, Wisdom Bridge).

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `slug` (TEXT) - Unique identifier
- `name` (TEXT)
- `partner_org_id` (UUID) - Optional partner association
- `ring_id` (UUID) - Optional ring association

#### `service_logs`
Individual service hour entries.

- `id` (UUID) - Primary key
- `user_id` (UUID) - References user_profiles
- `site_id` (UUID) - References sites
- `service_activity_id` (UUID) - References service_activities
- `performed_at` (TIMESTAMPTZ)
- `duration_minutes` (INT)
- `verified_by` (UUID) - References user_profiles (staff/partner)
- `verified_at` (TIMESTAMPTZ)

### Partners

#### `partner_orgs`
Partner organizations (Senior Center, Fire Station, Rec Center, etc.).

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `slug` (TEXT) - Unique identifier
- `name` (TEXT)
- `org_type` (TEXT) - 'senior_center', 'fire_station', 'rec_center', etc.
- `primary_contact_name`, `primary_contact_email` (TEXT)

#### `partner_locations`
Physical locations for partners.

- `id` (UUID) - Primary key
- `partner_org_id` (UUID) - References partner_orgs
- `label` (TEXT) - 'Main building', 'Arena A', etc.
- `address_line1`, `address_line2` (TEXT)
- `city`, `state`, `postal_code` (TEXT)
- `latitude`, `longitude` (NUMERIC)

### Endorsements

#### `endorsements`
Mentor/staff feedback for portfolios.

- `id` (UUID) - Primary key
- `portfolio_id` (UUID) - References portfolios
- `author_user_id` (UUID) - References user_profiles (nullable for external mentors)
- `author_name`, `author_title` (TEXT) - For external mentors
- `body_md` (TEXT) - Markdown content
- `context` (TEXT) - 'Fire Station mentor', 'Esports coach', etc.

### Analytics

#### `activity_events`
Analytics and telemetry events.

- `id` (UUID) - Primary key
- `site_id` (UUID) - References sites
- `user_id` (UUID) - References user_profiles
- `event_type` (TEXT) - 'quest_started', 'session_checkin', etc.
- `event_data` (JSONB) - Arbitrary event details
- `created_at` (TIMESTAMPTZ)

## Key Relationships

1. **Multi-Tenancy**: All site-specific data references `sites.id`
2. **User Context**: Users can have different roles at different sites via `site_memberships`
3. **Quest Flow**: `quests` → `quest_versions` (HOMAGO config) → `quest_participation` → `quest_progress_events`
4. **Portfolio**: `portfolios` → `artifacts` (linked to quests/rings) → `endorsements`
5. **Ring Activation**: Computed from `quest_participation`, `user_badges`, `service_logs` → `ring_activation_snapshots`
6. **Partner Integration**: `partner_orgs` → `partner_locations`, `partner_members` → `service_activities`

## Row Level Security (RLS)

All tables have RLS enabled. Policies will be added in a separate migration to enforce:

- Users can view their own data
- Staff/admins can view site data
- Public portfolios are viewable by anyone
- Site-specific data is isolated by `site_id`

## Indexes

Key indexes are created for:
- Foreign key lookups
- Common query patterns (user_id, site_id, quest_id)
- Sorting (sort_order, created_at)
- Filtering (is_active, status)

## Future Enhancements

- Quest versioning and curriculum evolution
- Multi-site replication engine
- Advanced ring activation algorithms
- Partner API integrations
- Media CDN integration
- Analytics aggregation views

