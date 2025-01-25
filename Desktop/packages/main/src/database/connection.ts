import { DataSource } from "typeorm";
import { app } from "electron";
import path from "node:path";
import {fileURLToPath} from 'url';
import * as entities from "./entities/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Database path:", path.join(app.getPath("userData"), "database.sqlite"));

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.join(app.getPath("userData"), "database.sqlite"),
  entities: Object.values(entities),
  migrations: [path.join(__dirname, "migrations/*.js")],
  synchronize: process.env.NODE_ENV === "development",
  logging: false && process.env.NODE_ENV === "development",
  extra: {
    timezone: "Z"
  }
});
