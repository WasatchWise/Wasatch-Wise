#!/usr/bin/env node

/**
 * Video Opportunity Analyzer
 * 
 * Identifies top destinations that would benefit from videos:
 * - Featured destinations without videos
 * - High-traffic destinations without videos
 * - Popular destinations without videos
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env.local');
let envVars = {};

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_DANIEL_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Analyze video opportunities
 */
async function analyzeVideoOpportunities() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('🎬 VIDEO OPPORTUNITY ANALYSIS');
  console.log('═'.repeat(80));
  console.log('');
  
  // Get all active destinations
  const { data: allDestinations, error: allError } = await supabase
    .from('public_destinations')
    .select('id, name, slug, description, county, subcategory, category, is_featured, featured, video_url, popularity_score')
    .order('popularity_score', { ascending: false, nullsFirst: false });
  
  if (allError) {
    console.error('❌ Error fetching destinations:', allError.message);
    process.exit(1);
  }
  
  console.log(`📊 Total active destinations: ${allDestinations.length}`);
  
  // Categorize destinations
  const withVideos = allDestinations.filter(d => d.video_url);
  const withoutVideos = allDestinations.filter(d => !d.video_url);
  
  console.log(`✅ With videos: ${withVideos.length}`);
  console.log(`❌ Without videos: ${withoutVideos.length}`);
  console.log('');
  
  // Priority 1: Featured destinations without videos
  const featuredWithoutVideos = withoutVideos.filter(d => 
    d.is_featured === true || d.featured === true
  );
  
  // Priority 2: High popularity score without videos (top 20%)
  const sortedByPopularity = withoutVideos
    .filter(d => d.popularity_score && d.popularity_score > 0)
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
  
  const top20Percent = Math.ceil(sortedByPopularity.length * 0.2);
  const highPopularityWithoutVideos = sortedByPopularity.slice(0, top20Percent);
  
  // Priority 3: National/State Parks without videos
  const parksWithoutVideos = withoutVideos.filter(d => 
    d.subcategory?.toLowerCase().includes('national park') ||
    d.subcategory?.toLowerCase().includes('state park') ||
    d.name?.toLowerCase().includes('national park') ||
    d.name?.toLowerCase().includes('state park')
  );
  
  // Priority 4: Popular categories without videos
  const categoryCounts = {};
  withoutVideos.forEach(d => {
    const cat = d.category || 'uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  const popularCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);
  
  const popularCategoryDestinations = withoutVideos.filter(d => 
    popularCategories.includes(d.category)
  );
  
  // Combine and deduplicate priorities
  const priorityMap = new Map();
  
  // Add featured (highest priority)
  featuredWithoutVideos.forEach(d => {
    priorityMap.set(d.id, {
      ...d,
      priority: 1,
      priorityReason: 'Featured destination',
      score: 100
    });
  });
  
  // Add high popularity
  highPopularityWithoutVideos.forEach(d => {
    if (!priorityMap.has(d.id)) {
      priorityMap.set(d.id, {
        ...d,
        priority: 2,
        priorityReason: `High popularity (score: ${d.popularity_score})`,
        score: d.popularity_score || 0
      });
    }
  });
  
  // Add parks
  parksWithoutVideos.forEach(d => {
    if (!priorityMap.has(d.id)) {
      priorityMap.set(d.id, {
        ...d,
        priority: 3,
        priorityReason: 'National/State Park',
        score: 50
      });
    }
  });
  
  // Add popular categories
  popularCategoryDestinations.forEach(d => {
    if (!priorityMap.has(d.id)) {
      priorityMap.set(d.id, {
        ...d,
        priority: 4,
        priorityReason: `Popular category: ${d.category}`,
        score: 30
      });
    }
  });
  
  const opportunities = Array.from(priorityMap.values())
    .sort((a, b) => {
      // Sort by priority first, then by score
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.score - a.score;
    });
  
  // Generate reports
  console.log('🎯 TOP VIDEO OPPORTUNITIES');
  console.log('═'.repeat(80));
  console.log('');
  
  // Priority 1: Featured
  if (featuredWithoutVideos.length > 0) {
    console.log(`⭐ PRIORITY 1: Featured Destinations (${featuredWithoutVideos.length})`);
    console.log('');
    featuredWithoutVideos.slice(0, 10).forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name}`);
      console.log(`      Slug: ${d.slug}`);
      console.log(`      County: ${d.county || 'N/A'}`);
      console.log(`      Category: ${d.category || 'N/A'}`);
      console.log('');
    });
    if (featuredWithoutVideos.length > 10) {
      console.log(`   ... and ${featuredWithoutVideos.length - 10} more`);
      console.log('');
    }
  }
  
  // Priority 2: High Popularity
  if (highPopularityWithoutVideos.length > 0) {
    console.log(`🔥 PRIORITY 2: High Popularity (${highPopularityWithoutVideos.length})`);
    console.log('');
    highPopularityWithoutVideos.slice(0, 10).forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name} (Score: ${d.popularity_score})`);
      console.log(`      Slug: ${d.slug}`);
      console.log(`      Category: ${d.category || 'N/A'}`);
      console.log('');
    });
    if (highPopularityWithoutVideos.length > 10) {
      console.log(`   ... and ${highPopularityWithoutVideos.length - 10} more`);
      console.log('');
    }
  }
  
  // Priority 3: Parks
  if (parksWithoutVideos.length > 0) {
    console.log(`🏞️  PRIORITY 3: National/State Parks (${parksWithoutVideos.length})`);
    console.log('');
    parksWithoutVideos.slice(0, 10).forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name}`);
      console.log(`      Slug: ${d.slug}`);
      console.log(`      County: ${d.county || 'N/A'}`);
      console.log('');
    });
    if (parksWithoutVideos.length > 10) {
      console.log(`   ... and ${parksWithoutVideos.length - 10} more`);
      console.log('');
    }
  }
  
  // Summary statistics
  console.log('═'.repeat(80));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Total opportunities identified: ${opportunities.length}`);
  console.log(`   - Featured: ${featuredWithoutVideos.length}`);
  console.log(`   - High Popularity: ${highPopularityWithoutVideos.length}`);
  console.log(`   - Parks: ${parksWithoutVideos.length}`);
  console.log(`   - Popular Categories: ${popularCategoryDestinations.length}`);
  console.log('');
  console.log(`Popular categories needing videos: ${popularCategories.join(', ')}`);
  console.log('');
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDestinations: allDestinations.length,
      withVideos: withVideos.length,
      withoutVideos: withoutVideos.length,
      opportunities: opportunities.length
    },
    priorities: {
      featured: featuredWithoutVideos.length,
      highPopularity: highPopularityWithoutVideos.length,
      parks: parksWithoutVideos.length,
      popularCategories: popularCategoryDestinations.length
    },
    opportunities: opportunities.map(opp => ({
      id: opp.id,
      name: opp.name,
      slug: opp.slug,
      county: opp.county,
      category: opp.category,
      subcategory: opp.subcategory,
      priority: opp.priority,
      priorityReason: opp.priorityReason,
      score: opp.score,
      popularityScore: opp.popularity_score
    })),
    popularCategories: popularCategories,
    categoryBreakdown: categoryCounts
  };
  
  const reportPath = join(__dirname, 'video-opportunities-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Review top opportunities');
  console.log('   2. Use find-youtube-videos.mjs to search for videos');
  console.log('   3. Add videos to high-priority destinations');
  console.log('');
}

// Run analysis
analyzeVideoOpportunities().catch(console.error);

