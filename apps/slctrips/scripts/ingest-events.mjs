#!/usr/bin/env node

import { pathToFileURL } from 'url';
import { loadEnv } from './events-utils.mjs';
import { ingestEventbrite } from './ingest-eventbrite.mjs';
import { ingestTicketmaster } from './ingest-ticketmaster.mjs';

loadEnv();

async function main() {
  try {
    console.log('Starting events ingestion...');
    const [eventbriteResult, ticketmasterResult] = await Promise.allSettled([
      ingestEventbrite(),
      ingestTicketmaster(),
    ]);

    if (eventbriteResult.status === 'fulfilled') {
      console.log(`✅ Eventbrite: ${eventbriteResult.value.inserted} events upserted`);
    } else {
      console.error('❌ Eventbrite ingestion failed:', eventbriteResult.reason);
    }

    if (ticketmasterResult.status === 'fulfilled') {
      console.log(`✅ Ticketmaster: ${ticketmasterResult.value.inserted} events upserted`);
    } else {
      console.error('❌ Ticketmaster ingestion failed:', ticketmasterResult.reason);
    }

    console.log('Events ingestion complete.');
  } catch (error) {
    console.error('Events ingestion failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
