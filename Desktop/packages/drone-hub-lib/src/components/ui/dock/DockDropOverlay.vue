<template>
  <div 
    v-if="store.dragState.isDragging"
    class="dock-drop-overlay"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <!-- Container-level drop zones (only for empty areas) -->
    <template v-if="props.root && shouldShowRootDropZones">
      <div 
        v-for="relativePosition in availableRootPositions"
        :key="relativePosition"
        class="drop-zone"
        :class="[
          `drop-zone-${relativePosition}`,
          { 'active': isActiveTarget(relativePosition) }
        ]"
        @dragenter.prevent="handleDragEnter(relativePosition)"
        @dragleave.prevent="handleDragLeave"
      >
        <div class="drop-indicator">
          <span class="material-symbols-outlined">{{ getZoneIcon(relativePosition) }}</span>
        </div>
      </div>
    </template>

    <!-- Area-level drop zones (for stacking and splitting) -->
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
            'active': isActiveTarget(relativePosition)
          }
        ]"
        @dragenter.prevent="handleDragEnter(relativePosition, splitInfo.direction)"
        @dragleave.prevent="handleDragLeave"
      >
        <div class="drop-indicator">
          <span class="material-symbols-outlined">{{ getSplitIcon(splitInfo.direction) }}</span>
        </div>
      </div>

      <!-- Stack zone (center of the area) -->
      <div 
        v-if="shouldShowZoneForDraggedPanel"
        class="drop-zone stack-zone"
        :class="{ 
          'active': isActiveTarget(DockPosition.Center)
        }"
        @dragenter.prevent="handleDragEnter(DockPosition.Center)"
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

//#region Setup

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { DockPosition, PanelType, SplitDirection, type IDropTarget } from './models/DockTypes'
import { useDockStore } from '#stores/dockStore'

const store = useDockStore()
const { dragState } = storeToRefs(store)

const props = defineProps<{
  absolutePosition: DockPosition
  areaId: string
  root: boolean
}>()

//#endregion


//#region Root-level

// Only show container drop zones if the dragged panel is of type 'toolbar'
const shouldShowRootDropZones = computed(() => 
  dragState.value.panel?.type === PanelType.Toolbar
)

// Only show root drop zones for positions that don't have panels
const availableRootPositions = computed(() => {
  const layout = store.currentLayout
  
  return [DockPosition.Left, DockPosition.Right, DockPosition.Top, DockPosition.Bottom].filter(position => {
    return !layout.areas[position]
  })
})

//#endregion


//#region Area-level

// Only show zone if:
// - Panel is dragged over the current area
// - Dragged panel type matches the area type
const shouldShowZoneForDraggedPanel = computed(() => {
  const draggedPanelType = dragState.value.panel?.type;
  const dragAreaId = dragState.value.dropTarget?.areaId;

  const isSameArea = props.areaId === dragAreaId;
  const isSamePanelType = (props.absolutePosition === DockPosition.Center && draggedPanelType === PanelType.Content)
  || (props.absolutePosition !== DockPosition.Center && draggedPanelType === PanelType.Toolbar);

  return isSameArea && isSamePanelType;
});

const areaSplitPositions = computed(() => ({
  [DockPosition.Left]: {
    allowed: [DockPosition.Left, DockPosition.Right].includes(props.absolutePosition) == false,
    direction: SplitDirection.Horizontal
  },
  [DockPosition.Right]: {
    allowed: [DockPosition.Left, DockPosition.Right].includes(props.absolutePosition) == false,
    direction: SplitDirection.Horizontal
  },
  [DockPosition.Top]: {
    allowed: [DockPosition.Bottom, DockPosition.Top].includes(props.absolutePosition) == false,
    direction: SplitDirection.Vertical
  },
  [DockPosition.Bottom]: {
    allowed: [DockPosition.Bottom, DockPosition.Top].includes(props.absolutePosition) == false,
    direction: SplitDirection.Vertical
  }
}))

//#endregion


//#region Visual Helpers

function getSplitIcon(direction: SplitDirection): string {
  return direction === SplitDirection.Horizontal ? 'swap_horiz' : 'swap_vert'
}

function getZoneIcon(position: DockPosition): string {
  switch (position) {
    case DockPosition.Left: return 'chevron_left'
    case DockPosition.Right: return 'chevron_right'
    case DockPosition.Top: return 'expand_less'
    case DockPosition.Bottom: return 'expand_more'
    default:
      throw new Error(`Invalid position: ${position}`)
  }
}

function isActiveTarget(
  relativePosition: DockPosition
): boolean {
  const target = store.dragState.dropTarget

  const isSameAbsolutePosition = target?.absolutePosition === props.absolutePosition
  const isSameRelativePosition = target?.relativePosition === relativePosition
  const isSameArea = target?.areaId === props.areaId

  return isSameAbsolutePosition && isSameRelativePosition && isSameArea
}

//#endregion


//#region Drag & Drop

function handleDragEnter(
  relativePosition: DockPosition,
  splitDirection?: SplitDirection
) {
  const target = {
    absolutePosition: props.absolutePosition,
    relativePosition: relativePosition,
    areaId: props.areaId,
    splitDirection: splitDirection
  };

  store.updateDropTarget(target);
}

function handleDragLeave(event: DragEvent) {
  const currentTarget = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as Node | null
  
  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    store.updateDropTarget(null)
  }
}

function handleDrop() {
  const target = store.dragState.dropTarget

  if (target)
    store.handleDrop(target)

  store.stopDragging()
}

//#endregion

</script>

<style scoped>
.dock-drop-overlay {
  @apply fixed inset-0 bg-black/20 pointer-events-none z-50;
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