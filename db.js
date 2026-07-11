import Database from 'better-sqlite3';

const db = new Database('vissko.db', { verbose: console.log });

// Create orders table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export const saveOrder = (id, email) => {
  const stmt = db.prepare('INSERT OR IGNORE INTO orders (id, email, status) VALUES (?, ?, ?)');
  return stmt.run(id, email, 'confirmed');
};

export const getOrder = (id, email) => {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ? AND email = ?');
  return stmt.get(id, email);
};

export default db;
