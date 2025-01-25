import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import { Logger } from '@/services/logger.service';
import type { PanelDefinition } from '@/models/ui/panel-definition';

const CONTEXT = 'PanelStore';

interface PanelStackItem {
  panel: PanelDefinition;
  props: Record<string, any>;
}

export const usePanelStore = defineStore('panel', () => {
  // Panel stack to keep track of panel history
  const panelStack = ref<PanelStackItem[]>([]);
  
  // Computed refs for the currently active panel
  const activePanel = shallowRef<PanelDefinition | null>(null);
  const panelProps = ref<Record<string, any>>({});

  async function showPanel(panelDefinition: PanelDefinition, props: Record<string, any> = {}) {
    try {
      if (!panelDefinition) {
        Logger.warn(CONTEXT, 'Panel definition parameter is undefined');
        return;
      }

      Logger.info(CONTEXT, `Showing panel: ${panelDefinition.title}`, {
        props,
        stackSize: panelStack.value.length
      });
      
      // Add current panel to stack if it exists
      if (activePanel.value) {
        panelStack.value.push({
          panel: activePanel.value,
          props: panelProps.value
        });
      }

      // Set new active panel
      activePanel.value = panelDefinition;
      panelProps.value = props;
    } catch (error) {
      Logger.error(CONTEXT, `Failed to show panel: ${panelDefinition.title}`, error);
      throw error;
    }
  }

  function hidePanel() {
    try {
      // Log the current panel being hidden
      if (activePanel.value) {
        Logger.info(CONTEXT, `Hiding panel: ${activePanel.value.title}`);
      }

      // If there are panels in the stack, restore the last one
      if (panelStack.value.length > 0) {
        const previousPanel = panelStack.value.pop();
        if (previousPanel) {
          Logger.info(CONTEXT, `Restoring previous panel: ${previousPanel.panel.title}`);
          activePanel.value = previousPanel.panel;
          panelProps.value = previousPanel.props;
          return;
        }
      }

      // If no panels in stack, clear everything
      activePanel.value = null;
      panelProps.value = {};
      panelStack.value = [];
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to hide panel', error);
      throw error;
    }
  }

  function clearPanels() {
    activePanel.value = null;
    panelProps.value = {};
    panelStack.value = [];
    Logger.info(CONTEXT, 'Cleared all panels');
  }

  return {
    activePanel,
    panelProps,
    showPanel,
    hidePanel,
    clearPanels,
    // Expose stack size for debugging/testing
    get stackSize() {
      return panelStack.value.length;
    }
  };
});