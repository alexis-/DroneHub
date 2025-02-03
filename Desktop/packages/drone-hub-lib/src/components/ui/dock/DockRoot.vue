<template>
  <!-- 
    DockRoot with horizontally arranged left -> center -> right.
    Inside the center container, we vertically arrange top -> center -> bottom.
    This ensures top and bottom are constrained between left and right.
  -->
  <div class="dock-root" ref="rootRef">
    <!-- The left vertical toolbar (always present, pinned to left) -->
    <DockVerticalToolbar class="shrink-0" />

    <!-- Left panel -->
    <div 
      v-if="leftRoot && leftRoot.visible"
      class="dock-left"
      :style="leftStyle"
      ref="leftRef"
    >
      <component
        :is="leftRoot.areaDef?.dockComponent"
        :areaDef="leftRoot.areaDef"
      />
    </div>

    <!-- Splitter between left and center -->
    <div
      v-if="leftRoot && leftRoot.visible"
      class="root-splitter w-2 cursor-col-resize"
      @mousedown="onRootMousedown('vertical', leftRoot, $event)"
    />

    <!-- Middle container: top -> center -> bottom stacked vertically -->
    <div class="dock-middle" ref="middleRef">

      <!-- Top panel -->
      <div
        v-if="topRoot && topRoot.visible"
        class="dock-top"
        :style="topStyle"
        ref="topRef"
      >
        <component
          :is="topRoot.areaDef?.dockComponent"
          :areaDef="topRoot.areaDef"
        />
      </div>

      <!-- Splitter between top and center -->
      <div
        v-if="topRoot && topRoot.visible"
        class="root-splitter h-2 cursor-row-resize"
        @mousedown="onRootMousedown('horizontal', topRoot, $event)"
      />

      <!-- Center area (made relative for overlay containment) -->
      <div class="dock-center" ref="centerRef">
        <component
          :is="centerRoot.areaDef?.dockComponent"
          :areaDef="centerRoot.areaDef"
        />

        <!-- Root-level drop overlay is contained here -->
        <DockDropOverlay
          v-if="store.dragState.isDragging"
          :root="true"
          class="absolute inset-0"
        />
      </div>

      <!-- Splitter between center and bottom -->
      <div
        v-if="bottomRoot && bottomRoot.visible"
        class="root-splitter h-2 cursor-row-resize"
        @mousedown="onRootMousedown('horizontal', bottomRoot, $event)"
      />

      <!-- Bottom panel -->
      <div
        v-if="bottomRoot && bottomRoot.visible"
        class="dock-bottom"
        :style="bottomStyle"
        ref="bottomRef"
      >
        <component
          :is="bottomRoot.areaDef?.dockComponent"
          :areaDef="bottomRoot.areaDef"
        />
      </div>
    </div>

    <!-- Splitter between center and right -->
    <div
      v-if="rightRoot && rightRoot.visible"
      class="root-splitter w-2 cursor-col-resize"
      @mousedown="onRootMousedown('vertical', rightRoot, $event)"
    />

    <!-- Right panel -->
    <div
      v-if="rightRoot && rightRoot.visible"
      class="dock-right"
      :style="rightStyle"
      ref="rightRef"
    >
      <component
        :is="rightRoot.areaDef?.dockComponent"
        :areaDef="rightRoot.areaDef"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { onUnmounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDockStore } from '#stores/dockStore';
import DockDropOverlay from './DockDropOverlay.vue';
import { useRootResizing } from './DockResizing';

//#region Store

const store = useDockStore();
const { currentLayout } = storeToRefs(store);

//#endregion


//#region References

const rootRef = ref<HTMLElement | null>(null);
const topRef = ref<HTMLElement | null>(null);
const bottomRef = ref<HTMLElement | null>(null);
const leftRef = ref<HTMLElement | null>(null);
const rightRef = ref<HTMLElement | null>(null);
const middleRef = ref<HTMLElement | null>(null);
const centerRef = ref<HTMLElement | null>(null);

//#endregion


//#region Root Resizing Logic

const {
  state: rootResizeState,
  startResize,
  handleMouseMove,
  stopResize
} = useRootResizing();

/**
 * Fired on mousedown for top/bottom/left/right splitters
 * @param direction 'horizontal' or 'vertical'
 * @param rootArea The IRootArea to resize
 * @param event 
 */
function onRootMousedown(direction: 'horizontal' | 'vertical', rootArea, event: MouseEvent) {
  startResize(direction, rootArea, event);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

/**
 * We measure the dock-root container dimension on every mousemove,
 * so we can clamp the root area’s size to no more than 40% of the total width/height.
 * This ensures the store never records a size > 40% no matter what CSS does.
 */
function onMouseMove(event: MouseEvent) {
  // Determine the container dimension once per mouse move
  let containerSize = 0;

  // We rely on the current `rootResizeState.direction` to decide
  // which dimension (width or height) we measure.
  if (rootResizeState.direction === 'horizontal') {
    containerSize = rootRef.value?.clientHeight || 0;
  } else if (rootResizeState.direction === 'vertical') {
    containerSize = rootRef.value?.clientWidth || 0;
  }

  // Pass that container size to our resizing logic
  handleMouseMove(event, containerSize);
}

function onMouseUp() {
  stopResize();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});

//#endregion


//#region Computed Root-Area Accessors

const leftRoot = computed(() => currentLayout.value.areas.left);
const rightRoot = computed(() => currentLayout.value.areas.right);
const topRoot = computed(() => currentLayout.value.areas.top);
const bottomRoot = computed(() => currentLayout.value.areas.bottom);
const centerRoot = computed(() => currentLayout.value.areas.center);

//#endregion


//#region Computed Styles for root areas

/**
 * Left area width
 */
const leftStyle = computed(() => {
  if (!leftRoot.value) return {};
  const px = leftRoot.value.sizePx ?? 200;
  return { width: px + 'px' };
});

/**
 * Right area width
 */
const rightStyle = computed(() => {
  if (!rightRoot.value) return {};
  const px = rightRoot.value.sizePx ?? 200;
  return { width: px + 'px' };
});

/**
 * Top area height
 */
const topStyle = computed(() => {
  if (!topRoot.value) return {};
  const px = topRoot.value.sizePx ?? 200;
  return { height: px + 'px' };
});

/**
 * Bottom area height
 */
const bottomStyle = computed(() => {
  if (!bottomRoot.value) return {};
  const px = bottomRoot.value.sizePx ?? 200;
  return { height: px + 'px' };
});

//#endregion
</script>

<style scoped>
/* 
  1) The entire root is a horizontal flex: left -> center -> right 
  2) The center (dock-middle) is a column flex: top -> center -> bottom
*/

/* Root container: left -> center -> right */
.dock-root {
  @apply w-full h-full flex min-h-0 bg-surface-800;
}

/* 
  Left & Right areas:
    - flex-none so they keep a fixed width from the store (sizePx)
    - min-w ensures a minimal visible width, max-w ensures it won't exceed 40%
    - Make them flex containers so that child panels can scroll if needed
    - overflow-hidden ensures the bounding box is clipped; the panel inside
      will manage scrolling with .panel-content-wrapper { overflow-auto }
*/
.dock-left, .dock-right {
  @apply flex-none min-w-[4rem] max-w-[40%] border-surface-700 relative;

  /* fix: allow child to handle scrolling properly */
  @apply h-full min-h-0 flex flex-col overflow-hidden;
}

/*
  The middle container is a vertical stack: top -> center -> bottom
  It occupies leftover horizontal space (flex-1).
*/
.dock-middle {
  @apply flex flex-col flex-1 min-h-0 relative;
}

/* 
  Top & Bottom:
    - flex-none for a fixed height from the store (sizePx).
    - min-h / max-h for safety
    - again, define them as flex containers, min-h-0, overflow-hidden
*/
.dock-top, .dock-bottom {
  @apply flex-none min-h-[4rem] max-h-[40%] border-surface-700 relative;

  /* fix: child scrollers inside will now work */
  @apply w-full min-h-0 flex flex-col overflow-hidden;
}

/*
  The center area is a flex-1 so it fills leftover vertical space.
  Also overflow-hidden as the bounding box. Inside .dock-panel we do actual scrolling.
*/
.dock-center {
  @apply flex-1 relative overflow-hidden min-h-0;
}

/* The general splitter style; dimension varies by orientation. */
.root-splitter {
  @apply relative z-10 bg-surface-600 hover:bg-primary-400 transition-colors;
}

.root-splitter:hover::after {
  @apply opacity-20;
}
</style>
