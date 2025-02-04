<template>
  <!-- 
    A vertical toolbar pinned to the left side.
    Delegates drag & drop to the store. 
  -->
  <div 
    class="dock-vertical-toolbar flex flex-col h-full bg-surface-900 border-r border-surface-700 select-none relative"
    @dragover="onToolbarDragOver"
    @drop.prevent="onContainerDrop"
  >
    <!-- 
      We render each toolbar item in the order found in computedToolbarItems.
      The displayed icon, tooltip and active flag are computed reactively.
    -->
    <div
      v-for="(item, index) in computedToolbarItems"
      :key="item.id"
      class="toolbar-item group relative flex items-center justify-center h-12"
      :class="[{ 'toolbar-item-active': item.isActive }]"
      draggable="true"
      @dragstart="onDragStart($event, item)"
      @dragenter.prevent="onDragEnter($event, index)"
      @dragover.prevent
      @drop.prevent="onDrop($event, index)"
      @dragend="onDragEnd($event)"
      @click="toggleArea(item)"
      @mouseenter="onMouseEnter(item)"
      @mouseleave="onMouseLeave"
    >
      <!-- 
        Render a drop indicator above the item if the store indicates a drop above.
      -->
      <div 
        v-if="dockStore.dragState.isDragging && isPotentialDropAbove(index)"
        class="absolute top-0 left-0 w-full h-[2px] bg-primary-500"
      ></div>
      <!-- 
        Render a drop indicator below the item if the store indicates a drop below.
      -->
      <div
        v-if="dockStore.dragState.isDragging && isPotentialDropBelow(index)"
        class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-500"
      ></div>

      <!-- The item’s icon (from the first panel in that sub-tree) -->
      <span 
        class="material-symbols-outlined text-surface-200 text-xl"
      >
      {{ item.icon }}
      </span>

      <!-- Tooltip displayed on hover -->
      <div
        v-if="hoverItem === item"
        class="absolute left-full ml-2 px-2 py-1 bg-surface-800 text-surface-100 text-xs rounded shadow-lg whitespace-nowrap"
      >
      {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * DockVerticalToolbar.vue
 *
 * This vertical toolbar is pinned to the left side of the screen.
 * Each item references an area hierarchy (panelStack or containerSplit).
 * On click: toggles that area's visibility (mutual exclusivity).
 * On drag: the store decides if we reorder the item, or drag it out to the dock layout.
 */

import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDockStore } from '#stores/dockStore';
import { DropTargetType } from './models/DockTypes';
import type { IIconToolbarItem } from './models/DockModels';


//#region Store Setup

const dockStore = useDockStore();
const { leftToolbarItems, currentLayout, dragState } = storeToRefs(dockStore);

//#endregion


//#region Local State

/**
 * Local reactive state to track which toolbar item is hovered.
 */
const hoverItem = ref<IIconToolbarItem | null>(null);

//#endregion



//#region Computed Toolbar Items

/**
 * Computes an enhanced list of toolbar items so that each item includes:
 *  - title: computed from the first panel in its area hierarchy (or a fallback).
 *  - icon: computed from the first panel in its area hierarchy (or a fallback).
 *  - isActive: true if the left root area is visible and its area definition matches the item's area.
 *
 * This ensures that changes deep inside an area (for example, if the first panel is replaced)
 * automatically update the toolbar’s display.
 */
 const computedToolbarItems = computed(() => {
  return leftToolbarItems.value.map((item) => {
    const panel = dockStore.getFirstPanelInHierarchy(item.areaDef);
    return {
      ...item,
      title: panel?.title || 'Untitled',
      icon: panel?.icon || 'help',
      isActive:
        currentLayout.value.areas.left &&
        currentLayout.value.areas.left.visible &&
        currentLayout.value.areas.left.areaDef?.id === item.areaDef.id,
    };
  });
});

//#endregion


//#region Hover / Tooltip

/**
 * When the mouse enters a toolbar item, set it as the hovered item to show its tooltip.
 * @param item The toolbar item.
 */
 function onMouseEnter(item: IIconToolbarItem) {
  hoverItem.value = item;
}

/**
 * When the mouse leaves a toolbar item, clear the hovered item.
 */
function onMouseLeave() {
  hoverItem.value = null;
}

//#endregion


//#region Toggle (Mutual Exclusivity)

/**
 * Toggles the visibility of the associated area in the left root.
 * Only one area is visible at a time; if the same area is already visible,
 * clicking again hides it.
 * @param item The toolbar item whose area should be toggled.
 */
function toggleArea(item: IIconToolbarItem) {
  dockStore.toggleIconToolbarItem(item.id);
}

//#endregion


//#region Drag & Drop (Unified with store)

/**
 * Called when dragging starts on a toolbar item.
 * Delegates the start of the drag operation to the dock store.
 * @param e Drag event.
 * @param item The toolbar item being dragged.
 */
function onDragStart(e: DragEvent, item: IIconToolbarItem) {
  dockStore.startDragging(e, item.areaDef);
}

/**
 * Called when a dragged toolbar item enters another toolbar item.
 * Updates the drop target in the dock store to indicate the target index.
 * @param e Drag event.
 * @param targetIndex The index of the hovered item.
 */
function onDragEnter(e: DragEvent, targetIndex: number) {
  dockStore.updateDropTarget({
    targetType: DropTargetType.IconToolbar,
    toolbarIndex: targetIndex,
  });
}

/**
 * Called when a drop occurs on a toolbar item.
 * Delegates the drop handling to the dock store.
 * @param e Drag event.
 * @param targetIndex The index where the item was dropped.
 */
function onDrop(e: DragEvent, targetIndex: number) {
  // Prevent the drop event from bubbling up to the container drop handler
  e.stopPropagation();

  if (!dragState.value.isDragging) {
    return;
  }
  
  dockStore.handleDrop({
    targetType: DropTargetType.IconToolbar,
    toolbarIndex: targetIndex,
  });
}

/**
 * Called when the drop occurs on the toolbar container (outside any icon).
 * Here we compute a default drop index (by examining the current mouse position)
 * and then delegate the drop handling to the dock store.
 * @param e Drag event.
 */
 function onContainerDrop(e: DragEvent): void {
  if (!dragState.value.isDragging) {
    return;
  }
  // If the drag ended over the container (not over an icon), update the drop target
  // and then handle the drop using that target.
  const dropIndex = getDropIndexFromEvent(e);
  dockStore.handleDrop({
    targetType: DropTargetType.IconToolbar,
    toolbarIndex: dropIndex,
  });
}

/**
 * onToolbarDragOver: Handles dragover events on the toolbar container (outside the icon items).
 * It computes the drop index based on the mouse Y coordinate relative to the icons
 * and then updates the dock store's drop target.
 * @param e Drag event.
 */
function onToolbarDragOver(e: DragEvent): void {
  e.preventDefault();
  const dropIndex = getDropIndexFromEvent(e);
  dockStore.updateDropTarget({
    targetType: DropTargetType.IconToolbar,
    toolbarIndex: dropIndex,
  });
}

/**
 * Helper function to compute the toolbar drop index based on the drag event.
 * It inspects the toolbar container’s child elements (toolbar items) and determines
 * between which items the mouse pointer is hovering.
 * @param e Drag event.
 * @returns The computed toolbar index for the drop target.
 */
function getDropIndexFromEvent(e: DragEvent): number {
  // Get the container element from the event
  const container = e.currentTarget as HTMLElement;
  // Query all toolbar items
  const toolbarItemElements = container.querySelectorAll('.toolbar-item');
  let dropIndex = 0;
  let found = false;
  toolbarItemElements.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    // If the pointer is above the midpoint of the first item that qualifies,
    // then that index is our drop target.
    if (!found && e.clientY < midY) {
      dropIndex = index;
      found = true;
    }
  });
  // If none qualify, then drop at the end (append)
  if (!found) {
    dropIndex = toolbarItemElements.length;
  }
  return dropIndex;
}

/**
 * Called when the drag operation ends (either normally or by cancellation).
 * Delegates the finalization to the dock store.
 * @param e Drag event.
 */
function onDragEnd(e: DragEvent) {
  dockStore.stopDragging();
}

//#endregion


//#region Drop Indicator Helpers

/**
 * Checks whether the current drop target (if any) indicates a drop above the item at the given index.
 * @param index The toolbar index of the item.
 * @returns True if the drop target index equals this index.
 */
function isPotentialDropAbove(index: number): boolean {
  if (!dragState.value.isDragging) return false;
  if (!dragState.value.dropTarget) return false;
  if (dragState.value.dropTarget.targetType !== DropTargetType.IconToolbar) return false;

  return dragState.value.dropTarget.toolbarIndex === index;
}

/**
 * Checks whether the current drop target (if any) indicates a drop below the item at the given index.
 * @param index The toolbar index of the item.
 * @returns True if the drop target index equals this index plus one.
 */
function isPotentialDropBelow(index: number): boolean {
  if (!dragState.value.isDragging) return false;
  if (!dragState.value.dropTarget) return false;
  if (dragState.value.dropTarget.targetType !== DropTargetType.IconToolbar) return false;

  return dragState.value.dropTarget.toolbarIndex === (index + 1);
}

//#endregion
</script>

<style scoped>
.dock-vertical-toolbar {
  @apply w-14; /* 3.5rem; adjust as needed */
}

.toolbar-item {
  @apply cursor-pointer hover:bg-surface-800 transition-colors duration-150;
}

.toolbar-item.toolbar-item-active {
  @apply bg-surface-700;
}

.material-symbols-outlined {
  @apply text-xl;
}
</style>
