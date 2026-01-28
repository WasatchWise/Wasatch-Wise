/**
 * Supabase Pagination Utilities
 *
 * Supabase limits responses to 1000 records by default.
 * These utilities handle pagination automatically to fetch ALL records.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * Fetches ALL records from a Supabase table using pagination.
 * Automatically handles the 1000 record limit by making multiple requests.
 *
 * @param supabase - Supabase client instance
 * @param table - Table name to query
 * @param select - Fields to select (default: '*')
 * @param filters - Optional query builder function for filtering/ordering
 * @returns Array of all records
 *
 * @example
 * // Fetch all destinations
 * const destinations = await fetchAllRecords(supabase, 'public_destinations');
 *
 * @example
 * // Fetch all destinations in a category with filtering
 * const hiking = await fetchAllRecords(
 *   supabase,
 *   'public_destinations',
 *   '*',
 *   (query) => query.eq('category', 'Hiking').order('name')
 * );
 */
export async function fetchAllRecords<T = any>(
  supabase: SupabaseClient,
  table: string,
  select: string = '*',
  filters?: (query: any) => any
): Promise<T[]> {
  const allRecords: T[] = [];
  const pageSize = 1000; // Supabase's max per request
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    // Build base query
    let query = supabase
      .from(table)
      .select(select)
      .range(offset, offset + pageSize - 1);

    // Apply filters if provided
    if (filters) {
      query = filters(query);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching records', { table, error: error.message });
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    allRecords.push(...(data as T[]));

    // If we got fewer records than pageSize, we've reached the end
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  return allRecords;
}

/**
 * Fetches records in batches and calls a callback for each batch.
 * Useful for processing large datasets without loading everything into memory.
 *
 * @param supabase - Supabase client instance
 * @param table - Table name to query
 * @param select - Fields to select
 * @param onBatch - Callback function called for each batch
 * @param filters - Optional query builder function
 *
 * @example
 * // Process destinations in batches
 * await fetchInBatches(
 *   supabase,
 *   'public_destinations',
 *   '*',
 *   (batch) => {
 *     console.log(`Processing ${batch.length} destinations...`);
 *     // Process batch
 *   }
 * );
 */
export async function fetchInBatches<T = any>(
  supabase: SupabaseClient,
  table: string,
  select: string = '*',
  onBatch: (batch: T[]) => void | Promise<void>,
  filters?: (query: any) => any
): Promise<void> {
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from(table)
      .select(select)
      .range(offset, offset + pageSize - 1);

    if (filters) {
      query = filters(query);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching batch', { table, error: error.message });
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    // Call the callback with this batch
    await onBatch(data as T[]);

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }
}

/**
 * Gets the total count of records matching a query.
 * More efficient than fetching all records just to count them.
 *
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param filters - Optional query builder function
 * @returns Total count
 *
 * @example
 * const total = await getRecordCount(supabase, 'public_destinations');
 * const hikingCount = await getRecordCount(
 *   supabase,
 *   'public_destinations',
 *   (query) => query.eq('category', 'Hiking')
 * );
 */
export async function getRecordCount(
  supabase: SupabaseClient,
  table: string,
  filters?: (query: any) => any
): Promise<number> {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (filters) {
    query = filters(query);
  }

  const { count, error } = await query;

  if (error) {
    logger.error('Error counting records', { table, error: error.message });
    throw error;
  }

  return count ?? 0;
}
