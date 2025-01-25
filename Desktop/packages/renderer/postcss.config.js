import {hexToRgb, rgbToHex, shiftHex, shiftRgb} from '../drone-hub-lib/src/styles/functions/color-transform.js';

export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-functions': {
      functions: {
        hexToRgb: hexToRgb,
        rgbToHex: rgbToHex,
        shiftHex: shiftHex,
        shiftRgb: shiftRgb
      }
    },
  }
}