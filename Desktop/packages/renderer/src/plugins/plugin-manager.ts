import type { App } from 'vue'
import { 
  registerRouter, 
  registerVuetify, 
  registerStore, 
  registerStyles,
  setupKeyboardShortcuts 
} from '@/plugins'
import { Logger } from '@/services/logger.service'
import { AppError } from '@/utils/errors/app-error'

const CONTEXT = 'PluginManager'

export function registerPlugins(app: App) {
  try {
    Logger.info(CONTEXT, 'Initializing plugins')
    
    registerRouter(app)
    registerVuetify(app)
    registerStore(app)
    registerStyles()
    setupKeyboardShortcuts()
    
    Logger.info(CONTEXT, 'All plugins initialized successfully')
  } catch (error) {
    Logger.error(CONTEXT, 'Failed to initialize plugins', error)
    throw new AppError('Failed to initialize plugins', CONTEXT, error as Error)
  }
}