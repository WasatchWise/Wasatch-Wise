#!/usr/bin/env tsx
/**
 * CLI Script: Import USPA Agreement Hub CSV files
 * 
 * Usage:
 *   tsx scripts/import-uspa.ts <csv-file-path> [--type dynamic_menu|negotiation_tracker]
 * 
 * Example:
 *   tsx scripts/import-uspa.ts ~/Downloads/USPA\ Agreement\ Hub\ \[UPDATE\ -\ 9_22_2025\]\ -\ Dynamic\ Menu.csv --type dynamic_menu
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { importDynamicMenu, importNegotiationTracker } from '../lib/daros/import-uspa';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: tsx scripts/import-uspa.ts <csv-file-path> [--type dynamic_menu|negotiation_tracker]');
    process.exit(1);
  }
  
  const filePath = args[0];
  const typeFlagIndex = args.indexOf('--type');
  const type = typeFlagIndex !== -1 && args[typeFlagIndex + 1]
    ? args[typeFlagIndex + 1]
    : filePath.includes('Dynamic Menu') || filePath.includes('dynamic_menu')
      ? 'dynamic_menu'
      : filePath.includes('Negotiation') || filePath.includes('negotiation')
        ? 'negotiation_tracker'
        : 'dynamic_menu'; // Default
  
  if (type !== 'dynamic_menu' && type !== 'negotiation_tracker') {
    console.error('Invalid type. Must be "dynamic_menu" or "negotiation_tracker"');
    process.exit(1);
  }
  
  console.log(`Reading CSV file: ${filePath}`);
  console.log(`Import type: ${type}`);
  
  try {
    const csvContent = readFileSync(filePath, 'utf-8');
    
    console.log(`\nCSV file loaded: ${(csvContent.length / 1024).toFixed(1)} KB`);
    console.log('Starting import...\n');
    
    let result;
    if (type === 'dynamic_menu') {
      result = await importDynamicMenu(csvContent);
    } else {
      result = await importNegotiationTracker(csvContent);
    }
    
    console.log('\n✅ Import completed!');
    console.log(`\nResults:`);
    
    if ('vendorsCreated' in result) {
      console.log(`  - Vendors created/updated: ${result.vendorsCreated}`);
      console.log(`  - District-vendor relationships: ${result.districtVendorsCreated}`);
    }
    
    if ('negotiationsTracked' in result) {
      console.log(`  - Negotiations tracked: ${result.negotiationsTracked}`);
    }
    
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
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
