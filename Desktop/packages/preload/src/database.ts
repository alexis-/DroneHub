import { ipcRenderer } from 'electron'
import type { IProject } from '@dhlib/models/core/interfaces/IProject.js'
import type { IRoute } from '@dhlib/models/core/interfaces/missions/IRoute.js'
import type { IDroneType } from '@dhlib/models/core/interfaces/missions/IDroneType.js'
import type { IZone } from '@dhlib/models/core/interfaces/missions/IZone.js'

export interface DatabaseAPI {
  projects: {
    getAll: (loadRelations?: boolean) => Promise<IProject[]>
    getById: (id: number, loadRelations?: boolean) => Promise<IProject>
    create: (data: Partial<IProject>) => Promise<IProject>
    update: (id: number, data: Partial<IProject>) => Promise<IProject>
    delete: (id: number, cascade: boolean) => Promise<void>
  }
  zones: {
    getAll: (loadRelations?: boolean) => Promise<IZone[]>
    getById: (id: number, loadRelations?: boolean) => Promise<IZone>
    create: (data: Partial<IZone>) => Promise<IZone>
    update: (id: number, data: Partial<IZone>) => Promise<IZone>
    delete: (id: number) => Promise<void>
  }
  routes: {
    getAll: (loadRelations?: boolean) => Promise<IRoute[]>
    getById: (id: number, loadRelations?: boolean) => Promise<IRoute>
    create: (data: Partial<IRoute>) => Promise<IRoute>
    update: (id: number, data: Partial<IRoute>) => Promise<IRoute>
    delete: (id: number) => Promise<void>
  }
  droneTypes: {
    getAll: () => Promise<IDroneType[]>
    getById: (id: number) => Promise<IDroneType>
    create: (data: Partial<IDroneType>) => Promise<IDroneType>
    update: (id: number, data: Partial<IDroneType>) => Promise<IDroneType>
    delete: (id: number) => Promise<void>
  }
}

export const databaseApi: DatabaseAPI = {
  projects: {
    getAll: () => ipcRenderer.invoke('db:projects:getAll'),
    getById: (id) => ipcRenderer.invoke('db:projects:getById', id),
    create: (data) => ipcRenderer.invoke('db:projects:create', data),
    update: (id, data) => ipcRenderer.invoke('db:projects:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:projects:delete', id)
  },
  routes: {
    getAll: () => ipcRenderer.invoke('db:routes:getAll'),
    getById: (id) => ipcRenderer.invoke('db:routes:getById', id),
    create: (data) => ipcRenderer.invoke('db:routes:create', data),
    update: (id, data) => ipcRenderer.invoke('db:routes:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:routes:delete', id)
  },
  droneTypes: {
    getAll: () => ipcRenderer.invoke('db:droneTypes:getAll'),
    getById: (id) => ipcRenderer.invoke('db:droneTypes:getById', id),
    create: (data) => ipcRenderer.invoke('db:droneTypes:create', data),
    update: (id, data) => ipcRenderer.invoke('db:droneTypes:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:droneTypes:delete', id)
  },
  zones: {
    getAll: () => ipcRenderer.invoke('db:zones:getAll'),
    getById: (id) => ipcRenderer.invoke('db:zones:getById', id),
    create: (data) => ipcRenderer.invoke('db:zones:create', data),
    update: (id, data) => ipcRenderer.invoke('db:zones:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:zones:delete', id)
  }
} 