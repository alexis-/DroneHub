import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useMapStore } from './map.store';
import { mapFeaturesService } from '@/services/map-features.service';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';
import type { IProject } from '@shared/database/entities/IProject';
import type { MapMarker } from '@/types/map-features';
import type { Map as OlMap } from 'ol';

const CONTEXT = 'MapFeaturesStore';

export const useMapFeaturesStore = defineStore('map-features', () => {
  const mapStore = useMapStore();
  const temporaryMarkers = ref<Map<string, MapMarker>>(new Map());
  const projectMarkers = ref<Map<string, MapMarker[]>>(new Map());

  async function initializeLayer(mapId: string) {
    try {
      Logger.info(CONTEXT, 'Initializing features layer');
      
      const map = mapStore.getMap(mapId);
      if (!map) {
        throw new AppError(`Map ${mapId} not found`, CONTEXT);
      }
      mapFeaturesService.initializeLayer(mapId, map);
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to initialize features layer', error);
      throw error;
    }
  }

  function setTemporaryMarker(mapId: string, lng: number, lat: number, purpose: string): MapMarker {
    try {
      Logger.info(CONTEXT, `Setting temporary marker at ${lat}, ${lng} for ${purpose}`);
      
      clearTemporaryMarker(mapId);

      const marker = mapFeaturesService.createMarker(mapId, {
        id: 'temporary',
        type: 'temporary',
        coordinates: [lng, lat],
        properties: {
          purpose
        }
      });

      temporaryMarkers.value.set(mapId, marker);
      Logger.debug(CONTEXT, 'Temporary marker added successfully');
      return marker;
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to set temporary marker', error);
      throw error;
    }
  }

  function clearTemporaryMarker(mapId: string) {
    try {
      const marker = temporaryMarkers.value.get(mapId);

      if (marker) {
        Logger.debug(CONTEXT, 'Clearing temporary marker');
        
        mapFeaturesService.removeMarker(mapId, marker.id);
        temporaryMarkers.value.delete(mapId);
      }
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to clear temporary marker', error);
      throw error;
    }
  }

  function setProjectMarkers(mapId: string, projects: IProject[]) {
    try {
      Logger.info(CONTEXT, `Setting ${projects.length} project markers`);
      
      clearProjectMarkers(mapId);

      const markers = projects.map(project => {
        try {
          return mapFeaturesService.createMarker(mapId, {
            id: `project-${project.id}`,
            type: 'project',
            coordinates: [project.poi_lng, project.poi_lat],
            properties: {
              projectId: project.id,
              name: project.name
            }
          });
        } catch (error) {
          Logger.error(CONTEXT, `Failed to add marker for project ${project.id}`, error);
          return null;
        }
      }).filter((marker): marker is MapMarker => marker !== null);

      projectMarkers.value.set(mapId, markers);

      const createdMarkerCount = projectMarkers.value.get(mapId)?.length ?? 0;
      
      if (createdMarkerCount != markers.length) {
        Logger.warn(CONTEXT, `Failed to add ${markers.length - createdMarkerCount} project markers - only ${createdMarkerCount} markers were added`);
      } else {
        Logger.info(CONTEXT, `Successfully added ${createdMarkerCount} project markers`);
      }
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to set project markers', error);
      throw error;
    }
  }

  function clearProjectMarkers(mapId: string) {
    try {
      const markers = projectMarkers.value.get(mapId);

      if (!markers) {
        Logger.debug(CONTEXT, 'No project markers to clear');
        return;
      }

      Logger.debug(CONTEXT, `Clearing ${markers.length} project markers`);

      markers.forEach(marker => {
        mapFeaturesService.removeMarker(mapId, marker.id);
      });

      projectMarkers.value.set(mapId, []);

      Logger.debug(CONTEXT, 'Project markers cleared successfully');
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to clear project markers', error);
      throw error;
    }
  }

  return {
    temporaryMarkers,
    projectMarkers,
    initializeLayer,
    setTemporaryMarker,
    clearTemporaryMarker,
    setProjectMarkers,
    clearProjectMarkers
  };
}); 