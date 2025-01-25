<template>
  <div class="map-page">
    <!-- <PanelContainer /> -->

    <!-- <OpenLayersMap class="map-view" :mapId="MapIds.Main" /> -->
    <CesiumMap class="map-view" :mapId="MapIds.Main" />

    <!-- <component 
      v-if="toolStore.activeToolComponent"
      :is="toolStore.activeToolComponent"
      v-bind="toolStore.activeToolProps"
      class="tool-component"
    /> -->
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
// import OpenLayersMap from '@dhlib/components/open-layers/OlMap.vue';
import CesiumMap from '@dhlib/components/cesium/CesiumMap.vue';
// import PanelContainer from '@/components/panels/PanelContainer.vue';
// import { Panels } from '@/components/panels/panels-index';
// import { useToolStore } from '@/stores/tool.store';
// import { usePanelStore } from '@/stores/panel.store';
import { Logger } from '@/services/logger.service';
import { MapIds } from '@/config/map-config';
import { projectRepository } from '@/repositories/project.repository';

// DON'T DELETE
// import FlySafe from './map/map-flysafe';
// const flySafe = new FlySafe();
const CONTEXT = 'MapPage';

// const toolStore = useToolStore();
// const panelStore = usePanelStore();

// Initialize default tool
onMounted(async () => {
  try {
    Logger.debug(CONTEXT, 'Initializing map page');
    // toolStore.activateTool('rectangle-selection');
    // panelStore.showPanel(Panels.Projects);
    
    const projects = await projectRepository.getAll();
    Logger.info(CONTEXT, `Loaded ${projects.length} projects and set markers`);
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to initialize map page', error);
  }
});
</script>

<style>
.map-page {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map-view {
  width: 100%;
  height: 100%;
}

.tool-component {
  position: relative;
  z-index: 100;
}
</style>
