import type { IActionActionGroupJoin } from './IActionActionGroupJoin.js';
import type { IActionActionParamJoin } from './IActionActionParamJoin.js';

export interface IAction {
    actionActuatorFunc: number;
    paramJoins: IActionActionParamJoin[];
    actionGroupJoins: IActionActionGroupJoin[];
} 