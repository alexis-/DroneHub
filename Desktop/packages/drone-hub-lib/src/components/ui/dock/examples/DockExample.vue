<template>
  <div class="h-screen w-screen flex flex-col">
    <div class="h-12 bg-surface-900 flex items-center px-4 gap-2">
      <button 
        v-for="panel in availablePanels" 
        :key="panel.id"
        class="px-3 py-1 bg-surface-700 hover:bg-surface-600 rounded flex items-center gap-1"
        draggable="true"
        @dragstart="handleDragStart($event, panel)"
        @dragend="handleDragEnd"
      >
      <!-- @drag="handleDrag($event, panel)" -->
        <span v-if="panel.icon" class="material-symbols-outlined text-sm">{{ panel.icon }}</span>
        {{ panel.title }}
      </button>

      <div class="flex-1"></div>

      <div class="flex items-center gap-2">
        <select 
          v-if="layouts.length > 0"
          v-model="selectedLayout"
          class="px-2 py-1 bg-surface-700 rounded"
        >
          <option value="">Select Layout</option>
          <option 
            v-for="layout in layouts" 
            :key="layout.id" 
            :value="layout.id"
          >
            {{ layout.name }}
          </option>
        </select>

        <button 
          v-if="selectedLayout"
          class="px-3 py-1 bg-primary-700 hover:bg-primary-600 rounded"
          @click="loadLayout"
        >
          Load
        </button>

        <button 
          class="px-3 py-1 bg-primary-700 hover:bg-primary-600 rounded"
          @click="saveCurrentLayout"
        >
          Save Layout
        </button>
      </div>
    </div>

    <DockContainer class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDockStore } from '#stores/dockStore'
import DockContainer from '../DockRoot.vue'
import FileExplorer from './panels/FileExplorer.vue'
import Properties from './panels/Properties.vue'
import Timeline from './panels/Timeline.vue'
import Preview from './panels/Preview.vue'
import type { Panel } from '../models/DockTypes'

const store = useDockStore()
const { layouts, dragState } = storeToRefs(store)
const selectedLayout = ref<string>('')

// Define available panels that can be dragged into the dock
const availablePanels = ref<Panel[]>([
  {
    id: 'file-explorer',
    type: 'toolbar',
    title: 'File Explorer',
    icon: 'folder',
    component: FileExplorer,
    closeable: true
  },
  {
    id: 'properties',
    type: 'toolbar',
    title: 'Properties',
    icon: 'tune',
    component: Properties,
    closeable: true
  },
  {
    id: 'timeline',
    type: 'toolbar',
    title: 'Timeline',
    icon: 'timeline',
    component: Timeline,
    closeable: true
  },
  {
    id: 'preview',
    type: 'content',
    title: 'Preview',
    icon: 'visibility',
    component: Preview,
    closeable: true
  }
])

function handleDragStart(event: DragEvent, panel: Panel) {
  // Update store state with a fresh panel object
  store.startDragging(event, panel);
}

function handleDragEnd() {
  store.stopDragging()
}

function saveCurrentLayout() {
  const name = prompt('Enter layout name:')
  if (name) {
    store.saveLayout(name)
  }
}

function loadLayout() {
  if (selectedLayout.value) {
    store.loadLayout(selectedLayout.value)
    selectedLayout.value = ''
  }
}
</script>

<style scoped>
.material-symbols-outlined {
  font-size: 1.2em;
}
</style>
