<template>
  <div class="h-screen w-screen flex flex-col">
    <!-- Toolbar with available panels -->
    <div class="h-12 bg-surface-900 flex-shrink-0 flex items-center px-4 gap-2">
      <button 
        v-for="panel in availablePanels" 
        :key="panel.title"
        class="px-3 py-1 bg-surface-700 hover:bg-surface-600 rounded flex items-center gap-1"
        draggable="true"
        @dragstart="handleDragStart($event, panel)"
      >
      <!-- @dragend="handleDragEnd" -->
        <span v-if="panel.icon" class="material-symbols-outlined text-sm">{{ panel.icon }}</span>
        {{ panel.title }}
      </button>

      <div class="flex-1"></div>

      <!-- Layout management -->
      <div class="flex items-center gap-2">
        <input 
          v-model="layoutName"
          class="px-2 py-1 bg-surface-800 rounded"
          placeholder="Layout name..."
        >
        <button 
          class="px-3 py-1 bg-surface-700 hover:bg-surface-600 rounded"
          @click="saveLayout"
        >
          Save Layout
        </button>
        <button 
          v-for="layout in layouts"
          :key="layout.id"
          class="px-3 py-1 bg-surface-700 hover:bg-surface-600 rounded"
          @click="loadLayout(layout.id)"
        >
          {{ layout.name }}
        </button>
      </div>
    </div>

    <!-- Dock system -->
    <div class="flex-1 min-h-0">
      <DockRoot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDockStore } from '#stores/dockStore'
import { createPanel, type Panel } from '../models/DockModels'
import DockRoot from '../DockRoot.vue'
import { PanelType } from '../models/DockTypes'

//#region Store Setup

const store = useDockStore()
const { layouts } = storeToRefs(store)

//#endregion


//#region Layout Management

const layoutName = ref('')

function saveLayout() {
  if (layoutName.value) {
    store.saveLayout(layoutName.value)
    layoutName.value = ''
  }
}

function loadLayout(layoutId: string) {
  store.loadLayout(layoutId)
}

//#endregion


//#region Panel Definitions

// Panel templates that will be used to create new instances
const panelTemplates = [
  // Content panels
  {
    type: PanelType.Content,
    title: 'Preview',
    icon: 'view_in_ar',
    component: () => import('./panels/Preview.vue'),
    closeable: true,
    props: {}
  },
  {
    type: PanelType.Content,
    title: 'Timeline',
    icon: 'timeline',
    component: () => import('./panels/Timeline.vue'),
    closeable: true,
    props: {}
  },

  // Toolbar panels
  {
    type: PanelType.Toolbar,
    title: 'File Explorer',
    icon: 'folder',
    component: () => import('./panels/FileExplorer.vue'),
    closeable: true,
    props: {}
  },
  {
    type: PanelType.Toolbar,
    title: 'Properties',
    icon: 'tune',
    component: () => import('./panels/Properties.vue'),
    closeable: true,
    props: {}
  }
]

// Create a computed property for the available panels to be displayed
const availablePanels = computed(() => panelTemplates)

//#endregion


//#region Drag & Drop

function handleDragStart(event: DragEvent, template: typeof panelTemplates[0]) {
  // Create a new panel instance based on the template
  const panel = createPanel({
    panelType: template.type,
    title: template.title,
    icon: template.icon,
    component: template.component,
    closeable: template.closeable,
    props: template.props
  });
  
  store.startDragging(event, panel)
}

function handleDragEnd() {
  store.stopDragging()
}

//#endregion

</script>

<style scoped>
/* No additional styles needed - using Tailwind classes */
</style>