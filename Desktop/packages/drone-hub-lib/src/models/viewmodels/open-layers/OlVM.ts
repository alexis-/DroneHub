import { Map as OlMap, View } from 'ol'
import type { Coordinate } from 'ol/coordinate';
import type LayerGroup from 'ol/layer/Group';

//import '#utils/extensions/throw.ts';
import { AppError } from '#models/app-errors.ts';
import type { ILoggerService } from '#models/interfaces/ILoggerService.js';
import type { IMapControls } from '#models/interfaces/IMapControls.ts';

const CONTEXT = "OpenLayersViewModel";

export class OpenLayersViewModel implements IMapControls {
  private _logger: ILoggerService;
  private _map: OlMap;

  get map(): OlMap {
    if (!this._map)
      throw new AppError("Map is not initialized", CONTEXT);

    return this._map; //.value;
  }
  
  async initMap(
    logger: ILoggerService,
    mapElement: HTMLElement,
    layers: LayerGroup[],
    defaultCenter: Coordinate,
    defaultZoom: number = 8
  )
  {
    // console.log(Object.throwIfNullish);
    // console.log(mapElement.throwIfNullish);
    // mapElement.throwIfNullish('Map element is nullish');
    // logger.throwIfNullish('Logger is nullish');

    this._logger = logger;

    this._map = new OlMap({
      target: mapElement,
      layers: layers,
      view: new View({
        center: defaultCenter,
        zoom: defaultZoom,
      }),
      controls: [],
    });
    
    // await mapFeaturesStore.initializeLayer(props.mapId);
    
    // emit('update:map-style', mapStyle);
    // centerMapWithGeolocation();
    
    this._logger.info(CONTEXT, 'Map initialized successfully');
  }

  centerOnGPS(): void {
    // this.map.getView().setCenter(this.obtainGeolocation());
  }

  changeZoomLevel(delta: number): void {
    this.map.getView().setZoom(this.map.getView().getZoom() + delta);
  }
}

// export * from './OlVM.geolocation';