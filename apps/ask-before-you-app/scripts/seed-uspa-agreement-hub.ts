#!/usr/bin/env tsx
/**
 * Seed utah_agreements from USPA Agreement Hub Dynamic Menu CSV.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-uspa-agreement-hub.ts "<path-to-csv>"
 *
 * Example:
 *   pnpm exec tsx scripts/seed-uspa-agreement-hub.ts "$HOME/Downloads/USPA Agreement Hub [UPDATE - 9_22_2025] - Dynamic Menu (1).csv"
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    rows.push(fields);
  }
  return rows;
}

function parseDate(value: string): string | null {
  const v = (value || '').trim();
  if (!v || v.toLowerCase() === 'none') return null;
  const match = v.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: pnpm exec tsx scripts/seed-uspa-agreement-hub.ts "<path-to-csv>"');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, 'utf-8');
  } catch (e) {
    console.error('Failed to read file:', (e as Error).message);
    process.exit(1);
  }

  const rows = parseCSV(csvContent);
  const header = rows[0];
  if (
    !header ||
    header[0]?.toLowerCase() !== 'company' ||
    header[1]?.toLowerCase() !== 'product'
  ) {
    console.error('Expected CSV header: Company, Product, Originator, Type, Status, Expiration Notes, Date Approved, Expires on');
    process.exit(1);
  }

  const dataRows = rows.slice(1);
  const records = dataRows.map((row) => ({
    company: (row[0] ?? '').trim() || null,
    product: (row[1] ?? '').trim() || null,
    originator: (row[2] ?? '').trim() || null,
    type: (row[3] ?? '').trim() || null,
    status: (row[4] ?? '').trim() || null,
    expiration_notes: (row[5] ?? '').trim() || null,
    date_approved: parseDate(row[6] ?? ''),
    expires_on: parseDate(row[7] ?? ''),
  }));

  const supabase = createClient(url, key);

  // Optional: clear existing rows so this script is idempotent for full refresh
  const clearFirst = process.argv.includes('--replace');
  if (clearFirst) {
    const { error: delErr } = await supabase.from('utah_agreements').delete().gte('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
      console.error('Clear failed:', delErr.message);
      process.exit(1);
    }
    console.log('Cleared existing utah_agreements rows.');
  }

  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const chunk = records.slice(i, i + BATCH);
    const { error } = await supabase.from('utah_agreements').insert(chunk);
    if (error) {
      console.error('Insert error at batch', i / BATCH + 1, ':', error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    process.stdout.write(`\rInserted ${inserted}/${records.length}`);
  }
  console.log('\nDone. Total rows in utah_agreements:', inserted);
}

main();
