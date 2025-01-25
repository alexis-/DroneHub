import { AppError } from '@mjosdrone/dhlib/models/app-errors';

/**
 * Error thrown when a state transition is invalid
 */
export class StateTransitionError extends AppError {
  constructor(from: string, to: string, reason: string) {
    super(
      `Invalid state transition from ${from} to ${to}: ${reason}`,
      'AppState'
    );
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: string, originalError?: Error) {
    super(message, context? context : 'Database', originalError);
  }
} 

/**
 * Error thrown when a component operation fails
 */
export class ComponentError extends AppError {
  constructor(componentName: string, message: string, originalError?: Error) {
    super(message, `Component:${componentName}`, originalError);
  }
}

/**
 * Error thrown when a service operation fails
 */
export class ServiceError extends AppError {
  constructor(serviceName: string, message: string, originalError?: Error) {
    super(message, `Service:${serviceName}`, originalError);
  }
}

/**
 * Error thrown when a store operation fails
 */
export class StoreError extends AppError {
  constructor(storeName: string, message: string, originalError?: Error) {
    super(message, `Store:${storeName}`, originalError);
  }
}

/**
 * Error thrown when a plugin operation fails
 */
export class PluginError extends AppError {
  constructor(pluginName: string, message: string, originalError?: Error) {
    super(message, `Plugin:${pluginName}`, originalError);
  }
}

/**
 * Error thrown when a configuration error occurs
 */
export class ConfigError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'Config', originalError);
  }
}