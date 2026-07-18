import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Table 'orders' must be created manually or via init scripts.
// The schema is: id (TEXT), email (TEXT), status (TEXT), created_at (DATETIME)

export const saveOrder = async (id, email, customerName = null, phone = null, shippingAddress = null) => {
  const addressJson = shippingAddress ? JSON.stringify(shippingAddress) : null;
  return await client.execute({
    sql: 'INSERT OR IGNORE INTO orders (id, email, customer_name, phone, shipping_address, status) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, email, customerName, phone, addressJson, 'confirmed']
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

export const getAllOrders = async () => {
  const result = await client.execute('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows;
};

export const getOrderCount = async () => {
  const result = await client.execute('SELECT COUNT(*) as count FROM orders');
  return Number(result.rows[0].count);
};

export const updateOrderStatusByEmail = async (email, status) => {
  return await client.execute({
    sql: 'UPDATE orders SET status = ? WHERE email = ?',
    args: [status, email]
  });
};

export const updateOrderStatusById = async (id, status) => {
  return await client.execute({
    sql: 'UPDATE orders SET status = ? WHERE id = ?',
    args: [status, id]
  });
};

export default client;
