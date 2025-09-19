#!/usr/bin/env node

/**
 * Database migration script
 * Run migrations and optionally seed initial data
 */

import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
config();

const execAsync = promisify(exec);

const runMigrations = async () => {
    try {
        console.log('🚀 Starting database setup...');

        // Run drizzle migrations
        console.log('📦 Running migrations...');
        const { stdout, stderr } = await execAsync('bun run db:migrate');

        if (stderr && !stderr.includes('Warning')) {
            throw new Error(stderr);
        }

        console.log(stdout);
        console.log('✅ Database migrations completed successfully!');

        console.log('🎉 Database setup complete!');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
};

// Check if this script is run directly
if (require.main === module) {
    runMigrations();
}

export { runMigrations };