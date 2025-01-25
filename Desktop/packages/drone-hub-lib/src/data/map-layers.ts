import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS.js';
import OSM from 'ol/source/OSM.js';
import { get as getProjection } from 'ol/proj';
import { GenerateTileGrid } from '#utils/open-layers/OlLayerUtils.ts';
import XYZ from 'ol/source/XYZ';
import { CesiumTerrainProvider, OpenStreetMapImageryProvider, WebMapTileServiceImageryProvider } from 'cesium';

/**
 * OL Map layer presets
 */
export const OlMapLayers: Record<string, TileLayer> = {
  'OSM_3857_XYZ': new TileLayer({
    source: new OSM(),
  }),
  'Norway_3857_WMTS': new TileLayer({
    source: new WMTS({
      url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?',
      layer: 'Nibcache_web_mercator_v2',
      format: 'image/png',
      matrixSet: 'default028mm',
      projection: getProjection('EPSG:3857'),
      tileGrid: GenerateTileGrid('EPSG:3857', 19),
      style: 'default',
      attributions: 'Kartverket, Geovekst, kommuner og OSM contributors.',
    }),
  }),
  // 'Norway_25832_WMTS': new TileLayer({
  //   source: new WMTS({
  //     url: 'http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm32_wmts_v2?',
  //     layer: 'Nibcache_UTM33_EUREF89',
  //     format: 'image/png',
  //     matrixSet: 'default028mm',
  //     projection: getProjection('EPSG:25832'),
  //     tileGrid: GenerateTileGrid('EPSG:25832', 19),
  //     style: 'default',
  //     attributions: 'Kartverket, Geovekst, kommuner og OSM contributors.',
  //   }),
  // }),
  'abb': new TileLayer({
      // title: 'Skianlegg Kart',
      // type: 'base',
      extent: [1194558.803012, 8618317.604343, 1195540.931820, 8619363.209844],
      source: new XYZ({
          minZoom: 14,
          maxZoom: 22,
          url: 'https://abb.mjosdrone.no/base/{z}/{x}/{-y}.png',
          tileSize: [256, 256]
      })
  })
}


/**
 * Cesium Map layer presets
 */
export const CesiumMapLayers: Record<string, () => any> = {
  Norge: () => new WebMapTileServiceImageryProvider({
    url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?',
    layer: 'Nibcache_web_mercator_v2',
    format: 'image/png',
    style: 'default',
    tileMatrixSetID: 'default028mm',
    maximumLevel: 19,
  }),
  Osm: () => new OpenStreetMapImageryProvider({
    url : 'https://tile.openstreetmap.org/'
  }),
  TerrainProvider: () => CesiumTerrainProvider.fromUrl('http://localhost:8080', {requestVertexNormals: true})
};
