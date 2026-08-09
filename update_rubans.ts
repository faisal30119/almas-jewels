import { db } from './src/db/index.js';
import { products } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function update() {
  const mainImage = '/assets/images/61iXLd1O+OL._SY695_.jpg';
  const subImages = JSON.stringify([
    '/assets/images/71V52eCgCNL._SY695_.jpg',
    '/assets/images/61cPASED62L._SY695_.jpg',
    '/assets/images/61vDXnCmbpL._SY695_.jpg',
    '/assets/images/51yFEaupQUL._SY695_.jpg'
  ]);
  
  await db.update(products).set({
    image: mainImage,
    inclusions: subImages as any // we store subImages here if there's no subImages column?
  }).where(eq(products.name, 'Rubans Pendant Western Jewellery'));
  
  console.log('Updated Rubans Pendant images');
}
update().catch(console.error);
