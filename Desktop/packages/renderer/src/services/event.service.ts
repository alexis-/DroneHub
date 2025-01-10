import { Logger } from '@/services/logger.service';

type EventCallback = (...args: any[]) => void;


const CONTEXT = 'EventService';

/**
 * Application-wide event handling service
 */
export class EventService {
  private static instance: EventService;
  private eventMap: Map<string, Set<EventCallback>> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): void {
    Logger.debug(CONTEXT, `Subscribing to event: ${event}`);
    
    if (!this.eventMap.has(event)) {
      this.eventMap.set(event, new Set());
    }
    
    this.eventMap.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    Logger.debug(CONTEXT, `Unsubscribing from event: ${event}`);
    
    const callbacks = this.eventMap.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.eventMap.delete(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, ...args: any[]): void {
    Logger.debug(CONTEXT, `Emitting event: ${event}`, args);
    
    const callbacks = this.eventMap.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          Logger.error(CONTEXT, `Error in event handler for ${event}`, error);
        }
      });
    }
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    Logger.info(CONTEXT, 'Clearing all event listeners');
    this.eventMap.clear();
  }
}

// Export singleton instance
export const eventService = EventService.getInstance(); 