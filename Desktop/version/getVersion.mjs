/**
 * Entry function for get app version.
 * In current implementation, it returns `version` from `package.json`, but you can implement any logic here.
 * Runs several times for each vite configs and electron-builder config.
 * @return {string}
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export function getVersion() {
  try {
    // Get the directory path of the current module
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // Read package.json from project root (assuming version folder is in project root)
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../package.json'), 'utf8')
    );
    return packageJson.version;
  } catch (error) {
    console.error('Error reading version from package.json:', error);
    return '0.0.0'; // Fallback version
  }
}
