<template>
  
  
  <div class="h-screen w-screen flex flex-col">
    <!-- 
      Top area: Panel Source (Content and Toolbar panels) plus layout management controls.
      Drag a panel from these lists into the dock layout.
    -->
    <div class="h-16 bg-surface-900 flex-shrink-0 flex items-center px-4 gap-4">
      <!-- Content Panels -->
      <div class="flex flex-col gap-1">
        <div class="text-xs text-surface-100">Content Panels</div>
        <div class="flex items-center gap-2">
          <button 
            v-for="panel in contentPanels" 
            :key="panel.title"
            class="px-3 py-1 bg-surface-700 hover:bg-surface-600 rounded flex items-center gap-1"
            draggable="true"
            @dragstart="handleDragStart($event, panel)"
            @dragend="handleDragEnd"
          >
            <span v-if="panel.icon" class="material-symbols-outlined text-sm">{{ panel.icon }}</span>
            {{ panel.title }}
          </button>
        </div>
      </div>

      <!-- Toolbar Panels -->
      <div class="flex flex-col gap-1">
        <div class="text-xs text-surface-100">Toolbar Panels</div>
        <div class="flex items-center gap-2">
          <button 
            v-for="panel in toolbarPanels" 
            :key="panel.title"
            class="px-3 py-1 bg-surface-700 hover:bg-surface-600 rounded flex items-center gap-1"
            draggable="true"
            @dragstart="handleDragStart($event, panel)"
            @dragend="handleDragEnd"
          >
            <span v-if="panel.icon" class="material-symbols-outlined text-sm">{{ panel.icon }}</span>
            {{ panel.title }}
          </button>
        </div>
      </div>

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

    <!-- 
      Main dock system.
      Note: DockRoot.vue renders the left vertical toolbar (using <DockVerticalToolbar />) 
      as well as the content/side areas.
    -->
    <div class="flex-1 min-h-0">
      <DockRoot />
    </div>
  </div>
  
  
</template>

<script setup lang="ts">
/**
 * DockExample.vue
 *
 * This updated demo component shows the new panel source (split into content and toolbar panels)
 * and the new vertical icon toolbar features.
 *
 * - Users can drag panels (from these lists) into the dock layout.
 * - When a toolbar panel is dropped onto the left side, it will be managed via the icon toolbar.
 * - Layout management buttons allow saving/loading layouts.
 *
 * This component integrates with the DockStore via Pinia.
 */

import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDockStore } from '#stores/dockStore';
import { createPanel } from '../models/DockModels';
import DockRoot from '../DockRoot.vue';
import { PanelType } from '../models/DockTypes';

//#region Store Setup

const store = useDockStore();
const { layouts } = storeToRefs(store);

const layoutName = ref('');

//#endregion


//#region Panel Definitions

/**
 * Panel templates that serve as the source for new panels.
 * Two types are provided:
 *  - Content panels (which will be added to the center area)
 *  - Toolbar panels (which when dropped into the left toolbar will appear as icons)
 */
const panelTemplates = [
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
];

/**
 * Compute two groups of panels based on their type.
 */
const contentPanels = computed(() => panelTemplates.filter(p => p.type === PanelType.Content));
const toolbarPanels = computed(() => panelTemplates.filter(p => p.type === PanelType.Toolbar));

//#endregion


//#region Drag & Drop Handlers

/**
 * Called when the user begins dragging a panel from the source list.
 * A new panel instance is created from the template and the drag is delegated to the dock store.
 *
 * @param event The originating DragEvent.
 * @param template The panel template from which to create a new panel.
 */
function handleDragStart(event: DragEvent, template: typeof panelTemplates[0]) {
  const panel = createPanel({
    panelType: template.type,
    title: template.title,
    icon: template.icon,
    component: template.component,
    closeable: template.closeable,
    props: template.props
  });
  
  store.startDragging(event, panel);
}

function handleDragEnd() {
  store.stopDragging()
}

//#endregion


//#region Layout Management

/**
 * Saves the current layout using the provided name.
 */
function saveLayout() {
  if (layoutName.value) {
    store.saveLayout(layoutName.value);
    layoutName.value = '';
  }
}

/**
 * Loads a previously saved layout.
 *
 * @param layoutId The ID of the layout to load.
 */
function loadLayout(layoutId: string) {
  store.loadLayout(layoutId);
}

//#endregion
</script>

<style scoped>
/* No additional styles beyond Tailwind CSS classes are required */
</style>
