<template>
  <div 
    class="dock-area-panel-stack"
    @dragover.prevent
  >
    <!-- Panel header with tabs -->
    <div 
      v-if="panelStack.length > 0"
      class="panel-header"
    >
      <div class="tabs-container">
        <button
          v-for="panel in panelStack"
          :key="panel.id"
          class="tab"
          :class="{ 'active': panel === activePanel }"
          @click="activatePanel(panel)"
          @dragstart="startDragging($event, panel)"
          @dragend="stopDragging"
          draggable="true"
        >
          <span 
            v-if="panel.icon"
            class="material-symbols-outlined"
          >{{ panel.icon }}</span>
          <span class="tab-title">{{ panel.title }}</span>
          <button 
            v-if="panel.closeable"
            class="close-button"
            @click.stop="closePanel(panel)"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </button>
      </div>
    </div>

    <!-- Panel content -->
    <div class="panel-content">
      <DockPanel
        v-if="activePanel"
        :panel="activePanel"
      />
    </div>

    <!-- Drop overlay -->
    <DockDropOverlay
      :area-id="areaDef.id"
      :absolute-position="areaDef.absolutePosition"
      :root="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDockStore } from '#stores/dockStore'
import { DockAreaPanelStackDef, type Panel } from './models/DockClasses'
import DockDropOverlay from './DockDropOverlay.vue'
import DockPanel from './DockPanel.vue'

//#region Props & Store

const props = defineProps<{
  areaDef: DockAreaPanelStackDef
}>()

const store = useDockStore()

//#endregion


//#region Computed

const panelStack = computed(() => props.areaDef.panelStack)
const activePanel = computed(() => props.areaDef.activePanel)

//#endregion


//#region Panel Management

/**
 * Sets the specified panel as the active panel
 * @param panel Panel to activate
 */
function activatePanel(panel: Panel) {
  props.areaDef.activePanel = panel
}

/**
 * Closes the specified panel
 * @param panel Panel to close
 */
function closePanel(panel: Panel) {
  store.removePanel(panel)
}

//#endregion


//#region Drag & Drop

/**
 * Starts dragging a panel
 * @param event Drag event
 * @param panel Panel being dragged
 */
function startDragging(event: DragEvent, panel: Panel) {
  store.startDragging(event, panel)
}

/**
 * Stops dragging a panel
 */
function stopDragging() {
  store.stopDragging()
}

//#endregion

</script>

<style scoped>
.dock-area-panel-stack {
  @apply flex flex-col h-full w-full relative overflow-hidden;
}

.panel-header {
  @apply flex-shrink-0 bg-surface-900 border-b border-surface-700;
}

.tabs-container {
  @apply flex items-center h-9 overflow-x-auto;
}

.tab {
  @apply flex items-center gap-1 px-3 h-full min-w-[6rem] max-w-[12rem]
         text-sm text-surface-100 bg-surface-800
         border-r border-surface-700
         hover:bg-surface-700
         transition-colors duration-150;
}

.tab.active {
  @apply bg-surface-600 text-white;
}

.tab-title {
  @apply truncate;
}

.close-button {
  @apply ml-1 p-0.5 rounded-sm
         hover:bg-surface-500
         transition-colors duration-150;
}

.close-button .material-symbols-outlined {
  @apply text-base;
}

.panel-content {
  @apply flex-1 overflow-hidden;
}
</style>
