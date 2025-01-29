import type { IZone } from './missions/IZone.js';

export interface IProject {
    id: number;
    name: string;
    poi_lat: number;
    poi_lng: number;
    version: string;
    description?: string;
    settings?: Record<string, any>;
    zones?: IZone[];
    createdAt: Date;
    updatedAt: Date;
}