import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import type { IProject } from '@shared/database/entities/IProject';
import { Logger } from '@/services/logger.service';
import { AppState } from '@/types/app-state';
import { ProjectSelectionHandler } from '@/states/project-selection.handler';
import type { BaseStateHandler } from '@/states/base-state-handler';

const CONTEXT = 'AppStateStore';

export { AppState };

export const useAppStateStore = defineStore('app-state', () => {
  const currentState = ref<AppState>(AppState.PROJECT_SELECTION);
  const activeProject = ref<IProject | null>(null);
  const currentHandler = shallowRef<BaseStateHandler | null>(null);

  // State flags
  const isProjectSelection = computed(() => currentState.value === AppState.PROJECT_SELECTION);
  const isProjectEditing = computed(() => currentState.value === AppState.PROJECT_EDITING);

  // Handler mapping
  const handlers = new Map<AppState, new () => BaseStateHandler>([
    [AppState.PROJECT_SELECTION, ProjectSelectionHandler],
  ]);

  async function setState(state: AppState, project?: IProject) {
    try {
      // Validate transition
      if (currentHandler.value && !currentHandler.value.canTransitionTo(state)) {
        throw new Error(`Invalid state transition from ${currentState.value} to ${state}`);
      }

      Logger.info(CONTEXT, `State changing from ${currentState.value} to ${state}`, { 
        projectId: project?.id 
      });

      // Exit current state
      await currentHandler.value?.onExit();

      // Update state
      currentState.value = state;
      
      // Set active project if needed
      if (project && state === AppState.PROJECT_EDITING) {
        activeProject.value = project;
      } else if (state !== AppState.PROJECT_EDITING) {
        activeProject.value = null;
      }

      // Initialize and enter new state
      const HandlerClass = handlers.get(state);
      if (HandlerClass) {
        currentHandler.value = new HandlerClass();
        await currentHandler.value.onEnter();
      } else {
        currentHandler.value = null;
      }
    } catch (error) {
      Logger.error(CONTEXT, 'Failed to change state', error);
      throw error;
    }
  }

  return {
    currentState,
    activeProject,
    isProjectSelection,
    isProjectEditing,
    setState,
  };
}); 