import { Logger } from '@/services/logger.service';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { MapConfig } from '@/config/map-config';
import { AppError } from '@/utils/errors/app-error';
import type { MapMarker, MarkerOptions } from '@/types/map-features';
import type { Map as OlMap } from 'ol';

const CONTEXT = 'MapFeaturesService';

export class MapFeaturesService {
  private static instance: MapFeaturesService;
  
  private vectorLayers: Map<string, VectorLayer<VectorSource>> = new Map();
  private vectorSources: Map<string, VectorSource> = new Map();
  private markers: Map<string, Map<string, MapMarker>> = new Map();

  constructor() {
    Logger.info(CONTEXT, 'Initializing map features service');
  }

  static getInstance(): MapFeaturesService {
    if (!MapFeaturesService.instance) {
      MapFeaturesService.instance = new MapFeaturesService();
    }
    return MapFeaturesService.instance;
  }

  /**
   * Initialize the vector layer for a specific map
   */
  initializeLayer(mapId: string, map: OlMap): void {
    try {
      Logger.info(CONTEXT, `Initializing features layer for map: ${mapId}`);
      
      if (this.vectorLayers.has(mapId)) {
        Logger.debug(CONTEXT, `Features layer already initialized for map: ${mapId}`);
        return;
      }

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        zIndex: 1
      });

      map.addLayer(vectorLayer);
      this.vectorLayers.set(mapId, vectorLayer);
      this.vectorSources.set(mapId, vectorSource);
      this.markers.set(mapId, new Map());

      Logger.info(CONTEXT, `Features layer initialized successfully for map: ${mapId}`);
    } catch (error) {
      Logger.error(CONTEXT, `Failed to initialize features layer for map: ${mapId}`, error);
      throw error;
    }
  }

  /**
   * Create a new marker on the map
   */
  createMarker(mapId: string, options: MarkerOptions): MapMarker {
    try {
      Logger.info(CONTEXT, `Creating marker of type ${options.type}`, options);
      
      const [lng, lat] = options.coordinates;
      const coordinates = fromLonLat([lng, lat]);

      const marker = new Feature({
        geometry: new Point(coordinates),
        properties: options.properties || {},
      });

      const style = this.createMarkerStyle(options);
      marker.setStyle(style);

      const mapMarker: MapMarker = {
        id: options.id,
        type: options.type,
        feature: marker,
        properties: options.properties || {},
      };

      this.addMarkerToMap(mapId, mapMarker);
      return mapMarker;
    } catch (error) {
      throw new AppError(`Failed to create marker: ${options.id}`, CONTEXT, error as Error);
    }
  }

  /**
   * Add a marker to the map
   */
  private addMarkerToMap(mapId: string, marker: MapMarker): void {
    const map = this.markers.get(mapId);
    if (!map) {
      throw new AppError(`Map not found for map: ${mapId}`, CONTEXT);
    }

    const vectorSource = this.vectorSources.get(mapId);
    if (!vectorSource) {
      throw new AppError(`Vector source not found for map: ${mapId}`, CONTEXT);
    }

    // Remove existing marker with same ID if it exists.
    this.removeMarker(mapId, marker.id);

    vectorSource.addFeature(marker.feature);
    map.set(marker.id, marker);

    Logger.info(CONTEXT, `Added marker ${marker.id} to map`);
  }

  /**
   * Remove a marker from the map
   */
  removeMarker(mapId: string, markerId: string): void {
    const vectorSource = this.vectorSources.get(mapId);
    if (!vectorSource) {
      throw new AppError(`Vector source not found for map: ${mapId}`, CONTEXT);
    }
    
    const map = this.markers.get(mapId);

    if (!map) {
      throw new AppError(`Map not found for map: ${mapId}`, CONTEXT);
    }

    const marker = map.get(markerId);

    if (marker) {
      vectorSource.removeFeature(marker.feature);
      map.delete(markerId);

      Logger.info(CONTEXT, `Removed marker ${markerId} from map`);
    }
  }

  /**
   * Create a style for a marker
   */
  private createMarkerStyle(options: MarkerOptions): Style {
    const config = options.type === 'project' 
      ? MapConfig.markers.project 
      : MapConfig.markers.poi;

    const anchor = options.style?.anchor 
      ? Array.from(options.style.anchor)
      : Array.from(config.anchor);

    return new Style({
      image: new Icon({
        anchor: anchor,
        src: options.style?.src || config.path,
        scale: options.style?.scale || config.scale,
      }),
    });
  }

  /**
   * Clear all markers from the map
   */
  clearAllMarkers(mapId: string): void {
    const vectorSource = this.vectorSources.get(mapId);

    if (!vectorSource) {
      throw new AppError(`Vector source not found for map: ${mapId}`, CONTEXT);
    }

    const map = this.markers.get(mapId);

    if (!map) {
      throw new AppError(`Map not found for map: ${mapId}`, CONTEXT);
    }

    map.forEach(marker => {
      vectorSource.removeFeature(marker.feature);
    });

    map.clear();

    Logger.info(CONTEXT, 'All markers cleared from map');
  }

  /**
   * Get all markers of a specific type
   */
  getMarkersByType<T extends MapMarker>(mapId: string, type: T['type']): T[] {
    const map = this.markers.get(mapId);

    if (!map) {
      throw new AppError(`Map not found for map: ${mapId}`, CONTEXT);
    }

    return Array.from(map.values())
      .filter(marker => marker.type === type) as T[];
  }
}

// Create a singleton instance
export const mapFeaturesService = MapFeaturesService.getInstance();