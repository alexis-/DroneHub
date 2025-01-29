import type { IRoute } from './IRoute.js';

export interface IDroneType {
    id: number;
    name: string;
    droneEnumValue: number;
    droneSubEnumValue?: number;
    sensorWidth: number;
    sensorHeight: number;
    focalLength: number;
    imageWidth: number;
    imageHeight: number;
    maxSpeed?: number;
    maxAltitude?: number;
    routes: IRoute[];
    createdAt: Date;
    updatedAt: Date;
} 