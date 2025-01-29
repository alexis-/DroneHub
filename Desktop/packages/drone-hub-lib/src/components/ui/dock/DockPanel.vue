<template>
  <div 
    v-show="isActive"
    class="dock-panel"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="panel-header">
      <div class="panel-title">
        <span v-if="panel.icon" class="material-symbols-outlined">{{ panel.icon }}</span>
        {{ panel.title }}
      </div>
      <button 
        v-if="panel.closeable"
        class="close-button"
        @click="$emit('close', panel.id)"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    
    <div class="panel-content">
      <component 
        :is="panel.component"
        v-bind="panel.props || {}"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Panel } from './models/DockTypes'
import { useDockStore } from '#stores/dockStore'

const props = defineProps<{
  panel: Panel
  isActive: boolean
}>()

const store = useDockStore()

defineEmits<{
  (e: 'close', id: string): void
}>()

function handleDragStart(event: DragEvent) {
  // Update store drag state
  store.startDragging(event, props.panel)
}

function handleDragEnd() {
  store.stopDragging()
}
</script>

<style scoped>
.dock-panel {
  @apply h-full flex flex-col bg-surface-800;
}

.panel-header {
  @apply flex items-center justify-between px-3 py-1 bg-surface-700 border-b border-surface-600;
}

.panel-title {
  @apply flex items-center gap-1 text-sm font-medium;
}

.close-button {
  @apply p-0.5 hover:bg-surface-600 rounded;
}

.close-button span {
  @apply text-base;
}

.panel-content {
  @apply flex-1 overflow-auto;
}
</style>
