import type { App } from 'vue'
import { 
  registerRouter, 
  registerStore, 
  setupKeyboardShortcuts 
} from '@/plugins'
import { Logger } from '@/services/logger.service'
import { AppError } from '@mjosdrone/dhlib/models/app-errors'

const CONTEXT = 'PluginManager'

export function registerPlugins(app: App) {
  try {
    Logger.info(CONTEXT, 'Initializing plugins')
    
    registerRouter(app)
    registerStore(app)
    setupKeyboardShortcuts()
    
    Logger.info(CONTEXT, 'All plugins initialized successfully')
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to initialize plugins', error)
    throw new AppError('Failed to initialize plugins', CONTEXT, error as Error)
  }
}