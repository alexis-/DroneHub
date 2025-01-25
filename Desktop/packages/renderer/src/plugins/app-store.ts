import { createPinia } from 'pinia';
import type { App } from 'vue';

export default function (app: App) {
  const pinia = createPinia();
  app.use(pinia);
}
