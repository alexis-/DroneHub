import { AppState } from '@/models/ui/app-state';
import { StateTransitionError } from '@/models/errors/app-error';
import { Logger } from './logger.service';

const CONTEXT = 'StateValidator';

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Service to validate state transitions
 */
export class StateValidatorService {
  private static validTransitions = new Map<AppState, AppState[]>([
    [AppState.PROJECT_SELECTION, [AppState.PROJECT_CREATION, AppState.PROJECT_EDITING]],
    [AppState.PROJECT_CREATION, [AppState.PROJECT_SELECTION]],
    [AppState.PROJECT_EDITING, [AppState.PROJECT_SELECTION]],
  ]);

  /**
   * Validate a state transition
   */
  static validateTransition(from: AppState, to: AppState): ValidationResult {
    Logger.debug(CONTEXT, `Validating transition from ${from} to ${to}`);

    const validTransitions = this.validTransitions.get(from);
    
    if (!validTransitions) {
      return { 
        valid: false, 
        reason: `No valid transitions defined for state: ${from}` 
      };
    }

    const isValid = validTransitions.includes(to);
    
    if (!isValid) {
      return { 
        valid: false, 
        reason: `Cannot transition from ${from} to ${to}` 
      };
    }

    return { valid: true };
  }

  /**
   * Validate a state transition and throw if invalid
   * @throws {StateTransitionError}
   */
  static validateTransitionOrThrow(from: AppState, to: AppState): void {
    const result = this.validateTransition(from, to);
    
    if (!result.valid) {
      throw new StateTransitionError(from, to, result.reason!);
    }
  }
} 