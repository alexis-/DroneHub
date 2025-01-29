import { SplitDirection, DockPosition, PanelType } from "./models/DockTypes"

export function validateSplitDirection(absolutePosition: DockPosition, splitDirection: SplitDirection): boolean {
  switch (absolutePosition) {
    case DockPosition.Center:
      return true // Center can be split in any direction
    case DockPosition.Left:
    case DockPosition.Right:
      return splitDirection === SplitDirection.Vertical
    case DockPosition.Top:
    case DockPosition.Bottom:
      return splitDirection === SplitDirection.Horizontal
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