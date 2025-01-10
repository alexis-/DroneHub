import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { ActionActionGroupJoin } from "./ActionActionGroupJoin";
import type { ActionGroupWaypointJoin } from "./ActionGroupWaypointJoin";
import type { IActionGroup } from '@shared/database/entities/IActionGroup';

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