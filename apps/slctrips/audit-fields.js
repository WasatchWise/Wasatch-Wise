const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mkepcjzqnbowrgbvjfem.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXBjanpxbmJvd3JnYnZqZmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzQzOTAsImV4cCI6MjA2NzM1MDM5MH0.sAaVt7vUxeZ--sjN1qvJzsApW63iKHug0FvzAfwXdgg'
);

(async () => {
  console.log('=== DESTINATIONS TABLE ===');
  const { data: dest } = await supabase.from('destinations').select('*').limit(1);
  if (dest && dest[0]) {
    console.log('Available fields:', Object.keys(dest[0]).join(', '));
  }

  console.log('\n=== PUBLIC_DESTINATIONS VIEW ===');
  const { data: pubDest } = await supabase.from('public_destinations').select('*').limit(1);
  if (pubDest && pubDest[0]) {
    console.log('Available fields:', Object.keys(pubDest[0]).join(', '));
  }

  console.log('\n=== GUARDIANS TABLE ===');
  const { data: guard } = await supabase.from('guardians').select('*').limit(1);
  if (guard && guard[0]) {
    console.log('Available fields:', Object.keys(guard[0]).join(', '));
  }

  console.log('\n=== DESTINATION_AFFILIATE_GEAR TABLE ===');
  const { data: aff } = await supabase.from('destination_affiliate_gear').select('*').limit(1);
  if (aff && aff[0]) {
    console.log('Available fields:', Object.keys(aff[0]).join(', '));
  }

  console.log('\n=== CHECKING DATA QUALITY ===');
  const { data: destSample } = await supabase.from('public_destinations').select('*').limit(100);
  if (destSample) {
    const withImages = destSample.filter(d => d.image_url).length;
    const withDesc = destSample.filter(d => d.description).length;
    const withSubcat = destSample.filter(d => d.subcategory).length;
    const withRegion = destSample.filter(d => d.region).length;
    const familyFriendly = destSample.filter(d => d.is_family_friendly).length;
    const petFriendly = destSample.filter(d => d.pet_allowed).length;
    const featured = destSample.filter(d => d.featured).length;

    console.log(`Sample of 100 destinations:`);
    console.log(`  - ${withImages}/100 have images`);
    console.log(`  - ${withDesc}/100 have descriptions`);
    console.log(`  - ${withSubcat}/100 have subcategories`);
    console.log(`  - ${withRegion}/100 have regions`);
    console.log(`  - ${familyFriendly}/100 are family friendly`);
    console.log(`  - ${petFriendly}/100 are pet allowed`);
    console.log(`  - ${featured}/100 are featured`);
  }
})();
