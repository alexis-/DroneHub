import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { Zone } from "./Zone.js";
import type { IProject } from '@dhlib/models/core/interfaces/IProject.js';

@Entity("Projects")
export class Project implements IProject {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
    
    @Column()
    poi_lat!: number;
    
    @Column()
    poi_lng!: number;

    @Column()
    version!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'simple-json', nullable: true })
    settings?: Record<string, any>;

    @OneToMany('Zone', (zone: Zone) => zone.project)
    zones: Zone[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 