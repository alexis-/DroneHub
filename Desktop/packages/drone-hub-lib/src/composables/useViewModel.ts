import { useViewModelStore } from '#stores/viewModelStore.ts';
import { inject, onMounted, onUnmounted } from 'vue';
import type { IViewModelCallbacks } from '#models/interfaces/IViewModelCallbacks';

/**
 * Composable for managing viewmodel lifecycle in components.
 * It registers the viewmodel as active when the component is mounted,
 * and deactivates (and optionally removes) it on unmount.
 *
 * @param id Unique identifier for the viewmodel.
 * @param factory Factory function to create a new viewmodel instance.
 * @param preserveOnUnmount If true, the view model remains in the store after unmounting.
 * @returns The viewmodel instance as a reactive ref.
 */
export function useViewModel<T extends object>(
  id: string,
  factory: () => T,
  preserveOnUnmount = true
): T {
  // Retrieve the view model store from the dependency injection system.
  const store = useViewModelStore();

  if (!store) {
    throw new Error('ViewModelStore not provided. Make sure to provide it in your app setup.');
  }

  // Get or create the view model instance.
  const vm = store.getOrCreate(id, factory);

  // Mark the view model as active.
  store.activateViewModel(id, vm);

  // Call the optional onMounted lifecycle callback if implemented.
  onMounted(() => {
    if (typeof (vm as unknown as IViewModelCallbacks).onMounted === 'function') {
      (vm as unknown as IViewModelCallbacks).onMounted();
    }
  });

  // On component unmount, call the optional onUnmounted lifecycle callback,
  // then deactivate (and optionally remove) the view model.
  onUnmounted(() => {
    if (typeof (vm as unknown as IViewModelCallbacks).onUnmounted === 'function') {
      (vm as unknown as IViewModelCallbacks).onUnmounted();
    }
    store.deactivateViewModel(id);
    if (!preserveOnUnmount) {
      store.remove(id);
    }
  });

  return vm;
}
