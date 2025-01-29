import type { IProject } from '../IProject.js';
import type { IRoute } from './IRoute.js';

export interface IZone {
  id: number;
  name: string;
  description?: string;
  boundaries: Array<number>;
  project: IProject;
  routes?: IRoute[];
  createdAt: Date;
  updatedAt: Date;
}