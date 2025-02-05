//#region [IFILESYSTEMSERVICE INTERFACE]

/**
 * A file identifier represents either a file path (string) in Electron or a File object in browser environments.
 */
export type FileIdentifier = string | File;

/**
 * The result of a file or folder picker dialog.
 * - In Electron, `fileIdentifiers` will be file paths (string).
 * - In a browser, they may be File objects or handles.
 */
export interface FilePickerResult {
  /**
   * Indicates whether the dialog was canceled.
   */
  canceled: boolean;
  /**
   * An array of file identifiers chosen by the user.
   */
  fileIdentifiers: FileIdentifier[];
  /**
   * An optional array of base64 encoded security scoped bookmarks.
   *
   * @platform darwin,mas
   */
  bookmarks?: string[];
}

/*
 * Docs: https://electronjs.org/docs/api/structures/file-filter
 */
export interface FileFilter {
  extensions: string[];
  name: string;
}

export interface FilePickerProperties {
  /**
   * Allow files to be selected.
   */
  openFile?: boolean;
  /**
   * Allow directories to be selected.
   */
  openDirectory?: boolean;
  /**
   * Allow multiple selections.
   */
  multiSelections?: boolean;
  /**
   * Show hidden files in dialog.
   */
  showHiddenFiles?: boolean;
  /**
   * Allow creating new directories from the dialog.
   */
  createDirectory?: boolean;
  /**
   * Prompt for creation if the entered path does not exist.
   */
  promptToCreate?: boolean;
  /**
   * Disable the automatic alias (symlink) path resolution.
   */
  noResolveAliases?: boolean;
  /**
   * Treat packages (like .app folders) as directories.
   */
  treatPackageAsDirectory?: boolean;
  /**
   * Do not add the chosen item to recent documents list.
   */
  dontAddToRecent?: boolean;
}

export interface FilePickerOptions {
  title?: string;
  defaultPath?: string;
  /**
   * Custom label for the confirmation button. If not provided, the default is used.
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

/**
 * IFilesystemService provides file system operations that work in both Electron and browser environments.
 * - In Electron, file operations use IPC and file identifiers are file paths (strings).
 * - In browser implementations, file identifiers may be File objects or handles.
 */
export interface IFilesystemService {
  /**
   * Shows a file picker dialog.
   *
   * @param options - Options for the file picker.
   * @returns A promise that resolves with the file picker result.
   */
  showFilePicker(options: FilePickerOptions): Promise<FilePickerResult>;

  /**
   * Shows a folder picker dialog.
   *
   * @param options - Options for the folder picker.
   * @returns A promise that resolves with the folder picker result.
   */
  showFolderPicker(options: FilePickerOptions): Promise<FilePickerResult>;

  /**
   * Reads a file.
   * In Electron, the file parameter must be a file path (string).
   * In a browser, the file parameter can be a File object.
   *
   * @param file - The file identifier (path or File object).
   * @param encoding - The encoding to use ('utf8' or 'binary'). Defaults to 'utf8'.
   * @returns A promise that resolves with the file content.
   */
  readFile(file: string | File, encoding?: 'utf8' | 'binary'): Promise<string | ArrayBuffer>;

  /**
   * Writes data to a file.
   * In Electron, the file parameter must be a file path (string).
   * In a browser, the file parameter can be a File object (or a file handle if supported).
   *
   * @param file - The file identifier (path or File object).
   * @param data - The data to write.
   * @returns A promise that resolves when the write is complete.
   */
  writeFile(file: string | File, data: string | ArrayBuffer): Promise<void>;

  /**
   * Returns the application root path.
   *
   * @param subFolder - Optional subfolder(s) to append to the root.
   * @returns The application root path.
   */
  getAppRoot(subFolder?: string): string;
}

//#endregion
