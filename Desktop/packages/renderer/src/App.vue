<template>
  <div class="h-screen w-screen flex flex-col">
    <DockRoot />
    <!-- <router-view /> -->
    <!-- <DockExample /> -->
    <!-- <TreeViewExample /> -->
    
    <!-- <Toast position="bottom-center" /> -->
  </div>
</template>

<script lang="ts" setup>
  
  //#region Imports

  import { type Ref, ref, onMounted } from 'vue';
  import DockRoot from '@dhlib/components/ui/dock/DockRoot.vue';
  import TreeView from '@dhlib/components/ui/treeview/TreeView.vue';
  // import DockExample from '@dhlib/components/ui/dock/examples/DockExample.vue'
  // import TreeViewExample from '@dhlib/components/ui/treeview/examples/TreeViewExample.vue'
  import { useDockStore } from '@dhlib/stores/dockStore';
  import { AppError } from '@dhlib/models/app-errors';
  import type { IProject } from '@dhlib/models/core/interfaces/IProject';
  import { projectRepository } from '@/repositories/project.repository';
  import { DockPosition, PanelType } from '@dhlib/components/ui/dock/models/DockTypes';
  import { createPanel } from '@dhlib/components/ui/dock/models/DockModels';
  
import { 
  RootContainerModel,
} from '@dhlib/components/ui/treeview/examples/TreeViewExampleModel';
  //#endregion

  const rootModel = ref(new RootContainerModel());

  //#region Local State & References

  const store = useDockStore();
  const projects: Ref<IProject[]> = ref([]);
  
  //#endregion


  //#region Create Default UI

  /**
   * Creates the default UI by adding two panels: a TreeView panel for folders and a Map panel.
   * For the TreeView panel we pass in a ref (instanceRef) so that the loaded component instance can be accessed externally.
   */
  function createDefaultUI() {
    store.addPanel(
      createPanel({
        panelType: PanelType.Toolbar,
        title: 'Browser',
        icon: 'folder',
        closeable: false,
        // The component is loaded asynchronously (TreeView) and we pass a reference in its props.
        component: async () => TreeView,
        props: {
          model: rootModel
        },
      }),
      DockPosition.Center,
      DockPosition.Left
    );

    store.addPanel(
      createPanel({
        panelType: PanelType.Toolbar,
        title: 'Data',
        icon: 'database',
        closeable: false,
        // The component is loaded asynchronously (TreeView) and we pass a reference in its props.
        component: async () => TreeView,
        props: {
          model: null
        },
      }),
      DockPosition.Bottom,
      DockPosition.Left
    );
  
    store.addPanel(
      createPanel({
        panelType: PanelType.Content,
        title: 'Map',
        icon: 'public',
        closeable: false,
        component: () => import('@/pages/map.vue')
      }),
      DockPosition.Center,
      DockPosition.Center
    );
  }
  
  //#endregion


  //#region App Initialization

  onMounted(async () => {
    try {
      createDefaultUI();
  
      projects.value = await projectRepository.getAll();
    } catch (error) {
      throw new AppError('Failed to initialize app', 'App', error as Error);
    }
  });
  
  //#endregion
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
