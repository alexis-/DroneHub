import 'reflect-metadata';
import { DataSource } from "typeorm";
import { app } from "electron";
import path from "node:path";
import * as entities from "./entities";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: path.join(app.getPath("userData"), "database.sqlite"),
  entities: Object.values(entities),
  migrations: [path.join(__dirname, "migrations/*.js")],
  synchronize: process.env.NODE_ENV === "development",
  logging: false && process.env.NODE_ENV === "development",
  extra: {
    timezone: "Z"
  }
});