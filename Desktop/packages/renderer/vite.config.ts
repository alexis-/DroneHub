import { defineConfig } from 'vite'
import swc from 'unplugin-swc';
import {join} from 'node:path';
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import cesium from 'vite-plugin-cesium';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssFunctions from 'postcss-functions';
import {hexToRgb, rgbToHex, shiftHex, shiftRgb} from '../drone-hub-lib/src/styles/functions/color-transform.js';

const PACKAGE_ROOT = __dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    swc.vite(),
    vue(),
    Components(),
    cesium()
  ],
  resolve: {
    alias: {
      '@vite-electron-builder/preload': join(PACKAGE_ROOT, '../preload', '/'),
      '@mjosdrone/dhlib': join(PACKAGE_ROOT, '../drone-hub-lib/src'),
      '@dhlib': join(PACKAGE_ROOT, '../drone-hub-lib/src'),
      '@': join(PACKAGE_ROOT, 'src'),
      '@shared': join(PACKAGE_ROOT, '../shared/src'),
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: join(PACKAGE_ROOT, './tailwind.config.js') }),
        autoprefixer(),
        postcssFunctions({
          functions: {
            hexToRgb: hexToRgb,
            rgbToHex: rgbToHex,
            shiftHex: shiftHex,
            shiftRgb: shiftRgb
          }
        }),
      ],
    },
  },
})
