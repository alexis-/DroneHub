import type { IRoute } from './IRoute.js';
import type { IActionGroupWaypointJoin } from './IActionGroupWaypointJoin.js';

export interface IWaypoint {
    id: number;
    route: IRoute;
    sequenceNumber: number;
    latitude: number;
    longitude: number;
    elevation: number;
    speed?: number;
    headingMode?: number;
    heading?: number;
    turnMode?: number;
    turnDampingDist?: number;
    isRisky?: boolean;
    actionGroupJoins: IActionGroupWaypointJoin[];
    createdAt: Date;
    updatedAt: Date;
} 