import { ipcMain } from 'electron'
import { DatabaseService } from '../services/database-service.js'

const dbService = new DatabaseService()

export function setupDatabaseHandlers() {
  // Projects
  ipcMain.handle('db:projects:getAll', (_, loadRelations = true) => dbService.getAllProjects(loadRelations))
  ipcMain.handle('db:projects:getById', (_, id: number, loadRelations = true) => dbService.getProjectById(id, loadRelations))
  ipcMain.handle('db:projects:create', (_, data: any) => dbService.createProject(data))
  ipcMain.handle('db:projects:update', (_, id: number, data: any) => dbService.updateProject(id, data))
  ipcMain.handle('db:projects:delete', (_, id: number, cascade: boolean) => dbService.deleteProject(id, cascade))

  // Routes
  ipcMain.handle('db:routes:getAll', (_, loadRelations = true) => dbService.getAllRoutes(loadRelations))
  ipcMain.handle('db:routes:getById', (_, id: number, loadRelations = true) => dbService.getRouteById(id, loadRelations))
  ipcMain.handle('db:routes:create', (_, data: any) => dbService.createRoute(data))
  ipcMain.handle('db:routes:update', (_, id: number, data: any) => dbService.updateRoute(id, data))
  ipcMain.handle('db:routes:delete', (_, id: number, cascade: boolean) => dbService.deleteRoute(id, cascade))

  // DroneTypes
  ipcMain.handle('db:droneTypes:getAll', () => dbService.getAllDroneTypes())
  ipcMain.handle('db:droneTypes:getById', (_, id: number) => dbService.getDroneTypeById(id))
  ipcMain.handle('db:droneTypes:create', (_, data: any) => dbService.createDroneType(data))
  ipcMain.handle('db:droneTypes:update', (_, id: number, data: any) => dbService.updateDroneType(id, data))
  ipcMain.handle('db:droneTypes:delete', (_, id: number) => dbService.deleteDroneType(id))

  // Waypoints
  ipcMain.handle('db:waypoints:getAll', (_, loadRelations = true) => dbService.getAllWaypoints(loadRelations))
  ipcMain.handle('db:waypoints:getById', (_, id: number, loadRelations = true) => dbService.getWaypointById(id, loadRelations))
  ipcMain.handle('db:waypoints:create', (_, data: any) => dbService.createWaypoint(data))
  ipcMain.handle('db:waypoints:update', (_, id: number, data: any) => dbService.updateWaypoint(id, data))
  ipcMain.handle('db:waypoints:delete', (_, id: number) => dbService.deleteWaypoint(id))

  // Actions
  ipcMain.handle('db:actions:getAll', () => dbService.getAllActions())
  ipcMain.handle('db:actions:getById', (_, id: number) => dbService.getActionById(id))
  ipcMain.handle('db:actions:create', (_, data: any) => dbService.createAction(data))
  ipcMain.handle('db:actions:update', (_, id: number, data: any) => dbService.updateAction(id, data))
  ipcMain.handle('db:actions:delete', (_, id: number) => dbService.deleteAction(id))

  // ActionGroups
  ipcMain.handle('db:actionGroups:getAll', () => dbService.getAllActionGroups())
  ipcMain.handle('db:actionGroups:getById', (_, id: number) => dbService.getActionGroupById(id))
  ipcMain.handle('db:actionGroups:create', (_, data: any) => dbService.createActionGroup(data))
  ipcMain.handle('db:actionGroups:update', (_, id: number, data: any) => dbService.updateActionGroup(id, data))
  ipcMain.handle('db:actionGroups:delete', (_, id: number) => dbService.deleteActionGroup(id))

  // ActionParams
  ipcMain.handle('db:actionParams:getAll', () => dbService.getAllActionParams())
  ipcMain.handle('db:actionParams:getById', (_, id: number) => dbService.getActionParamById(id))
  ipcMain.handle('db:actionParams:create', (_, data: any) => dbService.createActionParam(data))
  ipcMain.handle('db:actionParams:update', (_, id: number, data: any) => dbService.updateActionParam(id, data))
  ipcMain.handle('db:actionParams:delete', (_, id: number) => dbService.deleteActionParam(id))
} 