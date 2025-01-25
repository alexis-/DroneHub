<template>
  <div class="map-controls map-controls--bottom-right">
    <Button
      size="lg"
      iconSize="3xl"
      class="mb-6"
      icon="location_searching"
      @click="centerOnGPS" />

    <div class="map-controls__zoom">
      <Button
        size="lg"
        iconSize="2xl"
        class="mb-3"
        icon="add"
        @click="changeZoomLevel(1)" />

      <Button
        size="lg"
        iconSize="2xl"
        icon="remove"
        @click="changeZoomLevel(-1)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '#components/ui/Button.vue';
import type { IMapControls } from '#models/interfaces/IMapControls';

const props = defineProps<{
  mapControls: IMapControls;
}>();

const centerOnGPS = () => props.mapControls.centerOnGPS();
const changeZoomLevel = (delta: number) => props.mapControls.changeZoomLevel(delta);
</script>

<style scoped>
.map-controls {
  position: absolute;
  z-index: 1;
  padding: 1rem;
}

.map-controls--bottom-left {
  bottom: 0;
  left: 0;
}

.map-controls--bottom-right {
  bottom: 0;
  right: 0;
}

.map-controls__zoom {
  display: flex;
  flex-direction: column;
}
</style>
