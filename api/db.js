import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export const saveOrder = async (
  id, email, customerName = null, phone = null, shippingAddress = null, stripePiId = null,
  utmSource = null, utmMedium = null, utmCampaign = null, fbc = null, fbp = null
) => {
  const addressJson = shippingAddress ? JSON.stringify(shippingAddress) : null;
  return await client.execute({
    sql: `INSERT OR IGNORE INTO orders 
          (id, email, customer_name, phone, shipping_address, status, stripe_pi_id, utm_source, utm_medium, utm_campaign, fbc, fbp) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, email, customerName, phone, addressJson, 'confirmed', stripePiId, utmSource, utmMedium, utmCampaign, fbc, fbp]
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

export const updateOrderStatusByPiId = async (piId, status) => {
  return await client.execute({
    sql: 'UPDATE orders SET status = ? WHERE stripe_pi_id = ?',
    args: [status, piId]
  });
};

export const getSetting = async (key) => {
  const result = await client.execute({
    sql: 'SELECT value FROM settings WHERE key = ?',
    args: [key]
  });
  return result.rows[0]?.value || null;
};

export const setSetting = async (key, value) => {
  return await client.execute({
    sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    args: [key, value]
  });
};

export const getAllSettings = async () => {
  const result = await client.execute('SELECT * FROM settings');
  const settings = {};
  result.rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
};

export default client;
