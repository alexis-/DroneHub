import { Logger } from '@/services/logger.service';
import { AppState } from '@/types/app-state';

export abstract class BaseStateHandler {
  protected context: string;

  constructor() {
    this.context = this.constructor.name;
  }

  /**
   * Called when entering the state
   */
  async onEnter(): Promise<void> {
    Logger.debug(this.context, `Entering state`);
  }

  /**
   * Called when exiting the state
   */
  async onExit(): Promise<void> {
    Logger.debug(this.context, `Exiting state`);
  }

  /**
   * Validate if transition to target state is allowed
   */
  abstract canTransitionTo(targetState: AppState): boolean;
} 