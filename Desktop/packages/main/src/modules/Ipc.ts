import {globalShortcut} from 'electron';
import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import { initializeIpcHandlers } from '../ipc/register-ipc.js';

class InitializeIpc implements AppModule {
  enable({app}: ModuleContext): Promise<void> | void {
    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
    
    return initializeIpcHandlers();
  }
}


export function initializeAppIpc(...args: ConstructorParameters<typeof InitializeIpc>) {
  return new InitializeIpc(...args);
}
