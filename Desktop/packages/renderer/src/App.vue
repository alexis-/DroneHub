<template>
  <div>
    <router-view />
    
    <Toast position="bottom-center" />
  </div>
</template>

<script lang="ts" setup>
import { type Ref, ref, provide, onMounted} from 'vue';

import { AppError } from '@mjosdrone/dhlib/models/app-errors';
import type { IProject } from '@shared/database/entities/IProject';
import { projectRepository } from '@/repositories/project.repository';

const CONTEXT = 'App';

const projects: Ref<IProject[]> = ref([]);

onMounted(async () => {
  try {
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
