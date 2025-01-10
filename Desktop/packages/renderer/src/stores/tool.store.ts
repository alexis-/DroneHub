import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import tools from '@/components/tools/tools';
import type { Component } from 'vue';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';

const CONTEXT = 'ToolStore';

export const useToolStore = defineStore('tool', () => {
  const activeTool = ref<string>('rectangle-selection');
  const activeToolComponent = shallowRef<Component | null>(null);
  const activeToolProps = ref<Record<string, any>>({});

  function activateTool(toolId: string, props: Record<string, any> = {}) {
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) {
        Logger.warn(CONTEXT, `Tool not found: ${toolId}`);
        return;
      }

      Logger.info(CONTEXT, `Activating tool: ${toolId}`, props);
      
      activeTool.value = toolId;
      activeToolProps.value = props;
      
      if (tool.component) {
        activeToolComponent.value = tool.component();
      } else {
        activeToolComponent.value = null;
      }
    } catch (error) {
      Logger.error(CONTEXT, `Failed to activate tool: ${toolId}`, error);
      throw new AppError(`Failed to activate tool: ${toolId}`, CONTEXT, error as Error);
    }
  }

  return {
    activeTool,
    activeToolComponent,
    activeToolProps,
    activateTool,
  };
});