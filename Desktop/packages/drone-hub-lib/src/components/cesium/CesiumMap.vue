<template>
  <div class="map-container">
    <div ref="_mapElement" class="map-element"></div>

    <MapControls :map-controls="_vm" />
    <Button 
      size="lg"
      iconSize="3xl"
      @click="openAndDisplayWpmlFile()">Show File Picker</Button>
  </div>
</template>

<script lang="ts" setup>
const CONTEXT = 'CesiumMap';

import { onMounted, onUnmounted, inject, ref } from 'vue';
import Button from '#components/ui/Button.vue';
import MapControls from '#components/map/MapControls.vue';

import { useViewModel } from '#composables/useViewModel.ts';
import type { ILoggerService } from '#models/interfaces/ILoggerService.js';
import { CesiumViewModel } from '#models/viewmodels/cesium/CesiumVM.ts';
import { mapCoordinatesCesium } from '#data/map-coordinates.ts';
import { FilePickerServiceKey, LoggerServiceKey } from '#models/injection-keys.ts';
import type { IFilesystemService } from '#models/interfaces/IFilesystemService.ts';
import { Cartesian2, Cartesian3, Color, HeightReference, HorizontalOrigin, VerticalOrigin } from 'cesium';

const props = defineProps<{
  mapId: string;
}>();

const _logger = inject(LoggerServiceKey) as ILoggerService;
const _filesystem = inject(FilePickerServiceKey) as IFilesystemService;
const _mapElement = ref<HTMLElement | null>(null);

const _vm = useViewModel<CesiumViewModel>(
  `cesium-map-${props.mapId}`, 
  () => new CesiumViewModel()
);

import { parseWpml, serializeWpml, WpmlRoot } from '#models/wpml/index.ts';
// TODO: Load from config - Convert Oslo coordinates to Cartesian3
const defaultPosition = mapCoordinatesCesium.Oslo;
const defaultZoom = 10000; // meters

const openAndDisplayWpmlFile = async () => {
  const res = await _filesystem.showFilePicker({});
  const xmlString = await _filesystem.readFile(res.filePaths[0]);

  // Parse XML
  const wpml = parseWpml(xmlString);
  const coordinates = wpml.document.folder.placemarks.map(placemark => placemark.coordinate);

  // Clear any existing entities
  _vm.viewer.entities.removeAll();

  // Create entities for each coordinate
  coordinates.forEach((coord, index) => {
    if (!coord) return;
    
    const position = Cartesian3.fromDegrees(
      coord.longitude,
      coord.latitude,
      coord.altitude
    );

    // Add a point entity
    _vm.viewer.entities.add({
      position: position,
      point: {
        pixelSize: 10,
        color: Color.RED,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        heightReference: HeightReference.RELATIVE_TO_GROUND
      },
      label: {
        text: `${index + 1}`,
        font: '14px sans-serif',
        horizontalOrigin: HorizontalOrigin.LEFT,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(10, 0),
        heightReference: HeightReference.RELATIVE_TO_GROUND
      }
    });
  });

  // If there are coordinates, zoom to them
  if (coordinates.length > 0) {
    _vm.viewer.zoomTo(_vm.viewer.entities);
  }
}

onMounted(async () => {
  try {
    await _vm.initMap(_logger, _mapElement.value, defaultPosition, defaultZoom);
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

.cesium-widget-credits{
    display:none !important;
}

/* Hide Popover on mobile */
@media (max-width: 30em) {
}

/* Hide Dialog on desktop */
@media (min-width: 64em) {
}
</style>
