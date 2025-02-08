//#region [APP CLOSING NOTIFIER MODULE WITH REQUEST-REPLY]

import { AppModule } from '../AppModule.js';
import { app, BrowserWindow, ipcMain } from 'electron';
import { randomUUID } from 'crypto';

/**
 * AppClosingNotifier listens for the application's shutdown event and notifies renderer processes.
 * When the app is about to quit, it sends an IPC message ('app-closing') to each BrowserWindow along with a unique requestId.
 * It then waits for each renderer window to reply on a unique reply channel before allowing the app to quit.
 */
class AppClosingNotifier implements AppModule {
  /**
   * Enables the module by registering an event listener on the Electron app.
   * When the 'before-quit' event fires, it iterates over all BrowserWindow instances,
   * sending an 'app-closing' message with a unique requestId and waiting for a corresponding reply.
   *
   * @param _context The module context (not used in this implementation).
   */
  enable(): void {
    // Listen for the 'before-quit' event which occurs before the app shuts down.
    app.on('before-quit', async (event) => {
      const windows = BrowserWindow.getAllWindows();

      // Create an array of promises, one per window.
      const closingPromises: Promise<void>[] = windows.map((window) => {
        return new Promise((resolve, reject) => {
          // Generate a unique requestId for this window.
          const requestId = randomUUID();

          // Set a timeout to avoid waiting indefinitely (e.g., 5 seconds).
          const timeout = setTimeout(() => {
            reject(
              new Error(
                `Window (id=${window.id}) did not reply to app-closing within the timeout period.`
              )
            );
          }, 5000);

          // Listen for the reply from this specific window on a channel unique to this request.
          ipcMain.once(`app-closing-reply-${requestId}`, () => {
            clearTimeout(timeout);
            resolve();
          });

          // Send the 'app-closing' message along with the unique requestId.
          window.webContents.send('app-closing', requestId);
        });
      });

      // Wait for all windows to finish their app-closing routines.
      try {
        await Promise.all(closingPromises);
      } catch (error) {
        console.error('Error waiting for renderer app-closing responses:', error);
      }
    });
  }
}

/**
 * Factory function to create an instance of AppClosingNotifier.
 *
 * @returns An instance of AppClosingNotifier.
 */
export function registerAppClosingNotifier(): AppModule {
  return new AppClosingNotifier();
}

//#endregion
