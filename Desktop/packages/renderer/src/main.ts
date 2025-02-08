import 'reflect-metadata';
import { createApp } from 'vue';
import { ipcRenderer } from 'electron';
import { registerPlugins } from '@/plugins/plugin-manager';
import { Logger } from '@/services/logger.service';
import { Filesystem } from '@/services/FileSystemService';

import { useViewModelStore } from '@dhlib/stores/viewModelStore';
import { ElectronAppStatePersistenceService } from '@dhlib/services/ElectronAppStatePersistenceService';
import { AppStatePersistenceServiceKey, FilePickerServiceKey, LoggerServiceKey } from '@dhlib/models/injection-keys';

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

  // Dependency injection: Provide our services and view model store to the application.
  app.provide(AppStatePersistenceServiceKey, appStatePersistenceService);
  app.provide(FilePickerServiceKey, Filesystem);
  app.provide(LoggerServiceKey, Logger);

  // Mount the Vue app.
  app.mount('#app');

  Logger.info(CONTEXT, 'Application initialized successfully');

  window.addEventListener('app-closing', async () => {
    // Create an instance of the view model store.
    const viewModelStore = useViewModelStore();

    await viewModelStore.onAppClosing();
  })

} catch (error) {
  Logger.error(CONTEXT, 'Failed to initialize application', error);
  throw error;
}
