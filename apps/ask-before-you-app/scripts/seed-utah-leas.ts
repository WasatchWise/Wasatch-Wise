#!/usr/bin/env tsx
/**
 * CLI Script: Seed all Utah LEAs
 * 
 * Creates all 157 Utah LEAs (41 districts + 116 charters) in the database
 */

import { config } from 'dotenv';
import { seedUtahLEAs } from '../lib/daros/seed-utah-leas';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  console.log('🌱 Seeding Utah LEAs...\n');
  
  try {
    const result = await seedUtahLEAs();
    
    console.log('\n✅ Seeding completed!');
    console.log(`\nResults:`);
    console.log(`  - School districts created: ${result.districtsCreated}`);
    console.log(`  - Charter schools created: ${result.chartersCreated}`);
    console.log(`  - Total LEAs: ${result.districtsCreated + result.chartersCreated}`);
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      result.errors.slice(0, 10).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
      if (result.errors.length > 10) {
        console.log(`  ... and ${result.errors.length - 10} more errors`);
      }
    } else {
      console.log('\n✨ No errors!');
    }
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
