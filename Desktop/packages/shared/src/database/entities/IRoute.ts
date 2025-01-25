import type { IProject } from './IProject.js';
import type { IDroneType } from './IDroneType.js';
import type { IWaypoint } from './IWaypoint.js';

export interface IRoute {
    id: number;
    name: string;
    project: IProject;
    droneType: IDroneType;
    flyToWaylineMode: number;
    finishAction: number;
    exitOnRCLost: boolean;
    executeRCLostAction: boolean;
    globalTransitionalSpeed: number;
    waylineId: string;
    distance?: number;
    duration?: number;
    autoFlightSpeed: number;
    maxFlightSpeed?: number;
    returnToHomeAltitude?: number;
    waypoints: IWaypoint[];
    createdAt: Date;
    updatedAt: Date;
} 