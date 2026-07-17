import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';
dotenv.config();

const neonPool = new Pool({
  connectionString: 'postgresql://postgres:74e47d976b0364959185e357b92e97d7@ftu3fhj2.us-east.database.insforge.app:5432/insforge?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const csqlPool = new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
  connectionTimeoutMillis: 15000,
});

async function migrate() {
  try {
    const products = await neonPool.query('SELECT * FROM products');
    console.log(`Found ${products.rows.length} products in Neon`);
    
    // Clear existing target products using DELETE instead of TRUNCATE
    await csqlPool.query('DELETE FROM order_items');
    await csqlPool.query('DELETE FROM products');
    
    for (const p of products.rows) {
      await csqlPool.query(
        'INSERT INTO products (id, name, price, stock, image, category, stone_color, plating, description, inclusions, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [p.id, p.name, p.price, p.stock, p.image, p.category, p.stone_color, p.plating, p.description, p.inclusions, p.created_at]
      );
    }
    console.log('Migrated products.');
    
    // reset sequence
    await csqlPool.query(`SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id),0) + 1, false) FROM products;`);
    
    console.log('Migration complete.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await neonPool.end();
    await csqlPool.end();
  }
}
migrate();
