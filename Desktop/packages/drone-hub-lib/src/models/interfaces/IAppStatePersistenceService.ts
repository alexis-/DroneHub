//#region [IAPPSTATEPERSISTENCESERVICE INTERFACE]

/**
 * IAppStatePersistenceService defines the contract for persisting view model state.
 * Implementations must provide methods to save and load state.
 */
export interface IAppStatePersistenceService {
  /**
   * Persists the view model state identified by a unique id.
   *
   * @param id Unique identifier for the view model.
   * @param state The state object to persist.
   * @returns A promise that resolves when the state is saved.
   */
  saveViewModel(id: string, state: any): Promise<void>;

  /**
   * Loads the persisted state for the given view model id.
   *
   * @param id Unique identifier for the view model.
   * @returns A promise that resolves with the persisted state or null if not found.
   */
  loadViewModel(id: string): Promise<any>;
}

//#endregion
