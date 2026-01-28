-- ============================================================================
-- Migration Script for Existing DAiTE Database
-- This script safely handles existing tables and adds missing ones
-- ============================================================================

-- First, let's see what we're working with
-- Run this section to check current state:
/*
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
*/

-- ============================================================================
-- STEP 1: Enable Extensions (Safe - won't error if already exists)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- STEP 2: Handle Existing vs New Tables
-- ============================================================================

-- Based on your existing tables, we need to:
-- 1. Check if tables exist before creating
-- 2. Potentially rename/migrate existing tables (daite_users -> users)
-- 3. Add missing columns to existing tables
-- 4. Create new tables that don't exist

-- ============================================================================
-- OPTION A: If you want to keep existing data and merge schemas
-- ============================================================================

-- This is more complex - we'd need to check each table's structure
-- and add missing columns. Let's do this step by step.

-- ============================================================================
-- OPTION B: Create missing tables only (SAFER - Recommended first step)
-- ============================================================================

-- Create tables that don't exist yet, using IF NOT EXISTS pattern

-- Core User Tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE TABLE public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            pseudonym TEXT UNIQUE NOT NULL,
            avatar_url TEXT,
            account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'paused', 'graduated', 'deleted')),
            verification_tier INTEGER NOT NULL DEFAULT 0 CHECK (verification_tier IN (0, 1, 2, 3)),
            is_premium BOOLEAN NOT NULL DEFAULT false,
            premium_tier TEXT CHECK (premium_tier IN ('monthly', 'yearly')),
            premium_expires_at TIMESTAMPTZ,
            onboarding_completed_at TIMESTAMPTZ,
            onboarding_skipped BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

-- User Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        CREATE TABLE public.user_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
            age INTEGER,
            bio TEXT,
            location_city TEXT,
            location_state TEXT,
            location_country TEXT,
            location_coordinates POINT,
            looking_for TEXT[] DEFAULT ARRAY['dating']::TEXT[] CHECK (looking_for <@ ARRAY['dating', 'friends', 'community']::TEXT[]),
            age_preference_min INTEGER DEFAULT 18,
            age_preference_max INTEGER DEFAULT 100,
            distance_preference_km INTEGER DEFAULT 50,
            relationship_goals TEXT,
            dealbreakers TEXT[],
            values TEXT[],
            aesthetic_profile JSONB,
            profile_completeness_score INTEGER DEFAULT 0 CHECK (profile_completeness_score BETWEEN 0 AND 100),
            profile_embedding vector(768),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- Continue with other missing tables...
-- (This is getting long - let me create a better solution)

-- ============================================================================
-- RECOMMENDED APPROACH: Use a script to generate IF NOT EXISTS statements
-- ============================================================================

-- Instead of manually doing each table, let's create a helper script

