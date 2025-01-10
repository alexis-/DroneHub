import { ref } from 'vue';
import { databaseApi } from '#preload';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';
import type { IProject } from '@shared/database/entities/IProject';

const CONTEXT = 'ProjectRepository';

class ProjectRepository {
  private projects = ref<IProject[]>([]);
  private initialized = false;

  /**
   * Get all projects, either from cache or database
   * @param forceRefresh Force a database refresh
   * @param loadRelations Whether to load related entities
   */
  async getAll(forceRefresh = false, loadRelations = true): Promise<IProject[]> {
    try {
      if (!this.initialized || forceRefresh) {
        this.projects.value = await databaseApi.projects.getAll(loadRelations);
        this.initialized = true;
        Logger.info(CONTEXT, `Loaded ${this.projects.value.length} projects from database`);
      }
      return this.projects.value;
    } catch (error) {
      throw new AppError('Failed to get projects', CONTEXT, error as Error);
    }
  }

  /**
   * Get a project by ID
   * @param id Project ID
   * @param loadRelations Whether to load related entities
   */
  async getById(id: number, loadRelations = true): Promise<IProject | undefined> {
    try {
      // First check cache
      let project = this.projects.value.find(p => p.id === id);
      
      // If not in cache or relations needed, fetch from DB
      if (!project || loadRelations) {
        project = await databaseApi.projects.getById(id, loadRelations);
        // Update cache
        const index = this.projects.value.findIndex(p => p.id === id);
        if (index >= 0) {
          this.projects.value[index] = project;
        } else {
          this.projects.value.push(project);
        }
      }
      
      return project;
    } catch (error) {
      throw new AppError('Failed to get project by ID', CONTEXT, error as Error);
    }
  }

  /**
   * Create a new project
   */
  async create(data: Partial<IProject>): Promise<IProject> {
    try {
      const project = await databaseApi.projects.create(data);
      this.projects.value.push(project);
      Logger.info(CONTEXT, `Created project: ${project.name}`, { projectId: project.id });
      return project;
    } catch (error) {
      throw new AppError('Failed to create project', CONTEXT, error as Error);
    }
  }

  /**
   * Update a project
   */
  async update(id: number, data: Partial<IProject>): Promise<IProject> {
    try {
      const project = await databaseApi.projects.update(id, data);
      const index = this.projects.value.findIndex(p => p.id === id);
      if (index >= 0) {
        this.projects.value[index] = project;
      }
      Logger.info(CONTEXT, `Updated project: ${project.name}`, { projectId: project.id });
      return project;
    } catch (error) {
      throw new AppError('Failed to update project', CONTEXT, error as Error);
    }
  }

  /**
   * Delete a project
   */
  async delete(id: number, cascade = true): Promise<void> {
    try {
      await databaseApi.projects.delete(id, cascade);
      this.projects.value = this.projects.value.filter(p => p.id !== id);
      Logger.info(CONTEXT, `Deleted project`, { projectId: id });
    } catch (error) {
      throw new AppError('Failed to delete project', CONTEXT, error as Error);
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.projects.value = [];
    this.initialized = false;
    Logger.debug(CONTEXT, 'Cache cleared');
  }
}

// Export a singleton instance
export const projectRepository = new ProjectRepository();