import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { db } from './src/db/index.js';
import { products } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

cloudinary.config({
  cloud_name: 'niagn9pn',
  api_key: '738543779546239',
  api_secret: 'wVRhdaov4Fg4urDDuN6LnaX7P4A'
});

async function run() {
  const imageDir = path.join(process.cwd(), 'src/assets/images');
  const files = fs.readdirSync(imageDir);
  const mapping: Record<string, string> = {};

  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;
    
    const filePath = path.join(imageDir, file);
    console.log(`Uploading ${file}...`);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'almas_bridal/assets'
      });
      mapping[file] = result.secure_url;
      console.log(`Uploaded ${file} to ${result.secure_url}`);
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error);
    }
  }

  console.log("Upload mapping:", JSON.stringify(mapping, null, 2));
  
  // Replace references in src/data.ts
  const dataTsPath = path.join(process.cwd(), 'src/data.ts');
  let dataTsContent = fs.readFileSync(dataTsPath, 'utf8');
  for (const [file, url] of Object.entries(mapping)) {
    // There are some references like '/assets/images/61iXLd1O+OL._SY695_.jpg' or './assets/images/...'
    dataTsContent = dataTsContent.replaceAll(`'./assets/images/${file}'`, `'${url}'`);
    dataTsContent = dataTsContent.replaceAll(`'/assets/images/${file}'`, `'${url}'`);
  }
  fs.writeFileSync(dataTsPath, dataTsContent);

  // Replace references in src/pages/Shop.tsx
  const shopTsxPath = path.join(process.cwd(), 'src/pages/Shop.tsx');
  if (fs.existsSync(shopTsxPath)) {
    let shopTsxContent = fs.readFileSync(shopTsxPath, 'utf8');
    for (const [file, url] of Object.entries(mapping)) {
      shopTsxContent = shopTsxContent.replaceAll(`'../assets/images/${file}'`, `'${url}'`);
      shopTsxContent = shopTsxContent.replaceAll(`'/assets/images/${file}'`, `'${url}'`);
    }
    fs.writeFileSync(shopTsxPath, shopTsxContent);
  }

  // Replace references in src/pages/Product.tsx
  const productTsxPath = path.join(process.cwd(), 'src/pages/Product.tsx');
  if (fs.existsSync(productTsxPath)) {
    let productTsxContent = fs.readFileSync(productTsxPath, 'utf8');
    for (const [file, url] of Object.entries(mapping)) {
      productTsxContent = productTsxContent.replaceAll(`'/assets/images/${file}'`, `'${url}'`);
    }
    fs.writeFileSync(productTsxPath, productTsxContent);
  }

  // Replace references in Cloud SQL
  const allProds = await db.select().from(products);
  for (const prod of allProds) {
    let changed = false;
    let newImage = prod.image;
    let newInclusions = prod.inclusions;

    if (newImage) {
      for (const [file, url] of Object.entries(mapping)) {
        if (newImage.includes(file)) {
          newImage = url;
          changed = true;
          break;
        }
      }
    }

    /*if (newInclusions && typeof newInclusions === 'string') {
      try {
        const inclArr = JSON.parse(newInclusions);
        let inclChanged = false;
        const newInclArr = inclArr.map(item => {
          for (const [file, url] of Object.entries(mapping)) {
             if (item.includes(file)) {
               inclChanged = true;
               return url;
             }
          }
          return item;
        });
        if (inclChanged) {
          newInclusions = JSON.stringify(newInclArr);
          changed = true;
        }
      } catch (e) {
      }
    }*/

    if (changed) {
      console.log(`Updating DB product ${prod.id}...`);
      await db.update(products).set({
        image: newImage
      }).where(eq(products.id, prod.id));
    }
  }
}

run().catch(console.error);
