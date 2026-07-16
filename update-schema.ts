import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function update() {
  console.log('Updating schema...');
  try {
    await db.execute(sql`ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;`);
    console.log('Done.');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
update();
