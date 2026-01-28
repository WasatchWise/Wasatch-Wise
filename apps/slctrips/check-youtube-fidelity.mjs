#!/usr/bin/env node

/**
 * YouTube Video Fidelity Checker
 * 
 * This script checks YouTube videos associated with destinations and TripKits
 * to verify they match the content of the page they're associated with.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

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
const YOUTUBE_API_KEY = envVars.YOUTUBE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\s?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\s?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Fetch video details from YouTube Data API
 */
function fetchVideoDetails(videoId) {
  if (!YOUTUBE_API_KEY) {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items && json.items.length > 0) {
            resolve(json.items[0]);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Check if video title/description matches destination name/keywords
 */
function checkVideoRelevance(videoDetails, destination) {
  if (!videoDetails) return { relevant: false, reason: 'No video details available' };
  
  const videoTitle = (videoDetails.snippet?.title || '').toLowerCase();
  const videoDescription = (videoDetails.snippet?.description || '').toLowerCase();
  const destinationName = (destination.name || '').toLowerCase();
  const destinationSlug = (destination.slug || '').toLowerCase();
  const destinationDescription = (destination.description || '').toLowerCase();
  
  // Extract keywords from destination
  const keywords = [
    destinationName,
    ...destinationName.split(' '),
    ...destinationSlug.split('-'),
  ].filter(k => k.length > 2);
  
  // Check if video title or description contains destination keywords
  let matchCount = 0;
  let matchedKeywords = [];
  
  for (const keyword of keywords) {
    if (videoTitle.includes(keyword) || videoDescription.includes(keyword)) {
      matchCount++;
      matchedKeywords.push(keyword);
    }
  }
  
  // Check location/county match
  const county = (destination.county || '').toLowerCase();
  const locationMatch = county && (videoTitle.includes(county) || videoDescription.includes(county));
  
  const relevanceScore = matchCount / Math.max(keywords.length, 1);
  const isRelevant = relevanceScore > 0.3 || locationMatch || matchCount >= 2;
  
  return {
    relevant: isRelevant,
    relevanceScore,
    matchCount,
    matchedKeywords,
    locationMatch,
    reason: isRelevant 
      ? `Matched ${matchCount} keywords: ${matchedKeywords.join(', ')}`
      : `Low relevance (${(relevanceScore * 100).toFixed(0)}% match)`
  };
}

/**
 * Main function to check YouTube video fidelity
 */
async function checkYouTubeFidelity() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('🎬 YOUTUBE VIDEO FIDELITY CHECK');
  console.log('═'.repeat(80));
  console.log('');
  
  // Fetch destinations with video URLs
  const { data: destinations, error: destError } = await supabase
    .from('public_destinations')
    .select('id, name, slug, description, county, video_url, subcategory, category')
    .not('video_url', 'is', null);
  
  if (destError) {
    console.error('❌ Error fetching destinations:', destError.message);
    process.exit(1);
  }
  
  console.log(`📊 Found ${destinations.length} destinations with video URLs\n`);
  
  // Check TripKits with videos (if they have video_url field)
  let tripkits = [];
  try {
    const { data: tkData, error: tkError } = await supabase
      .from('tripkits')
      .select('id, name, slug, description, video_url');
    
    if (!tkError && tkData) {
      tripkits = tkData.filter(tk => tk.video_url);
      console.log(`📦 Found ${tripkits.length} TripKits with video URLs\n`);
    }
  } catch (error) {
    console.log('⚠️  Could not fetch TripKits (table may not exist or have video_url field)\n');
  }
  
  const results = {
    total: destinations.length + tripkits.length,
    checked: 0,
    relevant: 0,
    irrelevant: 0,
    errors: 0,
    noApiKey: !YOUTUBE_API_KEY,
    details: []
  };
  
  // Check destination videos
  console.log('🔍 Checking destination videos...\n');
  
  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];
    const videoId = getYouTubeVideoId(dest.video_url);
    
    if (!videoId) {
      results.errors++;
      results.details.push({
        type: 'destination',
        id: dest.id,
        name: dest.name,
        videoUrl: dest.video_url,
        status: 'error',
        reason: 'Invalid YouTube URL format'
      });
      console.log(`❌ ${dest.name}: Invalid YouTube URL format`);
      continue;
    }
    
    try {
      const videoDetails = await fetchVideoDetails(videoId);
      results.checked++;
      
      if (!videoDetails) {
        results.errors++;
        results.details.push({
          type: 'destination',
          id: dest.id,
          name: dest.name,
          videoUrl: dest.video_url,
          videoId,
          status: 'error',
          reason: 'Video not found or API error'
        });
        console.log(`⚠️  ${dest.name}: Video not found (ID: ${videoId})`);
        continue;
      }
      
      const relevance = checkVideoRelevance(videoDetails, dest);
      
      if (relevance.relevant) {
        results.relevant++;
      } else {
        results.irrelevant++;
      }
      
      results.details.push({
        type: 'destination',
        id: dest.id,
        name: dest.name,
        slug: dest.slug,
        videoUrl: dest.video_url,
        videoId,
        videoTitle: videoDetails.snippet?.title,
        videoChannel: videoDetails.snippet?.channelTitle,
        status: relevance.relevant ? 'relevant' : 'irrelevant',
        relevanceScore: relevance.relevanceScore,
        matchCount: relevance.matchCount,
        matchedKeywords: relevance.matchedKeywords,
        reason: relevance.reason
      });
      
      const statusIcon = relevance.relevant ? '✅' : '❌';
      console.log(`${statusIcon} ${dest.name}`);
      console.log(`   Video: ${videoDetails.snippet?.title}`);
      console.log(`   ${relevance.reason}`);
      console.log('');
      
      // Rate limiting - be nice to YouTube API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.errors++;
      results.details.push({
        type: 'destination',
        id: dest.id,
        name: dest.name,
        videoUrl: dest.video_url,
        status: 'error',
        reason: error.message
      });
      console.log(`❌ ${dest.name}: Error - ${error.message}`);
    }
  }
  
  // Check TripKit videos
  if (tripkits.length > 0) {
    console.log('\n🔍 Checking TripKit videos...\n');
    
    for (const tk of tripkits) {
      const videoId = getYouTubeVideoId(tk.video_url);
      
      if (!videoId) {
        results.errors++;
        results.details.push({
          type: 'tripkit',
          id: tk.id,
          name: tk.name,
          videoUrl: tk.video_url,
          status: 'error',
          reason: 'Invalid YouTube URL format'
        });
        continue;
      }
      
      try {
        const videoDetails = await fetchVideoDetails(videoId);
        results.checked++;
        
        if (!videoDetails) {
          results.errors++;
          continue;
        }
        
        const relevance = checkVideoRelevance(videoDetails, tk);
        
        if (relevance.relevant) {
          results.relevant++;
        } else {
          results.irrelevant++;
        }
        
        results.details.push({
          type: 'tripkit',
          id: tk.id,
          name: tk.name,
          slug: tk.slug,
          videoUrl: tk.video_url,
          videoId,
          videoTitle: videoDetails.snippet?.title,
          videoChannel: videoDetails.snippet?.channelTitle,
          status: relevance.relevant ? 'relevant' : 'irrelevant',
          relevanceScore: relevance.relevanceScore,
          reason: relevance.reason
        });
        
      } catch (error) {
        results.errors++;
      }
    }
  }
  
  // Summary
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`Total items with videos: ${results.total}`);
  console.log(`Successfully checked: ${results.checked}`);
  console.log(`✅ Relevant videos: ${results.relevant} (${((results.relevant / results.checked) * 100).toFixed(1)}%)`);
  console.log(`❌ Irrelevant videos: ${results.irrelevant} (${((results.irrelevant / results.checked) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Errors: ${results.errors}`);
  
  if (results.noApiKey) {
    console.log('\n⚠️  WARNING: YOUTUBE_API_KEY not set - could not verify video details');
  }
  
  // Generate report file
  const reportPath = join(__dirname, 'youtube-fidelity-report.json');
  const fs = await import('fs');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // List problematic videos
  if (results.irrelevant > 0) {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('❌ VIDEOS THAT MAY NOT MATCH CONTENT');
    console.log('═'.repeat(80));
    console.log('');
    
    const irrelevant = results.details.filter(d => d.status === 'irrelevant');
    for (const item of irrelevant.slice(0, 10)) { // Show first 10
      console.log(`❌ ${item.name} (${item.type})`);
      console.log(`   Video: ${item.videoTitle}`);
      console.log(`   URL: ${item.videoUrl}`);
      console.log(`   Reason: ${item.reason}`);
      console.log('');
    }
    
    if (irrelevant.length > 10) {
      console.log(`... and ${irrelevant.length - 10} more (see report file)\n`);
    }
  }
  
  console.log('═'.repeat(80));
  console.log('');
}

// Run the check
checkYouTubeFidelity().catch(console.error);

