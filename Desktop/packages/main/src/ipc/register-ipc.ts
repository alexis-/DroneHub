import { app, BrowserWindow, globalShortcut, ipcMain, dialog } from 'electron';
import * as geoip from 'doc999tor-fast-geoip';
import { setupDatabaseHandlers } from './database-handlers.js';
import * as fs from 'fs';

function registerGetLocaleCountryCode() {
  ipcMain.handle('get-locale-country-code', async event => {
    return app.getLocaleCountryCode();
  });
}

function registerGetGeoIp() {
  ipcMain.handle('get-geoip', async (event, ip) => {
    return await geoip.lookup(ip);
  });
}

function registerGlobalShortcuts() {
  [].forEach(key => {
    globalShortcut.register(key, () => {
      BrowserWindow.getFocusedWindow()?.webContents.send('keyboard-shortcut', key);
    });
  });
}

function registerFilePicker() {
  ipcMain.handle('show-file-picker', async (event, options: Electron.OpenDialogOptions) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return { canceled: true, filePaths: [] };

    return await dialog.showOpenDialog(window, options);
  });

  ipcMain.handle('read-file', async (event, filePath: string, encoding?: 'utf8' | 'binary') => {
    try {
      return await fs.promises.readFile(filePath, encoding);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });

  ipcMain.handle('write-file', async (event, filePath: string, data: string | Buffer, encoding?: 'utf8' | 'binary') => {
    try {
      await fs.promises.writeFile(filePath, data, encoding);
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  });
}

export function initializeIpcHandlers() {
  registerGetLocaleCountryCode();
  registerGetGeoIp();
  registerFilePicker();
  setupDatabaseHandlers();
  
  registerGlobalShortcuts();
}
