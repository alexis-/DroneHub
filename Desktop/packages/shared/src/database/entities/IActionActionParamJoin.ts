import type { IAction } from './IAction.js';
import type { IActionParam } from './IActionParam.js';

export interface IActionActionParamJoin {
    id: number;
    action: IAction;  // actionActuatorFunc
    actionParam: IActionParam;  // id
}