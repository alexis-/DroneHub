import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { ActionActionGroupJoin } from "./ActionActionGroupJoin.js";
import type { ActionGroupWaypointJoin } from "./ActionGroupWaypointJoin.js";
import type { IActionGroup } from '@shared/database/entities/IActionGroup.js';

@Entity("ActionGroups")
export class ActionGroup implements IActionGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    triggerType: number;

    @Column({ type: 'float' })
    triggerParam: number;

    @OneToMany('ActionActionGroupJoin', (join: ActionActionGroupJoin) => join.actionGroup)
    actionJoins: ActionActionGroupJoin[];

    @OneToMany('ActionGroupWaypointJoin', (join: ActionGroupWaypointJoin) => join.actionGroup)
    waypointJoins: ActionGroupWaypointJoin[];
}