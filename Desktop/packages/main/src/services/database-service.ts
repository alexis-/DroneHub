import { AppDataSource } from '../database/connection.js'
import { Project, Route, DroneType, Zone } from '../database/entities/index.js';

export class DatabaseService {
  private getProjectRelations(loadRelations?: boolean): string[] {
    if (!loadRelations) return []
    return [
      'zones',
      'zones.routes',
      'zones.routes.droneType',
    ]
  }

  private getZoneRelations(loadRelations?: boolean): string[] {
    if (!loadRelations) return []
    return [
      'routes',
      'routes.droneType',
    ]
  }

  private getRouteRelations(loadRelations?: boolean): string[] {
    if (!loadRelations) return []
    return [
      'droneType',
    ]
  }

  // Projects
  async getAllProjects(loadRelations = true) {
    const projectRepo = AppDataSource.getRepository(Project)
    return projectRepo.find({
      relations: this.getProjectRelations(loadRelations)
    })
  }

  async getProjectById(id: number, loadRelations = true) {
    const projectRepo = AppDataSource.getRepository(Project)
    return projectRepo.findOne({
      where: { id },
      relations: this.getProjectRelations(loadRelations)
    })
  }

  async createProject(data: Partial<Project>) {
    const projectRepo = AppDataSource.getRepository(Project)

    // Create project first without zones
    const { zones, ...projectData } = data
    const project = projectRepo.create(projectData)
    const savedProject = await projectRepo.save(project)

    if (zones?.length) {
      // Create zones with their relations
      const savedZones = await Promise.all(
        zones.map(zone => this.createZone({ ...zone, project: savedProject }))
      )
      savedProject.zones = savedZones
    }
    
    return savedProject
  }

  async updateProject(id: number, data: Partial<Project>) {
    const projectRepo = AppDataSource.getRepository(Project)
    await projectRepo.update(id, data)
    return this.getProjectById(id)
  }

  async deleteProject(id: number, cascade: boolean = true) {
    const projectRepo = AppDataSource.getRepository(Project)
    if (cascade) {
      const project = await this.getProjectById(id, true)
      if (project) {
        for (const zone of project.zones || []) {
          await this.deleteZone(zone.id, true)
        }
      }
    }
    await projectRepo.delete(id)
  }

  // Zones
  async getAllZones(loadRelations = true) {
    const zoneRepo = AppDataSource.getRepository(Zone)
    return zoneRepo.find({
      relations: this.getZoneRelations(loadRelations)
    })
  }

  async getZoneById(id: number, loadRelations = true) {
    const zoneRepo = AppDataSource.getRepository(Zone)
    return zoneRepo.findOne({
      where: { id },
      relations: this.getZoneRelations(loadRelations)
    })
  }

  async createZone(data: Partial<Zone>) {
    const zoneRepo = AppDataSource.getRepository(Zone)
    
    // Create zone without routes first
    const { routes, ...zoneData } = data
    const zone = zoneRepo.create(zoneData)
    const savedZone = await zoneRepo.save(zone)
    
    if (routes?.length) {
      // Create routes with their relations
      const savedRoutes = await Promise.all(
        routes.map(route => this.createRoute({ ...route, zone: savedZone }))
      )
      savedZone.routes = savedRoutes
    }
    
    return savedZone
  }

  async updateZone(id: number, data: Partial<Zone>) {
    const zoneRepo = AppDataSource.getRepository(Zone)
    await zoneRepo.update(id, data)
    return this.getZoneById(id)
  }

  async deleteZone(id: number, cascade: boolean = true) {
    const zoneRepo = AppDataSource.getRepository(Zone)
    if (cascade) {
      const zone = await this.getZoneById(id, true)
      if (zone) {
        for (const route of zone.routes || []) {
          await this.deleteRoute(route.id)
        }
      }
    }
    await zoneRepo.delete(id)
  }

  // Routes
  async getAllRoutes(loadRelations = true) {
    const routeRepo = AppDataSource.getRepository(Route)
    return routeRepo.find({
      relations: this.getRouteRelations(loadRelations)
    })
  }

  async getRouteById(id: number, loadRelations = true) {
    const routeRepo = AppDataSource.getRepository(Route)
    return routeRepo.findOne({
      where: { id },
      relations: this.getRouteRelations(loadRelations)
    })
  }

  async createRoute(data: Partial<Route>) {
    const routeRepo = AppDataSource.getRepository(Route)
    
    // Create route without waypoints first
    const route = routeRepo.create(data)
    
    return await routeRepo.save(route)
  }

  async updateRoute(id: number, data: Partial<Route>) {
    const routeRepo = AppDataSource.getRepository(Route)
    await routeRepo.update(id, data)
    return this.getRouteById(id)
  }

  async deleteRoute(id: number) {
    const routeRepo = AppDataSource.getRepository(Route)
    await routeRepo.delete(id)
  }

  // DroneTypes
  async getAllDroneTypes() {
    const repo = AppDataSource.getRepository(DroneType)
    return repo.find()
  }

  async getDroneTypeById(id: number) {
    const repo = AppDataSource.getRepository(DroneType)
    return repo.findOneBy({ id })
  }

  async createDroneType(data: Partial<DroneType>) {
    const repo = AppDataSource.getRepository(DroneType)
    const droneType = repo.create(data)
    return repo.save(droneType)
  }

  async updateDroneType(id: number, data: Partial<DroneType>) {
    const repo = AppDataSource.getRepository(DroneType)
    await repo.update(id, data)
    return this.getDroneTypeById(id)
  }

  async deleteDroneType(id: number) {
    const repo = AppDataSource.getRepository(DroneType)
    await repo.delete(id)
  }
}