import type { Coordinate } from 'ol/coordinate';
import { OpenLayersViewModel } from './OlVM'
import { mapCoordinatesOpenLayers } from '#data/map-coordinates.ts';


// extend it
declare module './OlVM' {
  interface OpenLayersViewModel {
    centerMapWithGeolocation(): void;
    obtainGeolocation(): Coordinate | null;
  }
}

OpenLayersViewModel.prototype.centerMapWithGeolocation = function() {
  // TODO
}

OpenLayersViewModel.prototype.obtainGeolocation = function() {
  // TODO
  return mapCoordinatesOpenLayers.Oslo;
}

export {}