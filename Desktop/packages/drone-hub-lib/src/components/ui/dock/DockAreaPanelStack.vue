<template>

  <!-- 
    DockAreaPanelStack.vue
    This component renders a panel stack with a header (tab bar) and panel content.
    The header is conditionally positioned:
      - For content panels (center absolute area): header is at the top.
      - For toolbar panels (left, right, top, bottom absolute positions): header is at the bottom.
  -->
  <div 
    class="dock-area-panel-stack"
    @dragover.prevent
  >
    <!-- Conditional layout: 
         If isContentArea is true (center), header at top;
         else (toolbar panel) header at bottom -->
    <template v-if="isContentArea">
      <!-- Header (tabs) rendered at top -->
      <div 
        v-if="panelStack && panelStack.length > 0"
        class="panel-stack-header"
      >
        <div 
          class="tabs-container"
          @wheel.prevent="handleTabsWheel"
          ref="tabsContainerRef"
        >
          <button
            v-for="panel in panelStack"
            :key="panel.id"
            class="tab"
            :class="{ 'active': panel === activePanel }"
            @click="activatePanel(panel)"
            @mouseup="handleMouseUp($event, panel)"
            @dragstart="startDragging($event, panel)"
            @dragend="stopDragging"
            draggable="true"
          >
            <span 
              v-if="panel.icon"
              class="material-symbols-outlined"
            >
              {{ panel.icon }}
            </span>

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

      <!-- Panel content region -->
      <div class="panel-stack-content">
        <DockPanel
          v-if="activePanel"
          :panel="activePanel"
        />
      </div>
    </template>

    <template v-else>
      <!-- For toolbar areas, render panel content first -->
      <div class="panel-stack-content">
        <DockPanel
          v-if="activePanel"
          :panel="activePanel"
        />
      </div>

      <!-- Then render header (tabs) at the bottom -->
      <div 
        v-if="panelStack && panelStack.length > 0"
        class="panel-stack-header"
      >
        <div 
          class="tabs-container"
          @wheel.prevent="handleTabsWheel"
          ref="tabsContainerRef"
        >
          <button
            v-for="panel in panelStack"
            :key="panel.id"
            class="tab"
            :class="{ 'active': panel === activePanel }"
            @click="activatePanel(panel)"
            @mouseup="handleMouseUp($event, panel)"
            @dragstart="startDragging($event, panel)"
            @dragend="stopDragging"
            draggable="true"
          >
            <span 
              v-if="panel.icon"
              class="material-symbols-outlined"
            >
              {{ panel.icon }}
            </span>

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
    </template>

    <!-- Drop overlay for this stack area -->
    <DockDropOverlay
      :area-id="areaDef.id"
      :absolute-position="areaDef.absolutePosition"
      :root="false"
      class="absolute inset-0"
    />
  </div>

</template>

<script setup lang="ts">

  //#region Imports
  import { computed, ref } from 'vue';
  import { useDockStore } from '#stores/dockStore';
  import type { DockAreaPanelStack, Panel } from './models/DockModels';
  import DockDropOverlay from './DockDropOverlay.vue';
  import DockPanel from './DockPanel.vue';
  // Import the DockPosition enum to determine area type
  import { DockPosition } from './models/DockTypes';
  //#endregion


  //#region Props
  /**
   * Props for this component:
   * - areaDef: A DockAreaPanelStack from the store, describing a stack of panels.
   */
  const props = defineProps<{
    areaDef: DockAreaPanelStack
  }>();
  //#endregion


  //#region Store
  /**
   * Access to the Dock Store for panel operations.
   */
  const store = useDockStore();
  //#endregion


  //#region Computed Properties
  /**
   * Computed reactive property to track the panel stack from the area definition.
   */
  const panelStack = computed(() => props.areaDef.panelStack);
  /**
   * Computed reactive property for the currently active panel.
   */
  const activePanel = computed(() => props.areaDef.activePanel);

  /**
   * Determine if this area is the content area.
   * Content areas always have an absolute position of 'center'.
   * Toolbar panels (for left/right/top/bottom) will have a different absolute position.
   */
  const isContentArea = computed(() => props.areaDef.absolutePosition === DockPosition.Center);
  //#endregion


  //#region Template Refs
  /**
   * Reference to the tabs container element for scrolling.
   */
  const tabsContainerRef = ref<HTMLElement | null>(null);
  //#endregion


  //#region Panel Actions
  /**
   * Handles mouse button up events on panel tabs.
   * Middle mouse button (button 1) closes the panel.
   * @param event The mouse event.
   * @param panel The panel that was clicked.
   */
  function handleMouseUp(event: MouseEvent, panel: Panel) {
    // Check if middle mouse button (button 1) was clicked.
    if (event.button === 1) {
      // Always prevent default for middle mouse button to avoid scroll mode.
      event.preventDefault();

      // Only close if panel is closeable.
      if (panel.closeable) {
        closePanel(panel);
      }
    }
  }

  /**
   * Activates the given panel in this stack.
   * @param panel The panel to activate.
   */
  function activatePanel(panel: Panel) {
    props.areaDef.activePanel = panel;
  }

  /**
   * Closes the given panel via the store.
   * This removes it from the panelStack and reactivates a neighbor if needed.
   * @param panel The panel to close.
   */
  function closePanel(panel: Panel) {
    store.removePanel(panel);
  }
  //#endregion


  //#region Tab Scrolling
  /**
   * Handles mouse wheel events on the tabs container.
   * Scrolls the container horizontally based on the wheel delta.
   * @param event The wheel event.
   */
  function handleTabsWheel(event: WheelEvent) {
    if (!tabsContainerRef.value) return;

    const container = tabsContainerRef.value;
    const scrollAmount = event.deltaY * 2; // Adjust scroll speed as needed.
    container.scrollLeft += scrollAmount;
  }
  //#endregion


  //#region Drag & Drop
  /**
   * Starts dragging a panel by delegating to store.startDragging(...).
   * @param event DragEvent.
   * @param panel The panel to be dragged.
   */
  function startDragging(event: DragEvent, panel: Panel) {
    store.startDragging(event, panel);
  }

  /**
   * Finishes dragging a panel by delegating to store.stopDragging(...).
   */
  function stopDragging() {
    store.stopDragging();
  }
  //#endregion

</script>

<style scoped>
/*
  The outer .dock-area-panel-stack is a vertical flex container.
  We rely on parent classes (e.g. DockAreaPanelStack) to give us a bounding box
  with @apply flex-1 min-h-0.
*/
.dock-area-panel-stack {
  @apply relative flex flex-col h-full min-h-0;
  /* 
    .relative => needed so <DockDropOverlay/> can position itself absolute 
    h-full    => fill the parent's height
    min-h-0   => allow content to shrink if needed
  */
}

/* Header styles for the panel stack */
.panel-stack-header {
  @apply flex-shrink-0 bg-surface-900 border-t border-b border-surface-700;
  /* For toolbar panels (header at bottom), the top border may not be needed;
     if desired, adjust via CSS or additional conditional classes */
}

/* Container for the tabs, enabling horizontal scrolling */
.tabs-container {
  @apply flex items-center h-9 overflow-x-auto overflow-y-hidden no-scrollbar;
}

/* Tab button styles */
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

/* Close button styles */
.close-button {
  @apply ml-1 p-0.5 rounded-sm
         hover:bg-surface-500
         transition-colors duration-150;
}

.close-button .material-symbols-outlined {
  @apply text-base;
}

/**
 * The container for the currently active DockPanel.
 * We do NOT use overflow-hidden here so that the DockPanel’s own
 * overflow-auto can take effect.
 */
.panel-stack-content {
  @apply flex-1 min-h-0;
}
</style>
