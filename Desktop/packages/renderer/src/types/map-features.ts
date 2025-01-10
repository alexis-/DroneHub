import type { Feature } from 'ol';
import type { Point } from 'ol/geom';
import type { IProject } from '@shared/database/entities/IProject';

export interface MapMarker {
  id: string;
  type: 'temporary' | 'project';
  feature: Feature<Point>;
  properties: Record<string, any>;
}

export interface MarkerStyle {
  scale: number;
  anchor: [number, number];
  src: string;
}

export interface MarkerOptions {
  id: string;
  type: MapMarker['type'];
  coordinates: [number, number]; // [longitude, latitude]
  style?: Partial<MarkerStyle>;
  properties?: Record<string, any>;
}

export interface ProjectMarker extends MapMarker {
  type: 'project';
  properties: {
    projectId: number;
    project: IProject;
  };
}

export interface TemporaryMarker extends MapMarker {
  type: 'temporary';
  properties: {
    purpose: string;
  };
} 