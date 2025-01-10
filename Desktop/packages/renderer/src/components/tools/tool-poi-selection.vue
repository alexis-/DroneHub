<template>
  <div class="poi-selection-hint">
    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="ma-4"
    >
      Click on the map to select a point of interest
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useMapStore, useMapFeaturesStore } from '@/stores';
import { transform } from 'ol/proj';
import { Logger } from '@/services/logger.service';
import type { MapClickEvent } from '@/types/map';

const props = defineProps<{
  onSelect: (lat: number, lng: number) => void;
}>();

const mapStore = useMapStore();
const mapFeaturesStore = useMapFeaturesStore();
let clickListener: any = null;

onMounted(() => {
  Logger.info('POISelectionTool', 'Tool mounted');

  if (!mapStore.map) {
    Logger.error('POISelectionTool', 'Map not initialized');
    return;
  }

  mapFeaturesStore.initializeLayer();
  
  clickListener = mapStore.map.on('click', (event: MapClickEvent) => {
    Logger.debug('POISelectionTool', 'Map clicked', event.coordinate);

    const coordinates = event.coordinate;
    // Convert from EPSG:3857 to EPSG:4326 (lat/lng)
    const [lng, lat] = transform(coordinates, 'EPSG:3857', 'EPSG:4326');

    Logger.debug('POISelectionTool', 'Converted coordinates', { lat, lng });

    // Add marker to map
    mapFeaturesStore.setTemporaryMarker(lng, lat, 'poi-selection');

    props.onSelect(lat, lng);
  });
});

onUnmounted(() => {
  Logger.info('POISelectionTool', 'Tool unmounted');
  
  if (clickListener) {
    clickListener.unsubscribe();
  }
});
</script>

<style lang="scss">
.poi-selection-hint {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: none;
}
</style>