import { Viewer, Scene, Camera, ImageryLayer, TextureMagnificationFilter, TextureMinificationFilter, JulianDate, Cartesian2, Cartesian3 } from 'cesium';
import { AppError } from '#models/app-errors.ts';
import type { ILoggerService } from '#models/interfaces/ILoggerService.js';
import type { IMapControls } from '#models/interfaces/IMapControls.ts';
import { CesiumMapLayers } from '#data/map-layers.ts';
import { mapCoordinatesCesium } from '#data/map-coordinates.ts';

const CONTEXT = "CesiumViewModel";

export class CesiumViewModel implements IMapControls {
  private _logger: ILoggerService;
  private _viewer: Viewer;
  private _zoomAmount = 0;
  private _isZooming = false;
  private _zoomFrame: number | null = null;

  get viewer(): Viewer {
    if (!this._viewer)
      throw new AppError("Cesium viewer is not initialized", CONTEXT);

    return this._viewer;
  }

  get scene(): Scene {
    return this.viewer.scene;
  }

  get camera(): Camera {
    return this.viewer.camera;
  }
  
  async initMap(
    logger: ILoggerService,
    mapElement: HTMLElement,
    defaultPosition: Cartesian3,
    defaultZoom: number = 1000000
  ) {
    this._logger = logger;
    console.log(defaultPosition, defaultZoom)
    
    const norge = CesiumMapLayers.Norge();
    const terrainProvider = await CesiumMapLayers.TerrainProvider();
    
    
    norge.minificationFilter = TextureMinificationFilter.NEAREST;
    norge.magnificationFilter = TextureMagnificationFilter.NEAREST;

    this._viewer = new Viewer(mapElement, {
      baseLayer: ImageryLayer.fromProviderAsync(new Promise(res => res(norge)), {}),
      terrainProvider: terrainProvider,

      useBrowserRecommendedResolution: false,

      // Disable Cesium Ion
      baseLayerPicker : false,
      geocoder: false,

      // Disable widgets
      timeline: false,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      navigationHelpButton: false
    });

    this._viewer.scene.globe.depthTestAgainstTerrain  = true;
    this._viewer.scene.verticalExaggeration = 1;

    this._viewer.scene.globe.maximumScreenSpaceError = 1;

    this._viewer.scene.globe.enableLighting = true;
    this._viewer.scene.globe.atmosphereLightIntensity = 15;
    this._viewer.scene.highDynamicRange = true;
    
    this._viewer.clock.currentTime = JulianDate.fromIso8601(
      "2024-08-01T12:30:00.000Z",
    );

    this.camera.flyTo({
      destination: defaultPosition,
      duration: 0
    });
    
    this._logger.info(CONTEXT, 'Cesium viewer initialized successfully');
  }

  centerOnGPS(): void {
    // TODO: Implement geolocation centering
    this.camera.flyTo({
      destination: mapCoordinatesCesium.Oslo,
      duration: 5
    })
  }

  private _handleZoom = (): void => {
    if (Math.abs(this._zoomAmount) < 0.01) {
      this._isZooming = false;
      this._zoomAmount = 0;
      if (this._zoomFrame !== null) {
        cancelAnimationFrame(this._zoomFrame);
        this._zoomFrame = null;
      }
      return;
    }

    // Get the ray from the camera position in the view direction
    const ray = this.camera.getPickRay(new Cartesian2(
      Math.round(this.scene.canvas.clientWidth / 2),
      Math.round(this.scene.canvas.clientHeight / 2)
    ));

    if (!ray) return;

    // Find where this ray intersects with the terrain
    let intersection = this.scene.globe.pick(ray, this.scene);
    
    if (!intersection) {
      // If no intersection, use a point along the ray at a reasonable distance
      const direction = Cartesian3.normalize(ray.direction, new Cartesian3());
      intersection = Cartesian3.add(
        this.camera.position,
        Cartesian3.multiplyByScalar(direction, 1000000, new Cartesian3()),
        new Cartesian3()
      );
    }

    // Calculate the zoom factor based on accumulated zoom amount
    const zoomFactor = Math.pow(0.95, this._zoomAmount > 0 ? 1 : -1);
    
    // Calculate the new position by interpolating between current position and intersection
    const newPosition = Cartesian3.lerp(
      this.camera.position,
      intersection,
      this._zoomAmount > 0 ? (1 - zoomFactor) : -(zoomFactor - 1),
      new Cartesian3()
    );

    // Move camera directly without animation
    this.camera.position = newPosition;
    
    // Decay the zoom amount
    this._zoomAmount *= 0.7;
    
    // Request next frame
    this._zoomFrame = requestAnimationFrame(this._handleZoom);
  }

  changeZoomLevel(delta: number): void {
    // Accumulate zoom amount
    this._zoomAmount += delta;

    // Start zoom handling if not already started
    if (!this._isZooming) {
      this._isZooming = true;
      this._handleZoom();
    }
  }
}
