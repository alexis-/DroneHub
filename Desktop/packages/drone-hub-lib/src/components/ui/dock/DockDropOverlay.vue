<template>
  <!-- This overlay is shown if a panel is being dragged -->
  <div 
    v-if="store.dragState.isDragging"
    class="dock-drop-overlay"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- Container-level drop zones (only for empty areas, if root) -->
    <template v-if="props.root && shouldShowRootDropZones">
      <div 
        v-for="absolutePosition in availableRootPositions"
        :key="absolutePosition"
        class="drop-zone"
        :class="[
          `drop-zone-${absolutePosition}`,
          { 'active': isActiveTarget(null, absolutePosition, DockPosition.Center) }
        ]"
        @dragenter.prevent="handleDragEnter(null, absolutePosition, DockPosition.Center)"
        @dragleave.prevent="handleDragLeave"
      >
        <div class="drop-indicator">
          <span class="material-symbols-outlined">{{ getZoneIcon(absolutePosition) }}</span>
        </div>
      </div>
    </template>

    <!-- Area-level drop zones (stack vs. split) -->
    <template v-if="!props.root">
      <!-- Split zones -->
      <div 
        v-for="(splitInfo, relativePosition) in areaSplitPositions"
        :key="`split-${relativePosition}`"
        v-show="splitInfo.allowed && shouldShowZoneForDraggedPanel"
        class="drop-zone split-zone"
        :class="[
          `split-zone-${relativePosition}`,
          { 
            'active': isActiveTarget(props.areaId, props.absolutePosition, relativePosition)
          }
        ]"
        @dragenter.prevent="handleDragEnter(props.areaId, props.absolutePosition, relativePosition)"
        @dragleave.prevent="handleDragLeave"
      >
        <div class="drop-indicator">
          <span class="material-symbols-outlined">{{ getSplitIcon(splitInfo.direction) }}</span>
        </div>
      </div>

      <!-- Stack zone (center) -->
      <div 
        v-if="shouldShowZoneForDraggedPanel"
        class="drop-zone stack-zone"
        :class="{ 
          'active': isActiveTarget(props.areaId, props.absolutePosition, DockPosition.Center)
        }"
        @dragenter.prevent="handleDragEnter(props.areaId, props.absolutePosition, DockPosition.Center)"
        @dragleave.prevent="handleDragLeave"
      >
        <div class="drop-indicator">
          <span class="material-symbols-outlined">add</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { DockPosition, PanelType, SplitDirection } from './models/DockTypes'
import { useDockStore } from '#stores/dockStore'

const store = useDockStore()
const { currentLayout, dragState } = storeToRefs(store)

const props = defineProps<{
  absolutePosition?: DockPosition  // undefined when root === true
  areaId?: string                  // undefined when root === true
  root: boolean
}>()


//#region Root-level

/**
 * We only allow root drop zones for 'toolbar' type panels,
 * and only on empty root positions (i.e. no existing area).
 */
const shouldShowRootDropZones = computed(() => 
  dragState.value.panel?.type === PanelType.Toolbar
)

const availableRootPositions = computed(() => {
  const allRootPositions = [DockPosition.Left, DockPosition.Right, DockPosition.Top, DockPosition.Bottom];
  return allRootPositions.filter(position => {
    return !currentLayout.value.areas[position];
  })
})

//#endregion


//#region Area-level

/**
 * Only show the area-level overlay if:
 * 1) The dragged panel is over this area, and
 * 2) The dragged panel's type matches the area type (content vs. toolbar).
 */
const shouldShowZoneForDraggedPanel = computed(() => {
  const draggedPanelType = dragState.value.panel?.type;
  const dragAreaId = dragState.value.dropTarget?.areaId;
  const isSameArea = true; //props.areaId === dragAreaId;

  const isCenterArea   = (props.absolutePosition === DockPosition.Center);
  const isToolbarArea  = !isCenterArea;  // left, right, top, bottom
  const isDraggingContent = (draggedPanelType === PanelType.Content);
  const isDraggingToolbar = (draggedPanelType === PanelType.Toolbar);

  // Content panels only drop in center, toolbars only in side areas:
  const areaMatchesType = (isCenterArea && isDraggingContent) || (isToolbarArea && isDraggingToolbar);

  console.log(`areaMatchesType(${isCenterArea}, ${isDraggingContent}, ${isDraggingToolbar}) = ${areaMatchesType}`)
  console.log(`isSameArea = ${isSameArea}`)
  console.log(props.areaId, dragAreaId);
  return isSameArea && areaMatchesType;
});

/**
 * Provide a simple structure for possible split zones (left, right, top, bottom)
 * but only mark them "allowed" if it’s a valid combination.
 */
const areaSplitPositions = computed(() => ({
  [DockPosition.Left]: {
    allowed: ![DockPosition.Left, DockPosition.Right].includes(props.absolutePosition!),
    direction: SplitDirection.Horizontal
  },
  [DockPosition.Right]: {
    allowed: ![DockPosition.Left, DockPosition.Right].includes(props.absolutePosition!),
    direction: SplitDirection.Horizontal
  },
  [DockPosition.Top]: {
    allowed: ![DockPosition.Top, DockPosition.Bottom].includes(props.absolutePosition!),
    direction: SplitDirection.Vertical
  },
  [DockPosition.Bottom]: {
    allowed: ![DockPosition.Top, DockPosition.Bottom].includes(props.absolutePosition!),
    direction: SplitDirection.Vertical
  }
}));

//#endregion


//#region Visual Helpers

function getSplitIcon(direction: SplitDirection): string {
  return direction === SplitDirection.Horizontal ? 'swap_horiz' : 'swap_vert';
}

function getZoneIcon(position: DockPosition): string {
  switch (position) {
    case DockPosition.Left:   return 'chevron_left';
    case DockPosition.Right:  return 'chevron_right';
    case DockPosition.Top:    return 'expand_less';
    case DockPosition.Bottom: return 'expand_more';
    default: throw new Error(`Invalid position: ${position}`);
  }
}

function isActiveTarget(areaId: string | null, absPos: DockPosition, relPos: DockPosition): boolean {
  const target = store.dragState.dropTarget;
  if (!target) return false;
  const sameArea   = (areaId === null) || (target.areaId === areaId);
  const sameAbsPos = (target.absolutePosition === absPos);
  const sameRelPos = (target.relativePosition === relPos);
  return (sameArea && sameAbsPos && sameRelPos);
}

//#endregion


//#region Drag & Drop

function handleDragEnter(areaId: string | null, absPos: DockPosition, relPos: DockPosition) {
  store.updateDropTarget({ areaId, absolutePosition: absPos, relativePosition: relPos });
}

function handleDragLeave(event: DragEvent) {
  const currentTarget = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as Node | null;

  // If the mouse leaves the overlay or a drop-zone, and there's no related target inside it,
  // clear the drop target:
  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    store.updateDropTarget(null);
  }
}

function handleDrop() {
  const target = store.dragState.dropTarget;
  if (target) {
    store.handleDrop(target);
  }
  store.stopDragging();
}

//#endregion
</script>

<style scoped>
.dock-drop-overlay {
  @apply absolute inset-0 pointer-events-none z-50 bg-black/20;
}

.drop-zone {
  @apply absolute bg-primary-500/20 pointer-events-auto transition-colors duration-150;
}

.drop-zone.active {
  @apply bg-primary-500/40;
}

.drop-indicator {
  @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
         w-12 h-12 rounded-full bg-primary-500 text-white
         flex items-center justify-center
         transition-transform duration-150;
}

.active .drop-indicator {
  @apply scale-110;
}

/* Container drop zones */
.drop-zone-left {
  @apply left-0 top-0 w-1/4 h-full;
}

.drop-zone-right {
  @apply right-0 top-0 w-1/4 h-full;
}

.drop-zone-top {
  @apply left-0 top-0 w-full h-1/4;
}

.drop-zone-bottom {
  @apply left-0 bottom-0 w-full h-1/4;
}

/* Split zones */
.split-zone {
  @apply opacity-0 hover:opacity-100;
}

.split-zone.active {
  @apply opacity-100;
}

.split-zone-left {
  @apply left-0 top-0 w-12 h-full;
}

.split-zone-right {
  @apply right-0 top-0 w-12 h-full;
}

.split-zone-top {
  @apply left-0 top-0 w-full h-12;
}

.split-zone-bottom {
  @apply left-0 bottom-0 w-full h-12;
}

/* Stack zone */
.stack-zone {
  @apply left-1/4 top-1/4 w-1/2 h-1/2 opacity-0 hover:opacity-100;
}

.stack-zone.active {
  @apply opacity-100;
}
</style>
