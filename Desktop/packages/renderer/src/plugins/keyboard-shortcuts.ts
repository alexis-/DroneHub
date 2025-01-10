import { Logger } from '@/services/logger.service';
import { useToolStore } from '@/stores/tool.store';
import tools from '@/components/tools/tools';

const CONTEXT = 'KeyboardShortcuts';

export function setupKeyboardShortcuts() {
  const toolStore = useToolStore();

  window.addEventListener('keyboard-shortcut', ((event: CustomEvent<string>) => {
    try {
      const tool = tools.find(t => t.shortcut === event.detail);
      if (tool && tool.enabled) {
        Logger.debug(CONTEXT, `Keyboard shortcut triggered: ${event.detail}`, { toolId: tool.id });
        toolStore.activateTool(tool.id);
      }
    } catch (error) {
      Logger.error(CONTEXT, `Error handling keyboard shortcut: ${event.detail}`, error);
    }
  }) as EventListener);
} 