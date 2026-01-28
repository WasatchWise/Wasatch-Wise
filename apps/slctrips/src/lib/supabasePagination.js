/**
 * Supabase Pagination Utilities (JavaScript version for Node.js scripts)
 *
 * Supabase limits responses to 1000 records by default.
 * These utilities handle pagination automatically to fetch ALL records.
 */

/**
 * Fetches ALL records from a Supabase table using pagination.
 * Automatically handles the 1000 record limit by making multiple requests.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} table - Table name to query
 * @param {string} select - Fields to select (default: '*')
 * @param {Function} filters - Optional query builder function for filtering/ordering
 * @returns {Promise<Array>} Array of all records
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
async function fetchAllRecords(supabase, table, select = '*', filters) {
  const allRecords = [];
  const pageSize = 1000; // Supabase's max per request
  let offset = 0;
  let hasMore = true;

  const isVerbose =
    process.env.NODE_ENV === 'development' ||
    process.env.SUPABASE_PAGINATION_DEBUG === '1';

  if (isVerbose) {
    console.log(`Fetching all records from ${table}...`);
  }

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
      console.error(`Error fetching records from ${table}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    allRecords.push(...data);
    if (isVerbose) {
      console.log(`  Fetched ${allRecords.length} records so far...`);
    }

    // If we got fewer records than pageSize, we've reached the end
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  if (isVerbose) {
    console.log(`✅ Total records fetched: ${allRecords.length}\n`);
  }
  return allRecords;
}

/**
 * Fetches records in batches and calls a callback for each batch.
 * Useful for processing large datasets without loading everything into memory.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} table - Table name to query
 * @param {string} select - Fields to select
 * @param {Function} onBatch - Callback function called for each batch
 * @param {Function} filters - Optional query builder function
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
async function fetchInBatches(supabase, table, select = '*', onBatch, filters) {
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  const isVerbose =
    process.env.NODE_ENV === 'development' ||
    process.env.SUPABASE_PAGINATION_DEBUG === '1';

  if (isVerbose) {
    console.log(`Processing ${table} in batches...`);
  }

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
      console.error(`Error fetching batch from ${table}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    // Call the callback with this batch
    await onBatch(data);

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  if (isVerbose) {
    console.log(`✅ Batch processing complete\n`);
  }
}

/**
 * Gets the total count of records matching a query.
 * More efficient than fetching all records just to count them.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} table - Table name
 * @param {Function} filters - Optional query builder function
 * @returns {Promise<number>} Total count
 *
 * @example
 * const total = await getRecordCount(supabase, 'public_destinations');
 * const hikingCount = await getRecordCount(
 *   supabase,
 *   'public_destinations',
 *   (query) => query.eq('category', 'Hiking')
 * );
 */
async function getRecordCount(supabase, table, filters) {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (filters) {
    query = filters(query);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Error counting records in ${table}:`, error);
    throw error;
  }

  return count ?? 0;
}

module.exports = {
  fetchAllRecords,
  fetchInBatches,
  getRecordCount
};
