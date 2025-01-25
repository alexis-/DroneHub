import { Cartesian3 } from "cesium";
import type { Coordinate } from "ol/coordinate";
import { fromLonLat } from "ol/proj";

export const mapCoordinatesWGS84: Record<string, Coordinate> = {
  Oslo: [10.7522, 59.9139],
}

export const mapCoordinatesOpenLayers: Record<string, Coordinate> = {
  Oslo: fromLonLat(mapCoordinatesWGS84.Oslo),
}

export const mapCoordinatesCesium: Record<string, Cartesian3> = {
  Oslo: Cartesian3.fromDegrees(
    mapCoordinatesWGS84.Oslo[0], 
    mapCoordinatesWGS84.Oslo[1], 
    100000
  ),
}