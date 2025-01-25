import { Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import type { Action } from "./Action.js";
import type { ActionGroup } from "./ActionGroup.js";
import type { IActionActionGroupJoin } from '@shared/database/entities/IActionActionGroupJoin.js';

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