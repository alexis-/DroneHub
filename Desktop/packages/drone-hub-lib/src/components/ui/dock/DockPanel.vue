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
        :is="panel.component"
        v-bind="panel.props"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDockStore } from '#stores/dockStore'
import { type Panel } from './models/DockModels'

/**
 * Props: a single Panel to be rendered in this DockPanel
 */
const props = defineProps<{
  panel: Panel
}>()

const store = useDockStore()

/**
 * Closes the panel from the store. Removes it from the area’s panelStack.
 */
function closePanel() {
  store.removePanel(props.panel);
}
</script>

<style scoped>
/*
  The outer .dock-panel is a vertical flex container.
  We rely on parent classes (e.g. DockAreaPanelStack) to give us a bounding box
  with @apply flex-1 min-h-0. 
*/

.dock-panel {
  /* 
    flex-col so header is at top, main content grows below 
    flex-1 so it fills the parent's area
    min-h-0 is crucial in flex layouts so the content can properly scroll
  */
  @apply flex flex-col min-h-0 h-full w-full;
}

/** Panel header with a close button. */
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
  @apply p-0.5 rounded-sm hover:bg-surface-700 transition-colors duration-150;
}

.close-button .material-symbols-outlined {
  @apply text-base text-surface-100;
}


/* 
  Main panel content region: this is a flex item that will occupy the 
  leftover vertical space below the header.
*/
.panel-content {
  @apply flex-1 min-h-0;
}

</style>
