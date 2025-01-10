<template>
  <div class="panel-container app-panel" :class="{ 'panel-container--collapsed': isCollapsed }">
    <div class="app-panel__header">
      <div class="d-flex align-center">
        <v-icon :icon="panelStore.activePanel?.icon || 'mdi-view-list'" class="mr-4" />
        <h2>{{ panelStore.activePanel?.title || 'Panel' }}</h2>
      </div>
      <div class="d-flex gap-1">
        <div>
          <Suspense>
            <component
              v-if="headerComponent"
              :is="headerComponent"
              v-bind="panelStore.panelProps"
            />
          </Suspense>
        </div>
        <v-btn 
          :icon="isCollapsed ? 'mdi-menu' : 'mdi-chevron-right'" 
          :size="isCollapsed ? 'default' : 'small'"
          variant="tonal"
          @click="toggleCollapse" 
        />
      </div>
    </div>

    <Transition name="fade" mode="out-in">
      <div class="app-panel__content" v-if="!isCollapsed">
        <Suspense>
          <component 
            v-if="contentComponent"
            :is="contentComponent"
            v-bind="panelStore.panelProps"
          />
        </Suspense>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch } from 'vue';
import { usePanelStore } from '@/stores/panel.store';
import { useEventBus } from '@/composables/eventBus';
import { Logger } from '@/services/logger.service';
import type { Component } from 'vue';

const CONTEXT = 'PanelContainer';

const panelStore = usePanelStore();
const isCollapsed = ref(false);
const eventBus = useEventBus();

const headerComponent = shallowRef<Component | null>(null);
const contentComponent = shallowRef<Component | null>(null);

const currentPanelTitle = ref('');

// Watch for panel changes and load components
watch(() => panelStore.activePanel, async (panel) => {
  if (panel) {
    if (currentPanelTitle.value === panel.title) {
      return;
    }

    try {
      const [headerModule, contentModule] = await Promise.all([
        panel.components.header(),
        panel.components.content()
      ]);
      
      headerComponent.value = headerModule.default;
      contentComponent.value = contentModule.default;
      currentPanelTitle.value = panel?.title || '';
      
      Logger.debug(CONTEXT, 'Panel components loaded successfully');
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to load panel components', error);
    }
  } else {
    headerComponent.value = null;
    contentComponent.value = null;
    currentPanelTitle.value = '';
  }
}, { immediate: true });

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  eventBus.emit('panel:collapsed', isCollapsed.value);
  Logger.debug(CONTEXT, `Panel ${isCollapsed.value ? 'collapsed' : 'expanded'}`);
}
</script>

<style lang="scss">
.panel-container {
  @include floating-panel;
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-xs);
  z-index: 10;
  width: 360px;
  transition: width var(--transition-normal),
              height var(--transition-normal),
              background-color var(--transition-normal),
              backdrop-filter var(--transition-normal),
              border-color var(--transition-normal),
              box-shadow var(--transition-normal);

  &--collapsed {
    right: var(--spacing-md);
    width: 46px;
    height: 46px;
    background-color: transparent;
    box-shadow: none;
    backdrop-filter: none;
    overflow: hidden;
    border-color: transparent;

    transition: all var(--transition-normal),
      width var(--transition-fast),
      background-color var(--transition-normal),
      backdrop-filter var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    .app-panel__header {
      padding: var(--spacing-xs);
      background-color: transparent;
      border: none;
      
      transition: background-color var(--transition-fast),
        border var(--transition-fast);

      h2,
      .mr-4 {
        display: none;
      }

      div:first-child {
        display: none;
      }

      .v-btn:last-child {
        background: rgba(var(--color-surface-rgb));
      }
    }

    .app-panel__content {
      display: none;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 