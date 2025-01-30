<template>
  <div 
    class="dock-area-container-split"
    :class="[
      splitDirection === SplitDirection.Horizontal ? 'flex-col' : 'flex-row'
    ]"
    ref="containerRef"
  >
    <div 
      class="split-panel"
      :class="[splitDirection === SplitDirection.Horizontal ? 'h-1/2' : 'w-1/2']"
      ref="firstPanelRef"
    >
      <component 
        :is="leftOrTopComponent"
        :areaDef="areaDef.leftOrTop"
      />
    </div>

    <div 
      class="splitter"
      :class="[
        splitDirection === SplitDirection.Horizontal ? 'h-2' : 'w-2',
        isResizing ? 'bg-primary-500' : ''
      ]"
      @mousedown="startResize"
      @mouseover="splitterHovered = true"
      @mouseleave="splitterHovered = false"
    ></div>

    <div 
      class="split-panel"
      :class="[splitDirection === SplitDirection.Horizontal ? 'h-1/2' : 'w-1/2']"
      ref="secondPanelRef"
    >
      <component 
        :is="rightOrBottomComponent"
        :areaDef="areaDef.rightOrBottom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, defineAsyncComponent } from 'vue'
import { DockAreaContainerSplitDef } from './models/DockClasses'
import { SplitDirection } from './models/DockTypes'

//#region Props & Refs

const props = defineProps<{
  areaDef: DockAreaContainerSplitDef
}>()

// Template refs for direct element access
const containerRef = ref<HTMLElement | null>(null);
const firstPanelRef = ref<HTMLElement | null>(null);
const secondPanelRef = ref<HTMLElement | null>(null);

const splitDirection = computed(() => props.areaDef.splitDirection)

// Create refs to hold the resolved components
const leftOrTopComponent = computed(() => defineAsyncComponent(() => props.areaDef.leftOrTop?.dockComponent()));
const rightOrBottomComponent = computed(() => defineAsyncComponent(() => props.areaDef.rightOrBottom?.dockComponent()));

//#endregion


//#region Resize State

// Resize handling state
let isResizing = ref(false);
let splitterHovered = ref(false);
let startPosition = { x: 0, y: 0 };
let startSizes = { first: '50%', second: '50%' };

//#endregion


//#region Resize Handlers

/**
 * Initiates the resize operation when the splitter is clicked
 * @param event The mouse event that triggered the resize
 */
function startResize(event: MouseEvent) {
  if (!firstPanelRef.value || !secondPanelRef.value) return;
  
  isResizing.value = true;
  startPosition = { x: event.clientX, y: event.clientY };

  const propertyName = splitDirection.value === SplitDirection.Horizontal ? 'height' : 'width';
  
  startSizes = {
    first: getComputedStyle(firstPanelRef.value)[propertyName],
    second: getComputedStyle(secondPanelRef.value)[propertyName]
  };

  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

/**
 * Handles the resize operation as the mouse moves
 * @param event The mouse move event
 */
function handleResize(event: MouseEvent) {
  if (!isResizing.value || !containerRef.value || !firstPanelRef.value || !secondPanelRef.value) return;

  const delta = splitDirection.value === SplitDirection.Horizontal
    ? event.clientY - startPosition.y
    : event.clientX - startPosition.x;

  const containerSize = splitDirection.value === SplitDirection.Horizontal
    ? containerRef.value.offsetHeight
    : containerRef.value.offsetWidth;

  const newFirstSize = `${(parseInt(startSizes.first) + delta) / containerSize * 100}%`;
  const newSecondSize = `${(parseInt(startSizes.second) - delta) / containerSize * 100}%`;

  firstPanelRef.value.style[splitDirection.value === SplitDirection.Horizontal ? 'height' : 'width'] = newFirstSize;
  secondPanelRef.value.style[splitDirection.value === SplitDirection.Horizontal ? 'height' : 'width'] = newSecondSize;
}

/**
 * Stops the resize operation and cleans up event listeners
 */
function stopResize() {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

//#endregion


//#region Lifecycle

// Cleanup event listeners on component unmount
onUnmounted(() => {
  if (isResizing.value)
    stopResize();
})

//#endregion

</script>

<style scoped>
.dock-area-container-split {
  @apply flex h-full w-full overflow-hidden;
}

.split-panel {
  @apply flex-shrink-0 overflow-hidden;
}

.splitter {
  @apply bg-surface-600 hover:bg-primary-400 cursor-row-resize flex-shrink-0 transition-all duration-200;
  position: relative;
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
