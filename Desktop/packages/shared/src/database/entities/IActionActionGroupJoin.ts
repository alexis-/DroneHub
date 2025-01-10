import type { IAction } from './IAction';
import type { IActionGroup } from './IActionGroup';

export interface IActionActionGroupJoin {
    id: number;
    actionGroup: IActionGroup;
    action: IAction;
    sequenceNumber: number;
} 