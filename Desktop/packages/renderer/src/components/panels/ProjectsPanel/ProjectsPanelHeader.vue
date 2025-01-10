<template>
  <v-btn icon="mdi-plus" size="small" variant="tonal" color="primary" @click="createNewProject" />
</template>

<script lang="ts" setup>
import { AppError } from '@/utils/errors/app-error';
import { usePanelStore } from '@/stores/panel.store';
import { Panels } from '@/components/panels/panels-index';

const CONTEXT = 'ProjectsPanelHeader';
const panelStore = usePanelStore();

function createNewProject() {
  try {
    panelStore.showPanel(Panels.CreateProject);
  } catch (error) {
    throw new AppError('Failed to show new project panel', CONTEXT, error as Error);
  }
}
</script> 