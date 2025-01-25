import type { IWaypoint } from './IWaypoint.js';
import type { IActionGroup } from './IActionGroup.js';

export interface IActionGroupWaypointJoin {
    id: number;
    waypoint: IWaypoint;
    actionGroup: IActionGroup;
    sequenceNumber: number;
    actionGroupStartIndex: number;
    actionGroupEndIndex: number;
    actionGroupMode: number;
} 