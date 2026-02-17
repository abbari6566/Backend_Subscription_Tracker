import pg from "pg";
import { DATABASE_URL } from "../config/env.js";

if (!DATABASE_URL) {
  throw new Error(
    "Please define DATABASE_URL in .env.<development|production>.local (e.g. postgresql://user:pass@localhost:5432/dbname)"
  );
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Error connecting to PostgreSQL", error);
    process.exit(1);
  }
};

export { pool };
export default connectToDatabase;
