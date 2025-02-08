import type { InjectionKey } from 'vue';
import type { IAppStatePersistenceService } from './interfaces/IAppStatePersistenceService';
import type { ILoggerService } from './interfaces/ILoggerService';
import type { IFilesystemService } from './interfaces/IFilesystemService';

export const AppStatePersistenceServiceKey: InjectionKey<IAppStatePersistenceService> = Symbol('AppStatePersistenceService');
export const FilePickerServiceKey: InjectionKey<IFilesystemService> = Symbol('FilePickerService');
export const LoggerServiceKey: InjectionKey<ILoggerService> = Symbol('LoggerService');