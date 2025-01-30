<template>
  <div class="dock-panel">
    <!-- Panel header -->
    <div class="panel-header">
      <div class="header-content">
        <span 
          v-if="panel.icon"
          class="material-symbols-outlined"
        >{{ panel.icon }}</span>
        <span class="panel-title">{{ panel.title }}</span>
      </div>
      <div class="header-actions">
        <button 
          v-if="panel.closeable"
          class="close-button"
          @click="closePanel"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>

    <!-- Panel content -->
    <div class="panel-content">
      <component
        :is="panelComponent"
        v-bind="panel.props"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Panel } from './models/DockClasses'
import { useDockStore } from '#stores/dockStore'
import { computed, defineAsyncComponent } from 'vue';

const props = defineProps<{
  panel: Panel
}>()

const store = useDockStore()

const panelComponent = computed(() => defineAsyncComponent(props.panel.component))

function closePanel() {
  store.removePanel(props.panel)
}
</script>

<style scoped>
.dock-panel {
  @apply flex flex-col h-full w-full overflow-hidden;
}

.panel-header {
  @apply flex items-center justify-between h-9 px-3
         bg-surface-800 border-b border-surface-700;
}

.header-content {
  @apply flex items-center gap-2;
}

.panel-title {
  @apply text-sm text-surface-100 truncate;
}

.header-actions {
  @apply flex items-center;
}

.close-button {
  @apply p-0.5 rounded-sm
         hover:bg-surface-700
         transition-colors duration-150;
}

.close-button .material-symbols-outlined {
  @apply text-base text-surface-100;
}

.panel-content {
  @apply flex-1 overflow-auto;
}
</style>
