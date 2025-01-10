import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Route } from "./Route";
import type { IDroneType } from '@shared/database/entities/IDroneType';
@Entity("DroneTypes")
export class DroneType implements IDroneType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: false })
    droneEnumValue: number;

    @Column({ nullable: true })
    droneSubEnumValue: number;

    @Column("float")
    sensorWidth: number;

    @Column("float")
    sensorHeight: number;

    @Column("float")
    focalLength: number;

    @Column()
    imageWidth: number;

    @Column()
    imageHeight: number;

    @Column("float", { nullable: true })
    maxSpeed: number;

    @Column("float", { nullable: true })
    maxAltitude: number;

    @OneToMany(() => Route, route => route.droneType)
    routes: Route[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 