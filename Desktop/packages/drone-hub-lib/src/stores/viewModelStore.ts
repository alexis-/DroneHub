import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export const useViewModelStore = defineStore('viewmodels', () => {
  const viewModels: Ref<Map<string, any>> = ref(new Map());

  function getOrCreate<T>(id: string, factory: () => T): T {
    if (!viewModels.value.has(id)) {
      viewModels.value.set(id, factory());
    }
    return viewModels.value.get(id);
  };

  function get<T>(id: string): T | undefined {
    return viewModels.value.get(id);
  };

  function remove(id: string): boolean {
    return viewModels.value.delete(id);
  };

  function clear(): void {
    viewModels.value.clear();
  };
});
