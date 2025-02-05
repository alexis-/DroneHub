//#region [IVIEWMODELSTORE INTERFACE]

/**
 * Interface for a store that manages viewmodel lifecycles.
 */
export interface IViewModelStore {
  
  /**
   * Get a viewmodel instance by its ID. Creates a new instance if none exists.
   *
   * @param id Unique identifier for the viewmodel.
   * @param factory Factory function to create a new viewmodel if needed.
   * @returns The viewmodel instance.
   */
  getOrCreate<T>(id: string, factory: () => T): T;

  /**
   * Get an existing viewmodel instance by its ID.
   *
   * @param id Unique identifier for the viewmodel.
   * @returns The viewmodel instance or undefined if not found.
   */
  get<T>(id: string): T | undefined;

  /**
   * Delete a viewmodel from the store.
   *
   * @param id Unique identifier for the viewmodel to delete.
   * @returns true if the viewmodel was found and deleted, false otherwise.
   */
  remove(id: string): boolean;

  /**
   * Clear all viewmodels from the store.
   */
  clear(): void;

  /**
   * Immediately flushes any pending state changes for all viewmodels to persistent storage.
   * This should be called when the application is closing.
   *
   * @returns A promise that resolves when all pending state changes have been flushed.
   */
  flushAll(): Promise<void>;
}

//#endregion
