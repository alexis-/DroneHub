//#region [UPDATED WINDOW CREATION WITH CLOSE HANDLER]

import type { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';
import { BrowserWindow, ipcMain } from 'electron';
import type { AppInitConfig } from '../AppInitConfig.js';
import windowStateKeeper from 'electron-window-state';
import { randomUUID } from 'crypto'; // Node.js crypto for generating unique request IDs

class WindowManager implements AppModule {
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools: boolean;

  constructor({ initConfig, openDevTools = false }: { initConfig: AppInitConfig, openDevTools?: boolean }) {
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
  }

  async enable({ app }: ModuleContext): Promise<void> {
    await app.whenReady();
    await this.restoreOrCreateWindow(true);
    app.on('second-instance', () => this.restoreOrCreateWindow(true));
    app.on('activate', () => this.restoreOrCreateWindow(true));
  }

  /**
   * Creates a new BrowserWindow with a custom close handler.
   *
   * The custom close handler intercepts the window's close event, sends an 'app-closing' IPC
   * message to the renderer with a unique requestId, waits for the renderer's reply, and then
   * forces the window to close.
   *
   * @returns A Promise that resolves to the created BrowserWindow.
   */
  async createWindow(): Promise<BrowserWindow> {
    // Load the previous state with fallback to defaults
    const windowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800,
    });

    const browserWindow = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      webPreferences: {
        webSecurity: false, // TODO: Remove before production if possible.
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Sandbox disabled because the demo of preload script depends on Node.js APIs.
        webviewTag: false, // The webview tag is not recommended. Consider alternatives.
        preload: this.#preload.path,
      },
    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    windowState.manage(browserWindow);

    if (this.#renderer instanceof URL) {
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      await browserWindow.loadFile(this.#renderer.path);
    }

    // Add the custom close handler to manage cleanup via IPC.
    // We use a custom property (__forceClose) to avoid re-entering the close handler.
    (browserWindow as any).__forceClose = false;
    browserWindow.on('close', (event) => {
      if (!(browserWindow as any).__forceClose) {
        // Prevent default close behavior until cleanup is done.
        event.preventDefault();

        // Generate a unique requestId for this close event.
        const requestId = randomUUID();

        // Set a timeout to avoid waiting indefinitely (e.g., 5 seconds).
        const timeout = setTimeout(() => {
          console.error(`Window (id=${browserWindow.id}) did not reply to app-closing within the timeout period.`);
          (browserWindow as any).__forceClose = true;
          browserWindow.close();
        }, 5000);

        // Listen for the renderer's reply on the unique channel.
        ipcMain.once(`app-closing-reply-${requestId}`, () => {
          clearTimeout(timeout);
          (browserWindow as any).__forceClose = true;
          browserWindow.close();
        });

        // Send the 'app-closing' IPC message with the requestId to the renderer.
        browserWindow.webContents.send('app-closing', requestId);
      }
    });

    // Show window when ready
    browserWindow.once('ready-to-show', () => {
      if (windowState.isMaximized) {
        browserWindow.maximize();
      }
    });

    return browserWindow;
  }

  async restoreOrCreateWindow(show = false) {
    let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window === undefined) {
      window = await this.createWindow();
    }

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    window?.show();

    if (this.#openDevTools) {
      window?.webContents.openDevTools();
    }

    window.focus();

    return window;
  }
}

export function createWindowManagerModule(...args: ConstructorParameters<typeof WindowManager>) {
  return new WindowManager(...args);
}

//#endregion
