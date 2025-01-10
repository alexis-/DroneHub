import type { IRoute } from './IRoute';

export interface IProject {
    id: number;
    name: string;
    poi_lat: number;
    poi_lng: number;
    version: string;
    description?: string;
    settings?: Record<string, any>;
    routes?: IRoute[];
    createdAt: Date;
    updatedAt: Date;
}