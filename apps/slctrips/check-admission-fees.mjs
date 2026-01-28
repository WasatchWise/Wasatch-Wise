import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check admission_fee distribution
const { data: all } = await supabase
  .from('public_destinations')
  .select('admission_fee');

const feeDistribution = {
  null: 0,
  zero: 0,
  under25: 0,
  over25: 0
};

all?.forEach(d => {
  if (d.admission_fee === null || d.admission_fee === undefined) {
    feeDistribution.null++;
  } else if (d.admission_fee === 0) {
    feeDistribution.zero++;
  } else if (d.admission_fee < 25) {
    feeDistribution.under25++;
  } else {
    feeDistribution.over25++;
  }
});

console.log('Admission fee distribution in public_destinations:');
console.log(`  Null/undefined: ${feeDistribution.null}`);
console.log(`  Free ($0): ${feeDistribution.zero}`);
console.log(`  Under $25: ${feeDistribution.under25}`);
console.log(`  $25 or more: ${feeDistribution.over25}`);
console.log(`  TOTAL potentially "Under $25": ${feeDistribution.null + feeDistribution.zero + feeDistribution.under25}`);
