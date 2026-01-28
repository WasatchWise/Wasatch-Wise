/**
 * Database transaction utilities for robust data operations
 */

import { createClient } from './server';
import { logger } from '@/lib/utils/logger';
import { DatabaseError } from '@/lib/utils/errors';

/**
 * Execute a database operation with automatic retry and error handling
 */
export async function withTransaction<T>(
  operation: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<T>,
  options: {
    maxRetries?: number;
    table?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, table = 'unknown' } = options;
  const supabase = await createClient();
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await logger.logDBOperation(
        'transaction',
        table,
        () => operation(supabase)
      );
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (
        error instanceof Error &&
        (error.message.includes('connection') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET'))
      ) {
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // Non-retryable error or max retries reached
      throw error;
    }
  }

  throw new DatabaseError(
    `Database operation failed after ${maxRetries} attempts`,
    lastError
  );
}

/**
 * Batch insert with transaction safety
 */
export async function batchInsert<T>(
  table: string,
  records: T[],
  options: {
    batchSize?: number;
    onError?: 'skip' | 'fail';
  } = {}
): Promise<{ success: number; failed: number }> {
  const { batchSize = 100, onError = 'skip' } = options;
  let success = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    try {
      await withTransaction(async (supabase) => {
        const { error } = await supabase.from(table).insert(batch);

        if (error) {
          throw error;
        }
      }, { table });

      success += batch.length;
    } catch (error) {
      failed += batch.length;

      if (onError === 'fail') {
        throw error;
      }

      logger.warn('Batch insert partial failure', {
        table,
        batchSize: batch.length,
        error,
      });
    }
  }

  return { success, failed };
}
