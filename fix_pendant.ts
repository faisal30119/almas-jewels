import { db } from './src/db/index.js';
import { products } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function fix() {
  await db.update(products).set({ price: 399 }).where(eq(products.name, 'Rubans Pendant Western Jewellery'));
  console.log('Price fixed!');
}
fix().catch(console.error);
