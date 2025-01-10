import { Logger } from '@/services/logger.service';

/**
 * Application configuration service
 */
export class ConfigService {
  private static readonly CONTEXT = 'ConfigService';
  private static instance: ConfigService;
  private config: Record<string, any> = {};

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Load configuration from various sources
   */
  private loadConfig(): void {
    try {
      Logger.info(ConfigService.CONTEXT, 'Loading configuration');
      
      // Load environment variables
      this.config.env = {
        isDevelopment: import.meta.env.DEV,
        isProduction: import.meta.env.PROD,
        mode: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION
      };

      // Load other config sources here...
      
      Logger.info(ConfigService.CONTEXT, 'Configuration loaded successfully');
    } catch (error) {
      Logger.error(ConfigService.CONTEXT, 'Failed to load configuration', error);
      throw error;
    }
  }

  /**
   * Get a configuration value
   */
  get<T>(key: string, defaultValue?: T): T {
    const value = this.config[key];
    if (value === undefined && defaultValue === undefined) {
      Logger.warn(ConfigService.CONTEXT, `Configuration key not found: ${key}`);
    }
    return value ?? defaultValue;
  }

  /**
   * Set a configuration value
   */
  set(key: string, value: any): void {
    Logger.debug(ConfigService.CONTEXT, `Setting config key: ${key}`, value);
    this.config[key] = value;
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance(); 