import { ingestAnalytics, VideoAnalytics } from '../src/lib/research/learning-lab';

async function testCRMSync() {
    console.log("=== REVENUE ENGINE: CRM SYNC VERIFICATION ===");
    console.log("Scenario: Syncing high-intent signals for John Doe (john@example.com)");

    const mockAnalytics: VideoAnalytics[] = [
        {
            videoId: "video_abc_123",
            platform: "youtube", // Using valid platform for test
            viewCount: 100,
            retentionRate: 0.95,      // > 0.9 (+20 pts)
            hookRate: 0.8,
            dwellTimeSeconds: 75,     // > 60 (+25 pts)
            retentionCurveAUC: 0.85,
            reWatchRate: 0.6,          // > 0.4 (+30 pts)
            shareCount: 5,
            commentSentimentalScore: 0.8,
            topPositiveComments: ["This is a game changer!"]
        }
    ];

    console.log("\n[Test] Triggering ingestAnalytics for high-intent profile...");
    try {
        await ingestAnalytics(mockAnalytics, "john@example.com");
        console.log("\n✅ SUCCESS: CRM Sync Logic executed without errors.");
        console.log("Expected Output: [CRM Mock] Incrementing propensity for john@example.com by 75");
    } catch (err) {
        console.error("CRM Sync CRITICAL FAILURE:", err);
    }

    console.log("\n=== TEST COMPLETE ===");
}

testCRMSync();
