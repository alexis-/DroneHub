import { type Component, defineAsyncComponent } from 'vue'
import { v4 as uuidv4 } from 'uuid';
import { DockPosition, PanelType, SplitDirection } from './DockTypes';
import { validateSplitDirection } from '../DockUtils';

export abstract class Panel {
  constructor() {
    this.id = uuidv4();
  }

  id: string;
  type: PanelType;
  title: string;
  icon: string;
  parent: DockAreaPanelStackDef | null;
  abstract component(): Promise<Component>;
  closeable: boolean;
  props: any;
}

export class ContentPanel extends Panel {
  constructor() {
    super();
    this.type = PanelType.Content;
  }
}

export class SidePanel extends Panel {
  constructor() {
    super();
    this.type = PanelType.Toolbar;
  }
}

export interface IDockAreaDef {
  id: string;
  absolutePosition: DockPosition;
  relativePosition: DockPosition | null;
  parent: IDockAreaDef | null;
  dockComponent(): Promise<Component>;
}

export class DockAreaPanelStackDef implements IDockAreaDef {
  id: string
  absolutePosition: DockPosition
  relativePosition: DockPosition | null;
  parent: IDockAreaDef | null;
  panelStack: Panel[];
  activePanel: Panel | null;

  constructor(params: {id?: string, absolutePosition: DockPosition, relativePosition?: DockPosition | null, parent?: IDockAreaDef | null}) {
    this.id = params.id || uuidv4();
    this.absolutePosition = params.absolutePosition;
    this.relativePosition = params.relativePosition || null;
    this.parent = params.parent || null;
    this.panelStack = [];
    this.activePanel = null;
  }

  /**
   * Adds a panel to the panel stack
   * @param panel The panel to add
   * @param makeActive Whether to make the panel active
   */
  addPanel(panel: Panel, makeActive: boolean = true) {
    this.panelStack.push(panel)
    panel.parent = this;

    if (makeActive)
      this.activePanel = panel;
  }

  /**
   * Closes the given panel, or the active panel
   * @param panel The panel to close, or null to close the active panel
   * @returns Whether the panel was closed
   */
  closePanel(panel: Panel | null = null): boolean {
    panel = panel
      ? this.panelStack.find(p => p.id === panel.id)
      : this.activePanel;

    if (!panel)
      return false;

    const idx = this.panelStack.indexOf(panel);
    
    if (idx <= -1)
      throw new Error(`Invalid close panel operation: panel ${panel.id} not found in area ${this.id}`)
    
    this.panelStack.splice(idx, 1);
    this.activePanel = this.panelStack.length > 0
      ? this.panelStack[Math.min(idx, this.panelStack.length - 1)]
      : null;

    return true;
  }
  
  dockComponent() {
    return import('#components/ui/dock/DockAreaPanelStack.vue');
  }
} 

export class DockAreaContainerSplitDef implements IDockAreaDef {
  id: string;
  absolutePosition: DockPosition;
  relativePosition: DockPosition | null;
  // areaSize: number;
  parent: IDockAreaDef;
  splitDirection: SplitDirection;
  leftOrTop?: IDockAreaDef;
  rightOrBottom?: IDockAreaDef;

  constructor(params: {id?: string, absolutePosition: DockPosition, relativePosition?: DockPosition | null, parent?: IDockAreaDef | null, splitDirection: SplitDirection}) {
    this.id = params.id || uuidv4();
    this.absolutePosition = params.absolutePosition;
    this.relativePosition = params.relativePosition || null;
    this.parent = params.parent || null;
    this.splitDirection = params.splitDirection;
  }
  
  dockComponent() {
    return import('#components/ui/dock/DockAreaContainerSplit.vue');
  }

  validate(): boolean {
    return validateSplitDirection(this.absolutePosition, this.relativePosition);
  }
}

export class DockLayout {
  id: string;
  name: string;
  props: Map<string, any>;
  areas: {
    left?: IDockAreaDef;
    right?: IDockAreaDef;
    top?: IDockAreaDef;
    bottom?: IDockAreaDef;
    center: IDockAreaDef;
  }

  constructor(params: {name?: string, props?: Map<string, any>} = {}) {
    this.id = uuidv4();
    this.name = params.name || 'Default';
    this.props = params.props || new Map();
    this.areas = {
      left: null,
      right: null,
      top: null,
      bottom: null,
      center: null
    };
  }

  static defaultLayout() {
    const defaultLayout = new DockLayout({
      name: 'Default Layout',
    });

    defaultLayout.areas.center = new DockAreaPanelStackDef({
      absolutePosition: DockPosition.Center
    });

    return defaultLayout;
  }
}