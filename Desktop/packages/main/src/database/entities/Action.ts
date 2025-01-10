import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import type { ActionActionGroupJoin } from "./ActionActionGroupJoin";
import type { ActionActionParamJoin } from "./ActionActionParamJoin";
import type { IAction } from '@shared/database/entities/IAction';

@Entity("Actions")
export class Action implements IAction {
    @PrimaryColumn()
    actionActuatorFunc: number;

    @OneToMany('ActionActionParamJoin', (join: ActionActionParamJoin) => join.action)
    paramJoins: ActionActionParamJoin[];

    @OneToMany('ActionActionGroupJoin', (join: ActionActionGroupJoin) => join.action)
    actionGroupJoins: ActionActionGroupJoin[];
}