import sys

with open('src/pages/Shop.tsx', 'r') as f:
    content = f.read()

import_block = "import { products as hardcodedProducts, Product, categories, stoneColors, platings, priceRanges } from '../data';"

image_map = """import royalCollectionImg from '../assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from '../assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';

const imageMap: Record<string, string> = {
  '/assets/images/collection_royal_1783594977165.jpg': royalCollectionImg,
  '/assets/images/collection_solitaire_1783594992085.jpg': solitaireCollectionImg,
  '/assets/images/collection_occasion_1783595002665.jpg': occasionCollectionImg,
};

import { products as hardcodedProducts, Product, categories, stoneColors, platings, priceRanges } from '../data';"""

if import_block in content and "const imageMap" not in content:
    content = content.replace(import_block, image_map)

mapping_block = """          pgProducts = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
          }));"""

new_mapping_block = """          pgProducts = data.map((item: any) => ({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
            image: imageMap[item.image] || item.image
          }));"""

if mapping_block in content:
    content = content.replace(mapping_block, new_mapping_block)

dedup_block = "setDbProducts([...hardcodedProducts, ...pgProducts, ...fbProducts]);"
new_dedup_block = """
      const allProds = [...hardcodedProducts, ...pgProducts, ...fbProducts];
      const uniqueProds = Array.from(new Map(allProds.map(item => [item.id, item])).values());
      setDbProducts(uniqueProds);
"""

if dedup_block in content:
    content = content.replace(dedup_block, new_dedup_block)

with open('src/pages/Shop.tsx', 'w') as f:
    f.write(content)
print("Patched Shop.tsx")
