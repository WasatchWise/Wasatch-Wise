/**
 * Comprehensive logging utility with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level];

      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, context || '');
    } else {
      // In production, use structured logging
      console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry));
    }

    // Send to Sentry for errors in production
    if (this.isProduction && level === 'error' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry will be initialized separately
      // This is just a placeholder for the logging structure
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      ...(error instanceof Error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        : { error }),
    };

    this.log('error', message, errorContext);
  }

  /**
   * Log API call with timing
   */
  async logAPICall<T>(
    service: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.debug(`API Call: ${service}.${operation}`, { service, operation });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`API Success: ${service}.${operation}`, {
        service,
        operation,
        duration: `${duration}ms`,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`API Error: ${service}.${operation}`, error, {
        service,
        operation,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  /**
   * Log database operation
   */
  async logDBOperation<T>(
    operation: string,
    table: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.debug(`DB Operation: ${operation} on ${table}`, { operation, table });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`DB Success: ${operation} on ${table}`, {
        operation,
        table,
        duration: `${duration}ms`,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`DB Error: ${operation} on ${table}`, error, {
        operation,
        table,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}

export const logger = new Logger();
