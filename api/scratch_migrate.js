import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function run() {
  try {
    await client.execute('ALTER TABLE orders ADD COLUMN stripe_pi_id TEXT');
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}
run();
