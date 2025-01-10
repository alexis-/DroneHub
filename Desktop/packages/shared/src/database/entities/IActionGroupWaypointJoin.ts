import type { IWaypoint } from './IWaypoint';
import type { IActionGroup } from './IActionGroup';

export interface IActionGroupWaypointJoin {
    id: number;
    waypoint: IWaypoint;
    actionGroup: IActionGroup;
    sequenceNumber: number;
    actionGroupStartIndex: number;
    actionGroupEndIndex: number;
    actionGroupMode: number;
} 