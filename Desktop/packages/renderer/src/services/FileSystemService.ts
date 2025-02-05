//#region [IMPORTS]

import type { FilePickerOptions, IFilesystemService, FilePickerResult } from "@dhlib/models/interfaces/IFilesystemService";
import { 
  showFilePicker as showFilePickerIpc, 
  showFolderPicker as showFolderPickerIpc, 
  readFile as readFileIpc, 
  writeFile as writeFileIpc,
  getAppRoot as getAppRootIpc 
} from "@vite-electron-builder/preload";

//#endregion



//#region [FILESYSTEM SERVICE CLASS]

/**
 * FilesystemService implements IFilesystemService for Electron environments.
 * All file operations in Electron use file paths (strings).
 */
export class FilesystemService implements IFilesystemService {

  /**
   * Opens a file picker dialog.
   *
   * @param options - Options for the file picker.
   * @returns A promise resolving to the file picker result.
   */
  async showFilePicker(options: FilePickerOptions): Promise<FilePickerResult> {
    const result = await showFilePickerIpc(options);
    // Convert the returned file paths (strings) into fileIdentifiers.
    return {
      canceled: result.canceled,
      fileIdentifiers: result.filePaths,
      bookmarks: result.bookmarks
    };
  }
  
  /**
   * Opens a folder picker dialog.
   *
   * @param options - Options for the folder picker.
   * @returns A promise resolving to the folder picker result.
   */
  async showFolderPicker(options: FilePickerOptions): Promise<FilePickerResult> {
    const result = await showFolderPickerIpc(options);
    return {
      canceled: result.canceled,
      fileIdentifiers: result.filePaths,
      bookmarks: result.bookmarks
    };
  }

/**
   * Reads a file.
   * In Electron, the file parameter must be a file path (string).
   *
   * @param file - The file identifier (must be a string).
   * @param encoding - The encoding ('utf8' or 'binary'); defaults to 'utf8'.
   * @returns A promise resolving to the file content.
   */
async readFile(file: string | File, encoding: 'utf8' | 'binary' = 'utf8'): Promise<string | ArrayBuffer> {
  if (typeof file !== 'string') {
    throw new Error("Electron environment expects a file path string for readFile.");
  }

  if (encoding === 'binary') {
    // Call the IPC method with 'binary' encoding.
    const result = await readFileIpc(file, 'binary');
    // Cast result to Buffer via unknown to avoid type conflicts.
    const buffer = result as unknown as Buffer;
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  
  else {
    // Call the IPC method with 'utf8' encoding.
    return await readFileIpc(file, 'utf8');
  }
}

  /**
   * Writes data to a file.
   * In Electron, the file parameter must be a file path (string).
   *
   * @param file - The file identifier (must be a string).
   * @param data - The data to write.
   * @returns A promise that resolves when the write is complete.
   */
  async writeFile(file: string | File, data: string | ArrayBuffer): Promise<void> {
    if (typeof file !== 'string') {
      throw new Error("Electron environment expects a file path string for writeFile.");
    }
    return await writeFileIpc(file, data);
  }

  /**
   * Returns the application root path.
   *
   * @param subFolder - Optional subfolder(s) to append.
   * @returns The application root path.
   */
  getAppRoot(subFolder?: string): string {
    return getAppRootIpc(subFolder);
  }
}

//#endregion



//#region [EXPORT SINGLETON INSTANCE]

// Export a singleton instance for use across the application.
export const Filesystem = new FilesystemService();

//#endregion
