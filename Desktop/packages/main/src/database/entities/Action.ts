import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import type { ActionActionGroupJoin } from "./ActionActionGroupJoin.js";
import type { ActionActionParamJoin } from "./ActionActionParamJoin.js";
import type { IAction } from '@shared/database/entities/IAction.js';

@Entity("Actions")
export class Action implements IAction {
    @PrimaryColumn()
    actionActuatorFunc: number;

    @OneToMany('ActionActionParamJoin', (join: ActionActionParamJoin) => join.action)
    paramJoins: ActionActionParamJoin[];

    @OneToMany('ActionActionGroupJoin', (join: ActionActionGroupJoin) => join.action)
    actionGroupJoins: ActionActionGroupJoin[];
}