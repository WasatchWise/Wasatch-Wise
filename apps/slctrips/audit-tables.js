const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mkepcjzqnbowrgbvjfem.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXBjanpxbmJvd3JnYnZqZmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzQzOTAsImV4cCI6MjA2NzM1MDM5MH0.sAaVt7vUxeZ--sjN1qvJzsApW63iKHug0FvzAfwXdgg'
);

async function checkTable(tableName) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  return { tableName, count: count || 0, hasError: !!error, error: error?.message };
}

(async () => {
  console.log('Checking all known tables...\n');

  const tables = [
    'destinations',
    'public_destinations',
    'guardians',
    'tripkits',
    'best_of_rankings',
    'destination_affiliate_gear',
    'email_captures',
    'deep_dive_stories',
    'dan_videos',
    'affiliates',
    'counties',
    'regions',
    'categories',
    'subcategories'
  ];

  for (const table of tables) {
    const result = await checkTable(table);
    if (result.hasError) {
      console.log(`❌ ${table}: ERROR - ${result.error}`);
    } else {
      console.log(`✅ ${table}: ${result.count} rows`);
    }
  }
})();
