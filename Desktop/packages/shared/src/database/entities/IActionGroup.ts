import type { IActionActionGroupJoin } from './IActionActionGroupJoin';
import type { IActionGroupWaypointJoin } from './IActionGroupWaypointJoin';

export interface IActionGroup {
    id: number;
    triggerType: number;
    triggerParam: number;
    actionJoins: IActionActionGroupJoin[];
    waypointJoins: IActionGroupWaypointJoin[];
} 