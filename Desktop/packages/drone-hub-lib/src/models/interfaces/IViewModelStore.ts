/**
 * Interface for a store that manages viewmodel lifecycles
 */
export interface IViewModelStore {
  /**
   * Get a viewmodel instance by its ID. Creates a new instance if none exists.
   * @param id Unique identifier for the viewmodel
   * @param factory Factory function to create a new viewmodel if needed
   */
  getOrCreate<T>(id: string, factory: () => T): T;

  /**
   * Get an existing viewmodel instance by its ID
   * @param id Unique identifier for the viewmodel
   * @returns The viewmodel instance or undefined if not found
   */
  get<T>(id: string): T | undefined;

  /**
   * Delete a viewmodel from the store
   * @param id Unique identifier for the viewmodel to delete
   * @returns true if the viewmodel was found and deleted, false otherwise
   */
  delete(id: string): boolean;

  /**
   * Clear all viewmodels from the store
   */
  clear(): void;
}
