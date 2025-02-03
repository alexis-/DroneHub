//#region Imports
import type { DockAreaDef, Panel } from './DockModels';
//#endregion


//#region Enums

/**
 * Positions of the dock areas.
 */
export enum DockPosition {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center'
}

/**
 * A container-split is either horizontal or vertical.
 */
export enum SplitDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  All = 'all'
}

/**
 * Panel types: content or toolbar.
 */
export enum PanelType {
  Content = 'content',
  Toolbar = 'toolbar'
}

export enum DragSourceType {
  Panel = 'panel',
  Area = 'area',
}

export enum DropTargetType {
  Area = 'area',
  IconToolbar = 'icon-toolbar'
}

//#endregion


//#region Drag & Drop

/**
 * Result of validating a drop target.
 */
export interface IDropValidation {
  isValid: boolean;
  message?: string;
}

/**
 * A drop target can be either the icon toolbar or a dock area.
 * This interface unifies both possibilities.
 */
export interface IDropTarget {
  /**
   * Distinguishes the type of target for the current drag.
   */
  targetType: DropTargetType;

  /**
   * If targetType === 'area', these are relevant. Otherwise they may be undefined.
   */
  areaId?: string;                         // ID of the panel stack or container-split area
  absolutePosition?: DockPosition;         // e.g., 'left', 'right', 'center', etc.
  relativePosition?: DockPosition;         // e.g., 'top', 'bottom', 'center' for splitting

  /**
   * If targetType === DropTargetType.IconToolbar, we might reorder items in the left toolbar.
   * `toolbarIndex` is the index at which we'll insert the dragged item.
   */
  toolbarIndex?: number;
}

/**
 * The dock store's drag state supports:
 *  - dragSourceType: indicates if we are dragging a panel, or an area
 *  - dragSource:
 *    - the panel being dragged if dragSourceType === DragSourceType.Panel
 *    - the area being dragged if dragSourceType === DragSourceType.Area
 *  - dropTarget: where we're hovering
 */
export interface IDragState {
  isDragging: boolean;

  dragSourceType: DragSourceType | null;
  dragSource: Panel | DockAreaDef | null;

  dropTarget: IDropTarget | null;
}

export interface IDragPayload {
  sourceType: DragSourceType;
  sourceId: string;
}

//#endregion
