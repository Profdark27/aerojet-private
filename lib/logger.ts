/**
 * AeroJet Centralized Logger
 * Used for tracking critical business events and failures.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'

interface LogDetails {
  context: string
  message: string
  data?: any
  error?: any
}

class Logger {
  private formatLog(level: LogLevel, details: LogDetails) {
    const timestamp = new Date().toISOString()
    const color = level === 'ERROR' ? '❌' : level === 'SUCCESS' ? '✅' : level === 'WARN' ? '⚠️' : 'ℹ️'
    
    return {
      timestamp,
      level,
      color,
      ...details
    }
  }

  info(details: LogDetails) {
    console.log(JSON.stringify(this.formatLog('INFO', details)))
  }

  success(details: LogDetails) {
    console.log(JSON.stringify(this.formatLog('SUCCESS', details)))
  }

  warn(details: LogDetails) {
    console.warn(JSON.stringify(this.formatLog('WARN', details)))
  }

  error(details: LogDetails) {
    console.error(JSON.stringify(this.formatLog('ERROR', details)))
    // TODO: Integrate with Sentry or similar in the future
  }

  // Business-specific logs
  payment(status: 'SUCCESS' | 'FAILED', details: Omit<LogDetails, 'context'>) {
    this[status === 'SUCCESS' ? 'success' : 'error']({ context: 'PAYMENT', ...details })
  }

  messaging(status: 'SUCCESS' | 'FAILED', details: Omit<LogDetails, 'context'>) {
    this[status === 'SUCCESS' ? 'success' : 'error']({ context: 'MESSAGING', ...details })
  }

  ops(status: 'SUCCESS' | 'FAILED', details: Omit<LogDetails, 'context'>) {
    this[status === 'SUCCESS' ? 'success' : 'error']({ context: 'OPERATIONS', ...details })
  }
}

export const logger = new Logger()
