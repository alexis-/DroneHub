import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { Route } from "./Route";
import type { ActionGroupWaypointJoin } from "./ActionGroupWaypointJoin";
import type { IWaypoint } from '@shared/database/entities/IWaypoint';
@Entity("Waypoints")
export class Waypoint implements IWaypoint {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('Route', (route: Route) => route.waypoints)
    route: Route;

    @Column()
    sequenceNumber: number;

    @Column("double")
    latitude: number;

    @Column("double")
    longitude: number;

    @Column("float")
    elevation: number;

    @Column("float", { nullable: true })
    speed: number;

    @Column({ nullable: true })
    headingMode: number;

    @Column("float", { nullable: true })
    heading: number;

    @Column({ nullable: true })
    turnMode: number;

    @Column("float", { nullable: true })
    turnDampingDist: number;

    @Column({ nullable: true })
    isRisky: boolean;

    @OneToMany('ActionGroupWaypointJoin', (join: ActionGroupWaypointJoin) => join.waypoint)
    actionGroupJoins: ActionGroupWaypointJoin[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 