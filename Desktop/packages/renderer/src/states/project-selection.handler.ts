import { BaseStateHandler } from './base-state-handler';
import { AppState } from '@/types/app-state';
import { MapIds } from '@/config/map-config';
import { useMapFeaturesStore } from '@/stores/map-features.store';
import { projectRepository } from '@/repositories/project.repository';
import { Logger } from '@/services/logger.service';

export class ProjectSelectionHandler extends BaseStateHandler {
  private mapFeaturesStore = useMapFeaturesStore();

  async onEnter(): Promise<void> {
    await super.onEnter();
    
    try {
      const projects = await projectRepository.getAll();
      await this.mapFeaturesStore.setProjectMarkers(MapIds.Main, projects);
      Logger.info(this.context, `Set markers for ${projects.length} projects`);
    } catch (error) {
      Logger.error(this.context, 'Failed to set project markers', error);
      throw error;
    }
  }

  async onExit(): Promise<void> {
    await super.onExit();
    
    try {
      await this.mapFeaturesStore.clearProjectMarkers(MapIds.Main);
      Logger.info(this.context, 'Cleared project markers');
    } catch (error) {
      Logger.error(this.context, 'Failed to clear project markers', error);
      throw error;
    }
  }

  canTransitionTo(targetState: AppState): boolean {
    return targetState === AppState.PROJECT_EDITING;
  }
} 