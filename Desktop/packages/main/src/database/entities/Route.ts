import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { DroneType } from "./DroneType.ts";
import type { Zone } from "./Zone.ts";
import type { IRoute } from '@dhlib/models/core/interfaces/missions/IRoute.js';

@Entity("Routes")
export class Route implements IRoute {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne('Zone', (zone: Zone) => zone.routes)
    zone: Zone;

    @ManyToOne('DroneType', (droneType: DroneType) => droneType.routes)
    droneType!: DroneType;

    @Column({ type: 'simple-json' })
    boundaries!: Array<number>;

    @Column("float", { nullable: true })
    distance!: number;

    @Column({ nullable: true })
    duration!: number;

    @Column("float")
    averageFlightSpeed!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 