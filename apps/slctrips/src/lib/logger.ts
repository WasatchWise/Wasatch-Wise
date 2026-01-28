/**
 * Production-safe logger
 * Only logs to console in development, sends to error tracking in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
      ...(data && { data }),
    };

    // In development, log to console
    if (this.isDevelopment) {
      const consoleMethod = console[level] || console.log;
      if (data) {
        consoleMethod(`[${level.toUpperCase()}]`, message, data);
      } else {
        consoleMethod(`[${level.toUpperCase()}]`, message);
      }
    } else {
      // In production, only log errors (will be sent to Sentry)
      if (level === 'error') {
        // Errors will be caught by Sentry
        console.error(message, data);
      }
      // Silently ignore other logs in production
    }
  }

  info(message: string, data?: any, context?: LogContext) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: LogContext) {
    this.log('warn', message, data, context);
  }

  error(message: string, error?: any, context?: LogContext) {
    this.log('error', message, error, context);
  }

  debug(message: string, data?: any, context?: LogContext) {
    this.log('debug', message, data, context);
  }

  // For backward compatibility with console.log usage
  // In production, these are completely silent
  deprecatedLog(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data);
    }
  }
}

export const logger = new Logger();
export default logger;
