import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import type { Waypoint } from "./Waypoint";
import type { ActionGroup } from "./ActionGroup";
import type { IActionGroupWaypointJoin } from '@shared/database/entities/IActionGroupWaypointJoin';

@Entity("ActionGroupWaypointJoinTable")
@Index(["waypoint", "actionGroup"])
@Index(["waypoint", "actionGroup", "sequenceNumber"], { unique: true })
export class ActionGroupWaypointJoin implements IActionGroupWaypointJoin {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('Waypoint', (waypoint: Waypoint) => waypoint.actionGroupJoins)
    waypoint: Waypoint;

    @ManyToOne('ActionGroup', (group: ActionGroup) => group.waypointJoins)
    actionGroup: ActionGroup;

    // <wpml:actionGroupId>
    @Column()
    sequenceNumber: number;

    @Column()
    actionGroupStartIndex: number;

    @Column()
    actionGroupEndIndex: number;

    @Column()
    actionGroupMode: number;
} 