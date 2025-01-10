import { Logger } from '@/services/logger.service';
import { AppError } from './errors/app-error';

/**
 * Global error handler utility
 */
export class ErrorHandler {
  private static readonly CONTEXT = 'ErrorHandler';

  /**
   * Handle any error and log it appropriately
   */
  static handle(error: unknown, context: string, message: string): void {
    if (error instanceof AppError) {
      Logger.error(context, message, {
        name: error.name,
        message: error.message,
        context: error.context,
        originalError: error.originalError
      });
    } else if (error instanceof Error) {
      Logger.error(context, message, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      Logger.error(context, message, error);
    }
  }

  /**
   * Handle error and rethrow it
   */
  static handleAndThrow(error: unknown, context: string, message: string): never {
    this.handle(error, context, message);
    throw error;
  }

  /**
   * Create an AppError from any error
   */
  static normalizeError(error: unknown, context: string, message: string): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AppError(message, context, error);
    }
    
    return new AppError(message, context);
  }
} 