import type { Component } from 'vue';

export interface PanelDefinition {
  id: string;
  title: string;
  icon: string;
  components: {
    header: () => Promise<{ default: Component | null }>;
    content: () => Promise<{ default: Component }>;
  };
}