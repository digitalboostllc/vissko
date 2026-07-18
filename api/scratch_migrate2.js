import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function run() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    console.log('Settings table created');

    const columns = ['utm_source', 'utm_medium', 'utm_campaign', 'fbc', 'fbp'];
    for (const col of columns) {
      try {
        await client.execute(`ALTER TABLE orders ADD COLUMN ${col} TEXT`);
        console.log(`Added column ${col}`);
      } catch (err) {
        if (!err.message.includes('duplicate column')) {
          console.error(`Error adding ${col}:`, err.message);
        }
      }
    }
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}
run();
