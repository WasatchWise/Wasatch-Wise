import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function uploadVideo() {
    // Load env vars from .env.local if available
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
        console.error('❌ Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const videoPath = path.join(__dirname, '..', 'public', 'GREG WEEKEND.mp4');

    if (!fs.existsSync(videoPath)) {
        console.error('❌ Video file not found at:', videoPath);
        process.exit(1);
    }

    const videoFile = fs.readFileSync(videoPath);

    console.log('🚀 Uploading video to Supabase storage (event-flyers bucket)...');

    const { data, error } = await supabase.storage
        .from('event-flyers')
        .upload('GREG_WEEKEND.mp4', videoFile, {
            contentType: 'video/mp4',
            upsert: true
        });

    if (error) {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('event-flyers')
        .getPublicUrl('GREG_WEEKEND.mp4');

    console.log('✅ Upload successful!');
    console.log('🔗 Public URL:', publicUrl);
}

uploadVideo();
