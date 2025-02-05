  

//#region [CESIUM VIEW MODEL IMPLEMENTATION]

import {
  Viewer,
  Scene,
  Camera,
  ImageryLayer,
  TextureMagnificationFilter,
  TextureMinificationFilter,
  JulianDate,
  Cartesian2,
  Cartesian3,
  Tonemapper
} from 'cesium';

import { AppError } from '#models/app-errors.ts';
import type { ILoggerService } from '#models/interfaces/ILoggerService.js';
import type { IMapControls } from '#models/interfaces/IMapControls.ts';
import { CesiumMapLayers } from '#data/map-layers.ts';
import { mapCoordinates } from '#data/map-coordinates.ts';
import type { Coordinate } from 'ol/coordinate';
import { Transient } from '#utils/json-serialization.ts';

/**
 * Interface representing the serializable state of the Cesium camera.
 */
export interface ICameraState {
  /**
   * The destination of the camera represented as x, y, z coordinates.
   */
  destination: {
    x: number;
    y: number;
    z: number;
  };

  /**
   * The orientation of the camera represented by heading, pitch, and roll (in radians).
   */
  orientation: {
    heading: number;
    pitch: number;
    roll: number;
  };
}

const CONTEXT = "CesiumViewModel";

/**
 * CesiumViewModel implements map control functionality using Cesium.
 * It tracks the camera state (position, orientation, and zoom level) so that it can be
 * persisted across component mount/unmount cycles and app sessions.
 */
export class CesiumViewModel implements IMapControls {
  //#region [TRANSIENT PROPERTIES]

  /**
   * Logger service used for logging errors and informational messages.
   */
  @Transient
  private _logger: ILoggerService;

  /**
   * The Cesium Viewer instance.
   */
  @Transient
  private _viewer: Viewer;

  /**
   * Accumulated zoom delta used during animated zoom operations.
   */
  @Transient
  private _zoomAmount = 0;

  /**
   * Flag indicating if a zoom operation is in progress.
   */
  @Transient
  private _isZooming = false;

  /**
   * RequestAnimationFrame identifier for zoom animation.
   */
  @Transient
  private _zoomFrame: number | null = null;

  //#endregion


  //#region [PERSISTENT PROPERTIES]

  /**
   * Persisted camera state including destination (position) and orientation (angles).
   * This property is serialized and restored across sessions via the view model store.
   */
  public cameraState?: ICameraState;

  //#endregion


  //#region [GETTERS]

  /**
   * Returns the Cesium Viewer instance. Throws an error if the viewer is not yet initialized.
   *
   * @returns The Cesium Viewer instance.
   */
  get viewer(): Viewer {
    if (!this._viewer)
      throw new AppError("Cesium viewer is not initialized", CONTEXT);

    return this._viewer;
  }

  /**
   * Returns the Cesium Scene associated with the viewer.
   *
   * @returns The Cesium Scene.
   */
  get scene(): Scene {
    return this.viewer.scene;
  }

  /**
   * Returns the Cesium Camera associated with the viewer.
   *
   * @returns The Cesium Camera.
   */
  get camera(): Camera {
    return this.viewer.camera;
  }

  //#endregion


  //#region [INITIALIZATION AND CAMERA STATE RESTORATION]

  /**
   * Initializes the Cesium map viewer.
   *
   * If a persisted camera state exists, it is used to fly the camera to that state;
   * otherwise, the provided default coordinates and zoom are used.
   *
   * @param logger Logger service for logging events and errors.
   * @param mapElement HTML element in which the map is rendered.
   * @param defaultCoordinates Default geographic coordinates [longitude, latitude] for initial camera position.
   * @param defaultZoom Default zoom level (used as altitude in meters).
   */
  async initMap(
    logger: ILoggerService,
    mapElement: HTMLElement,
    defaultCoordinates: Coordinate,
    defaultZoom: number = 1000000
  ): Promise<void> {
    this._logger = logger;

    // Load base layers and terrain provider
    const norge = CesiumMapLayers.Norge();
    const terrainProvider = await CesiumMapLayers.TerrainProvider();

    // Determine the initial destination.
    // If a persisted camera state exists, use it; otherwise, use the provided defaults.
    let initialDestination: Cartesian3;
    let initialOrientation: { heading: number; pitch: number; roll: number } | undefined;

    if (this.cameraState) {
      initialDestination = new Cartesian3(
        this.cameraState.destination.x,
        this.cameraState.destination.y,
        this.cameraState.destination.z
      );
      initialOrientation = {
        heading: this.cameraState.orientation.heading,
        pitch: this.cameraState.orientation.pitch,
        roll: this.cameraState.orientation.roll
      };
    } else {
      initialDestination = Cartesian3.fromDegrees(
        defaultCoordinates[0],
        defaultCoordinates[1],
        defaultZoom
      );
      // Initialize the cameraState with default values
      this.cameraState = {
        destination: {
          x: initialDestination.x,
          y: initialDestination.y,
          z: initialDestination.z
        },
        orientation: {
          heading: 0,
          pitch: 0,
          roll: 0
        }
      };
    }

    // Initialize the Cesium viewer with configuration options.
    this._viewer = new Viewer(mapElement, {
      // Layers
      baseLayer: ImageryLayer.fromProviderAsync(new Promise(res => res(norge)), {}),
      terrainProvider: terrainProvider,

      // Rendering
      useBrowserRecommendedResolution: false,

      // Disable Cesium Ion
      baseLayerPicker: false,
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

    // Lighting configuration
    this._viewer.scene.globe.enableLighting = true;
    this._viewer.scene.globe.atmosphereLightIntensity = 15;
    this._viewer.scene.highDynamicRange = true;

    // Set the viewer clock time
    this._viewer.clock.currentTime = JulianDate.fromIso8601("2024-08-01T12:30:00.000Z");

    // Texture rendering configuration
    this._viewer.scene.globe.maximumScreenSpaceError = 1;
    this._viewer.scene.postProcessStages.fxaa.enabled = false;
    this._viewer.scene.postProcessStages.tonemapper = Tonemapper.PBR_NEUTRAL;

    // Configure imagery layer filters for all layers
    for (let i = 0; i < this._viewer.imageryLayers.length; i++) {
      this._viewer.imageryLayers.get(i).magnificationFilter = TextureMagnificationFilter.NEAREST;
      this._viewer.imageryLayers.get(i).minificationFilter = TextureMinificationFilter.NEAREST;
    }

    // Elevation settings
    this._viewer.scene.globe.depthTestAgainstTerrain = true;
    this._viewer.scene.verticalExaggeration = 1;

    // Fly to the initial camera state (persisted or default) without animation
    this.camera.flyTo({
      destination: initialDestination,
      orientation: initialOrientation,
      duration: 0
    });

    // Attach a listener to update the persisted camera state whenever the camera stops moving.
    this.camera.moveEnd.addEventListener(() => {
      this.updateCameraState();
    });

    this._logger.info(CONTEXT, 'Cesium viewer initialized successfully');
  }

  //#endregion


  //#region [CAMERA STATE MANAGEMENT]

  /**
   * Updates the persisted camera state with the current camera position and orientation.
   * This method is called automatically on camera move end.
   */
  public updateCameraState(): void {
    // Capture the current camera position and orientation.
    this.cameraState = {
      destination: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      },
      orientation: {
        heading: this.camera.heading,
        pitch: this.camera.pitch,
        roll: this.camera.roll
      }
    };

    // Log the updated camera state for debugging purposes.
    this._logger.debug(CONTEXT, 'Camera state updated', this.cameraState);
  }

  //#endregion


  //#region [MAP CONTROLS]

  /**
   * Centers the map on a predefined GPS location.
   * Currently uses a default position (e.g., Oslo) as a placeholder.
   */
  centerOnGPS(): void {
    // TODO: Implement geolocation centering with actual GPS coordinates if available.
    const defaultPosition = Cartesian3.fromDegrees(
      mapCoordinates.Oslo[0],
      mapCoordinates.Oslo[1],
      10000
    );

    this.camera.flyTo({
      destination: defaultPosition,
      duration: 5
    });
  }

  /**
   * Private handler to manage animated zooming.
   * This function calculates the new camera position based on the accumulated zoom delta,
   * interpolating between the current camera position and the terrain intersection.
   */
  private _handleZoom = (): void => {
    if (Math.abs(this._zoomAmount) < 0.01) {
      this._isZooming = false;
      this._zoomAmount = 0;
      if (this._zoomFrame !== null) {
        cancelAnimationFrame(this._zoomFrame);
        this._zoomFrame = null;
      }
      // Update persisted camera state when zoom operation ends.
      this.updateCameraState();
      return;
    }

    // Determine the center of the screen.
    const center = new Cartesian2(
      Math.round(this.scene.canvas.clientWidth / 2),
      Math.round(this.scene.canvas.clientHeight / 2)
    );

    // Get a ray from the camera through the center of the viewport.
    const ray = this.camera.getPickRay(center);

    if (!ray) return;

    // Compute the intersection of the ray with the terrain.
    let intersection = this.scene.globe.pick(ray, this.scene);

    if (!intersection) {
      // If no intersection is found, choose a point along the ray.
      const direction = Cartesian3.normalize(ray.direction, new Cartesian3());
      intersection = Cartesian3.add(
        this.camera.position,
        Cartesian3.multiplyByScalar(direction, 1000000, new Cartesian3()),
        new Cartesian3()
      );
    }

    // Calculate a zoom factor based on the accumulated zoom delta.
    const zoomFactor = Math.pow(0.95, this._zoomAmount > 0 ? 1 : -1);

    // Interpolate between the current position and the intersection to compute the new camera position.
    const newPosition = Cartesian3.lerp(
      this.camera.position,
      intersection,
      this._zoomAmount > 0 ? (1 - zoomFactor) : -(zoomFactor - 1),
      new Cartesian3()
    );

    // Update the camera position directly without animation.
    this.camera.position = newPosition;

    // Decay the accumulated zoom amount.
    this._zoomAmount *= 0.7;

    // Request the next animation frame.
    this._zoomFrame = requestAnimationFrame(this._handleZoom);
  };

  /**
   * Adjusts the zoom level of the map by accumulating the provided delta.
   * If no zoom animation is in progress, it initiates one.
   *
   * @param delta The zoom delta (positive to zoom in, negative to zoom out).
   */
  changeZoomLevel(delta: number): void {
    // Accumulate the zoom delta.
    this._zoomAmount += delta;

    // Start the zoom handling animation if not already running.
    if (!this._isZooming) {
      this._isZooming = true;
      this._handleZoom();
    }
  }

  //#endregion
}

//#endregion
