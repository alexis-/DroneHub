import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';
import installer from 'electron-devtools-installer';

const {
  REDUX_DEVTOOLS,
  VUEJS_DEVTOOLS,
  VUEJS3_DEVTOOLS,
  EMBER_INSPECTOR,
  BACKBONE_DEBUGGER,
  REACT_DEVELOPER_TOOLS,
  APOLLO_DEVELOPER_TOOLS,
  JQUERY_DEBUGGER,
  ANGULARJS_BATARANG,
  MOBX_DEVTOOLS,
  CYCLEJS_DEVTOOL,
  default: installExtension,
} = installer;

const extensionsDictionary = {
  REDUX_DEVTOOLS,
  VUEJS_DEVTOOLS,
  VUEJS3_DEVTOOLS,
  EMBER_INSPECTOR,
  BACKBONE_DEBUGGER,
  REACT_DEVELOPER_TOOLS,
  APOLLO_DEVELOPER_TOOLS,
  JQUERY_DEBUGGER,
  ANGULARJS_BATARANG,
  MOBX_DEVTOOLS,
  CYCLEJS_DEVTOOL,
} as const;

export class ChromeDevToolsExtension implements AppModule {
  readonly #extension: keyof typeof extensionsDictionary;
  readonly #openDevTools: boolean;

  constructor({extension}: {readonly extension: keyof typeof extensionsDictionary}, {openDevTools}: {readonly openDevTools: boolean} = {openDevTools: import.meta.env.DEV}) {
    this.#extension = extension;
    this.#openDevTools = openDevTools;
  }

  async enable({app}: ModuleContext): Promise<void> {
    await app.whenReady();
    if (this.#openDevTools) {
      await installExtension(extensionsDictionary[this.#extension]);
    }
  }
}

export function chromeDevToolsExtension(...args: ConstructorParameters<typeof ChromeDevToolsExtension>) {
  return new ChromeDevToolsExtension(...args);
}
