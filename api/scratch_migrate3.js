import client from './db.js';

async function migrate() {
  try {
    console.log('Adding amount column to orders table...');
    await client.execute(`ALTER TABLE orders ADD COLUMN amount REAL DEFAULT 89.0`);
    console.log('Migration completed successfully.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Column already exists.');
    } else {
      console.error('Migration failed:', error);
    }
  }
}

migrate();
