import 'reflect-metadata';
import { createApp } from 'vue';
import { registerPlugins } from '@/plugins/plugin-manager';
import { Logger } from '@/services/logger.service';
import { Filesystem } from '@/services/FileSystemService';
import { ElectronAppStatePersistenceService } from '@dhlib/services/ElectronAppStatePersistenceService';
import { AppStatePersistenceServiceKey, FilePickerServiceKey, LoggerServiceKey, ViewModelStoreKey } from '@dhlib/models/injection-keys';
import { useViewModelStore } from '@dhlib/stores/viewModelStore';
import App from '@/App.vue';

import '@material-symbols/font-400/outlined.css';
import '@/styles/main.css';

const CONTEXT = 'AppInitialization';

// Create Vue app
const app = createApp(App);

try {
  // Register plugins
  registerPlugins(app);

  // The app state persistence service be must initialized before the view model store.
  const appStatePersistenceService = new ElectronAppStatePersistenceService(Filesystem);
  app.provide(AppStatePersistenceServiceKey, appStatePersistenceService);

  // Instantiate the view model store and store its reference locally for later use.
  const viewModelStore = useViewModelStore();

  // Dependency injection: Provide our services and view model store to the application.
  app.provide(FilePickerServiceKey, Filesystem);
  app.provide(LoggerServiceKey, Logger);
  app.provide(ViewModelStoreKey, viewModelStore);

  // Mount the Vue app.
  app.mount('#app');

  Logger.info(CONTEXT, 'Application initialized successfully');
  
  // Add a listener to flush pending view model changes when the app is closing.
  window.addEventListener('beforeunload', () => {
    // flushAll returns a promise, but we're not awaiting here since beforeunload cannot be async.
    // This call attempts to persist any pending changes immediately.
    viewModelStore.flushAll();
  });

} catch (error) {
  Logger.error(CONTEXT, 'Failed to initialize application', error);
  throw error;
}
