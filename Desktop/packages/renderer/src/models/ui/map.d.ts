import type { Feature } from 'ol';
import type { Vector as VectorLayer } from 'ol/layer';
import type { Vector as VectorSource } from 'ol/source';

export type Feature = Feature<Point>;
export type VectorLayer = VectorLayer<VectorSource>;
export type MapClickEvent = MapBrowserEvent<MouseEvent>;
export type MapEventHandler = (event: MapClickEvent) => void;

export interface MapMarker {
  id: string;
  type: 'poi' | 'project';
  feature: Feature;
  properties: Record<string, any>;
}

export interface MapStyle {
  id: string;
  title: string;
  img: string;
} 