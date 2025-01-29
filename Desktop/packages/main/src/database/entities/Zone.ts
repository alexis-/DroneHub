import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { Route } from "./Route.ts";
import type { Project } from "./Project.ts";
import type { IZone } from '@dhlib/models/core/interfaces/missions/IZone.js';

@Entity("Zones")
export class Zone implements IZone {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'simple-json' })
    boundaries!: Array<number>;

    @ManyToOne('Project', (project: Project) => project.zones)
    project: Project;

    @OneToMany('Route', (route: Route) => route.zone)
    routes: Route[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 