import 'reflect-metadata';
import { createApp } from 'vue';
import { registerPlugins } from '@/plugins/plugin-manager';
import { Logger } from '@/services/logger.service';
import { Filesystem } from './services/filesystem.service';
import { FilePickerServiceKey, LoggerServiceKey, ViewModelStoreKey } from '@dhlib/models/injection-keys';
import { useViewModelStore } from '@/stores/viewmodel-store';
import App from '@/App.vue';

import '@material-symbols/font-400/outlined.css';
import '@/styles/main.css';

const CONTEXT = 'AppInitialization';

// Create vue app
const app = createApp(App);

try {
  // Register plugins
  registerPlugins(app);
  
  // Dependency injection
  app.provide(LoggerServiceKey, Logger);
  app.provide(FilePickerServiceKey, Filesystem)
  app.provide(ViewModelStoreKey, useViewModelStore());

  // Mount vue app
  app.mount('#app');
  
  Logger.info(CONTEXT, 'Application initialized successfully');
} catch (error) {
  Logger.error(CONTEXT, 'Failed to initialize application', error);
  throw error;
}
