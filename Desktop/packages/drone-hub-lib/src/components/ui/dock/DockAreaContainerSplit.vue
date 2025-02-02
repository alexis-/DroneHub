<template>
  <div 
    class="dock-area-container-split"
    :class="[
      splitDirection === SplitDirection.Horizontal ? 'flex-col' : 'flex-row'
    ]"
    ref="containerRef"
  >
    <!-- First panel: left or top -->
    <div 
      class="split-panel"
      :style="firstPanelStyle"
    >
      <component 
        v-if="areaDef.leftOrTop"
        :is="areaDef.leftOrTop.dockComponent"
        :areaDef="areaDef.leftOrTop"
      />
    </div>

    <!-- The splitter -->
    <div 
      class="splitter"
      :class="[
        splitDirection === SplitDirection.Horizontal ? 'h-2' : 'w-2',
        splitResizeState.isResizing ? 'bg-primary-500' : ''
      ]"
      @mousedown="onSplitMousedown($event)"
      @mouseover="splitterHovered = true"
      @mouseleave="splitterHovered = false"
    ></div>

    <!-- Second panel: right or bottom -->
    <div 
      class="split-panel"
      :style="secondPanelStyle"
    >
      <component 
        v-if="areaDef.rightOrBottom"
        :is="areaDef.rightOrBottom.dockComponent"
        :areaDef="areaDef.rightOrBottom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { DockAreaContainerSplit } from './models/DockModels'
import { SplitDirection } from './models/DockTypes'
import { useSplitResizing } from './DockResizing'

//#region Props

const props = defineProps<{
  areaDef: DockAreaContainerSplit
}>()

//#endregion


//#region State & Split Resizing

const splitterHovered = ref(false);

// Use the ratio-based resizing composable
const { state: splitResizeState, startResize, handleMouseMove, stopResize } = useSplitResizing();

/**
 * Triggered when user mouses down on the splitter for a container-split
 * @param event MouseEvent
 */
function onSplitMousedown(event: MouseEvent) {
  startResize(props.areaDef, event);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event: MouseEvent) {
  // We measure the container size in the relevant dimension
  if (!containerRef.value) return;

  const containerSize = (props.areaDef.splitDirection === SplitDirection.Horizontal)
    ? containerRef.value.offsetHeight
    : containerRef.value.offsetWidth;
  
  handleMouseMove(containerSize, event);
}

function onMouseUp() {
  stopResize();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

onUnmounted(() => {
  // Cleanup in case user navigates away mid-resize
  stopResize();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});

//#endregion


//#region Template Refs

const containerRef = ref<HTMLElement | null>(null);

//#endregion


//#region Split Direction

const splitDirection = computed(() => props.areaDef.splitDirection);

//#endregion


//#region Computed Styles
/**
 * We read the areaDef.splitRatio to compute child panel sizes.
 */
const firstPanelStyle = computed(() => {
  const ratio = props.areaDef.splitRatio;
  if (splitDirection.value === SplitDirection.Horizontal) {
    return { height: (ratio * 100) + '%' };
  } else {
    return { width: (ratio * 100) + '%' };
  }
});

const secondPanelStyle = computed(() => {
  const ratio = props.areaDef.splitRatio;
  if (splitDirection.value === SplitDirection.Horizontal) {
    return { height: ((1 - ratio) * 100) + '%' };
  } else {
    return { width: ((1 - ratio) * 100) + '%' };
  }
});

//#endregion
</script>

<style scoped>
.dock-area-container-split {
  @apply flex h-full w-full min-h-0 overflow-hidden;
}

/**
 * Each split-panel is the bounding box for its child area.
 * Make them flex containers so that .dock-area-panel-stack inside
 * can properly scroll within .panel-content-wrapper.
 */
.split-panel {
  @apply min-h-0 flex flex-col overflow-hidden;
}

.splitter {
  @apply relative bg-surface-600 hover:bg-primary-400 flex-shrink-0 cursor-row-resize transition-all duration-200;
}

.splitter::after {
  content: '';
  @apply absolute inset-0 bg-surface-400 opacity-0 transition-opacity duration-200;
}

.splitter:hover::after {
  @apply opacity-20;
}

.flex-row > .splitter {
  @apply cursor-col-resize;
}
</style>
