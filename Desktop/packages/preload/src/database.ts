import { ipcRenderer } from 'electron'
import type { IProject } from '@shared/database/entities/IProject.js'
import type { IRoute } from '@shared/database/entities/IRoute.js'
import type { IDroneType } from '@shared/database/entities/IDroneType.js'
import type { IWaypoint } from '@shared/database/entities/IWaypoint.js'
import type { IAction } from '@shared/database/entities/IAction.js'
import type { IActionGroup } from '@shared/database/entities/IActionGroup.js'
import type { IActionParam } from '@shared/database/entities/IActionParam.js'
import type { IActionActionGroupJoin } from '@shared/database/entities/IActionActionGroupJoin.js'
import type { IActionGroupWaypointJoin } from '@shared/database/entities/IActionGroupWaypointJoin.js'
import type { IActionActionParamJoin } from '@shared/database/entities/IActionActionParamJoin.js'

export interface DatabaseAPI {
  projects: {
    getAll: (loadRelations?: boolean) => Promise<IProject[]>
    getById: (id: number, loadRelations?: boolean) => Promise<IProject>
    create: (data: Partial<IProject>) => Promise<IProject>
    update: (id: number, data: Partial<IProject>) => Promise<IProject>
    delete: (id: number, cascade: boolean) => Promise<void>
  }
  routes: {
    getAll: (loadRelations?: boolean) => Promise<IRoute[]>
    getById: (id: number, loadRelations?: boolean) => Promise<IRoute>
    create: (data: Partial<IRoute>) => Promise<IRoute>
    update: (id: number, data: Partial<IRoute>) => Promise<IRoute>
    delete: (id: number, cascade: boolean) => Promise<void>
  }
  droneTypes: {
    getAll: () => Promise<IDroneType[]>
    getById: (id: number) => Promise<IDroneType>
    create: (data: Partial<IDroneType>) => Promise<IDroneType>
    update: (id: number, data: Partial<IDroneType>) => Promise<IDroneType>
    delete: (id: number) => Promise<void>
  }
  waypoints: {
    getAll: (loadRelations?: boolean) => Promise<IWaypoint[]>
    getById: (id: number, loadRelations?: boolean) => Promise<IWaypoint>
    create: (data: Partial<IWaypoint>) => Promise<IWaypoint>
    update: (id: number, data: Partial<IWaypoint>) => Promise<IWaypoint>
    delete: (id: number) => Promise<void>
  }
  actionGroups: {
    getAll: () => Promise<IActionGroup[]>
    getById: (id: number) => Promise<IActionGroup>
    create: (data: Partial<IActionGroup>) => Promise<IActionGroup>
    update: (id: number, data: Partial<IActionGroup>) => Promise<IActionGroup>
    delete: (id: number) => Promise<void>
  }
  actions: {
    getAll: () => Promise<IAction[]>
    getById: (id: number) => Promise<IAction>
    create: (data: Partial<IAction>) => Promise<IAction>
    update: (id: number, data: Partial<IAction>) => Promise<IAction>
    delete: (id: number) => Promise<void>
  }
  actionParams: {
    getAll: () => Promise<IActionParam[]>
    getById: (id: number) => Promise<IActionParam>
    create: (data: Partial<IActionParam>) => Promise<IActionParam>
    update: (id: number, data: Partial<IActionParam>) => Promise<IActionParam>
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
  waypoints: {
    getAll: () => ipcRenderer.invoke('db:waypoints:getAll'),
    getById: (id) => ipcRenderer.invoke('db:waypoints:getById', id),
    create: (data) => ipcRenderer.invoke('db:waypoints:create', data),
    update: (id, data) => ipcRenderer.invoke('db:waypoints:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:waypoints:delete', id)
  },
  actionGroups: {
    getAll: () => ipcRenderer.invoke('db:actionGroups:getAll'),
    getById: (id) => ipcRenderer.invoke('db:actionGroups:getById', id),
    create: (data) => ipcRenderer.invoke('db:actionGroups:create', data),
    update: (id, data) => ipcRenderer.invoke('db:actionGroups:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:actionGroups:delete', id)
  },
  actions: {
    getAll: () => ipcRenderer.invoke('db:actions:getAll'),
    getById: (id) => ipcRenderer.invoke('db:actions:getById', id),
    create: (data) => ipcRenderer.invoke('db:actions:create', data),
    update: (id, data) => ipcRenderer.invoke('db:actions:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:actions:delete', id)
  },
  actionParams: {
    getAll: () => ipcRenderer.invoke('db:actionParams:getAll'),
    getById: (id) => ipcRenderer.invoke('db:actionParams:getById', id),
    create: (data) => ipcRenderer.invoke('db:actionParams:create', data),
    update: (id, data) => ipcRenderer.invoke('db:actionParams:update', id, data),
    delete: (id) => ipcRenderer.invoke('db:actionParams:delete', id)
  }
} 