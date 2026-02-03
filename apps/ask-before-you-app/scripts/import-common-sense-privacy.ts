#!/usr/bin/env tsx
/**
 * Import Common Sense Media privacy evaluations from privacy.csv into Supabase.
 *
 * Usage:
 *   pnpm exec tsx scripts/import-common-sense-privacy.ts [path/to/privacy.csv]
 *
 * Default path: data/privacy.csv
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role bypasses RLS for bulk insert).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter((line) => line.trim());
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

async function main() {
  const csvPath = resolve(process.cwd(), process.argv[2] || 'data/privacy.csv');
  console.log(`Reading: ${csvPath}`);

  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, 'utf-8');
  } catch (e) {
    console.error('Failed to read file:', (e as Error).message);
    process.exit(1);
  }

  const rows = parseCSV(csvContent);
  if (rows.length < 2) {
    console.error('CSV must have header + at least one row');
    process.exit(1);
  }

  const headerRow = rows[0].map((h) => h.replace(/^"|"$/g, '').trim());
  const colIndex = (name: string) => headerRow.indexOf(name);
  const idx = {
    evaluationUrl: colIndex('evaluation-teaser href'),
    thumbnailUrl: colIndex('thumbnail src'),
    title: colIndex('title'),
    updatedDate: colIndex('updated-date'),
    tierIconUrl: colIndex('tier-icon src'),
    tierLabel: colIndex('tier-label'),
    tierScore: colIndex('tier-score'),
  };
  if (idx.evaluationUrl === -1 || idx.title === -1 || idx.tierLabel === -1) {
    console.error('CSV must have columns: evaluation-teaser href, title, tier-label. Found headers:', headerRow);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local. This script requires service role access (bypasses RLS).'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const dataRows = rows.slice(1);
  const records = dataRows.map((row) => ({
    evaluation_url: row[idx.evaluationUrl] || '',
    thumbnail_url: row[idx.thumbnailUrl] || null,
    title: row[idx.title] || '',
    updated_date_raw: row[idx.updatedDate] || null,
    tier_icon_url: row[idx.tierIconUrl] || null,
    tier_label: row[idx.tierLabel] || 'Warning',
    tier_score: (row[idx.tierScore] || '').trim() || null,
    source: 'common_sense_media',
  }));

  // Filter out rows with no evaluation_url or title
  const valid = records.filter((r) => r.evaluation_url && r.title);
  if (valid.length === 0) {
    console.error('No valid rows (need evaluation_url and title)');
    process.exit(1);
  }

  console.log(`Inserting ${valid.length} rows (upsert on evaluation_url)...`);
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < valid.length; i += BATCH) {
    const batch = valid.slice(i, i + BATCH);
    const { error } = await supabase
      .from('common_sense_privacy_evaluations')
      .upsert(batch, { onConflict: 'evaluation_url', ignoreDuplicates: false });
    if (error) {
      console.error('Batch error:', error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  ${inserted}/${valid.length}`);
  }
  console.log('Done.');
}

main();
