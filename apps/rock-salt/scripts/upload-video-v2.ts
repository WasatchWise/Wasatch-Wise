import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketName = 'event-videos'; // New bucket name for clarity
  
  if (!buckets?.find(b => b.name === bucketName)) {
    console.log(`Creating bucket: ${bucketName}`);
    await supabase.storage.createBucket(bucketName, { public: true });
  }

  const videoPath = path.join(__dirname, '..', 'public', 'GREG WEEKEND.mp4');
  const videoFile = fs.readFileSync(videoPath);
  
  console.log('🚀 Uploading 103MB video to Supabase...');
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload('greg_weekend.mp4', videoFile, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl('greg_weekend.mp4');
    console.log('✅ Success! URL:', publicUrl);
  }
}

main();
