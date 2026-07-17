import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';
async function update() {
  try {
    await db.execute(sql`ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_products_id_fk;`);
    await db.execute(sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS firebase_product_id TEXT;`);
    console.log('Schema updated successfully');
  } catch(e) {
    console.error('Error updating schema:', e);
  }
  process.exit(0);
}
update();
