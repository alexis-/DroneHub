<template>
  <div class="create-project-panel">
    <v-form ref="form" v-model="isValid" @submit.prevent="handleCreateProject">
      <div>

        <v-card-text class="px-4 pt-4 pb-2">
          <v-form ref="form" v-model="isValid" @submit.prevent="handleCreateProject">
            <v-text-field v-model="newProject.name" label="Project Name"
              :rules="[v => !!v || 'Project name is required']" placeholder="Enter project name" variant="outlined"
              density="comfortable" />

            <div class="poi-field mb-1">
              <v-text-field v-model="poiDisplay" label="Point of Interest"
                :rules="[v => !!v || 'Point of interest is required']" placeholder="Select on map" variant="outlined"
                density="comfortable" readonly>
                <template v-slot:prepend-inner>
                  <v-icon icon="mdi-map-marker" />
                </template>
                <template v-slot:append>
                  <v-btn icon="mdi-crosshairs" variant="tonal" size="small" class="poi-select-btn"
                    @click="startPoiSelection" />
                </template>
              </v-text-field>
            </div>

            <v-text-field v-model="newProject.version" label="Version" placeholder="1.0.0" variant="outlined"
              density="compact" disabled />

            <v-textarea v-model="newProject.description" label="Description"
              placeholder="Enter project description (optional)" variant="outlined" density="compact" rows="2" />
          </v-form>

          <div class="d-flex justify-end gap-2 mt-4">
          </div>
        </v-card-text>

        <v-card-actions class="justify-end gap-2 px-4 py-2">
          <v-btn variant="tonal" @click="closePanel">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" size="default" @click="handleCreateProject"
            :disabled="!isValid">
            Create
          </v-btn>
        </v-card-actions>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePanelStore, useToolStore, useAppStateStore, useMapFeaturesStore } from '@/stores';
import { useEventBus } from '@/composables/eventBus';
import { AppState } from '@/stores/app-state.store';
import { projectRepository } from '@/repositories/project.repository';
import { Logger } from '@/services/logger.service';
import { MapIds } from '@/config/map-config';
const isSelectingPoi = ref(false);
const form = ref<any>(null);
const isValid = ref(false);
const panelStore = usePanelStore();
const toolStore = useToolStore();
const appStateStore = useAppStateStore();
const mapFeaturesStore = useMapFeaturesStore();
const eventBus = useEventBus();
const newProject = ref({
  name: '',
  version: '1.0.0',
  description: '',
  poi_lat: 0,
  poi_lng: 0
});

const poiDisplay = computed(() => {
  if (!newProject.value.poi_lat && !newProject.value.poi_lng) return '';
  return `${newProject.value.poi_lat.toFixed(6)}°N, ${newProject.value.poi_lng.toFixed(6)}°E`;
});

onMounted(() => {
  appStateStore.setState(AppState.PROJECT_CREATION);
});

async function handleCreateProject() {
  const { valid } = await form.value.validate();
  if (!valid) {
    Logger.error('CreateProjectPanel', 'Form is invalid');
    return;
  }

  if (!newProject.value.name || !newProject.value.poi_lat || !newProject.value.poi_lng) return;

  const project = await projectRepository.create(newProject.value);
  eventBus.emit('project:created', project);

  // Reset form
  newProject.value = {
    name: '',
    version: '1.0.0',
    description: '',
    poi_lat: 0,
    poi_lng: 0
  };
}

function closePanel() {
  panelStore.hidePanel();
}

function startPoiSelection() {
  isSelectingPoi.value = true;

  Logger.info('CreateProjectPopup', 'Starting POI selection');

  toolStore.activateTool('poi-selection', {
    onSelect: (lat: number, lng: number) => {
      Logger.debug('CreateProjectPopup', 'POI selected', { lat, lng });

      newProject.value.poi_lat = lat;
      newProject.value.poi_lng = lng;
      isSelectingPoi.value = false;
    }
  });
}

// Add cleanup on component unmount
onUnmounted(() => {
  Logger.debug('CreateProjectPopup', 'Component unmounted');

  mapFeaturesStore.clearTemporaryMarker(MapIds.Main);
});
</script>

<style lang="scss">

.poi-selection-hint {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-width: 300px;
}
</style>
