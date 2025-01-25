import {defineAsyncComponent, type DefineComponent} from 'vue';

export interface Tool {
  id: string;
  icon: string;
  title: string;
  insertDivider: boolean;
  shortcut?: string;
  enabled: boolean;
  component: () => DefineComponent<{}, {}, any>;
}

const tools: Tool[] = [
  {
    id: 'rectangle-selection',
    icon: 'mdi-selection',
    title: 'Selection Tool: Rectangle [1]',
    insertDivider: false,
    shortcut: 'Digit1',
    enabled: true,
    component: () => defineAsyncComponent(() => import('./tool-selection-rectangle.vue')),
  },
  {
    id: 'poi-selection',
    icon: 'mdi-map-marker',
    title: 'POI Selection',
    insertDivider: false,
    shortcut: '',
    enabled: true,
    component: () => defineAsyncComponent(() => import('./tool-poi-selection.vue')),
  },
  {
    id: 'lasso-selection',
    icon: 'mdi-lasso',
    title: 'Selection Tool: Lasso [1]',
    insertDivider: true,
    shortcut: 'Digit1',
    enabled: false,
    component: () => null,
  },
  {
    id: 'add-waypoint',
    icon: 'mdi-map-marker-plus',
    title: 'Add Waypoint [2]',
    insertDivider: false,
    shortcut: 'Digit2',
    enabled: true,
    component: () => defineAsyncComponent(() => import('./tool-add-waypoint.vue')),
  },
  {
    id: 'area-rectangle',
    icon: 'mdi-vector-square',
    title: 'Create Rectangle Area [3]',
    insertDivider: false,
    shortcut: 'Digit3',
    enabled: true,
    component: () => defineAsyncComponent(() => import('./tool-area-rectangle.vue')),
  },
  {
    id: 'area-polygon',
    icon: 'mdi-vector-polygon',
    title: 'Create Polygon Area [3]',
    insertDivider: true,
    shortcut: 'Digit3',
    enabled: true,
    component: () => defineAsyncComponent(() => import('./tool-area-polygon.vue')),
  },
  {
    id: 'measure-ruler',
    icon: 'mdi-ruler',
    title: 'Ruler [9]',
    insertDivider: false,
    shortcut: 'Digit9',
    enabled: true,
    component: () => null, //defineAsyncComponent(() => import('./tool-area-polygon.vue')),
  },
  {
    id: 'measure-polygon',
    icon: 'mdi-pencil-ruler',
    title: 'Measure tool [9]',
    insertDivider: false,
    shortcut: 'Digit9',
    enabled: true,
    component: () => null, //defineAsyncComponent(() => import('./tool-area-polygon.vue')),
  },
];

export default tools;
