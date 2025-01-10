declare global {
  interface Tool {
    id: string;
    icon: string;
    title: string;
    insertDivider: boolean;
    shortcut?: string;
    enabled: boolean;
    component: () => DefineComponent<{}, {}, any>;
  }
}

export {};
