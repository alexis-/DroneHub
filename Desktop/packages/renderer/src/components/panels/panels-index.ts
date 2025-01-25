import type { PanelDefinition } from '@/models/ui/panel-definition';

export const ProjectsPanel: PanelDefinition = {
  id: 'Projects',
  title: 'Projects',
  icon: 'mdi-folder',
  components: {
    header: () => import('@/components/panels/ProjectsPanel/ProjectsPanelHeader.vue'),
    content: () => import('@/components/panels/ProjectsPanel/ProjectsPanelContent.vue')
  }
};

export const CreateProjectPanel: PanelDefinition = {
  id: 'CreateProject',
  title: 'Create Project',
  icon: 'mdi-folder-plus',
  components: {
    header: () => Promise.resolve({ default: null }),
    content: () => import('@/components/panels/CreateProjectPanel.vue')
  }
};

export const Panels: Record<string, PanelDefinition> = {
  Projects: ProjectsPanel,
  CreateProject: CreateProjectPanel,
}