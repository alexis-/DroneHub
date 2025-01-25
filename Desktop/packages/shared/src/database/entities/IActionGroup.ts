import type { IActionActionGroupJoin } from './IActionActionGroupJoin.js';
import type { IActionGroupWaypointJoin } from './IActionGroupWaypointJoin.js';

export interface IActionGroup {
    id: number;
    triggerType: number;
    triggerParam: number;
    actionJoins: IActionActionGroupJoin[];
    waypointJoins: IActionGroupWaypointJoin[];
} 