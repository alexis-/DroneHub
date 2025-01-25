/**
 * @module preload
 */

// export { sha256sum } from './nodeCrypto.js';
// export { versions } from './versions.js';

// import NotoSans from "@electron-fonts/noto-sans"

// window.addEventListener("DOMContentLoaded", () => {
//     NotoSans.inject()
// })

export { getLocaleCountryCode } from './ipc.js';
export { getGeoIp } from './ipc.js';
export { showFilePicker, showFolderPicker, readFile, writeFile } from './filesystem.js';
export type { FilePickerOptions, FileFilter } from './filesystem.js';
export { databaseApi } from './database.js';
