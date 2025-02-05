//#region [IMPORTS]

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';  // Node.js path module for path operations

//#endregion



//#region [FILE PICKER IPC REGISTRATION]

function registerFilePicker() {
  // Asynchronously show file picker dialog
  ipcMain.handle('show-file-picker', async (event, options: Electron.OpenDialogOptions) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return { canceled: true, filePaths: [] };

    return await dialog.showOpenDialog(window, options);
  });

  // Asynchronously read a file from disk
  ipcMain.handle('read-file', async (event, filePath: string, encoding?: 'utf8' | 'binary') => {
    try {
      return await fs.promises.readFile(filePath, encoding);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });

  // Asynchronously write data to a file on disk
  ipcMain.handle('write-file', async (event, filePath: string, data: string | Buffer, encoding: 'utf8' | 'binary' = 'utf8') => {
    try {
      // Extract the directory path from the file path.
      const directory = path.dirname(filePath);
      // Create the directory hierarchy if it doesn't exist.
      await fs.promises.mkdir(directory, { recursive: true });
      
      // Write the file, creating it or overwriting the existing content.
      await fs.promises.writeFile(filePath, data, { encoding, flag: 'w' });
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  });
}

//#endregion



//#region [GET APP ROOT SYNC IPC]

// Register a synchronous IPC handler that returns the app root directory (userData)
// Optionally, appends one or more subfolders (e.g., "sub/folder")
ipcMain.on('get-app-root-sync', (event, subFolder?: string) => {
  // Retrieve the Electron user data path
  let rootPath = app.getPath("userData");
  
  // If a subFolder is provided, join it with the rootPath using Node's path.join
  if (subFolder) {
    rootPath = path.join(rootPath, subFolder);
  }
  
  // Return the result synchronously via event.returnValue
  event.returnValue = rootPath;
});

//#endregion



//#region [EXPORT MODULE]

export function registerFilesystemIpc() {
  registerFilePicker();
  // The get-app-root-sync channel is registered above so no additional call is needed here.
}

//#endregion
