export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  caller?: string;
}

export interface ILoggerService {
  debug(context: string, message: string, data?: any)
  info(context: string, message: string, data?: any)
  warn(context: string, message: string, data?: any)
  error(context: string, message: string, error?: Error | any)
  getLogs(): LogEntry[]
  clearLogs()
}