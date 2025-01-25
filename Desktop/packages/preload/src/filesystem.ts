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

function convertProperties(props?: FilePickerProperties): Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'> {
  if (!props) return ['openFile'];
  
  return Object.entries(props)
    .filter(([_, value]) => value === true)
    .map(([key]) => key) as Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
}

export async function showFilePicker(options: FilePickerOptions = {}) {
  return await ipcRenderer.invoke('show-file-picker', {
    ...options,
    properties: convertProperties({ openFile: true, ...options.properties }),
  });
}

export async function showFolderPicker(options: FilePickerOptions = {}) {
  return await ipcRenderer.invoke('show-file-picker', {
    ...options,
    properties: convertProperties({ openDirectory: true, ...options.properties }),
  });
}

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

export async function writeFile(filePath: string, data: string | ArrayBuffer, encoding?: 'utf8' | 'binary'): Promise<void> {
  if (data instanceof ArrayBuffer) {
    // Convert ArrayBuffer to Buffer for Node.js
    data = Buffer.from(data);
  }
  await ipcRenderer.invoke('write-file', filePath, data, encoding);
}
