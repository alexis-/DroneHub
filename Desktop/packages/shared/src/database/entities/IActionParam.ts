import type { IActionActionParamJoin } from './IActionActionParamJoin';

export interface IActionParam {
    id: number;
    type: number;
    value: string;
    actionJoins: IActionActionParamJoin[];
} 