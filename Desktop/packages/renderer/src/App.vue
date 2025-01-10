<template>
  <v-app>
    <global-snackbar ref="globalSnackbarRef" />

    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import GlobalSnackbar from '@/components/global-snackbar.vue';
import { Ref, ref, provide, onMounted} from 'vue';
import { AppError } from '@/utils/errors/app-error';
import type { IProject } from '@shared/database/entities/IProject';
import { projectRepository } from '@/repositories/project.repository';

const CONTEXT = 'App';

const globalSnackbarRef = ref();
const projects: Ref<IProject[]> = ref([]);

onMounted(async () => {
  try {
    if (!globalSnackbarRef.value) {
      throw new AppError('GlobalSnackbar component is not available', CONTEXT);
    }

    provide('showSnackbar', globalSnackbarRef.value.showSnackbar);
    provide('hideSnackbar', globalSnackbarRef.value.hideSnackbar);

    projects.value = await projectRepository.getAll();
  } catch (error) {
    throw new AppError('Failed to initialize app', CONTEXT, error as Error);
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
