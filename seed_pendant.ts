import { db } from './src/db/index.js';
import { products } from './src/db/schema.js';

async function seed() {
  await db.insert(products).values({
    name: 'Rubans Pendant Western Jewellery',
    description: `Luxurious 18K Rose Gold Plating: This necklace boasts a stunning rose gold finish that exudes elegance and sophistication.
Timeless Design: Featuring a classic and versatile design, this necklace can be effortlessly styled for both casual and formal occasions.
High-Quality Craftsmanship: Made with meticulous attention to detail and using premium materials, ensuring durability and long-lasting shine.
Adjustable Chain Length: The necklace includes an adjustable chain, allowing for a customized fit and versatility in styling.
Ideal Gift Choice: With its luxurious appearance and timeless appeal, this necklace makes a perfect gift for various celebrations and milestones.`,
    price: 1299,
    category: 'Pendants',
    image: '/assets/images/pendant_butterfly_main_1786265928025.jpg',
    subImages: JSON.stringify([
      '/assets/images/pendant_butterfly_sub1_1786265950218.jpg',
      '/assets/images/pendant_butterfly_sub2_1786265975946.jpg',
      '/assets/images/pendant_butterfly_sub3_1786265998640.jpg'
    ]),
    stock: 100
  });
  console.log('Done!');
}
seed().catch(console.error);
