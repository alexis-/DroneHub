import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { ActionActionParamJoin } from "./ActionActionParamJoin.js";
import type { IActionParam } from '@shared/database/entities/IActionParam.js';

@Entity("ActionParams")
export class ActionParam implements IActionParam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: number;

    @Column("varchar", { length: 50 })
    value: string;

    @OneToMany('ActionActionParamJoin', (join: ActionActionParamJoin) => join.actionParam)
    actionJoins: ActionActionParamJoin[];
}