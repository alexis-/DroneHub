import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Route } from "./Route.js";
import type { IProject } from '@shared/database/entities/IProject.js';

@Entity("Projects")
export class Project implements IProject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'simple-json', nullable: true })
    settings: Record<string, any>;

    @OneToMany(() => Route, route => route.project)
    routes: Route[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 