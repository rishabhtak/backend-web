import { Pool } from "pg";
import * as dotenv from "dotenv";
import { config } from "./config";

dotenv.config();

export function getPool(): Pool {
  return new Pool({
    connectionString: config.postgres.connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}
