<template>
  <v-list class="app-panel__content project-list">
    <template v-for="project in projects" :key="project.id">
      <v-list-item :active="selectedProject?.id === project.id" @click="selectProject(project)" class="project-item"
        rounded="sm">
        <template v-slot:prepend>
          <div class="project-expand-icon">
            <v-icon :icon="isProjectExpanded(project.id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
              @click.stop="toggleProject(project.id)" class="expand-icon" size="small"></v-icon>
          </div>
        </template>

        <v-list-item-title class="project-title">
          <p>{{ project.name }}</p>
          <span class="project-info">
            {{ project.routes?.length || 0 }} routes
          </span>
        </v-list-item-title>

        <template v-slot:append>
          <div class="actions">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click.stop="editProject(project)"></v-btn>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error"
              @click.stop="confirmDeleteProject(project)"></v-btn>
          </div>
        </template>
      </v-list-item>

      <div v-if="isProjectExpanded(project.id)" class="routes-container">
        <v-list-item v-for="route in project.routes" :key="route.id" :active="selectedRoute?.id === route.id"
          @click="selectRoute(route)" class="route-item" density="compact" rounded="sm">
          <template v-slot:prepend>
            <v-icon icon="mdi-map-marker-path" size="small" class="route-icon"></v-icon>
          </template>

          <v-list-item-title class="route-title">
            {{ route.name }}
            <span class="route-info" v-if="route.distance">
              {{ (route.distance / 1000).toFixed(1) }}km
            </span>
          </v-list-item-title>

          <template v-slot:append>
            <div class="actions">
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click.stop="editRoute(route)"></v-btn>
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="error"
                @click.stop="confirmDeleteRoute(route)"></v-btn>
            </div>
          </template>
        </v-list-item>

        <v-btn block variant="tonal" color="primary" @click="createNewRoute(project)" prepend-icon="mdi-plus"
          size="small" class="add-route-btn">
          Add Route
        </v-btn>
      </div>
    </template>
  </v-list>

  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 pa-4">
        <v-icon icon="mdi-alert" color="error" class="mr-2" />
        Confirm Delete
      </v-card-title>
      <v-card-text class="pa-4">
        Are you sure you want to delete <strong>{{ itemToDelete?.name }}</strong>?
        <template v-if="itemToDelete?.routes?.length">
          <br><br>
          <v-alert type="warning" variant="tonal" density="compact">
            This will also delete {{ itemToDelete.routes.length }} associated route(s).
          </v-alert>
        </template>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="default" variant="tonal" @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" variant="tonal" @click="deleteItem">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useEventBus } from '@/composables/eventBus';
import { databaseApi } from '#preload';
import { Logger } from '@/services/logger.service';
import { AppError } from '@/utils/errors/app-error';
import type { IProject } from '@shared/database/entities/IProject';
import type { IRoute } from '@shared/database/entities/IRoute';
import { projectRepository } from '@/repositories/project.repository';

const CONTEXT = 'ProjectPanel';

// State
const projects = ref<IProject[]>([]);
const selectedProject = ref<IProject | null>(null);
const selectedRoute = ref<IRoute | null>(null);
const expandedProjects = ref<Set<number>>(new Set());
const showDeleteDialog = ref(false);
const itemToDelete = ref<IProject | IRoute | null>(null);

// Add event bus
const eventBus = useEventBus();

// Load projects on mount
onMounted(async () => {
  try {
    await loadProjects();
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to mount project panel', error);
    throw error;
  }
});

async function loadProjects() {
  try {
    projects.value = await projectRepository.getAll();
    Logger.info(CONTEXT, `Loaded ${projects.value.length} projects`);
  } catch (error) {
    throw new AppError('Failed to load projects', CONTEXT, error as Error);
  }
}

function isProjectExpanded(projectId: number): boolean {
  return expandedProjects.value.has(projectId);
}

function toggleProject(projectId: number) {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId);
  } else {
    expandedProjects.value.add(projectId);
  }
}

function selectProject(project: IProject) {
  try {
    selectedProject.value = project;
    selectedRoute.value = null;

    eventBus.emit('project:selected', project);

    Logger.info(CONTEXT, `Selected project: ${project.name}`, { projectId: project.id });
  } catch (error) {
    throw new AppError('Failed to select project', CONTEXT, error as Error);
  }
}

function selectRoute(route: IRoute) {
  try {
    selectedRoute.value = route;
    
    eventBus.emit('route:selected', route);

    Logger.info(CONTEXT, `Selected route: ${route.name}`, { 
      routeId: route.id,
      projectId: route.project.id 
    });
  } catch (error) {
    throw new AppError('Failed to select route', CONTEXT, error as Error);
  }
}

function editProject(project: IProject) {
  // TODO: Show edit dialog
  Logger.debug(CONTEXT, 'Edit project requested', { projectId: project.id });
}

function confirmDeleteProject(project: IProject) {
  itemToDelete.value = project;
  showDeleteDialog.value = true;
}

function createNewRoute(project: IProject) {
  // TODO: Show create route dialog
  Logger.debug(CONTEXT, 'Create route requested', { projectId: project.id });
}

function editRoute(route: IRoute) {
  // TODO: Show edit dialog
  Logger.debug(CONTEXT, 'Edit route requested', { routeId: route.id });
}

function confirmDeleteRoute(route: IRoute) {
  itemToDelete.value = route;
  showDeleteDialog.value = true;
}

async function deleteItem() {
  try {
    if (!itemToDelete.value) return;

    if ('routes' in itemToDelete.value) {
      // It's a project
      await projectRepository.delete(itemToDelete.value.id, true);
      Logger.info(CONTEXT, `Deleted project: ${itemToDelete.value.name}`, { 
        projectId: itemToDelete.value.id 
      });
    } else {
      // It's a route
      await databaseApi.routes.delete(itemToDelete.value.id, true);
      Logger.info(CONTEXT, `Deleted route: ${itemToDelete.value.name}`, { 
        routeId: itemToDelete.value.id 
      });
    }

    showDeleteDialog.value = false;
    itemToDelete.value = null;
    await loadProjects();
  } catch (error) {
    throw new AppError('Failed to delete item', CONTEXT, error as Error);
  }
}
</script>

<style lang="scss">
.project-panel {
  @include floating-panel;
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-xs);
  z-index: 10;
  width: 360px;
  transition: all var(--transition-normal);

  .app-panel__header {
    transition: all var(--transition-fast);

    .d-flex.gap {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

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

      .v-btn:first-child {
        display: none;
      }

      .v-btn:last-child {
        background: rgba(var(--color-surface-rgb));
      }
    }

    .project-list {
      display: none;
    }
  }
}

.project-list {
  height: calc(100% - 64px);
  overflow-y: auto;
}

.project-item {
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-fast);
  padding: 0 !important;

  &:hover {
    background-color: var(--color-surface-variant);
  }

  .project-expand-icon {
    width: 32px;
  }

  .expand-icon {
    opacity: 0.7;
    transition: all var(--transition-fast);

    &:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

.project-title,
.route-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: var(--spacing-sm);
  font-size: var(--font-size-body-1);

  p {
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.project-info,
.route-info {
  font-size: var(--font-size-caption);
  opacity: 0.7;
  background: var(--color-surface-variant);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.routes-container {
  margin-left: var(--spacing-xl);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs);
  border-left: 2px solid var(--color-border);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -2px;
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom,
        var(--color-border) 0%,
        var(--color-border) 90%,
        transparent 100%);
  }
}

.route-item {
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-surface-variant);
  }

  .route-icon {
    opacity: 0.7;
  }
}

.actions {
  opacity: 0;
  transition: opacity var(--transition-fast);
  display: flex;
  gap: var(--spacing-sm);

  .v-btn {
    transition: transform var(--transition-fast);

    &:hover {
      transform: scale(1.1);
    }
  }

  .v-list-item:hover & {
    opacity: 1;
  }
}

.add-route-btn {
  margin-top: var(--spacing-sm);
  transition: transform var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
  }
}

:deep(.v-list-item--active) {
  background-color: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-1);

  .actions {
    opacity: 1;
  }

  .project-info,
  .route-info {
    background: rgba(255, 255, 255, 0.2);
  }
}

.create-project-window {
  position: fixed;
  width: 320px;
  z-index: 100;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: move;
    user-select: none;
    border-bottom: 1px solid var(--color-border);
  }
}

:deep(.v-field) {
  font-size: var(--font-size-body-2);
}

.poi-field {
  position: relative;
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;

  .v-text-field {
    flex: 1;
  }

  .poi-select-btn {
    margin-top: 4px;
  }
}
</style>