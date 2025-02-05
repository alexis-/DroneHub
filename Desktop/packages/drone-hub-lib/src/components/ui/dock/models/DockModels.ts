//#region Imports

import { defineAsyncComponent, markRaw, reactive, type Component } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { DockPosition, PanelType, SplitDirection } from './DockTypes';
//#endregion

//#region Panel

/**
 * Represents a single panel (content or toolbar).
 */
export interface Panel {
  /**
   * Unique ID of this panel
   */
  id: string;

  /**
   * Whether it’s content or toolbar
   */
  panelType: PanelType;

  /**
   * Panel title, displayed in the tab
   */
  title: string;

  /**
   * (Optional) Material symbol name or icon
   */
  icon: string;

  /**
   * The stack area that currently “owns” this panel
   */
  parent: DockAreaPanelStack | null;

  /**
   * If true, a close button is shown
   */
  closeable: boolean;

  /**
   * Arbitrary props to pass to the main component
   */
  props: any;

  /**
   * A stable async component wrapper for the panel’s Vue component.
   */
  component: Component;

  /**
   * Optional external reference callback to receive the component instance.
   * Instead of passing a ref and watching it, the host can supply a callback.
   */
  instanceCallback?: (instance: any) => void;
}

/**
 * Creates a new Panel with the given options
 */
export function createPanel(opts: {
  panelType: PanelType;
  title?: string;
  icon?: string;
  closeable?: boolean;
  props?: any;
  component?: () => Promise<Component>;
  instanceCallback?: (instance: any) => void;
}): Panel {
  return {
    id: uuidv4(),
    panelType: opts.panelType,
    title: opts.title ?? '',
    icon: opts.icon ?? '',
    parent: null,
    closeable: opts.closeable ?? true,
    props: opts.props ?? {},
    instanceCallback: opts.instanceCallback,
    component: markRaw(defineAsyncComponent(opts.component
      ? opts.component
      : () => Promise.resolve(() => {throw new Error('Component not found')}) // safe default
    )),
  };
}

//#endregion


//#region Dock Areas

/**
 * Generic interface for any dock area node in the tree (panel stack or container split).
 */
export interface BaseDockAreaDef {
  /**
   * Unique ID
   */
  id: string;

  /**
   * The absolute (root-level) position of this area, e.g. top/left/center, etc.
   */
  absolutePosition: DockPosition;

  /**
   * The relative position of this area inside its parent container, e.g. top vs bottom split
   */
  relativePosition: DockPosition | null;

  /**
   * The parent area above this one (another containerSplit or null if root).
   */
  parent: DockAreaDef | null;
  
  /**
   * A stable async component that knows how to render this area.
   */
  dockComponent: Component;
}

/**
 * A “panel stack” area that can hold multiple panels in tabs.
 */
export interface DockAreaPanelStack extends BaseDockAreaDef {
  /**
   * Distinguishes this interface
   */
  areaType: 'panelStack';

  /**
   * All panels stacked in this area
   */
  panelStack: Panel[];

  /**
   * The currently active panel
   */
  activePanel: Panel | null;
}

/**
 * A “container split” area that holds two child areas (left/right or top/bottom).
 */
export interface DockAreaContainerSplit extends BaseDockAreaDef {
  areaType: 'containerSplit';

  /**
   * Horizontal or vertical split
   */
  splitDirection: SplitDirection;

  /**
   * The ratio allocated to leftOrTop child. Must be 0 < splitRatio < 1.
   * The rightOrBottom child implicitly gets (1 - splitRatio).
   */
  splitRatio: number;

  /**
   * The two children areas in this container
   */
  leftOrTop?: DockAreaDef;
  rightOrBottom?: DockAreaDef;
}

/**
 * Union type for any valid area
 */
export type DockAreaDef = DockAreaPanelStack | DockAreaContainerSplit;

/**
 * Factory function to create a panel-stack area.
 */
export function createDockAreaPanelStack(params: {
  id?: string;
  absolutePosition: DockPosition;
  relativePosition?: DockPosition | null;
  parent?: DockAreaDef | null;
}): DockAreaPanelStack {
  return reactive<DockAreaPanelStack>({
    id: params.id ?? uuidv4(),
    areaType: 'panelStack',
    absolutePosition: params.absolutePosition,
    relativePosition: params.relativePosition ?? null,
    parent: params.parent ?? null,

    // Always define a stable async component for this area
    dockComponent: markRaw(defineAsyncComponent(() => import('#components/ui/dock/DockAreaPanelStack.vue'))),
    panelStack: [],
    activePanel: null,
  });
}

/**
 * Factory function to create a container-split area.
 */
export function createDockAreaContainerSplit(params: {
  id?: string;
  absolutePosition: DockPosition;
  relativePosition?: DockPosition | null;
  parent?: DockAreaDef | null;
  splitDirection: SplitDirection;
}): DockAreaContainerSplit {
  return reactive<DockAreaContainerSplit>({
    id: params.id ?? uuidv4(),
    areaType: 'containerSplit',
    absolutePosition: params.absolutePosition,
    relativePosition: params.relativePosition ?? null,
    parent: params.parent ?? null,

    dockComponent: markRaw(defineAsyncComponent(() => import('#components/ui/dock/DockAreaContainerSplit.vue'))),
    splitRatio: 0.5,
    splitDirection: params.splitDirection,
    leftOrTop: undefined,
    rightOrBottom: undefined,
  });
}

//#endregion


//#region Toolbar

/**
 * Each icon toolbar item references a sub-tree (panel stack or container-split) 
 * that we want to manage in the left toolbar.
 */
export interface IIconToolbarItem {
  /**
   * Unique identifier for the toolbar item, typically areaDef.id
   */
  id: string;

  /**
   * The area sub-tree that this toolbar item controls.
   */
  areaDef: DockAreaDef;
}

//#endregion


//#region Root Areas & Layout

/**
 * For each root area (left, right, top, bottom, center), we store:
 *   - areaDef: The panel stack or container split
 *   - sizePx: pixel-based size for top/left/right/bottom
 *   - visible: whether it is currently shown in the root layout
 */
export interface IRootArea {
  /**
   * The absolute position for which this root area is defined
   */
  absolutePosition: DockPosition;

  /**
   * The root area definition (panel stack or container split).
   */
  areaDef: DockAreaDef | null;

  /**
   * Pixel-based size for top/left/right/bottom
   * (The center typically won't need it.)
   */
  sizePx: number;

  /**
   * Visibility toggle for this root area
   */
  visible: boolean;
}

/**
 * A complete docking layout with references to root areas.
 */
export interface DockLayout {
  id: string;
  name: string;
  props: Map<string, any>;
  areas: {
    left?: IRootArea;
    right?: IRootArea;
    top?: IRootArea;
    bottom?: IRootArea;
    center: IRootArea;  // always present
  };
}

/**
 * Creates a new DockLayout with optional name/props, always ensures a center area.
 * By default, top/left/right/bottom are not visible. The center is always visible.
 */
export function createDockLayout(params?: {
  name?: string;
  props?: Map<string, any>;
}): DockLayout {
  const layoutId = uuidv4();

  return reactive<DockLayout>({
    id: layoutId,
    name: params?.name ?? 'Default',
    props: params?.props ?? new Map(),
    areas: {
      center: {
        absolutePosition: DockPosition.Center,
        areaDef: createDockAreaPanelStack({ absolutePosition: DockPosition.Center }),
        sizePx: 0,
        visible: true
      },
    },
  });
}

/**
 * Convenience function to create the default layout
 */
export function createDefaultLayout(): DockLayout {
  return createDockLayout({ name: 'Default Layout' });
}

//#endregion

//#region Area & Panel Helpers

/**
 * Checks if a given area is a panel stack.
 */
export function isPanelStack(area: DockAreaDef | null | undefined): area is DockAreaPanelStack {
  return !!area && area.areaType === 'panelStack';
}

/**
 * Checks if a given area is a container split.
 */
export function isContainerSplit(area: DockAreaDef | null | undefined): area is DockAreaContainerSplit {
  return !!area && area.areaType === 'containerSplit';
}

/**
 * Add a panel to a panel-stack area
 */
export function addPanelToStack(
  area: DockAreaPanelStack,
  panel: Panel,
  makeActive: boolean = true
): void {
  area.panelStack.push(panel);
  panel.parent = area;
  if (makeActive) {
    area.activePanel = panel;
  }
}

/**
 * Close a panel from a panel-stack area
 * @returns true if found & removed, false otherwise
 */
export function closePanelInStack(area: DockAreaPanelStack, panel: Panel): boolean {
  const realPanel = area.panelStack.find(p => p.id === panel.id);
  if (!realPanel) return false;

  const idx = area.panelStack.indexOf(realPanel);
  if (idx === -1) return false; // not found

  area.panelStack.splice(idx, 1);

  // Update active panel if needed
  if (area.activePanel && area.activePanel.id === realPanel.id) {
    area.activePanel =
      area.panelStack.length > 0
        ? area.panelStack[Math.min(idx, area.panelStack.length - 1)]
        : null;
  }
  return true;
}

//#endregion