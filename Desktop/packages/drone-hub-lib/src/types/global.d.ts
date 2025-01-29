import { DockPosition } from '../components/ui/dock/models/DockTypes'

declare global {
  interface Window {
    activeDropZone: DockPosition | null
  }
}

export {}
