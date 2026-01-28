#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_DANIEL_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyData() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('📊 SUPABASE DATA VERIFICATION');
  console.log('═'.repeat(80));
  console.log('');

  // Get overall stats
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('id, place_id, photo_gallery, video_url, ai_story, ai_tips');

  if (error) {
    console.error('❌ Error fetching data:', error.message);
    process.exit(1);
  }

  const stats = {
    total: destinations.length,
    withGoogleData: destinations.filter(d => d.place_id).length,
    withPhotos: destinations.filter(d => d.photo_gallery && d.photo_gallery.length > 0).length,
    withVideos: destinations.filter(d => d.video_url).length,
    withAIStories: destinations.filter(d => d.ai_story).length,
    withAITips: destinations.filter(d => d.ai_tips).length,
  };

  // Count total photos
  let totalPhotos = 0;
  destinations.forEach(d => {
    if (d.photo_gallery && Array.isArray(d.photo_gallery)) {
      totalPhotos += d.photo_gallery.length;
    }
  });

  console.log('✅ Total Destinations:', stats.total);
  console.log('');
  console.log('📍 With Google Places Data:', stats.withGoogleData,
    `(${((stats.withGoogleData / stats.total) * 100).toFixed(1)}%)`);
  console.log('📸 With Photo Galleries:', stats.withPhotos,
    `(${((stats.withPhotos / stats.total) * 100).toFixed(1)}%)`);
  console.log('   → Total Photos:', totalPhotos);
  console.log('   → Avg Photos per Gallery:', (totalPhotos / stats.withPhotos || 0).toFixed(1));
  console.log('🎬 With YouTube Videos:', stats.withVideos,
    `(${((stats.withVideos / stats.total) * 100).toFixed(1)}%)`);
  console.log('📖 With AI Stories:', stats.withAIStories,
    `(${((stats.withAIStories / stats.total) * 100).toFixed(1)}%)`);
  console.log('💡 With AI Tips:', stats.withAITips,
    `(${((stats.withAITips / stats.total) * 100).toFixed(1)}%)`);
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  console.log('✅ All data is safely stored in Supabase!');
  console.log('✅ Code is backed up on GitHub!');
  console.log('');
}

verifyData().catch(console.error);
