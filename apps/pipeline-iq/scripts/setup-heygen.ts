
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
    console.error("❌ HEYGEN_API_KEY not found in .env.local");
    process.exit(1);
}

const BASE_URL = 'https://api.heygen.com/v2';

async function fetchFromHeyGen(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'X-Api-Key': API_KEY!,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${await response.text()}`);
    }
    
    return response.json();
}

async function findAssets() {
    console.log("🔍 Searching HeyGen Assets for 'Mike'...");

    try {
        // 1. Get Avatars
        console.log("  Fetching Avatars...");
        const avatarsData = await fetchFromHeyGen('/avatars');
        const avatars = avatarsData.data.avatars || [];
        
        const mikeAvatar = avatars.find((a: any) => 
            a.name?.toLowerCase().includes('mike') || 
            a.avatar_name?.toLowerCase().includes('mike')
        );

        if (mikeAvatar) {
            console.log(`  ✅ Found Avatar: ${mikeAvatar.name || mikeAvatar.avatar_name} (${mikeAvatar.avatar_id})`);
        } else {
            console.log("  ⚠️ No Avatar found with name 'Mike'. Listing first 5:");
            avatars.slice(0, 5).forEach((a: any) => console.log(`     - ${a.name || a.avatar_name} (${a.avatar_id})`));
        }

        // 2. Get Voices
        console.log("  Fetching Voices...");
        // V2 API often requires a separate call or looking through listings. 
        // Note: HeyGen API structure changes, checking v2/voices usually works or accessing via video setup.
        // Let's try simple list if available, otherwise just warn.
        // Note: As of typical HeyGen V2, voices are often just IDs. Let's try to fetch.
        
        // Actually, HeyGen often separates this. Let's try to assume we can list them.
        // If this 404s, we'll skip.
        try {
            const voicesData = await fetchFromHeyGen('/voices'); 
            // Note: Endpoint might be different or require specific parameters. 
            // If this fails we will rely on user.
             const voices = voicesData.data.voices || [];
             const mikeVoice = voices.find((v: any) => v.name?.toLowerCase().includes('mike'));
             
             if (mikeVoice) {
                 console.log(`  ✅ Found Voice: ${mikeVoice.name} (${mikeVoice.voice_id})`);
             } else {
                 console.log("  ⚠️ No Voice found with name 'Mike'. Listing first 5:");
                  voices.slice(0, 5).forEach((v: any) => console.log(`     - ${v.name} (${v.voice_id})`));
             }

        } catch (e) {
            console.log("  ⚠️ Could not fetch voices list directly (endpoint might be different).");
        }

    } catch (error) {
        console.error("❌ Error fetching from HeyGen:", error);
    }
}

findAssets();
