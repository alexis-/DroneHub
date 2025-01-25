export interface FilePickerResult {
  /**
   * whether or not the dialog was canceled.
   */
  canceled: boolean;
  /**
   * An array of file paths chosen by the user. If the dialog is cancelled this will
   * be an empty array.
   */
  filePaths: string[];
  /**
   * An array matching the `filePaths` array of base64 encoded strings which contains
   * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
   * this to be populated. (For return values, see table here.)
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

export interface IFilesystemService {
  showFilePicker(options: FilePickerOptions): Promise<FilePickerResult>;
  showFolderPicker(options: FilePickerOptions): Promise<FilePickerResult>;
  readFile(filePath: string, encoding: 'utf8'): Promise<string>;
  readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, data: string | ArrayBuffer, encoding?: 'utf8' | 'binary'): Promise<void>;
}