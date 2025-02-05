<template>
  <div class="dock-panel">
    <!-- Panel content -->
    <div class="panel-content">
      <!--
        We pass along all props except 'instanceRef'
        and we bind a local ref (childComponent) to the dynamic component.
      -->
      <component
        :is="panel.component"
        v-bind="props.panel.props"
        ref="childComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  
  //#region Imports

  import { ref, computed, onMounted, watch } from 'vue';
  import { useDockStore } from '#stores/dockStore';
  import type { Panel } from './models/DockModels';
  
  //#endregion


  //#region Props Declaration

  /**
   * Props: a single Panel to be rendered in this DockPanel.
   */
  const props = defineProps<{
    panel: Panel;
  }>();
  
  //#endregion


  //#region Store & Local Ref

  /**
   * Access the docking store for panel operations.
   */
  const store = useDockStore();
  
  /**
   * Reference to the dynamic component instance.
   */
  const childComponent = ref<any>(null);
  
  //#endregion


  //#region Lifecycle: Update external ref
  
  /**
   * Watch the treeViewRef so that when it becomes available,
   * we can update its model property.
   */
   watch(childComponent, (instance) => {
    if (props.panel.instanceCallback && typeof props.panel.instanceCallback === 'function') {
      props.panel.instanceCallback(childComponent.value);
    }
  });
  
  //#endregion


  //#region Panel Actions

  /**
   * Closes the panel by delegating to the dock store.
   */
  function closePanel() {
    store.removePanel(props.panel);
  }
  
  //#endregion
</script>

<style scoped>
/*
  The outer .dock-panel is a vertical flex container.
  We rely on parent classes (e.g. DockAreaPanelStack) to give us a bounding box
  with @apply flex-1 min-h-0.
*/
.dock-panel {
  /* 
    flex-col so header is at top, main content grows below 
    flex-1 so it fills the parent's area
    min-h-0 is crucial in flex layouts so the content can properly scroll
  */
  @apply flex flex-col min-h-0 h-full w-full;
}

/* 
  Main panel content region: this is a flex item that will occupy the 
  leftover vertical space below the header.
*/
.panel-content {
  @apply flex-1 min-h-0;
}
</style>
