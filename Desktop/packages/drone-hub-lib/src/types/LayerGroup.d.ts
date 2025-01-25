import type { Options as LayerGroupOptions } from 'ol/layer/Group';

declare module 'ol/layer/Group' {
  interface DHOptions extends LayerGroupOptions {
    title?: string;
  }
}