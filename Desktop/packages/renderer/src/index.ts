import { createApp } from 'vue';
import { registerPlugins } from '@/plugins/plugin-manager';
import { Logger } from '@/services/logger.service';
import App from '@/App.vue';

const CONTEXT = 'AppInitialization';

// Create vue app
const app = createApp(App);

try {
  // Register plugins
  registerPlugins(app);

  // Mount vue app
  app.mount('#app');
  
  Logger.info(CONTEXT, 'Application initialized successfully');
} catch (error) {
  Logger.error(CONTEXT, 'Failed to initialize application', error);
  throw error;
}
