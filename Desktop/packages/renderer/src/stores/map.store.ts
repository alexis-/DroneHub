import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { Map as olMap } from 'ol';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';

const CONTEXT = 'MapStore';

export const useMapStore = defineStore('map', () => {
  // Store multiple maps with their IDs
  const maps = ref<Map<string, olMap>>(new Map());
  const activeMapId = ref<string | null>(null);

  // Computed property to get the active map
  const activeMap = computed(() => activeMapId.value ? maps.value.get(activeMapId.value) : null);

  function createMap(id: string, options: { target: HTMLElement } & Record<string, any>): olMap {
    Logger.info(CONTEXT, `Creating new map with id: ${id}`);
    
    if (maps.value.has(id)) {
      throw new AppError(`Map with id ${id} already exists`, CONTEXT);
    }

    const map = new olMap(options);

    maps.value.set(id, map);
    
    // Set as active map if no other map is active
    if (!activeMapId.value) {
      setActiveMap(id);
    }

    return map;
  }

  function setActiveMap(id: string) {
    if (!maps.value.has(id)) {
      throw new AppError(`Cannot set active map: map ${id} does not exist`, CONTEXT);
    }
    Logger.info(CONTEXT, `Setting active map to: ${id}`);
    activeMapId.value = id;
  }

  function getMap(id: string): olMap | undefined {
    if (!maps.value.has(id)) {
      Logger.warn(CONTEXT, `Map ${id} requested but does not exist`);
    }
    return maps.value.get(id) as olMap | undefined;
  }

  function removeMap(id: string) {
    const map = maps.value.get(id);
    if (map) {
      Logger.info(CONTEXT, `Removing map: ${id}`);
      map.setTarget(undefined); // Clean up
      maps.value.delete(id);
      
      if (activeMapId.value === id) {
        activeMapId.value = maps.value.size > 0 ? Array.from(maps.value.keys())[0] : null;
      }
    }
  }

  return {
    maps,
    activeMap,
    activeMapId,
    createMap,
    getMap,
    removeMap,
    setActiveMap
  };
});