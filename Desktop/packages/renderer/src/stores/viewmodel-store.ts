import { defineStore } from 'pinia';
import type { IViewModelStore } from '@vite-electron-builder/drone-hub-lib/src/models/interfaces/IViewModelStore';

interface ViewModelStoreState {
  viewmodels: Map<string, any>;
}

export const useViewModelStore: () => IViewModelStore = defineStore('viewmodel-store', {
  state: (): ViewModelStoreState => ({
    viewmodels: new Map()
  }),

  actions: {
    getOrCreate<T>(id: string, factory: () => T): T {
      if (!this.viewmodels.has(id)) {
        this.viewmodels.set(id, factory());
      }
      return this.viewmodels.get(id);
    },

    get<T>(id: string): T | undefined {
      return this.viewmodels.get(id);
    },

    delete(id: string): boolean {
      return this.viewmodels.delete(id);
    },

    clear(): void {
      this.viewmodels.clear();
    }
  }
});
