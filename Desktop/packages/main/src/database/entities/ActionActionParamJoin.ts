import { Entity, ManyToOne, Index, PrimaryGeneratedColumn, Column } from "typeorm";
import type { Action } from "./Action";
import type { ActionParam } from "./ActionParam";
import type { IActionActionParamJoin } from '@shared/database/entities/IActionActionParamJoin';

@Entity("ActionActionParamJoinTable")
@Index(["action", "actionParam"], { unique: true })
export class ActionActionParamJoin implements IActionActionParamJoin {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('Action', (action: Action) => action.paramJoins)
    action: Action;

    @ManyToOne('ActionParam', (param: ActionParam) => param.actionJoins)
    actionParam: ActionParam;
} 