//#region [ELECTRON APP STATE PERSISTENCE SERVICE]

import type { IAppStatePersistenceService } from '#models/interfaces/IAppStatePersistenceService';
import type { IFilesystemService } from '#models/interfaces/IFilesystemService';
import { serializeViewModel } from '#utils/json-serialization';

/**
 * ElectronAppStatePersistenceService implements IAppStatePersistenceService for Electron apps.
 * It uses the injected IFilesystemService to read and write JSON files to a designated state folder.
 */
export class ElectronAppStatePersistenceService implements IAppStatePersistenceService {
  
  /**
   * Creates an instance of ElectronAppStatePersistenceService.
   *
   * @param filesystem The injected file system service for performing file operations.
   */
  constructor(private filesystem: IFilesystemService) {
    // Define the state folder based on the app root. The 'state' subfolder is used to store persisted view models.
    this.stateFolder = this.filesystem.getAppRoot('state');
  }
  
  /**
   * The folder where state files are stored.
   */
  private stateFolder: string;

  /**
   * Persists the view model state by writing it to a JSON file.
   * Properties marked with @Transient are omitted from the serialized output.
   *
   * @param id Unique identifier for the view model.
   * @param state The state object to persist.
   * @returns A promise that resolves when the state is successfully saved.
   */
  async saveViewModel(id: string, state: any): Promise<void> {
    const filePath = `${this.stateFolder}/${id}.json`;
    // Serialize the state using our generic serialization function to omit transient properties.
    const data = serializeViewModel(state);
    await this.filesystem.writeFile(filePath, data);
  }

  /**
   * Loads the persisted view model state from its corresponding JSON file.
   *
   * @param id Unique identifier for the view model.
   * @returns A promise that resolves with the state object or null if not found.
   */
  async loadViewModel(id: string): Promise<any> {
    const filePath = `${this.stateFolder}/${id}.json`;
    try {
      const data = (await this.filesystem.readFile(filePath, 'utf8')) as string;
      return JSON.parse(data);
    } catch (error) {
      // File not found or invalid JSON; return null.
      return null;
    }
  }
}

//#endregion
