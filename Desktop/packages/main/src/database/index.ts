import 'reflect-metadata';
import { AppDataSource } from "./connection";

const CONTEXT = 'Database';

export async function initializeDatabase() {
    try {
        await AppDataSource.initialize();
        console.info(CONTEXT, 'Database initialized');
        
        if (process.env.NODE_ENV === "development") {
            await AppDataSource.synchronize();
            console.info(CONTEXT, 'Database schema synchronized');
        } else {
            await AppDataSource.runMigrations();
            console.info(CONTEXT, 'Migrations completed');
        }
    } catch (error) {
        console.error('Failed to initialize database: ' + error);
        throw error;
    }
} 