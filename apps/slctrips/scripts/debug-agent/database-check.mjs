import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env.local') });

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Test database connectivity and integrity
 */
export async function testDatabase() {
  console.log('\n🗄️  Database & Data Integrity Testing\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const error = 'Missing Supabase credentials';
    console.log(`   ❌ ${error}`);
    results.failed.push({ test: 'Database Setup', error });
    return results;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Test Connection Health
  console.log('1. Connection Health\n');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('customer_product_access').select('id').limit(1);
    const queryTime = Date.now() - startTime;

    if (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }

    console.log(`   ✅ Supabase connection successful`);
    console.log(`   ✅ Query response time: ${queryTime}ms`);
    
    if (queryTime > 2000) {
      results.warnings.push({ 
        test: 'Database - Query Performance', 
        message: `Slow query time: ${queryTime}ms` 
      });
    } else {
      results.passed.push({ test: 'Database - Query Performance' });
    }
    
    results.passed.push({ test: 'Database - Connection' });
  } catch (error) {
    const errorMsg = `Connection test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Connection', error: errorMsg });
    return results;
  }

  // Test Service Role Access
  console.log('\n2. Service Role Access\n');
  try {
    // Service role should be able to access all tables
    const { error: serviceError } = await supabase
      .from('customer_product_access')
      .select('id')
      .limit(1);

    if (serviceError && serviceError.code !== 'PGRST116') {
      throw new Error(`Service role access failed: ${serviceError.message}`);
    }

    console.log(`   ✅ Service role access verified`);
    results.passed.push({ test: 'Database - Service Role Access' });
  } catch (error) {
    const errorMsg = `Service role access test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Service Role Access', error: errorMsg });
  }

  // Test Critical Tables
  console.log('\n3. Critical Tables\n');
  
  const criticalTables = [
    { name: 'customer_product_access', required: true },
    { name: 'purchases', required: true },
    { name: 'tripkits', required: true },
    { name: 'staykits', required: false },
    { name: 'tripkit_access_codes', required: false },
    { name: 'destinations', required: false },
  ];

  for (const table of criticalTables) {
    try {
      const { data, error } = await supabase.from(table.name).select('id').limit(1);

      if (error) {
        if (table.required) {
          throw new Error(`Table ${table.name} access failed: ${error.message}`);
        } else {
          console.log(`   ⚠️  Optional table ${table.name}: ${error.message}`);
          results.warnings.push({ 
            test: `Database - Table ${table.name}`, 
            message: `Optional table access issue: ${error.message}` 
          });
          continue;
        }
      }

      console.log(`   ✅ Table ${table.name} accessible`);
      results.passed.push({ test: `Database - Table ${table.name}` });
    } catch (error) {
      const errorMsg = `Table ${table.name} test failed: ${error.message}`;
      console.log(`   ${table.required ? '❌' : '⚠️ '} ${errorMsg}`);
      if (table.required) {
        results.failed.push({ test: `Database - Table ${table.name}`, error: errorMsg });
      } else {
        results.warnings.push({ test: `Database - Table ${table.name}`, message: errorMsg });
      }
    }
  }

  // Test Table Structure
  console.log('\n4. Table Structure\n');
  
  // Test customer_product_access table structure (users are in auth.users)
  try {
    const { data, error } = await supabase
      .from('customer_product_access')
      .select('id, user_id, product_id, product_type, access_type')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Customer product access table structure check failed: ${error.message}`);
    }

    console.log(`   ✅ Customer product access table structure valid`);
    results.passed.push({ test: 'Database - Customer Product Access Table Structure' });
  } catch (error) {
    const errorMsg = `Customer product access table structure test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Customer Product Access Table Structure', error: errorMsg });
  }

  // Test purchases table structure
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id, user_id, created_at')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Purchases table structure check failed: ${error.message}`);
    }

    console.log(`   ✅ Purchases table structure valid`);
    results.passed.push({ test: 'Database - Purchases Table Structure' });
  } catch (error) {
    const errorMsg = `Purchases table structure test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Purchases Table Structure', error: errorMsg });
  }

  // Test customer_product_access table structure
  try {
    const { data, error } = await supabase
      .from('customer_product_access')
      .select('id, user_id, product_id, product_type, access_type')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Access table structure check failed: ${error.message}`);
    }

    console.log(`   ✅ Customer product access table structure valid`);
    results.passed.push({ test: 'Database - Access Table Structure' });
  } catch (error) {
    const errorMsg = `Access table structure test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Access Table Structure', error: errorMsg });
  }

  // Test Data Quality
  console.log('\n5. Data Quality\n');
  
  // Check for missing required fields in tripkits
  try {
    const { data: tripkits, error } = await supabase
      .from('tripkits')
      .select('id, name, price, slug, code, status')
      .in('status', ['active', 'freemium'])
      .limit(10);

    if (error) {
      throw new Error(`Tripkits data quality check failed: ${error.message}`);
    }

    if (tripkits && tripkits.length > 0) {
      const missingFields = tripkits.filter(t => !t.name || !t.price || !t.slug || !t.code);
      if (missingFields.length > 0) {
        console.log(`   ⚠️  ${missingFields.length} tripkit(s) missing required fields`);
        results.warnings.push({ 
          test: 'Database - Tripkits Data Quality', 
          message: `${missingFields.length} tripkit(s) missing required fields` 
        });
      } else {
        console.log(`   ✅ All active tripkits have required fields`);
        results.passed.push({ test: 'Database - Tripkits Data Quality' });
      }
    } else {
      console.log(`   ⚠️  No active tripkits found`);
      results.warnings.push({ 
        test: 'Database - Tripkits Data Quality', 
        message: 'No active tripkits found' 
      });
    }
  } catch (error) {
    const errorMsg = `Tripkits data quality test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Tripkits Data Quality', error: errorMsg });
  }

  // Test Foreign Key Relationships
  console.log('\n6. Foreign Key Relationships\n');
  
  // Test customer_product_access references
  try {
    const { data: accessRecords, error } = await supabase
      .from('customer_product_access')
      .select('user_id, product_id, product_type')
      .limit(10);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Foreign key check failed: ${error.message}`);
    }

    if (accessRecords && accessRecords.length > 0) {
      // Check if referenced tripkits exist
      const tripkitIds = accessRecords
        .filter(a => a.product_type === 'tripkit')
        .map(a => a.product_id);

      if (tripkitIds.length > 0) {
        const { data: tripkits } = await supabase
          .from('tripkits')
          .select('id')
          .in('id', tripkitIds);

        const foundIds = new Set(tripkits?.map(t => t.id) || []);
        const missingIds = tripkitIds.filter(id => !foundIds.has(id));

        if (missingIds.length > 0) {
          console.log(`   ⚠️  ${missingIds.length} orphaned access record(s) found`);
          results.warnings.push({ 
            test: 'Database - Foreign Key Relationships', 
            message: `${missingIds.length} orphaned access record(s)` 
          });
        } else {
          console.log(`   ✅ Foreign key relationships valid`);
          results.passed.push({ test: 'Database - Foreign Key Relationships' });
        }
      } else {
        console.log(`   ℹ️  No access records to validate`);
        results.passed.push({ test: 'Database - Foreign Key Relationships' });
      }
    } else {
      console.log(`   ℹ️  No access records found (table may be empty)`);
      results.passed.push({ test: 'Database - Foreign Key Relationships' });
    }
  } catch (error) {
    const errorMsg = `Foreign key relationship test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Foreign Key Relationships', error: errorMsg });
  }

  // Test RLS Policies
  console.log('\n7. Row Level Security (RLS) Policies\n');
  
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test RLS on customer_product_access
    const { data: anonAccess, error: anonError } = await anonClient
      .from('customer_product_access')
      .select('id')
      .limit(1);

    if (anonAccess && anonAccess.length > 0) {
      console.log(`   ⚠️  RLS may not be fully configured (anon can access customer_product_access)`);
      results.warnings.push({ 
        test: 'Database - RLS Policies', 
        message: 'RLS may not be fully configured for customer_product_access' 
      });
    } else if (anonError && (anonError.code === '42501' || anonError.message.includes('permission'))) {
      console.log(`   ✅ RLS policies active (anon access denied as expected)`);
      results.passed.push({ test: 'Database - RLS Policies' });
    } else {
      console.log(`   ℹ️  RLS check inconclusive: ${anonError?.message || 'No error'}`);
      results.warnings.push({ 
        test: 'Database - RLS Policies', 
        message: 'RLS check inconclusive' 
      });
    }
  } catch (error) {
    console.log(`   ⚠️  RLS test error: ${error.message}`);
    results.warnings.push({ 
      test: 'Database - RLS Policies', 
      message: error.message 
    });
  }

  // Test Data Consistency
  console.log('\n8. Data Consistency\n');
  
  // Check for duplicate access records
  try {
    const { data: accessRecords, error } = await supabase
      .from('customer_product_access')
      .select('user_id, product_id, product_type')
      .limit(100);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Data consistency check failed: ${error.message}`);
    }

    if (accessRecords && accessRecords.length > 0) {
      const seen = new Set();
      const duplicates = [];

      for (const record of accessRecords) {
        const key = `${record.user_id}-${record.product_id}-${record.product_type}`;
        if (seen.has(key)) {
          duplicates.push(key);
        }
        seen.add(key);
      }

      if (duplicates.length > 0) {
        console.log(`   ⚠️  ${duplicates.length} potential duplicate access record(s) found`);
        results.warnings.push({ 
          test: 'Database - Data Consistency', 
          message: `${duplicates.length} potential duplicate access record(s)` 
        });
      } else {
        console.log(`   ✅ No duplicate access records found`);
        results.passed.push({ test: 'Database - Data Consistency' });
      }
    } else {
      console.log(`   ℹ️  No access records to check`);
      results.passed.push({ test: 'Database - Data Consistency' });
    }
  } catch (error) {
    const errorMsg = `Data consistency test failed: ${error.message}`;
    console.log(`   ❌ ${errorMsg}`);
    results.failed.push({ test: 'Database - Data Consistency', error: errorMsg });
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}\n`);

  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase()
    .then(() => process.exit(results.failed.length > 0 ? 1 : 0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

