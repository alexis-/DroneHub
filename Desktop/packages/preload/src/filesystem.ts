//#region [IMPORTS]

import { ipcRenderer } from "electron";

/*
 * Docs: https://electronjs.org/docs/api/structures/file-filter
 */
export interface FileFilter {
  extensions: string[];
  name: string;
}

export interface FilePickerProperties {
  /**
   * Allow files to be selected
   */
  openFile?: boolean;
  /**
   * Allow directories to be selected
   */
  openDirectory?: boolean;
  /**
   * Allow multiple paths to be selected
   */
  multiSelections?: boolean;
  /**
   * Show hidden files in dialog
   */
  showHiddenFiles?: boolean;
  /**
   * Allow creating new directories from dialog
   */
  createDirectory?: boolean;
  /**
   * Prompt for creation if path entered in dialog does not exist
   */
  promptToCreate?: boolean;
  /**
   * Disable the automatic alias (symlink) path resolution
   */
  noResolveAliases?: boolean;
  /**
   * Treat packages (like .app folders) as directories
   */
  treatPackageAsDirectory?: boolean;
  /**
   * Don't add the item being chosen to recent documents list
   */
  dontAddToRecent?: boolean;
}

export interface FilePickerOptions {
  title?: string;
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: FileFilter[];
  /**
   * Message to display above input boxes.
   *
   * @platform darwin
   */
  message?: string;
  properties?: FilePickerProperties;
}

//#endregion



//#region [FILE PICKER FUNCTIONS]

/**
 * Converts FilePickerProperties to an array of property strings.
 *
 * @param props - The properties object to convert.
 * @returns Array of property names.
 */
function convertProperties(
  props?: FilePickerProperties
): Array<
  'openFile' |
  'openDirectory' |
  'multiSelections' |
  'showHiddenFiles' |
  'createDirectory' |
  'promptToCreate' |
  'noResolveAliases' |
  'treatPackageAsDirectory' |
  'dontAddToRecent'
> {
  if (!props) return ['openFile'];

  return Object.entries(props)
    .filter(([_, value]) => value === true)
    .map(([key]) => key) as Array<
      'openFile' |
      'openDirectory' |
      'multiSelections' |
      'showHiddenFiles' |
      'createDirectory' |
      'promptToCreate' |
      'noResolveAliases' |
      'treatPackageAsDirectory' |
      'dontAddToRecent'
    >;
}

/**
 * Opens a file picker dialog via IPC.
 *
 * @param options - Options for the file picker dialog.
 * @returns A promise resolving to the selected file(s).
 */
export async function showFilePicker(options: FilePickerOptions = {}) {
  return await ipcRenderer.invoke('show-file-picker', {
    ...options,
    properties: convertProperties({ openFile: true, ...options.properties }),
  });
}

/**
 * Opens a folder picker dialog via IPC.
 *
 * @param options - Options for the folder picker dialog.
 * @returns A promise resolving to the selected folder(s).
 */
export async function showFolderPicker(options: FilePickerOptions = {}) {
  return await ipcRenderer.invoke('show-file-picker', {
    ...options,
    properties: convertProperties({ openDirectory: true, ...options.properties }),
  });
}

//#endregion



//#region [FILE OPERATIONS]

/**
 * Reads a file via IPC.
 *
 * @param filePath - The path of the file to read.
 * @param encoding - The file encoding ('utf8' or 'binary').
 * @returns A promise resolving to the file content.
 */
export async function readFile(filePath: string, encoding: 'utf8'): Promise<string>;
export async function readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
export async function readFile(filePath: string): Promise<string>;
export async function readFile(filePath: string, encoding?: 'utf8' | 'binary'): Promise<string | ArrayBuffer> {
  const result = await ipcRenderer.invoke('read-file', filePath, encoding || 'utf8');
  if (encoding === 'binary') {
    // Convert Node.js Buffer to ArrayBuffer
    const buffer = result as Buffer;
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  return result as string;
}

/**
 * Writes data to a file via IPC.
 *
 * @param filePath - The path of the file to write.
 * @param data - The data to write (string or ArrayBuffer).
 */
export async function writeFile(filePath: string, data: string | ArrayBuffer): Promise<void> {
  if (data instanceof ArrayBuffer) {
    // Convert ArrayBuffer to Buffer for Node.js
    data = Buffer.from(data);
  }
  await ipcRenderer.invoke('write-file', filePath, data, 'utf8');
}

//#endregion



//#region [GET APP ROOT FUNCTION]

/**
 * Retrieves the application root directory.
 * In an Electron environment, this returns the Electron userData path (optionally appended with a subfolder).
 *
 * @param subFolder - Optional subfolder(s) to append (e.g., "sub/folder").
 * @returns The application root path.
 */
export function getAppRoot(subFolder?: string): string {
  return ipcRenderer.sendSync('get-app-root-sync', subFolder);
}

//#endregion
