/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    context: string,
    originalError?: Error,
    ...data: any[]
  ) {
    super(message + (originalError ? `: ${originalError.message}` : '') + (data.length ? `: ${JSON.stringify(data)}` : ''));
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when a map operation fails
 */
export class MapError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'Map', originalError);
  }
}