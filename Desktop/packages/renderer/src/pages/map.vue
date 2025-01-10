<template>
  <div class="map-page">
    <open-layers-map class="map-view" :map-id="MapIds.Main" />
    <PanelContainer />

    <component 
      v-if="toolStore.activeToolComponent"
      :is="toolStore.activeToolComponent"
      v-bind="toolStore.activeToolProps"
      class="tool-component"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import OpenLayersMap from '@/components/open-layers-map.vue';
import PanelContainer from '@/components/panels/PanelContainer.vue';
import { Panels } from '@/components/panels/panels-index';
import { useToolStore } from '@/stores/tool.store';
import { usePanelStore } from '@/stores/panel.store';
import { useMapFeaturesStore } from '@/stores/map-features.store';
import { Logger } from '@/services/logger.service';
import { MapIds } from '@/config/map-config';
import { projectRepository } from '@/repositories/project.repository';

// DON'T DELETE
// import FlySafe from './map/map-flysafe';
// const flySafe = new FlySafe();
const CONTEXT = 'MapPage';

const toolStore = useToolStore();
const panelStore = usePanelStore();
const mapFeaturesStore = useMapFeaturesStore();

// Initialize default tool
onMounted(async () => {
  try {
    Logger.debug(CONTEXT, 'Initializing map page');
    toolStore.activateTool('rectangle-selection');
    panelStore.showPanel(Panels.Projects);
    
    const projects = await projectRepository.getAll();
    await mapFeaturesStore.setProjectMarkers(MapIds.Main, projects);
    Logger.info(CONTEXT, `Loaded ${projects.length} projects and set markers`);
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to initialize map page', error);
  }
});
</script>

<style lang="scss">
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
