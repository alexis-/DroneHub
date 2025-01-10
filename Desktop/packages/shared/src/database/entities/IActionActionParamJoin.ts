import { Action, ActionParam } from "@/database/entities";

export interface IActionActionParamJoin {
    id: number;
    action: Action;  // actionActuatorFunc
    actionParam: ActionParam;  // id
} 