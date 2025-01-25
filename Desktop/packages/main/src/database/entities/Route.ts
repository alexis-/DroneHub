import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { Project } from "./Project.js";
import type { DroneType } from "./DroneType.js";
import type { Waypoint } from "./Waypoint.js";
import type { IRoute } from '@shared/database/entities/IRoute.js';
@Entity("Routes")
export class Route implements IRoute {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne('Project', (project: Project) => project.routes)
    project: Project;

    @ManyToOne('DroneType', (droneType: DroneType) => droneType.routes)
    droneType: DroneType;

    @Column()
    flyToWaylineMode: number;

    @Column()
    finishAction: number;

    @Column({ default: true })
    exitOnRCLost: boolean;

    @Column({ default: true })
    executeRCLostAction: boolean;

    @Column("float")
    globalTransitionalSpeed: number;

    @Column({ unique: true })
    waylineId: string;

    @Column("float", { nullable: true })
    distance: number;

    @Column({ nullable: true })
    duration: number;

    @Column("float")
    autoFlightSpeed: number;

    @Column("float", { nullable: true })
    maxFlightSpeed: number;

    @Column("float", { nullable: true })
    returnToHomeAltitude: number;

    @OneToMany('Waypoint', (waypoint: Waypoint) => waypoint.route)
    waypoints: Waypoint[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 