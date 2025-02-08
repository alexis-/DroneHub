//#region [VIEW MODEL LIFECYCLE INTERFACE]

/**
 * IViewModelLifecycle defines optional lifecycle hooks for view models.
 * Implement these methods to perform actions when the view model is mounted or unmounted.
 */
export interface IViewModelCallbacks {

  
  
  /**
   * Called when the view model is mounted.
   * Implement any initialization that needs to occur after creation.
   */
  onMounted?(): void;

  /**
   * Called when the view model is unmounted.
   * Implement any cleanup logic (e.g., releasing resources, updating state)
   * before the view model is removed.
   */
  onUnmounted?(): void;
}

//#endregion
