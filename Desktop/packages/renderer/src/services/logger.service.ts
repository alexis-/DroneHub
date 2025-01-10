type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  caller?: string;
}

/**
 * Centralized logging service
 */
class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  /**
   * Extracts the caller's file and line number from the stack trace
   * Iterates through the stack until finding the first call outside of logger.service.ts
   */
  private getCallerLocation(): string {
    const error = new Error();
    const stack = error.stack?.split('\n');
    if (!stack) return 'unknown';

    // Find the first stack entry that's not from logger.service.ts
    for (const line of stack) {
      // Skip empty lines and lines without file information
      if (!line || line.trim() === '') continue;
      
      // Extract file path and line number using regex
      const match = line.match(/at.*\((.*):(\d+):(\d+)\)/) || 
                   line.match(/at\s+(.*):(\d+):(\d+)/);
      
      if (!match) continue;
      
      const fullPath = match[1];
      // Skip if the line is from logger.service.ts
      if (fullPath.includes('logger.service.ts')) continue;
      
      const lineNumber = match[2];
      // Remove timestamp query parameter and get filename
      const fileName = fullPath.split('/').pop()?.split('?')[0] || fullPath;
      
      return `${fileName}:${lineNumber}`;
    }

    return 'unknown';
  }

  private createLogEntry(
    level: LogLevel,
    context: string,
    message: string,
    data?: any
  ): LogEntry {
    // Format timestamp as yyyy-MM-dd hh:mm:ss
    const now = new Date();
    const timestamp = now.getFullYear() +
      '-' + String(now.getMonth() + 1).padStart(2, '0') +
      '-' + String(now.getDate()).padStart(2, '0') +
      ' ' + String(now.getHours()).padStart(2, '0') +
      ':' + String(now.getMinutes()).padStart(2, '0') +
      ':' + String(now.getSeconds()).padStart(2, '0');

    return {
      timestamp,
      level,
      context,
      message,
      data,
      caller: this.getCallerLocation(),
    };
  }

  private log(entry: LogEntry) {
    // Store log
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Format console output with caller information in italic
    const prefix = `[${entry.timestamp}] [${entry.context}]\n\x1B[3m${entry.caller}\x1B[0m\n`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case 'info':
        console.info(prefix, entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case 'error':
        console.error(prefix, entry.message, entry.data || '');
        break;
    }
  }

  debug(context: string, message: string, data?: any) {
    this.log(this.createLogEntry('debug', context, message, data));
  }

  info(context: string, message: string, data?: any) {
    this.log(this.createLogEntry('info', context, message, data));
  }

  warn(context: string, message: string, data?: any) {
    this.log(this.createLogEntry('warn', context, message, data));
  }

  error(context: string, message: string, error?: Error | any) {
    this.log(this.createLogEntry('error', context, message, error));
  }

  /**
   * Get all logs for debugging purposes
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const Logger = new LoggerService(); 