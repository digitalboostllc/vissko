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
    await client.execute("DROP TABLE IF EXISTS orders;");
    await client.execute(`
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        customer_name TEXT,
        phone TEXT,
        shipping_address TEXT,
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'orders' recreated with shipping columns.");
  } catch (e) {
    console.error("Error:", e);
  }
}

init();
