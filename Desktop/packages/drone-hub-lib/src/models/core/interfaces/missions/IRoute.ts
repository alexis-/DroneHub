import type { IDroneType } from './IDroneType.js';
import type { IZone } from './IZone.js';

export interface IRoute {
    id: number;
    zone: IZone;
    droneType: IDroneType;
    data: string;
    distance?: number;
    duration?: number;
    averageFlightSpeed: number;
    createdAt: Date;
    updatedAt: Date;
} 