import { inject, onUnmounted } from 'vue';
import { ViewModelStoreKey } from '#models/injection-keys.ts';

/**
 * Composable for managing viewmodel lifecycle in components
 * @param id Unique identifier for the viewmodel
 * @param factory Factory function to create a new viewmodel instance
 * @param options Configuration options
 * @returns The viewmodel instance as a reactive ref
 */
export function useViewModel<T>(
  id: string,
  factory: () => T,
  preserveOnUnmount = true
): T {
  const store = inject(ViewModelStoreKey);

  if (!store) {
    throw new Error('ViewModelStore not provided. Make sure to provide it in your app setup.');
  }

  const vm = store.getOrCreate(id, factory);

  onUnmounted(() => {
    if (!preserveOnUnmount) {
      store.delete(id);
    }
  });

  return vm;
}
