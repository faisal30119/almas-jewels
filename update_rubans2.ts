import { db } from './src/db/index.js';
import { products } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function update() {
  const mainImage = '/assets/images/61iXLd1O+OL._SY695_.jpg';
  
  await db.update(products).set({
    image: mainImage
  }).where(eq(products.name, 'Rubans Pendant Western Jewellery'));
  
  console.log('Updated Rubans Pendant main image to 61iXLd1O+OL');
}
update().catch(console.error);
