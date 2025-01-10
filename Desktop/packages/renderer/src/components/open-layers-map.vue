<template>
  <div class="map-container">
    <div ref="mapElement" class="map-container"></div>

    <div class="map-controls map-controls--bottom-right">
      <v-btn
        size="default"
        @click="centerMapWithGeolocation"
        class="mb-4 crosshair"
        icon="mdi-crosshairs-gps"
        variant="tonal"
      />

      <div class="map-controls__zoom">
        <v-btn
          size="default"
          @click="changeMapZoomLevel(1)"
          class="mb-1"
          icon="mdi-plus"
          variant="tonal"
        />
        <v-btn
          size="default"
          @click="changeMapZoomLevel(-1)"
          icon="mdi-minus"
          variant="tonal"
        />
      </div>
    </div>

    <div class="map-controls map-controls--bottom-left">
      <v-menu
        location="top"
        offset="10"
        open-on-hover
      >
        <template v-slot:activator="{ props }">
          <v-btn
            class="map-style-btn"
            v-bind="props"
            @click="changeMapStyle(null)"
            variant="flat"
          >
            <img :src="mapStyle.img" class="map-style-img" />
          </v-btn>
        </template>

        <v-card class="map-style-menu">
          <v-list density="compact">
            <v-list-subheader>Map Style</v-list-subheader>
            <v-list-item
              v-for="(ms, index) in mapStyles"
              :key="index"
              :value="ms.id"
              :active="mapStyle.id === ms.id"
              @click="changeMapStyle(ms)"
            >
              <template v-slot:prepend>
                <img class="map-style-list-img" :src="ms.img" />
              </template>
              <v-list-item-title>{{ ms.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, inject, ref} from 'vue';

import 'ol/ol.css';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {get as getProjection} from 'ol/proj.js';
import {getTopLeft, getWidth} from 'ol/extent.js';

import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';

const CONTEXT = 'OpenLayersMap';

const projection = getProjection('EPSG:3857');
const projectionExtent = projection!.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);
const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

import getGeolocationFromIp from '../utils/geolocation-from-ip';
import getLocationFromLocale from '../utils/geolocation-from-locale';
import mapStyles from '@/models/map-styles';

import { useMapStore } from '@/stores/map.store';
import { useMapFeaturesStore } from '@/stores/map-features.store';

const mapStore = useMapStore();
const mapFeaturesStore = useMapFeaturesStore();
const mapElement = ref<HTMLElement | null>(null);

const showSnackbar = inject<(msg: string) => void>('showSnackbar', s => {});

// TODO: Load from config
const defaultCenter = fromLonLat([10.7522, 59.9139]); // Oslo coordinates
const defaultZoom = 8;

let mapStyle = ref<MapStyle>(mapStyles[0]);

const layersArray = [
  {
    id: 'openStreetMap',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
  },
  {
    id: 'satellite',
    layers: [
      new TileLayer({
        source: new WMTS({
          url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?',
          layer: 'Nibcache_web_mercator_v2',
          format: 'image/jpgpng',
          matrixSet: 'GoogleMapsCompatible',
          projection: projection!,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          style: 'default',
          attributions: 'Kartverket, Geovekst, kommuner og OSM contributors.',
        }),
      }),
    ]
  }
];

const props = defineProps<{
  mapId: string;
}>();

function changeMapStyle(ms: MapStyle | null) {
  try {
    if (ms === null) {
      // Find current layer index
      const currentIndex = mapStyles.findIndex(style => style.id === mapStyle.value.id);
      // Get next style, wrapping around to beginning if needed
      const nextIndex = (currentIndex + 1) % mapStyles.length;
      ms = mapStyles[nextIndex];
    }

    mapStyle.value = ms;

    // Find the corresponding layer
    const layerConfig = layersArray.find(l => l.id === ms?.id);

    if (!layerConfig) {
      throw new AppError(`No layer configuration found for style: ${ms.id}`, CONTEXT);
    }

    const map = mapStore.getMap(props.mapId);

    if (!map) {
      throw new AppError(`Map with id ${props.mapId} not found`, CONTEXT);
    }

    map.getLayers().forEach(layer => map.removeLayer(layer));
    layerConfig.layers?.forEach(layer => map.addLayer(layer));
    
    Logger.info(CONTEXT, `Map style changed to: ${ms.title}`);
  } catch (error) {
    throw new AppError(`Failed to change map style to: ${ms?.id}`, CONTEXT, error as Error);
  }
}

function changeMapZoomLevel(delta: number) {
  try {
    const map = mapStore.getMap(props.mapId);

    if (!map) {
      throw new AppError(`Map with id ${props.mapId} not found`, CONTEXT);
    }

    const view = map.getView();
    const newZoom = (view.getZoom() ?? defaultZoom) + delta;

    view.setZoom(newZoom);

    Logger.debug(CONTEXT, `Map zoom changed to: ${newZoom}`);
  } catch (error) {
    throw new AppError('Failed to change map zoom level', CONTEXT, error as Error);
  }
}

function centerMapWithGeolocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const map = mapStore.getMap(props.mapId);

        if (!map) {
          throw new AppError(`Map with id ${props.mapId} not found`, CONTEXT);
        }
    
        const coords = fromLonLat([position.coords.longitude, position.coords.latitude]);

        map.getView().setCenter(coords);

        Logger.info(CONTEXT, 'Map centered using device geolocation');
      },
      error => {
        Logger.warn(CONTEXT, 'Failed to get device geolocation', error);
        showSnackbar(`Error getting geolocation: ${error.message}`);
        centerMapWithIp();
      },
    );
  } else {
    Logger.warn(CONTEXT, 'Geolocation not supported by browser');
    showSnackbar('Geolocation is not supported by this browser.');
    centerMapWithIp();
  }
}

function centerMapWithIp() {
  getGeolocationFromIp(
    (lat, lng) => {
      const map = mapStore.getMap(props.mapId);

      if (!map) {
        throw new AppError(`Map with id ${props.mapId} not found`, CONTEXT);
      }
    
      map.getView().setCenter(fromLonLat([lng, lat]));
      Logger.info(CONTEXT, 'Geolocation set from IP');
    },
    () => {
      Logger.warn(CONTEXT, 'Error getting geolocation from IP');
      centerMapWithLocale();
    },
  );
}

function centerMapWithLocale() {
  getLocationFromLocale((lat, lng) => {
    const map = mapStore.getMap(props.mapId);

    if (!map) {
      throw new AppError(`Map with id ${props.mapId} not found`, CONTEXT);
    }
    
    map.getView().setCenter(fromLonLat([lng, lat]));

    Logger.info(CONTEXT, 'Geolocation set from locale');
  });
}

async function initMap() {
  if (!mapElement.value) {
    throw new AppError('Map element not found', CONTEXT);
  }

  try {
    const map = mapStore.createMap(props.mapId, {
      target: mapElement.value,
      layers: layersArray[0].layers,
      view: new View({
        center: defaultCenter,
        zoom: defaultZoom,
      }),
      controls: [],
    });

    await mapFeaturesStore.initializeLayer(props.mapId);
    
    emit('update:map-style', mapStyle);
    centerMapWithGeolocation();
    
    Logger.info(CONTEXT, 'Map initialized successfully');
  } catch (error) {
    throw new AppError('Failed to initialize map', CONTEXT, error as Error);
  }
}

onMounted(async () => {
  try {
    await initMap();
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to mount map component', error);
    throw error;
  }
});

onUnmounted(() => {
  mapStore.removeMap(props.mapId);
});

// defineExpose({changeMapStyle});
const emit = defineEmits(['update:map-style', 'map-idle']);
</script>

<style lang="scss">
.map-container {
  width: 100%;
  height: 100%;
  background: var(--color-surface);
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  z-index: 10;

  &--bottom-left {
    bottom: var(--spacing-lg);
    left: var(--spacing-md);
    padding: 0;
  }

  &--bottom-right {
    bottom: var(--spacing-xxl);
    right: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
  }

  &__zoom {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .v-btn {
    background-color: var(--color-surface);
    border: 1px solid rgba(var(--color-opposite-rgb), 0.5);
    color: rgba(var(--color-opposite-rgb), 0.7);
    
    &.crosshair {
      font-size: 14px;  // Default is usually 24px
    }

    &:hover {
      transform: scale(1.08);
    }
  }

  .map-style-btn {
    @include floating-panel;
    display: block;
    padding: 0;

    height: 66px;
    width: 66px;

    overflow: hidden;
    transition: transform var(--transition-fast);
    
    box-shadow: var(--shadow-2);

    &:hover {
      transform: scale(1.05);
    }
  }
}

.map-style-img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.map-style-menu {
  background: rgba(var(--color-surface-rgb), 0.8) !important;
  max-height: 400px;
  overflow-y: auto;
    
  .v-list-item {
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-xs);
    transition: all var(--transition-fast);
    
    &:hover {
      background-color: var(--color-surface-variant);
      transform: translateX(2px);
    }
    
    &--active {
      background-color: var(--color-primary) !important;
      color: white;
      
      .map-style-list-img {
        border-color: white;
      }
    }
  }
}

.map-style-list-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  margin-right: var(--spacing-sm);
  object-fit: cover;
}
</style>
