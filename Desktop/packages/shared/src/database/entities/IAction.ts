import type { IActionActionGroupJoin } from './IActionActionGroupJoin';
import type { IActionActionParamJoin } from './IActionActionParamJoin';

export interface IAction {
    actionActuatorFunc: number;
    paramJoins: IActionActionParamJoin[];
    actionGroupJoins: IActionActionGroupJoin[];
} 