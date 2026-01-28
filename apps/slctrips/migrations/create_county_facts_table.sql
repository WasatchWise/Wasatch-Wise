-- ============================================================================
-- COUNTY FACTS TABLE
-- Comprehensive educational data for all 29 Utah counties
-- Designed for 4th grade Utah Studies curriculum (TK-000)
-- ============================================================================

CREATE TABLE IF NOT EXISTS county_facts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic Identification
  county_name TEXT NOT NULL UNIQUE,
  county_seat TEXT NOT NULL,
  year_established INTEGER,
  named_after TEXT, -- Origin of the county name

  -- Demographics
  population INTEGER,
  population_year INTEGER DEFAULT 2024,
  area_square_miles INTEGER,
  population_density_per_sq_mile INTEGER,

  -- Geography & Nature
  elevation_range TEXT, -- e.g., "4,500 - 12,000 feet"
  highest_point TEXT,
  highest_point_elevation INTEGER,
  famous_landforms TEXT[], -- Array of notable geographic features
  geographical_highlight TEXT, -- Single sentence kid-friendly description
  climate_zone TEXT,

  -- Cities & Towns
  major_cities TEXT[], -- Top 3-5 cities/towns

  -- Economy & Resources
  top_resources TEXT[], -- Mining, agriculture, tourism, etc.
  primary_industries TEXT[],
  agricultural_products TEXT[],

  -- History & Culture
  famous_people JSONB, -- [{name: "Person", claim: "Why they're famous"}]
  historical_events JSONB, -- [{year: 1869, event: "Railroad completion"}]
  indigenous_heritage TEXT, -- Native American history
  pioneer_history TEXT, -- Settlement history

  -- Modern Attractions
  unique_attractions TEXT[],
  filmed_locations JSONB, -- Movies/TV shows filmed here
  festivals_events TEXT[],

  -- Educational Fun Facts
  did_you_know_facts TEXT[], -- 5-10 surprising kid-friendly facts
  fun_comparisons TEXT[], -- "Bigger than Rhode Island!", etc.
  weird_laws TEXT[], -- Quirky local ordinances
  state_records TEXT[], -- "Tallest mountain", "Most snowfall", etc.

  -- Symbols & Identity
  unofficial_motto TEXT,
  county_colors TEXT[],
  notable_symbols TEXT, -- County flower, bird, etc.

  -- Kid-Friendly Highlights
  kid_friendly_summary TEXT, -- 2-3 sentence pitch for 9-year-olds
  coolness_rating INTEGER CHECK (coolness_rating >= 1 AND coolness_rating <= 10),
  adventure_level TEXT CHECK (adventure_level IN ('Chill Explorer', 'Weekend Warrior', 'Extreme Adventurer')),
  best_for TEXT[], -- "Hiking", "Swimming", "History", etc.

  -- Curriculum Integration
  utah_studies_themes TEXT[], -- Geography, Resources, Culture, Government
  field_trip_ideas TEXT[],
  research_project_prompts TEXT[],

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_verified BOOLEAN DEFAULT false,
  data_sources TEXT[] -- URLs or references for fact-checking
);

-- Create index for fast county lookups
CREATE INDEX IF NOT EXISTS idx_county_facts_name ON county_facts(county_name);

-- Enable Row Level Security
ALTER TABLE county_facts ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "County facts are publicly readable"
  ON county_facts
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can write
CREATE POLICY "Authenticated users can manage county facts"
  ON county_facts
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Add helpful comment
COMMENT ON TABLE county_facts IS 'Comprehensive educational data for Utah counties, optimized for 4th grade Utah Studies curriculum and TK-000 TripKit';
