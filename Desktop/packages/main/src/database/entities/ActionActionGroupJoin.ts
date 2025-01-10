import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import type { Action } from "./Action";
import type { ActionGroup } from "./ActionGroup";
import type { IActionActionGroupJoin } from '@shared/database/entities/IActionActionGroupJoin';

@Entity("ActionActionGroupJoinTable")
@Index(["action", "actionGroup"])
@Index(["action", "actionGroup", "sequenceNumber"], { unique: true })
export class ActionActionGroupJoin implements IActionActionGroupJoin {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('ActionGroup', (group: ActionGroup) => group.actionJoins)
    actionGroup: ActionGroup;

    @ManyToOne('Action', (action: Action) => action.actionGroupJoins)
    action: Action;

    // <wpml:actionId>
    @Column()
    sequenceNumber: number;
} 