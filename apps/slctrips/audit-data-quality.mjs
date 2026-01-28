import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDataQuality() {
    console.log('Starting Data Quality Audit...');

    const { data: destinations, error } = await supabase
        .from('public_destinations')
        .select('id, name, last_verified_at, source_name, image_url, description');

    if (error) {
        console.error('Error fetching destinations:', error);
        return;
    }

    const total = destinations.length;
    const staleDate = new Date();
    staleDate.setMonth(staleDate.getMonth() - 6); // 6 months ago

    const stats = {
        total,
        stale: 0,
        missingAttribution: 0,
        missingImage: 0,
        missingDescription: 0,
        staleList: [],
        missingAttributionList: [],
    };

    destinations.forEach(d => {
        // Check Stale (older than 6 months or never verified)
        const lastVerified = d.last_verified_at ? new Date(d.last_verified_at) : null;
        if (!lastVerified || lastVerified < staleDate) {
            stats.stale++;
            if (stats.staleList.length < 50) stats.staleList.push(d.name);
        }

        // Check Attribution
        if (!d.source_name) {
            stats.missingAttribution++;
            if (stats.missingAttributionList.length < 50) stats.missingAttributionList.push(d.name);
        }

        // Check Image
        if (!d.image_url) {
            stats.missingImage++;
        }

        // Check Description
        if (!d.description) {
            stats.missingDescription++;
        }
    });

    const report = {
        timestamp: new Date().toISOString(),
        metrics: {
            total_destinations: total,
            stale_count: stats.stale,
            stale_percentage: ((stats.stale / total) * 100).toFixed(1) + '%',
            missing_attribution_count: stats.missingAttribution,
            missing_attribution_percentage: ((stats.missingAttribution / total) * 100).toFixed(1) + '%',
            missing_image_count: stats.missingImage,
            missing_description_count: stats.missingDescription,
        },
        samples: {
            stale_destinations: stats.staleList,
            missing_attribution: stats.missingAttributionList,
        }
    };

    console.log('Audit Complete. Writing report to data-quality-report.json');
    fs.writeFileSync('data-quality-report.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.metrics, null, 2));
}

auditDataQuality();
