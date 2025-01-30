import type { Panel } from './DockClasses';

export enum DockPosition {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center'
}

export enum SplitDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  All = 'all'
}

export enum PanelType {
  Content = 'content',
  Toolbar = 'toolbar'
}

export interface IDropValidation {
  isValid: boolean;
  message?: string;
}

export interface IDragState {
  isDragging: boolean;
  panel: Panel | null;
  dropTarget: IDropTarget | null;
}

export interface IDropTarget {
  areaId: string | null;
  absolutePosition: DockPosition;
  relativePosition: DockPosition;
}