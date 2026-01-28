#!/usr/bin/env node

/**
 * YouTube Video Cleanup Script
 * 
 * This script removes irrelevant and broken video URLs from the database
 * based on the fidelity report findings.
 * 
 * SAFETY: Creates a backup before making changes
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
 * Load fidelity report
 */
function loadFidelityReport() {
  try {
    const reportPath = join(__dirname, 'youtube-fidelity-report.json');
    const reportContent = readFileSync(reportPath, 'utf8');
    return JSON.parse(reportContent);
  } catch (error) {
    console.error('❌ Error loading fidelity report:', error.message);
    console.error('   Run check-youtube-fidelity.mjs first to generate the report');
    process.exit(1);
  }
}

/**
 * Create backup of current video URLs
 */
async function createBackup() {
  console.log('📦 Creating backup of current video URLs...\n');
  
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('id, name, slug, video_url')
    .not('video_url', 'is', null);
  
  if (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
  }
  
  const backup = {
    timestamp: new Date().toISOString(),
    total: destinations.length,
    videos: destinations.map(d => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      video_url: d.video_url
    }))
  };
  
  const backupPath = join(__dirname, `youtube-backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`✅ Backup created: ${backupPath}\n`);
  
  return backup;
}

/**
 * Main cleanup function
 */
async function cleanupYouTubeVideos() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('🧹 YOUTUBE VIDEO CLEANUP');
  console.log('═'.repeat(80));
  console.log('');
  
  // Load fidelity report
  const report = loadFidelityReport();
  
  // Create backup
  const backup = await createBackup();
  
  // Identify videos to remove
  const videosToRemove = report.details.filter(item => 
    item.status === 'irrelevant' || item.status === 'error'
  );
  
  console.log(`📊 Found ${videosToRemove.length} videos to remove:`);
  console.log(`   - Irrelevant: ${report.irrelevant}`);
  console.log(`   - Broken/Deleted: ${report.errors}`);
  console.log('');
  
  // Group by type
  const destinationsToFix = videosToRemove.filter(item => item.type === 'destination');
  const tripkitsToFix = videosToRemove.filter(item => item.type === 'tripkit');
  
  console.log(`🎯 Will update ${destinationsToFix.length} destinations`);
  if (tripkitsToFix.length > 0) {
    console.log(`🎯 Will update ${tripkitsToFix.length} tripkits`);
  }
  console.log('');
  
  // Confirm (in production, you might want to add a --force flag)
  console.log('⚠️  This will set video_url to NULL for problematic videos.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Update destinations
  let updated = 0;
  let errors = 0;
  const updateLog = [];
  
  console.log('🔄 Updating destinations...\n');
  
  for (const item of destinationsToFix) {
    try {
      const { error } = await supabase
        .from('destinations')
        .update({ video_url: null })
        .eq('id', item.id);
      
      if (error) {
        console.error(`❌ Error updating ${item.name}: ${error.message}`);
        errors++;
        updateLog.push({
          id: item.id,
          name: item.name,
          status: 'error',
          error: error.message
        });
      } else {
        updated++;
        updateLog.push({
          id: item.id,
          name: item.name,
          oldVideoUrl: item.videoUrl,
          status: 'removed',
          reason: item.reason || item.status
        });
        
        if (updated % 10 === 0) {
          console.log(`   ✅ Updated ${updated} destinations...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error updating ${item.name}: ${error.message}`);
      errors++;
    }
  }
  
  // Update tripkits if any
  if (tripkitsToFix.length > 0) {
    console.log('\n🔄 Updating tripkits...\n');
    
    for (const item of tripkitsToFix) {
      try {
        const { error } = await supabase
          .from('tripkits')
          .update({ video_url: null })
          .eq('id', item.id);
        
        if (error) {
          console.error(`❌ Error updating ${item.name}: ${error.message}`);
          errors++;
        } else {
          updated++;
          console.log(`   ✅ Updated ${item.name}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${item.name}: ${error.message}`);
        errors++;
      }
    }
  }
  
  // Generate cleanup report
  const cleanupReport = {
    timestamp: new Date().toISOString(),
    backupFile: `youtube-backup-${Date.now()}.json`,
    summary: {
      totalRemoved: updated,
      errors: errors,
      irrelevantRemoved: report.irrelevant,
      brokenRemoved: report.errors
    },
    updates: updateLog
  };
  
  const reportPath = join(__dirname, 'youtube-cleanup-report.json');
  writeFileSync(reportPath, JSON.stringify(cleanupReport, null, 2));
  
  // Final summary
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('✅ CLEANUP COMPLETE');
  console.log('═'.repeat(80));
  console.log('');
  console.log(`✅ Successfully removed ${updated} video URLs`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors encountered`);
  }
  console.log('');
  console.log(`📄 Cleanup report saved to: ${reportPath}`);
  console.log(`📦 Backup saved for rollback if needed`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Review the cleanup report');
  console.log('   2. Manually add better videos for important destinations');
  console.log('   3. Run check-youtube-fidelity.mjs monthly to catch new issues');
  console.log('');
}

// Run cleanup
cleanupYouTubeVideos().catch(console.error);

