//#region [BROWSER APP STATE PERSISTENCE SERVICE]

import type { IAppStatePersistenceService } from '#models/interfaces/IAppStatePersistenceService';
import { serializeViewModel } from '#utils/json-serialization';

/**
 * BrowserAppStatePersistenceService implements IAppStatePersistenceService for browser environments.
 * It uses the browser's localStorage API to persist view model state.
 */
export class BrowserAppStatePersistenceService implements IAppStatePersistenceService {

  /**
   * Persists the view model state by saving it as a JSON string in localStorage.
   * Properties marked with @Transient are omitted from the serialized output.
   *
   * @param id Unique identifier for the view model.
   * @param state The state object to persist.
   * @returns A promise that resolves when the state is saved.
   */
  async saveViewModel(id: string, state: any): Promise<void> {
    const key = `app_state_${id}`;
    // Serialize the state with transient properties omitted.
    const data = serializeViewModel(state);
    localStorage.setItem(key, data);
  }

  /**
   * Loads the persisted view model state from localStorage.
   *
   * @param id Unique identifier for the view model.
   * @returns A promise that resolves with the parsed state object or null if not found.
   */
  async loadViewModel(id: string): Promise<any> {
    const key = `app_state_${id}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
}

//#endregion
