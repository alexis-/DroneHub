<template>
  <div class="map-container">
    <div ref="_mapElement" class="map-element"></div>

    <MapControls :map-controls="_vm" />
  </div>
</template>

<script lang="ts" setup>
const CONTEXT = 'OpenLayersMap';

import { onMounted, onUnmounted, inject, ref } from 'vue';
// import { useToast } from "/composables/useToast";


// import 'ol/ol.css';
import LayerGroup, { type DHOptions } from 'ol/layer/Group';

import MapControls from '#components/map/MapControls.vue';

import { useViewModel } from '#composables/useViewModel.ts';
import { MapError } from '#models/app-errors.ts';
import type { ILoggerService } from '#models/interfaces/ILoggerService.js';
import { OpenLayersViewModel } from '#models/viewmodels/open-layers/OlVM.ts';
import { mapCoordinates } from '#data/map-coordinates.ts';
import { OlMapLayers } from '#data/map-layers.ts';
import { LoggerServiceKey } from '#models/injection-keys.ts';


// const toast = useToast();

const props = defineProps<{
  mapId: string;
}>();

const _logger = inject(LoggerServiceKey) as ILoggerService;
const _mapElement = ref<HTMLElement | null>(null);

const _vm = useViewModel<OpenLayersViewModel>(
  `ol-map-${props.mapId}`, 
  () => new OpenLayersViewModel()
);


// TODO: Load from config
const defaultCenter = mapCoordinates.Oslo; // Oslo coordinates
const defaultZoom = 8;

onMounted(async () => {
  try {
    const layerGroups = [
      new LayerGroup({
        title: 'base',
        layers: [
          OlMapLayers.Norway_3857_WMTS,
          OlMapLayers.abb,
        ]
      } as DHOptions)
    ]
    await _vm.initMap(_logger, _mapElement.value, layerGroups, defaultCenter, defaultZoom);
  } catch (error) {
    _logger.error(CONTEXT, 'Failed to mount map component', error);
    throw error;
  }
});

const emit = defineEmits(['update:map-style', 'map-idle']);
</script>

<style>
.map-container {
  width: 100%;
  height: 100%;
}

.map-element {
  position: absolute;
  width: 100%;
  height: 100%;
}

/* Hide Popover on mobile */
@media (max-width: 30em) {
}

/* Hide Dialog on desktop */
@media (min-width: 64em) {
}
</style>
