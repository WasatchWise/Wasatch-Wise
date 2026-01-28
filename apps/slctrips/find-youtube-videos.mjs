#!/usr/bin/env node

/**
 * YouTube Video Finder
 * 
 * Helps find appropriate YouTube videos for destinations using YouTube Data API
 * Provides search suggestions and validates video relevance
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

const YOUTUBE_API_KEY = envVars.YOUTUBE_API_KEY;
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_DANIEL_SERVICE_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('❌ YOUTUBE_API_KEY not found in .env.local');
  process.exit(1);
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

/**
 * Search YouTube for videos
 */
function searchYouTube(query, maxResults = 10) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodedQuery}&key=${YOUTUBE_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
          } else {
            resolve(json.items || []);
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
 * Check video relevance
 */
function checkRelevance(video, destination) {
  const videoTitle = (video.snippet?.title || '').toLowerCase();
  const videoDescription = (video.snippet?.description || '').toLowerCase();
  const destinationName = (destination.name || '').toLowerCase();
  const destinationSlug = (destination.slug || '').toLowerCase();
  
  // Extract keywords
  const keywords = [
    destinationName,
    ...destinationName.split(' ').filter(k => k.length > 2),
    ...destinationSlug.split('-').filter(k => k.length > 2)
  ];
  
  let matchCount = 0;
  const matchedKeywords = [];
  
  for (const keyword of keywords) {
    if (videoTitle.includes(keyword) || videoDescription.includes(keyword)) {
      matchCount++;
      matchedKeywords.push(keyword);
    }
  }
  
  const relevanceScore = matchCount / Math.max(keywords.length, 1);
  const isRelevant = relevanceScore > 0.3 || matchCount >= 2;
  
  return {
    relevant: isRelevant,
    relevanceScore,
    matchCount,
    matchedKeywords
  };
}

/**
 * Find videos for a destination
 */
async function findVideosForDestination(destinationName, destinationSlug, county, category) {
  console.log(`\n🔍 Searching for videos: ${destinationName}`);
  console.log(`   Location: ${county || 'N/A'}, Category: ${category || 'N/A'}`);
  console.log('');
  
  // Build search queries
  const queries = [
    `${destinationName} ${county || ''}`.trim(),
    `${destinationName} tour`,
    `${destinationName} visit`,
    `${destinationName} guide`,
    `${destinationName} hiking`,
  ].filter(q => q.length > 0);
  
  const allResults = [];
  
  for (const query of queries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
    try {
      console.log(`   Searching: "${query}"...`);
      const results = await searchYouTube(query, 5);
      
      for (const video of results) {
        const relevance = checkRelevance(video, {
          name: destinationName,
          slug: destinationSlug
        });
        
        allResults.push({
          videoId: video.id.videoId,
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          description: video.snippet.description.substring(0, 200),
          thumbnail: video.snippet.thumbnails?.default?.url,
          publishedAt: video.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          relevance: relevance.relevant,
          relevanceScore: relevance.relevanceScore,
          matchCount: relevance.matchCount,
          matchedKeywords: relevance.matchedKeywords
        });
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`   ⚠️  Error searching "${query}": ${error.message}`);
    }
  }
  
  // Deduplicate and sort by relevance
  const uniqueResults = Array.from(
    new Map(allResults.map(v => [v.videoId, v])).values()
  ).sort((a, b) => {
    if (a.relevance !== b.relevance) {
      return b.relevance ? 1 : -1;
    }
    return b.relevanceScore - a.relevanceScore;
  });
  
  return uniqueResults;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node find-youtube-videos.mjs <destination-name> [destination-slug] [county]');
    console.log('');
    console.log('Examples:');
    console.log('  node find-youtube-videos.mjs "Zion National Park"');
    console.log('  node find-youtube-videos.mjs "Snow Canyon State Park" "snow-canyon" "Washington County"');
    console.log('');
    console.log('Or use with opportunity report:');
    console.log('  node find-youtube-videos.mjs --from-report');
    process.exit(0);
  }
  
  if (args[0] === '--from-report') {
    // Load opportunity report and find videos for top 10
    try {
      const reportPath = join(__dirname, 'video-opportunities-report.json');
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      
      console.log('🎯 Finding videos for top 10 opportunities...\n');
      
      const top10 = report.opportunities.slice(0, 10);
      
      for (const opp of top10) {
        const videos = await findVideosForDestination(
          opp.name,
          opp.slug,
          opp.county,
          opp.category
        );
        
        // Show top 3 relevant videos
        const relevantVideos = videos.filter(v => v.relevance).slice(0, 3);
        
        if (relevantVideos.length > 0) {
          console.log(`\n✅ Found ${relevantVideos.length} relevant videos:`);
          relevantVideos.forEach((v, i) => {
            console.log(`\n   ${i + 1}. ${v.title}`);
            console.log(`      Channel: ${v.channel}`);
            console.log(`      Relevance: ${(v.relevanceScore * 100).toFixed(0)}%`);
            console.log(`      URL: ${v.url}`);
          });
        } else {
          console.log(`\n⚠️  No highly relevant videos found`);
        }
        
        console.log('\n' + '─'.repeat(60));
        
        // Rate limiting between destinations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('   Run analyze-video-opportunities.mjs first to generate report');
      process.exit(1);
    }
    
  } else {
    // Single destination search
    const destinationName = args[0];
    const destinationSlug = args[1] || destinationName.toLowerCase().replace(/\s+/g, '-');
    const county = args[2] || '';
    
    const videos = await findVideosForDestination(destinationName, destinationSlug, county, '');
    
    console.log(`\n📊 Found ${videos.length} videos\n`);
    
    // Show relevant videos first
    const relevantVideos = videos.filter(v => v.relevance);
    const otherVideos = videos.filter(v => !v.relevance);
    
    if (relevantVideos.length > 0) {
      console.log('✅ RELEVANT VIDEOS:');
      console.log('');
      relevantVideos.slice(0, 5).forEach((v, i) => {
        console.log(`${i + 1}. ${v.title}`);
        console.log(`   Channel: ${v.channel}`);
        console.log(`   Relevance: ${(v.relevanceScore * 100).toFixed(0)}% (matched: ${v.matchedKeywords.join(', ')})`);
        console.log(`   URL: ${v.url}`);
        console.log(`   Published: ${new Date(v.publishedAt).toLocaleDateString()}`);
        console.log('');
      });
    }
    
    if (otherVideos.length > 0 && relevantVideos.length < 5) {
      console.log('⚠️  OTHER VIDEOS (lower relevance):');
      console.log('');
      otherVideos.slice(0, 5 - relevantVideos.length).forEach((v, i) => {
        console.log(`${i + 1}. ${v.title}`);
        console.log(`   Channel: ${v.channel}`);
        console.log(`   Relevance: ${(v.relevanceScore * 100).toFixed(0)}%`);
        console.log(`   URL: ${v.url}`);
        console.log('');
      });
    }
    
    console.log('💡 To add a video to the database, use:');
    console.log(`   UPDATE destinations SET video_url = 'YOUTUBE_URL' WHERE slug = '${destinationSlug}';`);
    console.log('');
  }
}

main().catch(console.error);

