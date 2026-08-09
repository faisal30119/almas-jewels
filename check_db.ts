import { db } from './src/db/index.js';
import { products } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function check() {
  const allProds = await db.select().from(products);
  console.log(allProds.filter(p => p.name.includes("Ruban") || p.name.includes("Pendant")));
}
check().catch(console.error);
