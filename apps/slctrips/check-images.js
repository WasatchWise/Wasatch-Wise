const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mkepcjzqnbowrgbvjfem.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXBjanpxbmJvd3JnYnZqZmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzQzOTAsImV4cCI6MjA2NzM1MDM5MH0.sAaVt7vUxeZ--sjN1qvJzsApW63iKHug0FvzAfwXdgg'
);

(async () => {
  const { data, error } = await supabase
    .from('public_destinations')
    .select('id,name,slug,image_url,category')
    .limit(10);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample destinations:');
    data.forEach(d => {
      console.log('\n' + d.name + ' (' + d.category + ')');
      console.log('  image_url: ' + (d.image_url || 'NULL'));
    });

    const withImages = data.filter(d => d.image_url);
    const withoutImages = data.filter(d => !d.image_url);
    console.log('\n\n===== Summary =====');
    console.log('With images: ' + withImages.length);
    console.log('Without images: ' + withoutImages.length);
  }
})();
