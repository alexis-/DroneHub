import type { InjectionKey } from 'vue';
import type { IViewModelStore } from './interfaces/IViewModelStore';
import type { ILoggerService } from './interfaces/ILoggerService';
import type { IFilesystemService } from './interfaces/IFilesystemService';

export const ViewModelStoreKey: InjectionKey<IViewModelStore> = Symbol('ViewModelStore');
export const LoggerServiceKey: InjectionKey<ILoggerService> = Symbol('LoggerService');
export const FilePickerServiceKey: InjectionKey<IFilesystemService> = Symbol('FilePickerService');