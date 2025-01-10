import { AppDataSource } from '../database/connection'
import { Project, Route, DroneType, Waypoint, Action, ActionGroup, ActionParam, ActionActionGroupJoin, ActionGroupWaypointJoin, ActionActionParamJoin } from '../database/entities'

export class DatabaseService {
  private getProjectRelations(loadRelations?: boolean): string[] {
    if (!loadRelations) return []
    return [
      'routes',
      'routes.waypoints',
      'routes.droneType',
      'routes.waypoints.actionGroupJoins',
      'routes.waypoints.actionGroupJoins.actionGroup',
      'routes.waypoints.actionGroupJoins.actionGroup.actionJoins',
      'routes.waypoints.actionGroupJoins.actionGroup.actionJoins.action',
      'routes.waypoints.actionGroupJoins.actionGroup.actionJoins.action.paramJoins',
      'routes.waypoints.actionGroupJoins.actionGroup.actionJoins.action.paramJoins.actionParam'
    ]
  }

  private getRouteRelations(loadRelations?: boolean): string[] {
    if (!loadRelations) return []
    return [
      'waypoints',
      'droneType',
      'waypoints.actionGroupJoins',
      'waypoints.actionGroupJoins.actionGroup',
      'waypoints.actionGroupJoins.actionGroup.actionJoins',
      'waypoints.actionGroupJoins.actionGroup.actionJoins.action',
      'waypoints.actionGroupJoins.actionGroup.actionJoins.action.paramJoins',
      'waypoints.actionGroupJoins.actionGroup.actionJoins.action.paramJoins.actionParam'
    ]
  }

  private getWaypointRelations(loadRelations?: boolean, specificRelations?: string[]): string[] {
    if (!loadRelations) return []
    if (specificRelations) return specificRelations
    return [
      'route',
      'actionGroupJoins',
      'actionGroupJoins.actionGroup',
      'actionGroupJoins.actionGroup.actionJoins',
      'actionGroupJoins.actionGroup.actionJoins.action',
      'actionGroupJoins.actionGroup.actionJoins.action.paramJoins',
      'actionGroupJoins.actionGroup.actionJoins.action.paramJoins.actionParam'
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
    const project = projectRepo.create(data)
    return projectRepo.save(project)
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
        for (const route of project.routes || []) {
          await this.deleteRoute(route.id, true)
        }
      }
    }
    await projectRepo.delete(id)
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
    const waypointRepo = AppDataSource.getRepository(Waypoint)
    
    // Create route without waypoints first
    const { waypoints, ...routeData } = data
    const route = routeRepo.create(routeData)
    const savedRoute = await routeRepo.save(route)
    
    if (waypoints?.length) {
      // Create waypoints with their relations
      const savedWaypoints = await Promise.all(
        waypoints.map(wp => this.createWaypoint({ ...wp, route: savedRoute }))
      )
      savedRoute.waypoints = savedWaypoints
    }
    
    return savedRoute
  }

  async updateRoute(id: number, data: Partial<Route>) {
    const routeRepo = AppDataSource.getRepository(Route)
    await routeRepo.update(id, data)
    return this.getRouteById(id)
  }

  async deleteRoute(id: number, cascade: boolean = true) {
    const routeRepo = AppDataSource.getRepository(Route)
    if (cascade) {
      const route = await this.getRouteById(id, true)
      if (route) {
        for (const waypoint of route.waypoints || []) {
          await this.deleteWaypoint(waypoint.id)
        }
      }
    }
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

  // Waypoints
  async getAllWaypoints(loadRelations = true, specificRelations?: string[]) {
    const repo = AppDataSource.getRepository(Waypoint)
    return repo.find({
      relations: this.getWaypointRelations(loadRelations, specificRelations)
    })
  }

  async getWaypointById(id: number, loadRelations = true, specificRelations?: string[]) {
    const repo = AppDataSource.getRepository(Waypoint)
    return repo.findOne({
      where: { id },
      relations: this.getWaypointRelations(loadRelations, specificRelations)
    })
  }

  async createWaypoint(data: Partial<Waypoint>) {
    const waypointRepo = AppDataSource.getRepository(Waypoint)
    const actionGroupRepo = AppDataSource.getRepository(ActionGroup)
    const joinRepo = AppDataSource.getRepository(ActionGroupWaypointJoin)
    
    // Extract actionGroupJoins to handle separately
    const { actionGroupJoins, ...waypointData } = data
    
    // Create and save waypoint
    const waypoint = waypointRepo.create(waypointData)
    const savedWaypoint = await waypointRepo.save(waypoint)
    
    if (actionGroupJoins?.length) {
      // Process each action group join
      const savedJoins = await Promise.all(actionGroupJoins.map(async join => {
        // Check if action group already exists by comparing properties
        const existingActionGroup = await actionGroupRepo.findOne({
          where: {
            triggerType: join.actionGroup.triggerType,
            triggerParam: join.actionGroup.triggerParam
          }
        })
        
        // Use existing or create new action group
        const actionGroup = existingActionGroup || 
          await this.createActionGroup(join.actionGroup)
        
        // Create the join
        const joinData = {
          ...join,
          waypoint: savedWaypoint,
          actionGroup
        }
        const newJoin = joinRepo.create(joinData)
        return joinRepo.save(newJoin)
      }))
      
      savedWaypoint.actionGroupJoins = savedJoins
    }
    
    return savedWaypoint
  }

  async updateWaypoint(id: number, data: Partial<Waypoint>) {
    const repo = AppDataSource.getRepository(Waypoint)
    await repo.update(id, data)
    return this.getWaypointById(id)
  }

  async deleteWaypoint(id: number) {
    const waypointRepo = AppDataSource.getRepository(Waypoint)
    const joinRepo = AppDataSource.getRepository(ActionGroupWaypointJoin)

    await joinRepo.createQueryBuilder()
      .delete()
      .where("waypointId = :id", { id })
      .execute()

    await waypointRepo.delete(id)
  }

  // Actions
  async getAllActions() {
    const repo = AppDataSource.getRepository(Action)
    return repo.find()
  }

  async getActionById(id: number) {
    const repo = AppDataSource.getRepository(Action)
    return repo.findOneBy({ actionActuatorFunc: id })
  }

  async createAction(data: Partial<Action>) {
    const actionRepo = AppDataSource.getRepository(Action)
    const paramRepo = AppDataSource.getRepository(ActionParam)
    const joinRepo = AppDataSource.getRepository(ActionActionParamJoin)
    
    // Extract paramJoins to handle separately
    const { paramJoins, ...actionData } = data
    
    // Create and save action
    const action = actionRepo.create(actionData)
    const savedAction = await actionRepo.save(action)
    
    if (paramJoins?.length) {
        // Process each param join
        const savedJoins = await Promise.all(paramJoins.map(async join => {
            // Check if param already exists
            const existingParam = await paramRepo.findOne({
                where: {
                    type: join.actionParam.type,
                    value: join.actionParam.value
                }
            })
            
            // Use existing or create new param
            const actionParam = existingParam || 
                await paramRepo.save(paramRepo.create(join.actionParam))
            
            // Create the join
            const joinData = {
                ...join,
                action: savedAction,
                actionParam
            }
            const newJoin = joinRepo.create(joinData)
            return joinRepo.save(newJoin)
        }))
        
        savedAction.paramJoins = savedJoins
    }
    
    return savedAction
  }

  async updateAction(id: number, data: Partial<Action>) {
    const repo = AppDataSource.getRepository(Action)
    await repo.update(id, data)
    return this.getActionById(id)
  }

  async deleteAction(id: number) {
    const repo = AppDataSource.getRepository(Action)
    await repo.delete(id)
  }

  // ActionGroups
  async getAllActionGroups() {
    const repo = AppDataSource.getRepository(ActionGroup)
    return repo.find()
  }

  async getActionGroupById(id: number) {
    const repo = AppDataSource.getRepository(ActionGroup)
    return repo.findOneBy({ id })
  }

  async createActionGroup(data: Partial<ActionGroup>) {
    const actionGroupRepo = AppDataSource.getRepository(ActionGroup)
    const actionRepo = AppDataSource.getRepository(Action)
    const actionJoinRepo = AppDataSource.getRepository(ActionActionGroupJoin)
    
    // Extract actionJoins to handle separately
    const { actionJoins, ...groupData } = data
    
    // Create and save action group
    const actionGroup = actionGroupRepo.create(groupData)
    const savedActionGroup = await actionGroupRepo.save(actionGroup)
    
    if (actionJoins?.length) {
      // Process each action join
      const savedJoins = await Promise.all(actionJoins.map(async join => {
        // Check if action already exists by comparing essential properties
        const existingAction = await actionRepo.findOne({
          where: {
            actionActuatorFunc: join.action.actionActuatorFunc,
            // Add other identifying properties as needed
          }
        })
        
        // Use existing or create new action
        const action = existingAction || 
          await this.createAction(join.action)
        
        // Create the join
        const joinData = {
          ...join,
          actionGroup: savedActionGroup,
          action
        }
        const newJoin = actionJoinRepo.create(joinData)
        return actionJoinRepo.save(newJoin)
      }))
      
      savedActionGroup.actionJoins = savedJoins
    }
    
    return savedActionGroup
  }

  async updateActionGroup(id: number, data: Partial<ActionGroup>) {
    const repo = AppDataSource.getRepository(ActionGroup)
    await repo.update(id, data)
    return this.getActionGroupById(id)
  }

  async deleteActionGroup(id: number) {
    const repo = AppDataSource.getRepository(ActionGroup)
    await repo.delete(id)
  }

  // ActionParams
  async getAllActionParams() {
    const repo = AppDataSource.getRepository(ActionParam)
    return repo.find()
  }

  async getActionParamById(id: number) {
    const repo = AppDataSource.getRepository(ActionParam)
    return repo.findOneBy({ id })
  }

  async createActionParam(data: Partial<ActionParam>) {
    const repo = AppDataSource.getRepository(ActionParam)
    const actionParam = repo.create(data)
    return repo.save(actionParam)
  }

  async updateActionParam(id: number, data: Partial<ActionParam>) {
    const repo = AppDataSource.getRepository(ActionParam)
    await repo.update(id, data)
    return this.getActionParamById(id)
  }

  async deleteActionParam(id: number) {
    const repo = AppDataSource.getRepository(ActionParam)
    await repo.delete(id)
  }
} 