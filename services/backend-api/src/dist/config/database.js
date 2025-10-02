"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// NOTE: We do NOT initialize exports.pool here to avoid accessing 
// process.env.DATABASE_URL before dotenv has run in the main file.
exports.closeDatabase = exports.initializeDatabase = exports.testConnection = exports.pool = void 0;

// Database configuration for PostgreSQL
const pg_1 = require("pg");

// Variable to hold the connection pool
let dbPool = null;

/**
 * Initializes the database connection pool.
 * This function MUST be called after dotenv has loaded environment variables.
 */
const initializePool = () => {
    if (dbPool) {
        return dbPool;
    }

    // Check if DATABASE_URL is available here, not at the top level
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined. Cannot initialize database pool.");
    }

    const dbConfig = {
        connectionString: process.env.DATABASE_URL,
        // The ternary operator needs to be handled carefully in a transpiled environment
        // but for standard Node/ts-node, this is correct:
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };

    // Create and export the connection pool
    dbPool = new pg_1.Pool(dbConfig);
    exports.pool = dbPool; // Update the exported pool reference

    return dbPool;
};

// Database connection test
const testConnection = async () => {
    // Attempt to initialize the pool if it hasn't been already
    const pool = dbPool || initializePool();

    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        // If the error is due to missing URL (which should be caught by initializePool, 
        // but can still happen if it's imported without proper sequence):
        if (!process.env.DATABASE_URL) {
            console.error('❌ Database connection failed: DATABASE_URL is missing.');
            return false;
        }
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};
exports.testConnection = testConnection;

// Initialize database (create tables if they don't exist)
const initializeDatabase = async () => {
    // Ensure pool is initialized
    const pool = dbPool || initializePool();
    
    try {
        const client = await pool.connect();
        
        // Dynamic imports/requires must be used if they weren't at the top
        // or ensure they are properly transpiled. Keeping require here for simplicity.
        const fs = require('fs');
        const path = require('path');

        // Schemas to initialize
        const schemas = [
            'gamification.sql',
            'education.sql',
            'challenges.sql'
        ];
        
        // Execute schemas
        for (const schemaFile of schemas) {
            const schemaPath = path.join(__dirname, '../../database/schema/', schemaFile);
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                // Use a single transaction for schema initialization for atomicity
                await client.query(schema);
            }
        }
        
        console.log('✅ Database schemas initialized');

        // Read and execute seed data
        const seedPath = path.join(__dirname, '../../database/seeds/gamification_data.sql');
        if (fs.existsSync(seedPath)) {
            const seedData = fs.readFileSync(seedPath, 'utf8');
            await client.query(seedData);
            console.log('✅ Database seed data loaded');
        }

        client.release();
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;

// Graceful shutdown
const closeDatabase = async () => {
    if (!dbPool) {
        console.log('⚠️ Database pool not initialized. Skipping close.');
        return;
    }
    try {
        await dbPool.end();
        console.log('✅ Database connections closed');
        dbPool = null; // Clear the reference
        exports.pool = undefined; // Clear the exported reference
    }
    catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
};
exports.closeDatabase = closeDatabase;

// Handle process termination (using dbPool if it exists)
process.on('SIGINT', exports.closeDatabase);
process.on('SIGTERM', exports.closeDatabase);

// Export the pool variable as a getter or just leave it undefined until init is called
exports.pool = dbPool;