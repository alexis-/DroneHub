import type { FilePickerOptions, IFilesystemService } from "@dhlib/models/interfaces/IFilesystemService";
import { showFilePicker as showFilePickerIpc, showFolderPicker as showFolderPickerIpc, readFile as readFileIpc, writeFile as writeFileIpc } from "@vite-electron-builder/preload";

export class FilesystemService implements IFilesystemService {
  showFilePicker(options: FilePickerOptions): Promise<any> {
    return showFilePickerIpc(options);
  }
  
  showFolderPicker(options: FilePickerOptions): Promise<any> {
    return showFolderPickerIpc(options);
  }

  readFile(filePath: string, encoding: 'utf8'): Promise<string>;
  readFile(filePath: string, encoding: 'binary'): Promise<ArrayBuffer>;
  readFile(filePath: string): Promise<string>;
  readFile(filePath: string, encoding?: 'utf8' | 'binary'): Promise<string | ArrayBuffer> {
    return readFileIpc(filePath, encoding as any);
  }

  writeFile(filePath: string, data: string | ArrayBuffer, encoding?: 'utf8' | 'binary'): Promise<void> {
    return writeFileIpc(filePath, data, encoding);
  }
}

// Export singleton instance
export const Filesystem = new FilesystemService();