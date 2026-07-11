import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Initialize database
client.execute(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).catch(console.error);

export const saveOrder = async (id, email) => {
  return await client.execute({
    sql: 'INSERT OR IGNORE INTO orders (id, email, status) VALUES (?, ?, ?)',
    args: [id, email, 'confirmed']
  });
};

export const getOrder = async (id, email) => {
  const result = await client.execute({
    sql: 'SELECT * FROM orders WHERE id = ? AND email = ?',
    args: [id, email]
  });
  // Turso returns an object for each row in rows array
  return result.rows[0];
};

export default client;
