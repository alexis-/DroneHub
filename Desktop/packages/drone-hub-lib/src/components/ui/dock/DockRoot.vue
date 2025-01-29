<template>
  <div class="dock-root w-full h-full flex flex-col">
    <div class="dock-top" v-if="currentLayout.areas.top">
      <component :is="currentLayout.areas.top.dockComponent()" :areaDef="currentLayout.areas.top" />
    </div>
    
    <div class="dock-middle flex-1 flex">
      <div class="dock-left" v-if="currentLayout.areas.left">
        <component :is="currentLayout.areas.left.dockComponent()" :areaDef="currentLayout.areas.left" />
      </div>
      
      <div class="dock-center flex-1">
        <component :is="currentLayout.areas.center.dockComponent()" :areaDef="currentLayout.areas.center" />
      </div>
      
      <div class="dock-right" v-if="currentLayout.areas.right">
        <component :is="currentLayout.areas.right.dockComponent()" :areaDef="currentLayout.areas.right" />
      </div>
    </div>
    
    <div class="dock-bottom" v-if="currentLayout.areas.bottom">
      <component :is="currentLayout.areas.bottom.dockComponent()" :areaDef="currentLayout.areas.bottom" />
    </div>

    <!-- Global drop overlay for empty areas -->
    <DockDropOverlay v-if="store.dragState.isDragging" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDockStore } from '#stores/dockStore'
import DockDropOverlay from './DockDropOverlay.vue'

const store = useDockStore()
const { currentLayout } = storeToRefs(store)
</script>

<style scoped>
.dock-root {
  @apply bg-surface-800;
}

.dock-top, .dock-bottom {
  @apply h-64 min-h-[4rem] max-h-[50%] resize-y overflow-hidden;
}

.dock-left, .dock-right {
  @apply w-64 min-w-[4rem] max-w-[50%] resize-x overflow-hidden;
}

.dock-center {
  @apply min-w-[4rem] min-h-[4rem] overflow-hidden;
}
</style>
