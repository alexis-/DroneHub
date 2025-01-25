import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import { initializeDatabase } from '../database/index.js';

class InitializeDatabase implements AppModule {
  enable({app}: ModuleContext): Promise<void> | void {
    return initializeDatabase();
  }
}


export function initializeAppDatabase(...args: ConstructorParameters<typeof InitializeDatabase>) {
  return new InitializeDatabase(...args);
}
