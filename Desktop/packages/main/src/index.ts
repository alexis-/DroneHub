import type {AppInitConfig} from './AppInitConfig.js';
import {createModuleRunner} from './ModuleRunner.js';
import {disallowMultipleAppInstance} from './modules/SingleInstanceApp.js';
import {createWindowManagerModule} from './modules/WindowManager.js';
import {terminateAppOnLastWindowClose} from './modules/ApplicationTerminatorOnLastWindowClose.js';
import {hardwareAccelerationMode} from './modules/HardwareAccelerationModule.js';
import {autoUpdater} from './modules/AutoUpdater.js';
import {allowInternalOrigins} from './modules/BlockNotAllowdOrigins.js';
import {allowExternalUrls} from './modules/ExternalUrls.js';

// DroneHub Modules Imports
import {initializeAppDatabase} from './modules/Database.js';
import {initializeAppIpc} from './modules/Ipc.js';
import { chromeDevToolsExtension } from './modules/ChromeDevToolsExtension.js';
import { registerAppClosingNotifier } from './modules/AppClosingNotifier.js';


export async function initApp(initConfig: AppInitConfig) {
  const moduleRunner = createModuleRunner()
    .init(createWindowManagerModule({initConfig, openDevTools: import.meta.env.DEV}))
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({enable: true}))
    .init(autoUpdater())

    // Install DevTools extension if needed
    .init(chromeDevToolsExtension({extension: 'VUEJS3_DEVTOOLS'}, {openDevTools: import.meta.env.DEV}))

    // Security
    .init(allowInternalOrigins(
      new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : []),
    ))
    .init(allowExternalUrls(
      new Set(
        initConfig.renderer instanceof URL
          ? [
            'https://github.com',
            'https://api.github.com',
            'https://raw.githubusercontent.com',
          ]
          : [],
      )),
    )

    // DroneHub Modules
    .init(registerAppClosingNotifier())
    .init(initializeAppDatabase())
    .init(initializeAppIpc());

  await moduleRunner;
}
