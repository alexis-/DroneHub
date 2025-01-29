<template>
  <div 
    class="dock-area"
    :class="[`dock-area-${position}`]"
  >
    <template v-if="area.splits">
      <div 
        class="split-container"
        :class="{ 
          'flex-row': area.splits.direction === 'horizontal',
          'flex-col': area.splits.direction === 'vertical'
        }"
      >
        <DockArea 
          v-for="childArea in area.splits.areas"
          :key="childArea.id"
          :position="position"
          :area-id="childArea.id"
        />
      </div>
    </template>
    <template v-else>
      <div class="panels-container">
        <DockPanel
          v-for="panel in area.panels"
          :key="panel.id"
          :panel="panel"
          :is-active="panel.id === area.activePanel"
          @close="store.removePanel(panel.id)"
        />
      </div>
      <div v-if="area.panels.length > 1" class="panel-tabs">
        <button
          v-for="panel in area.panels"
          :key="panel.id"
          class="panel-tab"
          :class="{ active: panel.id === area.activePanel }"
          @click="activatePanel(panel.id)"
        >
          <span v-if="panel.icon" class="material-symbols-outlined">{{ panel.icon }}</span>
          {{ panel.title }}
        </button>
      </div>
    </template>

    <DockDropOverlay 
      :area-id="area.id"
      :absolutePosition="position"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDockStore } from '../../../stores/dockStore'
import type { Panel } from './models/DockTypes'
import { DockPosition } from './models/DockTypes'
import DockPanel from './DockPanel.vue'
import DockDropOverlay from './DockDropOverlay.vue'

const props = defineProps<{
  position: DockPosition
  areaId?: string
}>()

const store = useDockStore()

const area = computed(() => {
  const layout = store.currentLayout
  console.log("area", props.areaId, props.position, layout)
  return props.areaId 
    ? layout.areas.find(a => a.id === props.areaId)
    : layout.areas.find(a => a.position === props.position)
})

function activatePanel(panelId: string) {
  if (!area.value) return
  area.value.activePanel = panelId
}
</script>

<style scoped>
.dock-area {
  @apply h-full w-full flex flex-col;
}

.split-container {
  @apply flex flex-1;
}

.panels-container {
  @apply flex-1 overflow-hidden;
}

.panel-tabs {
  @apply flex border-t border-surface-600;
}

.panel-tab {
  @apply flex items-center gap-1 px-3 py-1 text-sm hover:bg-surface-700;
}

.panel-tab.active {
  @apply bg-surface-700;
}
</style>
