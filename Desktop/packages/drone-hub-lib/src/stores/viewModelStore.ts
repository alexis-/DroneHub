import { defineStore } from 'pinia';
import { ref, type Ref, watch, inject, reactive, computed } from 'vue';
import type { IAppStatePersistenceService } from '#models/interfaces/IAppStatePersistenceService';
import { AppStatePersistenceServiceKey } from '#models/injection-keys';

/**
 * The view model store keeps track of view model instances, provides lifecycle management,
 * and includes a persistence layer that automatically saves view models after changes.
 */
export const useViewModelStore = defineStore('viewmodels', () => {

  
  //#region [PRIVATE STATE DECLARATIONS]

  /**
   * Map of view model instances indexed by unique id.
   */
  const viewModels: Ref<Map<string, object>> = ref(new Map());

  /**
   * Map to track debounced save timer handles for each view model.
   */
  const saveTimers: Map<string, number> = new Map();

  /**
   * The persistence service injected via our dependency injection mechanism.
   */
  const persistenceService = inject(AppStatePersistenceServiceKey) as IAppStatePersistenceService;
  if (!persistenceService) {
    throw new Error('AppStatePersistenceService not provided. Ensure to provide it in your app setup.');
  }

  /**
   * Internal reactive registry to track active view models.
   * Each entry includes the view model instance and a reference count.
   */
  const activeViewModelsInternal: Ref<Map<string, { instance: object; count: number }>> = ref(new Map());

  //#endregion

  
  //#region [PRIVATE HELPER FUNCTIONS]

  /**
   * Schedules a debounced save for the given view model.
   * Clears any existing timer and sets a new one to call the persistence service after 5 seconds.
   *
   * @param id Unique identifier for the view model.
   * @param viewModel The view model instance whose state will be saved.
   */
  function scheduleSave(id: string, viewModel: object): void {
    // Clear existing timer if present
    if (saveTimers.has(id)) {
      clearTimeout(saveTimers.get(id));
    }
    // Set a new timer (5-second debounce)
    const timer = setTimeout(async () => {
      await persistenceService.saveViewModel(id, viewModel);
      saveTimers.delete(id);
    }, 5000);
    saveTimers.set(id, timer);
  }

  //#endregion

  
  //#region [STORE FUNCTIONS]

  /**
   * Gets an existing view model by id or creates a new one using the provided factory.
   * Also sets up a deep watcher to persist changes.
   * If persisted state exists, it is loaded and merged into the new instance.
   *
   * @param id Unique identifier for the view model.
   * @param factory Factory function that returns a new view model instance.
   * @returns The view model instance.
   */
  function getOrCreate<T extends object>(id: string, factory: () => T): T {
    if (!viewModels.value.has(id)) {
      // Create the new view model instance using the factory.
      // Wrap the instance with Vue's reactive() to ensure its properties are observed.
      const instance = factory();
      const vm = reactive(instance) as T;
      viewModels.value.set(id, vm);

      // Attempt to load any previously persisted data and merge it into the reactive instance.
      persistenceService
        .loadViewModel(id)
        .then((loadedData) => {
          if (loadedData) {
            Object.assign(vm, loadedData);
          }
        })
        .catch((error) => {
          console.error(`Error loading persisted state for view model ${id}:`, error);
        });

      // Setup a deep watcher on the reactive view model to schedule persistence on changes.
      // We wrap the view model in a getter function so that Vue can track its reactivity.
      watch(
        () => vm,
        () => {
          scheduleSave(id, vm);
        },
        { deep: true }
      );
    }
    return viewModels.value.get(id) as T;
  };

  /**
   * Retrieves a view model by its unique id.
   *
   * @param id Unique identifier for the view model.
   * @returns The view model instance or undefined if not found.
   */
  function get<T extends object>(id: string): T | undefined {
    return viewModels.value.get(id) as T | undefined;
  };

  /**
   * Removes a view model from the store.
   * Clears any pending save timer for the view model.
   *
   * @param id Unique identifier for the view model.
   * @returns A boolean indicating if the view model was successfully removed.
   */
  function remove(id: string): boolean {
    if (saveTimers.has(id)) {
      clearTimeout(saveTimers.get(id));
      saveTimers.delete(id);
    }
    return viewModels.value.delete(id);
  };

  /**
   * Clears all view models and cancels any pending save timers.
   */
  function clear(): void {
    saveTimers.forEach(timer => clearTimeout(timer));
    saveTimers.clear();
    viewModels.value.clear();
    activeViewModelsInternal.value.clear();
  };

  /**
   * Immediately flushes all pending view model saves.
   * This should be called when the application is closing.
   */
  async function flushAll(): Promise<void> {
    for (const [id, timer] of saveTimers.entries()) {
      clearTimeout(timer);
      const vm = viewModels.value.get(id);
      if (vm) {
        await persistenceService.saveViewModel(id, vm);
      }
      saveTimers.delete(id);
    }
  }

  //#endregion

  
  //#region  [ACTIVE VIEW MODELS MANAGEMENT]

  /**
   * Activates a view model by its unique id.
   * Increments the reference count if the view model is already active;
   * otherwise, registers it as active.
   *
   * @param id Unique identifier for the view model.
   * @param instance The view model instance.
   */
  function activateViewModel(id: string, instance: object): void {
    const entry = activeViewModelsInternal.value.get(id);
    if (entry) {
      entry.count += 1;
    } else {
      activeViewModelsInternal.value.set(id, { instance, count: 1 });
    }
  }

  /**
   * Deactivates a view model by its unique id.
   * Decrements the reference count and removes it if the count reaches zero.
   *
   * @param id Unique identifier for the view model.
   */
  function deactivateViewModel(id: string): void {
    const entry = activeViewModelsInternal.value.get(id);
    if (entry) {
      entry.count -= 1;
      if (entry.count <= 0) {
        activeViewModelsInternal.value.delete(id);
      }
    }
  }

  /**
   * Exposes a reactive mapping of currently active view models.
   * This computed property maps each id to its view model instance.
   */
  const activeViewModelsMap = computed<Map<string, object>>(() => {
    const activeMap = new Map<string, object>();
    for (const [id, entry] of activeViewModelsInternal.value.entries()) {
      activeMap.set(id, entry.instance);
    }
    return activeMap;
  });

  /**
   * Exposes a reactive list of currently active view model instances.
   */
  const activeViewModels = computed<object[]>(() => {
    const activeList = [];
    for (const entry of activeViewModelsInternal.value.values()) {
      activeList.push(entry.instance);
    }
    return activeList;
  });

  //#endregion
  
  
  //#region [APP CLOSING HANDLER]

  /**
   * Invokes the onUnmounted lifecycle callback on all active view models that implement IViewModelCallbacks,
   * and then forces a save of every active view model regardless of pending debounce timers.
   *
   * This method should be called when the application is closing.
   *
   * @returns A promise that resolves when all active view models have been saved.
   */
  async function onAppClosing(): Promise<void> {
    // Iterate over each active view model registered in the internal registry.
    for (const [id, entry] of activeViewModelsInternal.value.entries()) {
      const vm = entry.instance;
      
      // Call onUnmounted if the view model implements it.
      if (typeof (vm as any).onUnmounted === 'function') {
        try {
          console.log(`Calling onUnmounted for view model with id: ${id}`);
          (vm as any).onUnmounted();
        } catch (error) {
          console.error(`Error calling onUnmounted for view model with id: ${id}`, error);
        }
      }
      
      // Force a save of the view model's state.
      try {
        await persistenceService.saveViewModel(id, vm);
      } catch (error) {
        console.error(`Error forcing save for view model with id: ${id}`, error);
      }
    }

    // Additionally, flush any pending debounced saves (if any remain).
    await flushAll();
  }

  //#endregion


  //#region [STORE API]

  return {
    getOrCreate,
    get,
    remove,
    clear,
    flushAll,
    activateViewModel,
    deactivateViewModel,
    onAppClosing,
    activeViewModelsMap,
    activeViewModels,
  };

  //#endregion

});
