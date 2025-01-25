import type { IAction } from './IAction.js';
import type { IActionGroup } from './IActionGroup.js';

export interface IActionActionGroupJoin {
    id: number;
    actionGroup: IActionGroup;
    action: IAction;
    sequenceNumber: number;
} 