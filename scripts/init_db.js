import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function init() {
  console.log("Connecting to Turso...");
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'orders' ensured.");
    const result = await client.execute("SELECT count(*) as count FROM orders");
    console.log("Orders count:", result.rows[0].count);
  } catch (e) {
    console.error("Error:", e);
  }
}

init();
