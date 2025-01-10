<template>
  <div class="popup-container">
    <CreateProjectPopup v-if="popupStore.activePopups.includes('create-project')"
      v-bind="popupStore.popupProps['create-project']" @created="onProjectCreated"
      @start-poi-selection="onStartPoiSelection" />
    <!-- Other popups will be added here automatically -->
  </div>
</template>

<script lang="ts" setup>
import { usePopupStore } from '@/stores/popup.store';
import CreateProjectPopup from '../panels/CreateProjectPanel.vue';

const popupStore = usePopupStore();

function onProjectCreated(project: any) {
  const props = popupStore.popupProps['create-project'];
  if (props?.onCreated) {
    props.onCreated(project);
  }
  popupStore.hidePopup('create-project');
}

function onStartPoiSelection(options: { onSelect: (lat: number, lng: number) => void }) {
  // This should be handled by the map component
  emit('start-poi-selection', options);
}

const emit = defineEmits<{
  (event: 'start-poi-selection', options: { onSelect: (lat: number, lng: number) => void }): void;
}>();
</script>

<style lang="scss">
.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;

  >* {
    pointer-events: auto;
  }
}
</style>