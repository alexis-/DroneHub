import type { IActionActionParamJoin } from './IActionActionParamJoin.js';

export interface IActionParam {
    id: number;
    type: number;
    value: string;
    actionJoins: IActionActionParamJoin[];
}