import { SplitDirection, DockPosition, PanelType } from "./models/DockTypes"

export function validatePosition(direction: string): boolean {
  switch (direction) {
    case DockPosition.Left:
    case DockPosition.Right:
    case DockPosition.Top:
    case DockPosition.Bottom:
    case DockPosition.Center:
      return true;
    default:
      return false;
  }
}

export function validateSplitDirection(absolutePosition: DockPosition, relativePosition: DockPosition): boolean {
  switch (absolutePosition) {
    case DockPosition.Center:
      return true // Center can be split in any direction
    case DockPosition.Left:
    case DockPosition.Right:
      return relativePosition === DockPosition.Top || relativePosition === DockPosition.Bottom
    case DockPosition.Top:
    case DockPosition.Bottom:
      return relativePosition === DockPosition.Left || relativePosition === DockPosition.Right
    default:
      return false
  }
}

export function getOppositePosition(position: DockPosition): DockPosition {
  switch (position) {
    case DockPosition.Left:
      return DockPosition.Right
    case DockPosition.Right:
      return DockPosition.Left
    case DockPosition.Top:
      return DockPosition.Bottom
    case DockPosition.Bottom:
      return DockPosition.Top
    default:
      throw new Error('Invalid position');
  }
}

export function getSplitDirection(relativePosition: DockPosition): SplitDirection {
  switch (relativePosition) {
    case DockPosition.Left:
    case DockPosition.Right:
      return SplitDirection.Vertical
    case DockPosition.Top:
    case DockPosition.Bottom:
      return SplitDirection.Horizontal
    default:
      throw new Error('Invalid position');
  }
}

export function getPanelType(position: DockPosition): PanelType {
  switch (position) {
    case DockPosition.Left:
    case DockPosition.Right:
    case DockPosition.Top:
    case DockPosition.Bottom:
      return PanelType.Toolbar

    case DockPosition.Center:
      return PanelType.Content

    default:
      throw new Error('Invalid position');
  }
}