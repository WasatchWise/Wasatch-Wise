/**
 * Structured Logging System
 * Production-ready logging with levels, context, and formatting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  requestId?: string
}

// ============================================
// Configuration
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const CURRENT_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// ============================================
// Logger Implementation
// ============================================

class Logger {
  private requestId?: string

  constructor(requestId?: string) {
    this.requestId = requestId
  }

  /**
   * Create a child logger with request context
   */
  child(context: { requestId?: string }): Logger {
    return new Logger(context.requestId || this.requestId)
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  /**
   * Log at info level
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Log at error level
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Check log level threshold
    if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LEVEL]) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId: this.requestId,
    }

    // Format output based on environment
    const output = IS_PRODUCTION
      ? JSON.stringify(entry)
      : this.formatDev(entry)

    // Output to appropriate console method
    switch (level) {
      case 'debug':
        console.debug(output)
        break
      case 'info':
        console.info(output)
        break
      case 'warn':
        console.warn(output)
        break
      case 'error':
        console.error(output)
        break
    }
  }

  /**
   * Format log entry for development (human-readable)
   */
  private formatDev(entry: LogEntry): string {
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    }
    const reset = '\x1b[0m'

    const color = levelColors[entry.level]
    const levelStr = entry.level.toUpperCase().padEnd(5)
    const time = entry.timestamp.split('T')[1].split('.')[0]

    let output = `${color}[${levelStr}]${reset} ${time} ${entry.message}`

    if (entry.requestId) {
      output += ` ${color}(${entry.requestId})${reset}`
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n         ${JSON.stringify(entry.context, null, 2).replace(/\n/g, '\n         ')}`
    }

    return output
  }
}

// ============================================
// Exports
// ============================================

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Create a logger with request context
 */
export function createLogger(requestId?: string): Logger {
  return new Logger(requestId)
}

/**
 * Log API request (middleware helper)
 */
export function logApiRequest(
  method: string,
  path: string,
  requestId: string,
  context?: LogContext
): void {
  logger.info(`${method} ${path}`, { ...context, requestId })
}

/**
 * Log API response (middleware helper)
 */
export function logApiResponse(
  method: string,
  path: string,
  status: number,
  durationMs: number,
  requestId: string
): void {
  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  logger.child({ requestId })[level](`${method} ${path} ${status} (${durationMs}ms)`)
}

/**
 * Performance timing helper
 */
export function createTimer() {
  const start = performance.now()
  return {
    elapsed: () => Math.round(performance.now() - start),
    log: (message: string, context?: LogContext) => {
      const elapsed = Math.round(performance.now() - start)
      logger.debug(`${message} (${elapsed}ms)`, context)
    },
  }
}
