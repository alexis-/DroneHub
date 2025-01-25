import { getTopLeft, getWidth } from "ol/extent";
import type { ProjectionLike } from "ol/proj";
import {get as getProjection} from 'ol/proj';
import WMTSTileGrid from "ol/tilegrid/WMTS";

/**
 * Generate a tile grid for a WMTS layer
 */
export function GenerateTileGrid(projectionLike: ProjectionLike, zoomLevels: number): WMTSTileGrid {
  const projection = getProjection(projectionLike);
  const projectionExtent = projection!.getExtent();
  const size = getWidth(projectionExtent) / 256;
  
  const resolutions = new Array(zoomLevels);
  const matrixIds = new Array(zoomLevels);

  for (let z = 0; z < zoomLevels; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  return new WMTSTileGrid({
    origin: getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds,
  });
}