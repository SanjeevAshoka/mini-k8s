import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "springboot",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
// Connection pool settings
  max: 20,                    // Maximum connections (default: varies)
  min: 3,                     // Minimum connections to keep open (default: 0)
  idleTimeoutMillis: 30000,   // Close idle connections after 30s (default: 10000)
  connectionTimeoutMillis: 2000, // Timeout for establishing connection (default: 0)
  
  // Query settings
  statement_timeout: 30000,   // Cancel queries that run longer than 30s
});

export const createTables = async () => {
  // Enable uuid-ossp extension for older PostgreSQL versions
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  } catch (error) {
    // Extension might already exist, ignore error
    console.log("Extension uuid-ossp might already exist, continuing...");
  }
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pod (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL UNIQUE,
      image VARCHAR(255) NOT NULL,

      desired_state VARCHAR(50) NOT NULL,
      current_state VARCHAR(50) NOT NULL,

      node_id VARCHAR(255),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
export const db = drizzle(pool);
export default pool;