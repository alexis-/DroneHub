<template>
  <div class="dock-root w-full h-full flex flex-col" ref="rootRef">

    <!-- Top panel -->
    <div class="dock-top" v-if="currentLayout.areas.top" ref="topRef">
      <component :is="topComponent" :areaDef="currentLayout.areas.top" v-if="topComponent" />
    </div>

    <!-- Splitter between top and middle -->
    <div 
      v-if="currentLayout.areas.top"
      class="root-splitter h-2 cursor-row-resize bg-surface-600 hover:bg-primary-400 transition-colors"
      @mousedown="startResize('horizontal', 'top', $event)"
    />

    <!-- Middle row -->
    <div class="dock-middle flex-1 flex relative" ref="middleRef">
      <!-- Left panel -->
      <div class="dock-left" v-if="currentLayout.areas.left" ref="leftRef">
        <component :is="leftComponent" :areaDef="currentLayout.areas.left" v-if="leftComponent" />
      </div>

      <!-- Splitter between left and center -->
      <div 
        v-if="currentLayout.areas.left"
        class="root-splitter w-2 cursor-col-resize bg-surface-600 hover:bg-primary-400 transition-colors"
        @mousedown="startResize('vertical', 'left', $event)"
      />

      <!-- Center area (made relative for overlay containment) -->
      <div class="dock-center flex-1 relative" ref="centerRef">
        <component :is="centerComponent" :areaDef="currentLayout.areas.center" v-if="centerComponent" />

        <!-- Root-level drop overlay is contained here -->
        <DockDropOverlay 
          v-if="store.dragState.isDragging" 
          :root="true"
          class="absolute inset-0"
        />
      </div>

      <!-- Splitter between center and right -->
      <div
        v-if="currentLayout.areas.right"
        class="root-splitter w-2 cursor-col-resize bg-surface-600 hover:bg-primary-400 transition-colors"
        @mousedown="startResize('vertical', 'right', $event)"
      />

      <!-- Right panel -->
      <div class="dock-right" v-if="currentLayout.areas.right" ref="rightRef">
        <component :is="rightComponent" :areaDef="currentLayout.areas.right" v-if="rightComponent" />
      </div>
    </div>

    <!-- Splitter between middle and bottom -->
    <div
      v-if="currentLayout.areas.bottom"
      class="root-splitter h-2 cursor-row-resize bg-surface-600 hover:bg-primary-400 transition-colors"
      @mousedown="startResize('horizontal', 'bottom', $event)"
    />

    <!-- Bottom panel -->
    <div class="dock-bottom" v-if="currentLayout.areas.bottom" ref="bottomRef">
      <component :is="bottomComponent" :areaDef="currentLayout.areas.bottom" v-if="bottomComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">

import { onUnmounted, onMounted, computed, defineAsyncComponent, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDockStore } from '#stores/dockStore'
import DockDropOverlay from './DockDropOverlay.vue'


//#region Store

const store = useDockStore()
const { currentLayout } = storeToRefs(store)

//#endregion


//#region Components

const centerComponent = computed(() => defineAsyncComponent(() => currentLayout.value.areas.center?.dockComponent()));
const leftComponent   = computed(() => defineAsyncComponent(() => currentLayout.value.areas.left?.dockComponent()));
const rightComponent  = computed(() => defineAsyncComponent(() => currentLayout.value.areas.right?.dockComponent()));
const topComponent    = computed(() => defineAsyncComponent(() => currentLayout.value.areas.top?.dockComponent()));
const bottomComponent = computed(() => defineAsyncComponent(() => currentLayout.value.areas.bottom?.dockComponent()));

//#endregion


//#region Refs

const rootRef = ref<HTMLElement | null>(null);
const topRef = ref<HTMLElement | null>(null);
const bottomRef = ref<HTMLElement | null>(null);
const leftRef = ref<HTMLElement | null>(null);
const rightRef = ref<HTMLElement | null>(null);
const middleRef = ref<HTMLElement | null>(null);

//#endregion


//#region Resizing Logic

const isRootResizing = ref(false);
let rootStartPos = { x: 0, y: 0 };
let rootStartHeight = 0;
let rootStartWidth = 0;
let resizingEdge: 'top'|'bottom'|'left'|'right'|null = null;
let resizeDirection: 'horizontal'|'vertical'|null = null;

/**
 * Start resizing the root dock area in a particular edge/direction
 */
function startResize(direction: 'horizontal'|'vertical', edge: 'top'|'bottom'|'left'|'right', event: MouseEvent) {
  isRootResizing.value = true;
  resizingEdge = edge;
  resizeDirection = direction;
  
  rootStartPos = { x: event.clientX, y: event.clientY };

  if (edge === 'top' && topRef.value) {
    rootStartHeight = topRef.value.offsetHeight;
  }
  else if (edge === 'bottom' && bottomRef.value) {
    rootStartHeight = bottomRef.value.offsetHeight;
  }
  else if (edge === 'left' && leftRef.value) {
    rootStartWidth = leftRef.value.offsetWidth;
  }
  else if (edge === 'right' && rightRef.value) {
    rootStartWidth = rightRef.value.offsetWidth;
  }

  document.addEventListener('mousemove', handleRootResize);
  document.addEventListener('mouseup', stopRootResize);
}

/**
 * Handle the ongoing mouse movement to resize
 */
function handleRootResize(event: MouseEvent) {
  if (!isRootResizing.value) return;

  const dx = event.clientX - rootStartPos.x;
  const dy = event.clientY - rootStartPos.y;

  if (resizeDirection === 'horizontal') {
    if (resizingEdge === 'top' && topRef.value) {
      const newHeight = rootStartHeight + dy;
      topRef.value.style.height = newHeight + 'px';
    }
    else if (resizingEdge === 'bottom' && bottomRef.value) {
      const newHeight = rootStartHeight - dy;
      bottomRef.value.style.height = newHeight + 'px';
    }
  }
  else if (resizeDirection === 'vertical') {
    if (resizingEdge === 'left' && leftRef.value) {
      const newWidth = rootStartWidth + dx;
      leftRef.value.style.width = newWidth + 'px';
    }
    else if (resizingEdge === 'right' && rightRef.value) {
      const newWidth = rootStartWidth - dx;
      rightRef.value.style.width = newWidth + 'px';
    }
  }
}

/**
 * End the resize, remove event listeners
 */
function stopRootResize() {
  isRootResizing.value = false;
  resizingEdge = null;
  resizeDirection = null;

  document.removeEventListener('mousemove', handleRootResize);
  document.removeEventListener('mouseup', stopRootResize);
}

// Cleanup
onUnmounted(() => {
  stopRootResize();
});

//#endregion
</script>

<style scoped>
.dock-root {
  @apply bg-surface-800;
}

.dock-top, .dock-bottom {
  @apply flex-none h-64 min-h-[4rem] max-h-[50%] overflow-hidden border-b border-surface-700 relative;
}

.dock-left, .dock-right {
  @apply flex-none w-64 min-w-[4rem] max-w-[50%] overflow-hidden border-r border-surface-700 relative;
}

.dock-center {
  @apply flex-1 overflow-hidden;
  /* We mark .dock-center as relative so the overlay can be absolutely contained */
}

.root-splitter {
  @apply relative z-10;
}

.root-splitter:hover::after {
  @apply opacity-20;
}
</style>
