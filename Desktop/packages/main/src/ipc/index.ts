const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron');
import * as geoip from 'doc999tor-fast-geoip';
import { setupDatabaseHandlers } from './database-handlers';

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

export function setupAllIpcHandlers() {
  registerGetLocaleCountryCode();
  registerGetGeoIp();
  setupDatabaseHandlers();
  
  registerGlobalShortcuts();
}
